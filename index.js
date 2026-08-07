const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs-extra');
const path = require('path');
const figlet = require('figlet');
const chalk = require('chalk');
const express = require('express');
const qrcode = require('qrcode-terminal');
const bodyParser = require('body-parser');
const qrServer = require('./meshqr.js');
const pairServer = require('./meshpair.js');

const config = require('./src/config/config');
const { connectDatabase } = require('./src/database/connection');
const commandHandler = require('./src/handlers/commandHandler');
const eventHandler = require('./src/handlers/eventHandler');
const { autoStatusView } = require('./src/features/autoStatus');
const { autoLikeStatus } = require('./src/features/autoLikeStatus');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session Generator Routes
app.use('/qr', qrServer);
app.use('/code', pairServer);
app.use('/pair', (req, res) => {
  res.sendFile(path.join(__dirname, 'pair.html'));
});

// Root route for Session Generator
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'meshpage.html'));
});

// Keep-alive/Status route
app.get('/status', (req, res) => {
  res.json({
    status: 'MESH-TECH-V2 is running',
    version: '2.0.0',
    owner: 'Mesh',
    channel: 'https://whatsapp.com/channel/0029VbDeTrNEKyZ9GlUude2R',
    group: 'https://chat.whatsapp.com/DM1JxxnOJFp0vsTHpej89M',
    uptime: process.uptime()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(chalk.green(`[SERVER] Keep-alive running on port ${PORT}`));
});

/**
 * Handle session ID from environment variable.
 * If SESSION_ID starts with "Mesh~", it is base64-encoded creds.json.
 * We decode it and write to auth_info/creds.json before starting Baileys.
 */
async function handleSessionId() {
  const sessionId = config.SESSION_ID;
  const authDir = './auth_info';
  const credsPath = path.join(authDir, 'creds.json');

  if (!sessionId) {
    console.log(chalk.yellow('[SESSION] No SESSION_ID found. Awaiting QR scan...'));
    return;
  }

  // Check if it's a Mesh~ prefixed session
  if (sessionId.startsWith('Mesh~')) {
    const base64Creds = sessionId.slice(5); // Remove "Mesh~" prefix
    try {
      const credsData = Buffer.from(base64Creds, 'base64').toString('utf-8');
      const credsJson = JSON.parse(credsData);

      await fs.ensureDir(authDir);
      await fs.writeFile(credsPath, JSON.stringify(credsJson, null, 2));

      console.log(chalk.green('[SESSION] Mesh~ session decoded and saved to auth_info/creds.json'));
    } catch (error) {
      console.error(chalk.red('[SESSION ERROR] Failed to decode Mesh~ session ID:'), error.message);
      console.log(chalk.yellow('[SESSION] Awaiting QR scan instead...'));
    }
  } else {
    console.log(chalk.yellow('[SESSION] SESSION_ID does not start with Mesh~. Awaiting QR scan...'));
  }
}

async function startBot() {
  console.clear();
  console.log(
    chalk.cyan(
      figlet.textSync('MESH-TECH', { horizontalLayout: 'full' })
    )
  );
  console.log(chalk.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.cyan('  MESH-TECH-V2 | Multi-Device WhatsApp Bot'));
  console.log(chalk.cyan('  Version: 2.0.0 | By: Mesh'));
  console.log(chalk.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

  // Initialize database
  await connectDatabase();

  // Handle session ID before auth state
  await handleSessionId();

  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: state,
    browser: ['MESH-TECH-V2', 'Chrome', '20.0.04'],
    markOnlineOnConnect: true,
    keepAliveIntervalMs: 30000,
    defaultQueryTimeoutMs: undefined,
    syncFullHistory: false
  });

  // Save credentials on update
  sock.ev.on('creds.update', saveCreds);

  // Connection handler
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(chalk.yellow('\n[QR] Scan this QR code with WhatsApp > Linked Devices:\n'));
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error instanceof Boom &&
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;

      console.log(
        chalk.red(
          `[DISCONNECT] Connection closed. Reconnecting: ${shouldReconnect}`
        )
      );

      if (shouldReconnect) {
        setTimeout(startBot, 5000);
      } else {
        console.log(chalk.red('[LOGOUT] Session ended. Delete auth_info folder to restart.'));
        process.exit(0);
      }
    }

    if (connection === 'open') {
      console.log(chalk.green('[CONNECTED] MESH-TECH-V2 is now online!'));
      console.log(chalk.cyan(`[INFO] Bot JID: ${sock.user.id}`));
      console.log(chalk.cyan(`[INFO] Name: ${sock.user.name}`));
      console.log(chalk.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

      // Auto features
      if (config.AUTO_READ_STATUS === 'true') autoStatusView(sock);
      if (config.AUTO_LIKE_STATUS === 'true') autoLikeStatus(sock);
    }
  });

  // Message handler
  sock.ev.on('messages.upsert', async (m) => {
    await commandHandler(sock, m);
  });

  // Group events
  sock.ev.on('group-participants.update', async (update) => {
    await eventHandler(sock, update);
  });

  // Presence update
  sock.ev.on('presence.update', async (update) => {
    // Handle presence updates if needed
  });
}

startBot().catch((err) => {
  console.error(chalk.red('[FATAL] Failed to start bot:'), err);
  process.exit(1);
});
