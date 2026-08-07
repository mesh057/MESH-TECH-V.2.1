const config = require('../config/config');
const { getPrefix, isOwner, isGroupAdmin } = require('../utils/helpers');
const { logCommand } = require('../utils/logger');

// Import all command modules
const generalCommands = require('../commands/general');
const groupCommands = require('../commands/group');
const adminCommands = require('../commands/admin');
const mediaCommands = require('../commands/media');
const funCommands = require('../commands/fun');
const ownerCommands = require('../commands/owner');
const aiCommands = require('../commands/ai');
const downloadCommands = require('../commands/download');
const aiExtended = require('../commands/ai_extended');
const musicCommands = require('../commands/music');
const downloaderExtended = require('../commands/downloader_extended');
const toolsCommands = require('../commands/tools');
const specialCommands = require('../commands/special');
const bugCommands = require('../commands/bug');
const antiCommands = require('../commands/anti');
const channelCommands = require('../commands/channel');
const economyCommands = require('../commands/economy');
const weaponsCommands = require('../commands/weapons');
const petCommands = require('../commands/pet');
const levelupCommands = require('../commands/levelup');
const editorCommands = require('../commands/editor');
const cryptoCommands = require('../commands/crypto');
const tempmailCommands = require('../commands/tempmail');
const movieDownloaderCommands = require('../commands/movie_downloader');
const premiumAppsCommands = require('../commands/premium_apps');
const ownerExtendedCommands = require('../commands/owner_extended');
const islamCommands = require('../commands/islam');
const animeCommands = require('../commands/anime');
const nsfwCommands = require('../commands/nsfw');
const reactionsCommands = require('../commands/reactions');
const emojiCommands = require('../commands/emoji');
const gameCommands = require('../commands/game');
const userCommands = require('../commands/user');
const funExtendedCommands = require('../commands/fun_extended');
const voiceChangerCommands = require('../commands/voice_changer');
const groupExtendedCommands = require('../commands/group_extended');
const phoxyCommands = require('../commands/phoxy');
const stalkCommands = require('../commands/stalk');
const videoLogoCommands = require('../commands/video_logo');
const photoCommands = require('../commands/photo');
const aiImageCommands = require('../commands/ai_image');

const commands = {
  ...generalCommands,
  ...groupCommands,
  ...adminCommands,
  ...mediaCommands,
  ...funCommands,
  ...ownerCommands,
  ...aiCommands,
  ...downloadCommands,
  ...aiExtended,
  ...musicCommands,
  ...downloaderExtended,
  ...toolsCommands,
  ...specialCommands,
  ...bugCommands,
  ...antiCommands,
  ...channelCommands,
  ...economyCommands,
  ...weaponsCommands,
  ...petCommands,
  ...levelupCommands,
  ...editorCommands,
  ...cryptoCommands,
  ...tempmailCommands,
  ...movieDownloaderCommands,
  ...premiumAppsCommands,
  ...ownerExtendedCommands,
  ...islamCommands,
  ...animeCommands,
  ...nsfwCommands,
  ...reactionsCommands,
  ...emojiCommands,
  ...gameCommands,
  ...userCommands,
  ...funExtendedCommands,
  ...voiceChangerCommands,
  ...groupExtendedCommands,
  ...phoxyCommands,
  ...stalkCommands,
  ...videoLogoCommands,
  ...photoCommands,
  ...aiImageCommands,
};

async function commandHandler(sock, m) {
  try {
    if (!m.messages || m.messages.length === 0) return;
    const msg = m.messages[0];
    if (!msg.message) return;
    if (msg.key.fromMe) return;

    const body = msg.message.conversation || 
                 msg.message.extendedTextMessage?.text || 
                 msg.message.imageMessage?.caption || 
                 msg.message.videoMessage?.caption || '';

    const prefix = config.PREFIX;
    const isCmd = body.startsWith(prefix);
    if (!isCmd) return;

    const args = body.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const fullArgs = args.join(' ');

    const sender = msg.key.participant || msg.key.remoteJid;
    const isGroup = msg.key.remoteJid.endsWith('@g.us');
    const groupMetadata = isGroup ? await sock.groupMetadata(msg.key.remoteJid) : null;

    const ctx = {
      sock, msg, body, command, args, fullArgs, sender, isGroup, groupMetadata,
      isOwner: isOwner(sender),
      isAdmin: isGroup ? isGroupAdmin(sender, groupMetadata) : false,
      reply: async (text, opts = {}) => {
        await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg, ...opts });
      },
      send: async (content) => {
        await sock.sendMessage(msg.key.remoteJid, content);
      },
      react: async (emoji) => {
        await sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } });
      }
    };

    if (!commands[command]) return;

    const cmd = commands[command];

    if (cmd.ownerOnly && !ctx.isOwner) {
      return ctx.reply('❌ Owner only.');
    }
    if (cmd.adminOnly && !ctx.isAdmin && !ctx.isOwner) {
      return ctx.reply('❌ Admin only.');
    }
    if (cmd.groupOnly && !isGroup) {
      return ctx.reply('❌ Group only.');
    }

    await ctx.react('⏳');
    await cmd.execute(ctx);
    await ctx.react('✅');
    await logCommand(command, sender, msg.key.remoteJid);

  } catch (error) {
    console.error('[COMMAND ERROR]', error);
    try {
      const msg = m.messages[0];
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${error.message}` }, { quoted: msg });
    } catch (e) {}
  }
}

module.exports = commandHandler;
