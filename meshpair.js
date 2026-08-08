const express = require('express');
const fs = require('fs');
const path = require('path');
const { makeid } = require('./id');
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  delay,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  Browsers,
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

function removeFile(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.rmSync(filePath, { recursive: true, force: true });
  } catch (error) {
    console.error('[PAIRING] Temporary session cleanup failed:', error.message);
  }
}

function normalizeNumber(value) {
  return String(value || '').replace(/\D/g, '');
}

function isValidNumber(number) {
  return /^\d{10,15}$/.test(number);
}

function getStatusCode(error) {
  return (
    error?.output?.statusCode ||
    error?.statusCode ||
    error?.data?.statusCode ||
    500
  );
}

async function getVersion() {
  try {
    const result = await fetchLatestBaileysVersion();
    return result?.version;
  } catch (error) {
    console.warn('[PAIRING] Could not fetch latest WhatsApp Web version:', error.message);
    return undefined;
  }
}

function withTimeout(promise, timeoutMs, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
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
  let socket;
  let codeRequested = false;
  let connectionClosed = false;
  let connectionStarted = false;
  let primaryPairingFailed = false;
  let fallbackScheduled = false;
  let pairingAttemptInFlight = false;
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

  const sendError = (status, message) => {
    if (!res.headersSent) res.status(status).json({ error: message });
  };

  timeout = setTimeout(() => {
    updatePairingSession(id, { state: 'failed', error: 'Pairing request timed out' });
    sendError(504, 'Pairing request timed out. Please generate a new code and try again.');
    try {
      socket?.end?.(undefined);
    } catch (error) {
      console.error('[PAIRING] Timed-out socket close failed:', error.message);
    }
    cleanup();
  }, PAIRING_TIMEOUT_MS);

  try {
    await fs.promises.mkdir(TEMP_ROOT, { recursive: true });
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const logger = pino({ level: 'silent' });
    const version = await getVersion();

    // FIX 1: Use a specific browser string that WhatsApp accepts reliably.
    // Browsers.ubuntu('Chrome') can produce a fingerprint that WhatsApp rejects
    // with "Couldn't link device". Using an explicit array is more stable.
    socket = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      logger,
      ...(version ? { version } : {}),
      browser: ['Ubuntu', 'Chrome', '22.0.0'],
      markOnlineOnConnect: false,
      syncFullHistory: false,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 25000,
      retryRequestDelayMs: 250,
      printQRInTerminal: false,
      // FIX 2: Disable QR generation entirely for pairing-code flow.
      // If QR is generated alongside a pairing code request, WhatsApp can
      // reject the pairing code because the session is in an ambiguous state.
      generateHighQualityLinkPreview: false,
    });

    socket.ev.on('creds.update', saveCreds);

    const requestCode = async (waitMs = 3000, strategy = 'source') => {
      if (pairingAttemptInFlight) throw new Error('Another pairing attempt is already in progress.');
      pairingAttemptInFlight = true;

      // The source strategy initializes the socket, waits briefly, and then
      // requests a code. The fallback passes the original connection-event
      // strategy through this same function after its longer wait.
      await delay(waitMs);
      if (connectionClosed) throw new Error('WhatsApp closed the connection before pairing started.');
      if (!socket?.requestPairingCode) {
        throw new Error('Socket is not ready or requestPairingCode is unavailable.');
      }
      const pairingCode = await withTimeout(
        socket.requestPairingCode(number),
        PAIRING_REQUEST_TIMEOUT_MS,
        'WhatsApp did not return a pairing code in time.',
      );
      pairingAttemptInFlight = false;
      if (!pairingCode || typeof pairingCode !== 'string') {
        throw new Error(`Invalid pairing code received: ${pairingCode}.`);
      }
      const formattedCode = pairingCode.match(/.{1,4}/g)?.join('-') || pairingCode;
      updatePairingSession(id, { state: 'code_ready', code: formattedCode, strategy });
      if (!res.headersSent) {
        res.json({
          code: formattedCode,
          requestId: id,
          expiresIn: Math.floor(PAIRING_TIMEOUT_MS / 1000),
        });
      }
    };

    socket.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
      try {
        if (connection === 'connecting') {
          connectionStarted = true;
          updatePairingSession(id, { state: 'connecting' });
          maybeRunLegacyFallback();
        }

        if (connection === 'open') {
          updatePairingSession(id, { state: 'connected' });
          await delay(1000);

          const credsPath = path.join(authPath, 'creds.json');
          if (fs.existsSync(credsPath)) {
            const sessionId = `Mesh~${fs.readFileSync(credsPath).toString('base64')}`;
            try {
              const sessionMessage = await socket.sendMessage(socket.user.id, { text: sessionId });
              await socket.sendMessage(
                socket.user.id,
                {
                  text: `
╔════════════════════════════════════════════╗
║  ✅ MESH-TECH-V2 PAIR CODE CONNECTED       ║
╚════════════════════════════════════════════╝

Bot: MESH-TECH-V2
Number: ${socket.user.id.split(':')[0]}
Session ID: Sent above (starts with Mesh~)

Next steps:
1. Copy the Session ID above.
2. Paste it in your bot's .env file as SESSION_ID.
3. Deploy your bot and enjoy.

Repository: https://github.com/mesh057/MESH-TECH-V.2.1
                  `.trim(),
                },
                { quoted: sessionMessage },
              );
            } catch (messageError) {
              console.error('[PAIRING] Failed to send session ID message:', messageError.message);
            }
          }

          updatePairingSession(id, { state: 'completed' });
          await delay(500);
          socket.end?.(undefined);
          cleanup();
        }

        if (connection === 'close') {
          const statusCode = getStatusCode(lastDisconnect?.error);
          // 401 = logged out / rejected; 403 = forbidden; 428 = precondition (too early)
          const isRejected = statusCode === 401 || statusCode === 403;
          const isPrecondition = statusCode === 428;

          let message;
          if (isRejected) {
            message =
              'WhatsApp rejected the pairing request or the temporary session expired. Please try again.';
          } else if (isPrecondition) {
            message =
              'Connection was not fully established before the pairing code was requested. Please try again.';
          } else {
            message = 'Connection closed before pairing completed. Please try again.';
          }

          connectionClosed = true;
          updatePairingSession(id, { state: 'failed', error: message });
          cleanup();
          if (!res.headersSent) sendError(isRejected ? 400 : 502, message);
        }
      } catch (error) {
        console.error('[PAIRING] Connection update failed:', error.message);
        updatePairingSession(id, { state: 'failed', error: error.message });
        cleanup();
        sendError(502, 'A pairing error occurred. Please try again.');
      }
    });

    const failPairing = (pairingError) => {
      const errorMsg = pairingError.message || 'Unknown pairing error';
      console.error('[PAIRING] requestPairingCode error:', errorMsg);
      updatePairingSession(id, { state: 'failed', error: errorMsg });
      if (!res.headersSent) {
        sendError(
          502,
          `WhatsApp pairing failed: ${errorMsg}. Ensure the phone number is correct (e.g., 2547XXXXXXXX) and try again.`,
        );
      }
      try {
        socket?.end?.(undefined);
      } catch (closeError) {
        console.error('[PAIRING] Failed to close pairing socket:', closeError.message);
      }
      cleanup();
    };

    const runLegacyFallback = () => {
      if (fallbackScheduled || connectionClosed || !primaryPairingFailed) return;
      fallbackScheduled = true;
      codeRequested = true;
      updatePairingSession(id, { state: 'fallback_wait' });
      // Preserve the previous implementation's delayed request path as the
      // backup when the source-style attempt cannot obtain a code.
      requestCode(5000, 'legacy-fallback').catch(failPairing);
    };

    const maybeRunLegacyFallback = () => {
      if (primaryPairingFailed) runLegacyFallback();
    };

    if (!state.creds.registered && !codeRequested) {
      codeRequested = true;
      updatePairingSession(id, { state: 'requesting_code', strategy: 'source' });
      requestCode(3000, 'source').catch((pairingError) => {
        pairingAttemptInFlight = false;
        primaryPairingFailed = true;
        updatePairingSession(id, { state: 'primary_failed', error: pairingError.message });
        // Start the preserved path even if the connecting event was missed;
        // the fallback keeps the original longer wait before requesting code.
        runLegacyFallback();
      });
    }

  } catch (error) {
    console.error('[PAIRING] Socket initialization failed:', error.message);
    updatePairingSession(id, { state: 'failed', error: error.message });
    cleanup();
    sendError(502, 'Pairing service initialization failed. Please try again.');
  }
});

module.exports = router;
