const { initModels } = require('../database/models');

async function logCommand(command, userJid, groupJid) {
  try {
    const { CommandLog } = initModels();
    await CommandLog.create({
      command,
      userJid,
      groupJid: groupJid || null
    });
  } catch (error) {
    console.error('[LOGGER ERROR]', error.message);
  }
}

function logInfo(message) {
  console.log(`[INFO] ${new Date().toISOString()} — ${message}`);
}

function logError(message, error) {
  console.error(`[ERROR] ${new Date().toISOString()} — ${message}`, error);
}

function logWarn(message) {
  console.warn(`[WARN] ${new Date().toISOString()} — ${message}`);
}

module.exports = { logCommand, logInfo, logError, logWarn };
