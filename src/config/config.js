require('dotenv').config();

module.exports = {
  // Core
  SESSION_ID: process.env.SESSION_ID || '',
  MODE: process.env.MODE || 'public',
  OWNER_NUMBER: process.env.OWNER_NUMBER || '254746844168',
  PREFIX: process.env.PREFIX || '!',
  BOT_NAME: process.env.BOT_NAME || 'MESH-TECH-V2',

  // Timezone
  TIME_ZONE: process.env.TIME_ZONE || 'Africa/Nairobi',

  // Auto Features
  AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || 'true',
  AUTO_LIKE_STATUS: process.env.AUTO_LIKE_STATUS || 'true',
  AUTO_REPLY_STATUS: process.env.AUTO_REPLY_STATUS || 'false',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',

  // API Keys
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',

  // Links
  CHANNEL_LINK: 'https://whatsapp.com/channel/0029VbDeTrNEKyZ9GlUude2R',
  GROUP_LINK: 'https://chat.whatsapp.com/DM1JxxnOJFp0vsTHpej89M',

  // Bot Metadata
  VERSION: '2.0.0',
  AUTHOR: 'Mesh'
};
