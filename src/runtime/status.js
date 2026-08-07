const fs = require('fs');
const path = require('path');

const runtime = {
  startedAt: Date.now(),
  bot: {
    state: 'starting',
    jid: null,
    name: null,
    lastEventAt: null,
    error: null,
    reconnects: 0,
  },
  pairingSessions: new Map(),
};

function now() {
  return new Date().toISOString();
}

function touchBot(patch = {}) {
  runtime.bot = {
    ...runtime.bot,
    ...patch,
    lastEventAt: now(),
  };
  return runtime.bot;
}

function registerPairingSession(id, details = {}) {
  runtime.pairingSessions.set(id, {
    id,
    type: details.type || 'pairing',
    state: details.state || 'starting',
    number: details.number || null,
    createdAt: now(),
    updatedAt: now(),
    ...details,
  });
  return runtime.pairingSessions.get(id);
}

function updatePairingSession(id, patch = {}) {
  const current = runtime.pairingSessions.get(id);
  if (!current) return null;
  const updated = { ...current, ...patch, updatedAt: now() };
  runtime.pairingSessions.set(id, updated);
  return updated;
}

function removePairingSession(id) {
  runtime.pairingSessions.delete(id);
}

function hasCreds(filePath) {
  try {
    return fs.existsSync(path.join(filePath, 'creds.json'));
  } catch (error) {
    return false;
  }
}

function countAuthSessions(rootPath) {
  try {
    if (!fs.existsSync(rootPath)) return 0;

    let count = hasCreds(rootPath) ? 1 : 0;
    const entries = fs.readdirSync(rootPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (hasCreds(path.join(rootPath, entry.name))) count += 1;
    }

    return count;
  } catch (error) {
    return 0;
  }
}

function getActivePairingCount() {
  return Array.from(runtime.pairingSessions.values()).filter((session) => (
    session.state !== 'closed' && session.state !== 'failed'
  )).length;
}

async function getStatusSnapshot() {
  const persistentSessions = countAuthSessions(path.join(__dirname, '../../auth_info'));
  const pendingPairings = getActivePairingCount();
  const botConnected = runtime.bot.state === 'connected';

  let status = 'CONNECTING';
  if (botConnected) status = 'ONLINE';
  else if (runtime.bot.state === 'error' || runtime.bot.state === 'logged_out') status = 'DEGRADED';
  else if (runtime.bot.state === 'stopped') status = 'OFFLINE';

  return {
    status,
    connectedBots: botConnected ? 1 : 0,
    activeSessions: persistentSessions + pendingPairings,
    pendingPairings,
    persistentSessions,
    uptime: Math.floor(process.uptime()),
    startedAt: new Date(runtime.startedAt).toISOString(),
    lastEventAt: runtime.bot.lastEventAt,
    botState: runtime.bot.state,
    botJid: runtime.bot.jid,
    botName: runtime.bot.name,
    reconnects: runtime.bot.reconnects,
    error: runtime.bot.error,
    timestamp: now(),
  };
}

module.exports = {
  runtime,
  touchBot,
  registerPairingSession,
  updatePairingSession,
  removePairingSession,
  getStatusSnapshot,
};
