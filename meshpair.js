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
} = require('@whiskeysockets/baileys');

const router = express.Router();
const TEMP_ROOT = path.join(__dirname, 'temp');

function removeFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { recursive: true, force: true });
    }
  } catch (e) {}
}

function normalizeNumber(value) {
  return String(value || '').replace(/\D/g, '');
}

function isValidNumber(number) {
  return /^\d{10,15}$/.test(number);
}

function getStatusCode(error) {
  return error?.output?.statusCode || error?.statusCode || 500;
}

router.get('/', async (req, res) => {
  const number = normalizeNumber(req.query.number);

  if (!isValidNumber(number)) {
    return res.status(400).json({
      error: 'Invalid phone number. Use 10–15 digits including country code (e.g. 2547XXXXXXXX).',
    });
  }

  const id = makeid();
  const authPath = path.join(TEMP_ROOT, id);
  let socket;
  let codeRequested = false;
  let cleaned = false;

  const cleanup = () => {
    if (!cleaned) {
      cleaned = true;
      removeFile(authPath);
    }
  };

  const sendError = (status, message) => {
    if (!res.headersSent) {
      res.status(status).json({ error: message });
    }
  };

  try {
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const logger = pino({ level: 'silent' });
    const { version } = await fetchLatestBaileysVersion();

    socket = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      logger,
      version,
      browser: Browsers.macOS('Chrome'),
      markOnlineOnConnect: false,
      syncFullHistory: false,
      connectTimeoutMs: 30_000,
      keepAliveIntervalMs: 25_000,
    });

    socket.ev.on('creds.update', saveCreds);

    socket.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
      try {
        // Request pairing code as soon as socket starts without waiting for QR event
        if (!state.creds.registered && !codeRequested) {
          codeRequested = true;
          // Short delay for socket WS connection handshake
          await delay(600);
          try {
            const pairingCode = await socket.requestPairingCode(number);
            const formattedCode = pairingCode?.match(/.{1,4}/g)?.join('-') || pairingCode;
            if (!res.headersSent) {
              res.json({ code: formattedCode });
            }
          } catch (pairErr) {
            console.error('[PAIRING] requestPairingCode error:', pairErr.message);
            cleanup();
            sendError(502, 'Failed to generate pairing code from WhatsApp. Please check number or try again.');
          }
        }

        if (connection === 'open') {
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
║  ✅ *MESH-TECH-V2 PAIR CODE CONNECTED*      ║
╚════════════════════════════════════════════╝
🤖 *Bot Name:* MESH-TECH-V2
📱 *Number:* ${socket.user.id.split(':')[0]}
🔐 *Session ID:* Sent above (starts with Mesh~)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *NEXT STEPS:*
1️⃣ Copy the Session ID above
2️⃣ Paste it in your bot's .env file as SESSION_ID
3️⃣ Deploy your bot and enjoy!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 Repo: https://github.com/mesh057/MESH-TECH-V2
                  `.trim(),
                },
                { quoted: sessionMessage }
              );
            } catch (msgErr) {
              console.error('[PAIRING] Failed to send session ID message to user:', msgErr.message);
            }
          }
          await delay(500);
          socket.end?.(undefined);
          cleanup();
        }

        if (connection === 'close') {
          const statusCode = getStatusCode(lastDisconnect?.error);
          cleanup();
          if ((statusCode === 401 || statusCode === 403) && !res.headersSent) {
            sendError(400, 'WhatsApp rejected the pairing request or session expired. Please try again.');
          } else if (!res.headersSent) {
            sendError(502, 'Connection closed before pairing completion.');
          }
        }
      } catch (error) {
        console.error('[PAIRING] Connection update failed:', error.message);
        cleanup();
        sendError(502, 'Pairing error occurred. Please try again.');
      }
    });
  } catch (error) {
    console.error('[PAIRING] Socket initialization failed:', error.message);
    cleanup();
    sendError(502, 'Pairing service initialization failed.');
  }
});

module.exports = router;
