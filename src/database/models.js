const { DataTypes } = require('sequelize');
const { getSequelize } = require('./connection');

function initModels() {
  const sequelize = getSequelize();

  const User = sequelize.define('User', {
    jid: { type: DataTypes.STRING, primaryKey: true },
    name: DataTypes.STRING,
    warns: { type: DataTypes.INTEGER, defaultValue: 0 },
    isBanned: { type: DataTypes.BOOLEAN, defaultValue: false },
    isPremium: { type: DataTypes.BOOLEAN, defaultValue: false },
    messageCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    lastSeen: DataTypes.DATE
  });

  const Group = sequelize.define('Group', {
    gid: { type: DataTypes.STRING, primaryKey: true },
    name: DataTypes.STRING,
    welcome: { type: DataTypes.BOOLEAN, defaultValue: true },
    goodbye: { type: DataTypes.BOOLEAN, defaultValue: true },
    antilink: { type: DataTypes.BOOLEAN, defaultValue: false },
    antispam: { type: DataTypes.BOOLEAN, defaultValue: false },
    modonly: { type: DataTypes.BOOLEAN, defaultValue: false }
  });

  const CommandLog = sequelize.define('CommandLog', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    command: DataTypes.STRING,
    userJid: DataTypes.STRING,
    groupJid: DataTypes.STRING,
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  });

  return { User, Group, CommandLog };
}

module.exports = { initModels };
