const config = require('../config/config');

function getPrefix() {
  return config.PREFIX;
}

function isOwner(jid) {
  return jid.includes(config.OWNER_NUMBER) || jid === config.OWNER_NUMBER + '@s.whatsapp.net';
}

function isGroupAdmin(jid, groupMetadata) {
  if (!groupMetadata || !groupMetadata.participants) return false;
  const participant = groupMetadata.participants.find(p => p.id === jid);
  return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
  getPrefix,
  isOwner,
  isGroupAdmin,
  formatUptime,
  formatBytes,
  sleep,
  randomChoice
};
