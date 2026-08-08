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
  registerPairingSession,
  updatePairingSession,
  removePairingSession,
} = require('./src/runtime/status');

const router = express.Router();
const TEMP_ROOT = path.join(__dirname, 'temp');
const PAIRING_TIMEOUT_MS = 120000;
const PAIRING_REQUEST_TIMEOUT_MS = 20000;

function normalizeNumber(value) {
  return String(value || '').replace(/\D/g, '');
}

function isValidNumber(number) {
  return /^\d{10,15}$/.test(number);
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

async function getVersion() {
  try {
    const { version } = await fetchLatestBaileysVersion();
    return version;
  } catch (error) {
    console.warn('[PAIRING] Could not fetch latest WhatsApp Web version:', error.message);
    return undefined;
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
  const authPath = path.join(TEMP_ROOT, id);
  let socket = null;
  let closed = false;
  let cleaned = false;
  let timeout;

  registerPairingSession(id, {
    type: 'pairing',
    state: 'starting',
    number,
  });

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    clearTimeout(timeout);
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

    // This is intentionally kept in the same order and shape as the working
    // MESH-TECH-MD-BOT implementation.
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
    });

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
          const credsPath = path.join(authPath, 'creds.json');
          if (fs.existsSync(credsPath) && socket.user?.id) {
            const sessionId = `Mesh~${fs.readFileSync(credsPath).toString('base64')}`;
            await socket.sendMessage(socket.user.id, { text: sessionId });
            console.log(`[PAIRING] Session generated for ${number}`);
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
