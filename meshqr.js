const express = require('express');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const { makeid } = require('./id');
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  Browsers,
  delay,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const {
  registerPairingSession,
  updatePairingSession,
  removePairingSession,
} = require('./src/runtime/status');

const router = express.Router();
const QR_TIMEOUT_MS = 120000;

function removeFile(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.rmSync(filePath, { recursive: true, force: true });
  } catch (error) {
    console.error('[QR] Temporary session cleanup failed:', error.message);
  }
}

async function getVersion() {
  try {
    const result = await fetchLatestBaileysVersion();
    return result?.version;
  } catch (error) {
    console.warn('[QR] Could not fetch latest WhatsApp Web version:', error.message);
    return undefined;
  }
}

router.get('/', async (req, res) => {
  const id = makeid();
  const tempDir = path.join(__dirname, 'temp', id);
  let socket;
  let responseSent = false;
  let cleaned = false;
  let timeout;

  registerPairingSession(id, { type: 'qr', state: 'starting' });

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    clearTimeout(timeout);
    removePairingSession(id);
    removeFile(tempDir);
  };

  const sendError = (status, message) => {
    if (!res.headersSent) res.status(status).json({ error: message, requestId: id });
  };

  timeout = setTimeout(() => {
    updatePairingSession(id, { state: 'failed', error: 'QR request timed out' });
    sendError(504, 'QR request timed out. Please generate a new QR code.');
    try {
      socket?.end?.(undefined);
    } catch (error) {
      console.error('[QR] Timed-out socket close failed:', error.message);
    }
    cleanup();
  }, QR_TIMEOUT_MS);

  try {
    await fs.promises.mkdir(path.dirname(tempDir), { recursive: true });
    const { state, saveCreds } = await useMultiFileAuthState(tempDir);
    const version = await getVersion();
    const logger = pino({ level: 'silent' });

    socket = makeWASocket({
      auth: state,
      ...(version ? { version } : {}),
      printQRInTerminal: false,
      logger,
      browser: Browsers.macOS('Desktop'),
      connectTimeoutMs: 30000,
      keepAliveIntervalMs: 25000,
      syncFullHistory: false,
    });

    socket.ev.on('creds.update', saveCreds);

    socket.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
      try {
        if (connection === 'connecting') {
          updatePairingSession(id, { state: 'connecting' });
        }

        if (qr && !responseSent) {
          updatePairingSession(id, { state: 'qr_ready' });
          const image = await QRCode.toBuffer(qr, {
            type: 'png',
            width: 640,
            margin: 2,
            errorCorrectionLevel: 'M',
          });
          res.set({
            'Content-Type': 'image/png',
            'Content-Length': String(image.length),
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            Pragma: 'no-cache',
            'X-QR-Request-Id': id,
          });
          responseSent = true;
          res.end(image);
        }

        if (connection === 'open') {
          updatePairingSession(id, { state: 'connected' });
          await delay(1200);
          const credsPath = path.join(tempDir, 'creds.json');

          if (fs.existsSync(credsPath) && socket.user?.id) {
            const sessionId = `Mesh~${fs.readFileSync(credsPath).toString('base64')}`;
            try {
              const sessionMessage = await socket.sendMessage(socket.user.id, { text: sessionId });
              await socket.sendMessage(
                socket.user.id,
                {
                  text: `
╔════════════════════════════════════════════╗
║  ✅ MESH-TECH-V2 QR SESSION CONNECTED      ║
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
              console.error('[QR] Failed to send session ID:', messageError.message);
            }
          }

          updatePairingSession(id, { state: 'completed' });
          await delay(500);
          socket.end?.(undefined);
          cleanup();
        }

        if (connection === 'close') {
          const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.statusCode;
          const message = statusCode === 401 || statusCode === 403
            ? 'WhatsApp rejected the QR session or it expired. Please generate a new QR code.'
            : 'The QR connection closed before completion. Please try again.';
          updatePairingSession(id, { state: 'failed', error: message });
          cleanup();
          if (!responseSent) sendError(statusCode === 401 || statusCode === 403 ? 400 : 502, message);
        }
      } catch (error) {
        console.error('[QR] Connection update failed:', error.message);
        updatePairingSession(id, { state: 'failed', error: error.message });
        cleanup();
        sendError(502, 'A QR session error occurred. Please try again.');
      }
    });
  } catch (error) {
    console.error('[QR] Socket initialization failed:', error.message);
    updatePairingSession(id, { state: 'failed', error: error.message });
    cleanup();
    sendError(502, 'QR service initialization failed. Please try again.');
  }
});

module.exports = router;
