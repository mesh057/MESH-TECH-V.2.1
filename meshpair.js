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
} = require('@whiskeysockets/baileys');

const router = express.Router();
const TEMP_ROOT = path.join(__dirname, 'temp');
const MAX_RECONNECTS = 2;

function removeFile(filePath) {
  fs.rmSync(filePath, { recursive: true, force: true });
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
      error: 'Invalid phone number. Use 10–15 digits including the country code.',
    });
  }

  const id = makeid();
  const authPath = path.join(TEMP_ROOT, id);
  let socket;
  let codeRequested = false;
  let reconnects = 0;
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

  const connect = async () => {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(authPath);
      const logger = pino({ level: 'silent' });
      const { version } = await fetchLatestBaileysVersion();

      socket = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(
            state.keys,
            logger.child({ level: 'silent' }),
          ),
        },
        logger,
        version,
        browser: ['MESH-TECH-V2', 'Chrome', '1.0.0'],
        markOnlineOnConnect: false,
        syncFullHistory: false,
        connectTimeoutMs: 60_000,
        keepAliveIntervalMs: 25_000,
      });

      socket.ev.on('creds.update', saveCreds);
      socket.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
        try {
          // Baileys requires the socket to be ready. The qr event is the
          // readiness trigger; requesting immediately after socket creation
          // can fail with 428/401 and produce no pairing code.
          if (qr && !state.creds.registered && !codeRequested) {
            codeRequested = true;
            const code = await socket.requestPairingCode(number);
            if (!res.headersSent) {
              res.json({ code });
            }
          }

          if (connection === 'open') {
            await delay(2500);
            const credsPath = path.join(authPath, 'creds.json');
            if (!fs.existsSync(credsPath)) {
              throw new Error('WhatsApp connected but credentials were not saved');
            }

            const sessionId = `Mesh~${fs.readFileSync(credsPath).toString('base64')}`;
            const sessionMessage = await socket.sendMessage(socket.user.id, {
              text: sessionId,
            });

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
              { quoted: sessionMessage },
            );

            await delay(100);
            socket.end?.(undefined);
            cleanup();
          }

          if (connection === 'close') {
            const statusCode = getStatusCode(lastDisconnect?.error);
            if (statusCode === 401 || statusCode === 403) {
              cleanup();
              if (!res.headersSent) {
                sendError(502, 'WhatsApp rejected the pairing request. Please try again.');
              }
              return;
            }

            if (!res.headersSent && reconnects < MAX_RECONNECTS) {
              reconnects += 1;
              codeRequested = false;
              await delay(1500);
              await connect();
            } else if (!res.headersSent) {
              cleanup();
              sendError(502, 'WhatsApp disconnected before a pairing code was generated.');
            }
          }
        } catch (error) {
          console.error('[PAIRING] Connection update failed:', error.message);
          cleanup();
          sendError(getStatusCode(error) >= 400 ? getStatusCode(error) : 502, 'Unable to generate a pairing code. Please try again.');
        }
      });
    } catch (error) {
      console.error('[PAIRING] Socket creation failed:', error.message);
      cleanup();
      sendError(502, 'Pairing service is temporarily unavailable. Please try again.');
    }
  };

  await connect();
});

module.exports = router;
