const express = require('express');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const { makeid } = require('./id');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  Browsers,
  delay,
  DisconnectReason,
} = require('@whiskeysockets/baileys');
const {
  runtime,
  registerPairingSession,
  updatePairingSession,
  removePairingSession,
} = require('./src/runtime/status');

const router = express.Router();
const AUTH_DIR = process.env.AUTH_DIR || path.join(__dirname, 'auth_info');
const PAIRING_TIMEOUT_MS = 300000;
const PAIRING_REQUEST_TIMEOUT_MS = 60000;
const SOCKET_KEEPALIVE_MS = 25000;

function normalizeNumber(value) {
  return String(value || '').replace(/\D/g, '');
}

function isValidNumber(number) {
  return /^\d{10,15}$/.test(number);
}

async function getVersion() {
  try {
    const { version } = await fetchLatestBaileysVersion();
    return version;
  } catch (error) {
    console.warn('[PAIRING] WhatsApp Web version lookup failed:', error.message);
    return undefined;
  }
}

function getStatusCode(error) {
  return error?.output?.statusCode || error?.statusCode || error?.data?.statusCode || null;
}

function withTimeout(promise, timeoutMs, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function removeFile(filePath) {
  try {
    fs.rmSync(filePath, { recursive: true, force: true });
  } catch (error) {
    console.error('[PAIRING] Temporary session cleanup failed:', error.message);
  }
}

router.get('/', async (req, res) => {
  const number = normalizeNumber(req.query.number);

  if (!isValidNumber(number)) {
    return res.status(400).json({
      error: 'Invalid phone number. Use 10–15 digits including country code (for example, 2547XXXXXXXX).',
    });
  }

  const id = makeid();
  const forceReset = ['1', 'true', 'yes'].includes(String(req.query.reset || '').toLowerCase());
  const authPath = AUTH_DIR;
  let socket = null;
  let closed = false;
  let cleaned = false;
  let timeout;
  let keepAliveTimer;

  registerPairingSession(id, {
    type: 'pairing',
    state: 'starting',
    number,
  });

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    clearTimeout(timeout);
    clearInterval(keepAliveTimer);
    removePairingSession(id);
    // Keep AUTH_DIR: the bot reuses this same Baileys auth state.
  };

  const fail = (status, message, error) => {
    if (error) console.error('[PAIRING]', message, error.message);
    updatePairingSession(id, { state: 'failed', error: message });
    if (!res.headersSent) res.status(status).json({ error: message });
    try {
      socket?.end?.(undefined);
    } catch (closeError) {
      console.error('[PAIRING] Socket close failed:', closeError.message);
    }
    cleanup();
  };

  timeout = setTimeout(() => {
    fail(504, 'Pairing request timed out. Please generate a new code and try again.');
  }, PAIRING_TIMEOUT_MS);

  try {
    await fs.promises.mkdir(AUTH_DIR, { recursive: true });
    let authState = await useMultiFileAuthState(authPath);

    if (authState.state.creds.registered) {
      if (runtime.bot.state === 'connected') {
        return fail(409, 'The bot is already connected. Use the bot instead of generating another pairing code.');
      }
      if (!forceReset) {
        return fail(409, 'Saved credentials were found. Use the fresh-pairing action to reset stale credentials, then generate a new code.');
      }
      console.warn('[PAIRING] Resetting stale auth state for a fresh pairing request.');
      await fs.promises.rm(AUTH_DIR, { recursive: true, force: true });
      await fs.promises.mkdir(AUTH_DIR, { recursive: true });
      authState = await useMultiFileAuthState(authPath);
    }

    const { state, saveCreds } = authState;
    const logger = pino({ level: 'silent' });
    const version = await getVersion();

    // Match the working MESH-TECH-MD-BOT pairing fingerprint exactly.
    socket = makeWASocket({
      ...(version ? { version } : {}),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      printQRInTerminal: false,
      logger,
      browser: Browsers.ubuntu('Chrome'),
      markOnlineOnConnect: true,
      keepAliveIntervalMs: SOCKET_KEEPALIVE_MS,
      connectTimeoutMs: 90000,
      defaultQueryTimeoutMs: undefined,
      retryRequestDelayMs: 500,
      syncFullHistory: false,
    });

    // A transport error can occur while WhatsApp is still negotiating the
    // pairing socket. Consume it explicitly so Railway does not terminate the
    // whole Node process before connection.update reports the real reason.
    socket.ws?.on?.('error', (error) => {
      console.error('[PAIRING] WebSocket transport error:', error.message);
    });

    // Observe the handshake before requesting the code. Some Baileys versions
    // emit `close` before requestPairingCode rejects; handling it here prevents
    // a dead socket from being reused and gives the route a deterministic error.
    socket.ev.on('connection.update', ({ connection, lastDisconnect }) => {
      if (connection !== 'close' || closed) return;
      closed = true;
      const statusCode = getStatusCode(lastDisconnect?.error);
      const message = statusCode === DisconnectReason.loggedOut
        ? 'WhatsApp logged out the temporary session. Please generate a new code.'
        : 'WhatsApp closed the pairing handshake before a code could be generated.';
      console.error('[PAIRING] Early handshake close:', JSON.stringify({
        statusCode,
        error: lastDisconnect?.error?.message || String(lastDisconnect?.error || ''),
      }));
      fail(statusCode === DisconnectReason.loggedOut ? 400 : 502, message, lastDisconnect?.error);
    });

    // Baileys manages the WebSocket keep-alive internally. Keep this pairing
    // session alive for the entire phone-linking window rather than allowing
    // an idle handshake to be closed by a short default timeout.
    keepAliveTimer = setInterval(() => {
      updatePairingSession(id, { lastSeenAt: Date.now() });
    }, SOCKET_KEEPALIVE_MS);

    if (!state.creds.registered) {
      updatePairingSession(id, { state: 'requesting_code' });
      await delay(3000);

      let pairingCode;
      try {
        pairingCode = await withTimeout(
          socket.requestPairingCode(number),
          PAIRING_REQUEST_TIMEOUT_MS,
          'WhatsApp did not return a pairing code in time.',
        );
      } catch (error) {
        return fail(502, `WhatsApp pairing failed: ${error.message}`, error);
      }

      pairingCode = pairingCode?.match(/.{1,4}/g)?.join('-') || pairingCode;
      if (!pairingCode || typeof pairingCode !== 'string') {
        return fail(502, 'WhatsApp returned an invalid pairing code. Please try again.');
      }

      updatePairingSession(id, { state: 'code_ready', code: pairingCode });
      if (!res.headersSent) {
        res.json({
          code: pairingCode,
          requestId: id,
          expiresIn: Math.floor(PAIRING_TIMEOUT_MS / 1000),
        });
      }
    }

    // Persist all credential and signal-key updates in the shared auth_info directory.
    socket.ev.on('creds.update', saveCreds);

    socket.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
      if (connection === 'connecting') {
        updatePairingSession(id, { state: 'connecting' });
      }

      if (connection === 'open') {
        // Do not close the socket here. WhatsApp can emit `open` before the
        // phone-link confirmation and closing immediately causes “Couldn’t
        // link device” even though the code was accepted. Keep this socket
        // alive so creds.update can persist the complete auth state.
        updatePairingSession(id, { state: 'completed' });
        console.log('[PAIRING] WhatsApp socket opened; preserving it for auth persistence.');
        clearTimeout(timeout);
        clearInterval(keepAliveTimer);
        removePairingSession(id);
      }

      if (connection === 'close' && !closed) {
        closed = true;
        const statusCode = getStatusCode(lastDisconnect?.error);
        console.error('[PAIRING] WhatsApp disconnect:', JSON.stringify({ statusCode, error: lastDisconnect?.error?.message || String(lastDisconnect?.error || '') }));
        const message = statusCode === DisconnectReason.loggedOut
          ? 'WhatsApp logged out the temporary session. Please generate a new code.'
          : 'Connection closed before pairing completed. Please try again.';
        if (!res.headersSent) fail(statusCode === DisconnectReason.loggedOut ? 400 : 502, message);
        else {
          updatePairingSession(id, { state: 'failed', error: message });
          cleanup();
        }
      }
    });
  } catch (error) {
    fail(502, 'Pairing service initialization failed. Please try again.', error);
  }
});

module.exports = router;
