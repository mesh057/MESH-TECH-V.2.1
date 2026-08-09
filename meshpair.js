const express = require('express');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
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
} = require('maher-zubair-baileys');
const {
  registerPairingSession,
  updatePairingSession,
  removePairingSession,
} = require('./src/runtime/status');

const router = express.Router();
const TEMP_ROOT = path.join(__dirname, 'temp');
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

async function createAuthBundle(authPath) {
  const files = {};
  const walk = async (directory, prefix = '') => {
    const entries = await fs.promises.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      const relative = path.join(prefix, entry.name).split(path.sep).join('/');
      if (entry.isDirectory()) await walk(absolute, relative);
      else files[relative] = (await fs.promises.readFile(absolute)).toString('base64');
    }
  };
  await walk(authPath);
  if (!files['creds.json']) throw new Error('Pairing completed without creds.json');
  const payload = JSON.stringify({ format: 'mesh-auth-v1', files });
  return `Mesh2~${zlib.gzipSync(Buffer.from(payload)).toString('base64')}`;
}

router.get('/', async (req, res) => {
  const number = normalizeNumber(req.query.number);

  if (!isValidNumber(number)) {
    return res.status(400).json({
      error: 'Invalid phone number. Use 10–15 digits including country code (for example, 2547XXXXXXXX).',
    });
  }

  const id = makeid();
  const authPath = path.join(TEMP_ROOT, id);
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
    removeFile(authPath);
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
    await fs.promises.mkdir(TEMP_ROOT, { recursive: true });
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
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

    // Baileys manages the WebSocket keep-alive internally. Keep this pairing
    // session alive for the entire phone-linking window rather than allowing
    // an idle handshake to be closed by a short default timeout.
    keepAliveTimer = setInterval(() => {
      updatePairingSession(id, { lastSeenAt: Date.now() });
    }, SOCKET_KEEPALIVE_MS);

    if (!state.creds.registered) {
      updatePairingSession(id, { state: 'requesting_code' });
      await delay(1500);

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

    // Match the reference: attach credential persistence after the pairing
    // request has been issued, not before it.
    socket.ev.on('creds.update', saveCreds);

    socket.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
      if (connection === 'connecting') {
        updatePairingSession(id, { state: 'connecting' });
      }

      if (connection === 'open') {
        updatePairingSession(id, { state: 'connected' });
        await delay(1000);

        try {
          if (socket.user?.id) {
            // Transfer the complete Baileys multi-file auth state. A creds.json
            // file alone is not sufficient for the bot to authenticate because
            // the signal/pre-key files are also required.
            const sessionId = await createAuthBundle(authPath);
            await socket.sendMessage(socket.user.id, { text: sessionId });
            console.log(`[PAIRING] Full Mesh2 session generated for ${number}`);
          }
          updatePairingSession(id, { state: 'completed' });
          await delay(500);
          socket.end?.(undefined);
          cleanup();
        } catch (error) {
          console.error('[PAIRING] Session delivery failed:', error.message);
          fail(502, 'Pairing completed, but the session could not be delivered.', error);
        }
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
