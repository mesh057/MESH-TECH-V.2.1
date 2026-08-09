require('dotenv').config();

const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs-extra');
const path = require('path');
const zlib = require('zlib');
const figlet = require('figlet');
const chalk = require('chalk');
const express = require('express');
const qrcode = require('qrcode-terminal');
const http = require('http');
const { WebSocketServer } = require('ws');
const bodyParser = require('body-parser');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  Browsers,
} = require('@whiskeysockets/baileys');

const qrServer = require('./meshqr.js');
const pairServer = require('./meshpair.js');
const config = require('./src/config/config');
const { connectDatabase } = require('./src/database/connection');
const commandHandler = require('./src/handlers/commandHandler');
const eventHandler = require('./src/handlers/eventHandler');
const { autoStatusView } = require('./src/features/autoStatus');
const { autoLikeStatus } = require('./src/features/autoLikeStatus');
const {
  runtime,
  touchBot,
  getStatusSnapshot,
} = require('./src/runtime/status');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use('/qr', qrServer);
app.use('/code', pairServer);
app.get('/pair', (req, res) => {
  res.sendFile(path.join(__dirname, 'pair.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'meshpage.html'));
});

app.get('/status', async (req, res) => {
  const snapshot = await getStatusSnapshot();
  res.set('Cache-Control', 'no-store');
  res.json({
    ...snapshot,
    version: config.VERSION,
    owner: config.AUTHOR,
    botName: config.BOT_NAME,
    channel: config.CHANNEL_LINK,
    group: config.GROUP_LINK,
    github: 'https://github.com/mesh057/MESH-TECH-V.2.1',
  });
});

app.get('/api/system-status', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(await getStatusSnapshot());
});

app.get('/health', async (req, res) => {
  const snapshot = await getStatusSnapshot();
  res.status(200).json({
    status: 'healthy',
    botStatus: snapshot.status,
    timestamp: new Date().toISOString(),
  });
});

function broadcastStatus(snapshot) {
  const payload = JSON.stringify(snapshot);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(payload);
  });
}

wss.on('connection', async (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  ws.on('error', () => {});
  ws.send(JSON.stringify(await getStatusSnapshot()));
});

const statusInterval = setInterval(async () => {
  broadcastStatus(await getStatusSnapshot());
}, 3000);

const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

statusInterval.unref?.();
heartbeatInterval.unref?.();

let botSocket = null;
let reconnectTimer = null;
let startInFlight = false;
let databaseReady = false;
let shuttingDown = false;

function getDisconnectCode(error) {
  return error?.output?.statusCode || error?.statusCode || error?.data?.statusCode || null;
}

function scheduleReconnect() {
  if (shuttingDown || reconnectTimer) return;

  runtime.bot.reconnects += 1;
  touchBot({ state: 'reconnecting', error: null });
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    startBot();
  }, 5000);
}

async function getBaileysVersion() {
  try {
    const result = await fetchLatestBaileysVersion();
    return result?.version;
  } catch (error) {
    console.warn(chalk.yellow(`[BAILEYS] Could not fetch latest version: ${error.message}`));
    return undefined;
  }
}

const AUTH_DIR = process.env.AUTH_DIR || path.join(__dirname, 'auth_info');

async function handleSessionId() {
  const sessionId = config.SESSION_ID;
  const authDir = AUTH_DIR;
  const credsPath = path.join(authDir, 'creds.json');

  if (!sessionId) {
    console.log(chalk.yellow('[SESSION] No SESSION_ID found. Awaiting QR scan...'));
    return;
  }

  try {
    await fs.ensureDir(authDir);

    // Prefer the persistent multi-file auth state created by meshpair.js.
    // A stale SESSION_ID must never overwrite a successfully paired account.
    if (await fs.pathExists(credsPath)) {
      const stats = await fs.stat(credsPath);
      if (stats.size > 0) {
        console.log(chalk.green('[SESSION] Existing persistent auth found; preserving it.'));
        return;
      }
    }

    if (sessionId.startsWith('Mesh2~')) {
      const compressed = Buffer.from(sessionId.slice(6), 'base64');
      const bundle = JSON.parse(zlib.gunzipSync(compressed).toString('utf8'));
      if (bundle.format !== 'mesh-auth-v1' || !bundle.files || typeof bundle.files !== 'object') {
        throw new Error('Invalid full-auth session bundle format');
      }
      await fs.emptyDir(authDir);
      for (const [relativePath, encoded] of Object.entries(bundle.files)) {
        const destination = path.resolve(authDir, relativePath);
        if (destination !== authDir && !destination.startsWith(`${authDir}${path.sep}`)) {
          throw new Error('Session bundle contains an unsafe file path');
        }
        await fs.ensureDir(path.dirname(destination));
        await fs.writeFile(destination, Buffer.from(encoded, 'base64'));
      }
      if (!(await fs.pathExists(credsPath))) throw new Error('Full-auth bundle is missing creds.json');
      console.log(chalk.green('[SESSION] Mesh2 full-auth bundle restored to auth_info/'));
      return;
    }

    if (sessionId.startsWith('Mesh~')) {
      const credsJson = JSON.parse(Buffer.from(sessionId.slice(5), 'base64').toString('utf-8'));
      await fs.writeFile(credsPath, JSON.stringify(credsJson, null, 2));
      console.log(chalk.yellow('[SESSION] Legacy Mesh~ credentials restored; full-auth Mesh2~ sessions are recommended.'));
      return;
    }

    console.log(chalk.yellow('[SESSION] SESSION_ID has an unsupported prefix. Awaiting QR scan...'));
  } catch (error) {
    console.error(chalk.red('[SESSION] Failed to restore session:'), error.message);
    console.log(chalk.yellow('[SESSION] Continuing in QR mode...'));
  }
}

async function startBot() {
  if (shuttingDown || startInFlight) return botSocket;

  startInFlight = true;
  const reconnecting = runtime.bot.reconnects > 0;
  touchBot({ state: reconnecting ? 'reconnecting' : 'starting', error: null });

  try {
    if (!databaseReady) {
      await connectDatabase();
      databaseReady = true;
    }

    await handleSessionId();
    await fs.ensureDir(AUTH_DIR);

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    // During first-time pairing, meshpair.js must be the only Baileys socket
    // using AUTH_DIR. A second QR/socket connection can make WhatsApp reject
    // the phone-link handshake. Restart the service after pairing completes.
    if (!state.creds.registered && process.env.ALLOW_QR_BOOT !== 'true') {
      touchBot({ state: 'pairing', error: null });
      console.log(chalk.yellow('[PAIRING] No registered auth found; waiting for browser pairing.'));
      return null;
    }

    const version = await getBaileysVersion();
    const socketOptions = {
      auth: state,
      logger: pino({ level: 'silent' }),
      browser: Browsers.ubuntu('Chrome'),
      markOnlineOnConnect: true,
      keepAliveIntervalMs: 30000,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: undefined,
      syncFullHistory: false,
    };

    if (version) socketOptions.version = version;

    const sock = makeWASocket(socketOptions);
    botSocket = sock;
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        touchBot({ state: 'pairing', error: null });
        console.log(chalk.yellow('\n[QR] Scan this QR code with WhatsApp > Linked Devices:\n'));
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'connecting') {
        touchBot({ state: 'connecting', error: null });
      }

      if (connection === 'open') {
        runtime.bot.reconnects = 0;
        touchBot({
          state: 'connected',
          jid: sock.user?.id || null,
          name: sock.user?.name || config.BOT_NAME,
          error: null,
        });
        console.log(chalk.green('[CONNECTED] MESH-TECH-V2 is now online!'));
        console.log(chalk.cyan(`[INFO] Bot JID: ${sock.user?.id || 'unknown'}`));
        console.log(chalk.cyan(`[INFO] Name: ${sock.user?.name || config.BOT_NAME}`));
        console.log(chalk.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

        if (config.AUTO_READ_STATUS === 'true') autoStatusView(sock);
        if (config.AUTO_LIKE_STATUS === 'true') autoLikeStatus(sock);
      }

      if (connection === 'close') {
        const disconnectCode = getDisconnectCode(lastDisconnect?.error);
        botSocket = null;

        if (disconnectCode === DisconnectReason.loggedOut) {
          touchBot({ state: 'logged_out', error: 'WhatsApp session logged out' });
          console.log(chalk.red('[LOGOUT] Session ended. Generate a new session to reconnect.'));
          return;
        }

        touchBot({ state: 'reconnecting', error: null });
        console.log(chalk.red(`[DISCONNECT] Connection closed. Reconnecting in 5 seconds.`));
        scheduleReconnect();
      }
    });

    sock.ev.on('messages.upsert', async (message) => {
      try {
        await commandHandler(sock, message);
        touchBot({ error: null });
      } catch (error) {
        touchBot({ state: 'connected', error: error.message });
        console.error(chalk.red('[MESSAGE] Handler error:'), error);
      }
    });

    sock.ev.on('group-participants.update', async (update) => {
      try {
        await eventHandler(sock, update);
      } catch (error) {
        touchBot({ error: error.message });
        console.error(chalk.red('[GROUP] Event handler error:'), error);
      }
    });

    sock.ev.on('presence.update', () => {});
    return sock;
  } catch (error) {
    botSocket = null;
    touchBot({ state: 'error', error: error.message });
    console.error(chalk.red('[BOT] Startup error:'), error);
    scheduleReconnect();
    return null;
  } finally {
    startInFlight = false;
  }
}

function startHttpServer() {
  server.listen(PORT, () => {
    console.log(chalk.green(`[SERVER] Dashboard and status server listening on port ${PORT}`));
  });
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  clearTimeout(reconnectTimer);
  clearInterval(statusInterval);
  clearInterval(heartbeatInterval);
  touchBot({ state: 'stopped', error: null });

  try {
    if (botSocket?.ws) botSocket.ws.close();
  } catch (error) {
    console.error('[SHUTDOWN] Socket close failed:', error.message);
  }

  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
  console.log(`[SHUTDOWN] Received ${signal}. Closing services...`);
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

startHttpServer();
startBot();
