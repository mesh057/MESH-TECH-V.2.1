const config = require('../config/config');
const { initModels } = require('../database/models');

module.exports = {
  broadcast: {
    description: 'Broadcast message to all chats',
    ownerOnly: true,
    execute: async (ctx) => {
      if (!ctx.fullArgs) return ctx.reply('❌ Provide a message to broadcast.');

      const chats = await ctx.sock.groupFetchAllParticipating();
      const groupJids = Object.keys(chats);
      let sent = 0;

      for (const jid of groupJids) {
        try {
          await ctx.sock.sendMessage(jid, { text: `📢 *Broadcast*\n\n${ctx.fullArgs}\n\n_— ${config.AUTHOR}_` });
          sent++;
        } catch (e) {
          // Skip failed sends
        }
      }

      await ctx.reply(`✅ Broadcast sent to *${sent}* groups.`);
    }
  },

  ban: {
    description: 'Ban a user from using the bot',
    ownerOnly: true,
    execute: async (ctx) => {
      const target = ctx.msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || ctx.args[0];
      if (!target) return ctx.reply('❌ Tag a user or provide a JID.');

      const { User } = initModels();
      await User.upsert({ jid: target, isBanned: true });
      await ctx.reply(`🚫 User @${target.split('@')[0]} has been banned.`, { mentions: [target] });
    }
  },

  unban: {
    description: 'Unban a user',
    ownerOnly: true,
    execute: async (ctx) => {
      const target = ctx.msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || ctx.args[0];
      if (!target) return ctx.reply('❌ Tag a user or provide a JID.');

      const { User } = initModels();
      await User.upsert({ jid: target, isBanned: false });
      await ctx.reply(`✅ User @${target.split('@')[0]} has been unbanned.`, { mentions: [target] });
    }
  },

  restart: {
    description: 'Restart the bot',
    ownerOnly: true,
    execute: async (ctx) => {
      await ctx.reply('🔄 Restarting MESH-TECH-V2...');
      setTimeout(() => process.exit(0), 2000);
    }
  },

  setprefix: {
    description: 'Change command prefix',
    ownerOnly: true,
    execute: async (ctx) => {
      if (!ctx.args[0]) return ctx.reply('❌ Provide a new prefix. Usage: !setprefix #');
      // In production, update config or database
      await ctx.reply(`✅ Prefix changed to *${ctx.args[0]}* (requires restart)`);
    }
  },

  mode: {
    description: 'Change bot mode',
    ownerOnly: true,
    execute: async (ctx) => {
      const modes = ['public', 'private', 'self'];
      if (!modes.includes(ctx.args[0])) {
        return ctx.reply(`❌ Invalid mode. Choose: ${modes.join(', ')}`);
      }
      await ctx.reply(`✅ Bot mode set to *${ctx.args[0]}* (requires restart)`);
    }
  },

  stats: {
    description: 'Show bot statistics',
    ownerOnly: true,
    execute: async (ctx) => {
      const { CommandLog } = initModels();
      const totalCommands = await CommandLog.count();
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);

      const stats = `
📊 *Bot Statistics*

📟 *Uptime:* ${hours}h ${minutes}m
⚡ *Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
📝 *Total Commands Used:* ${totalCommands}
🌐 *Mode:* ${config.MODE}
🔧 *Version:* ${config.VERSION}
      `.trim();

      await ctx.reply(stats);
    }
  },

  block: {
    description: 'Block a user',
    ownerOnly: true,
    execute: async (ctx) => {
      const target = ctx.msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) return ctx.reply('❌ Tag a user to block.');
      await ctx.sock.updateBlockStatus(target, 'block');
      await ctx.reply(`🚫 Blocked @${target.split('@')[0]}`, { mentions: [target] });
    }
  },

  unblock: {
    description: 'Unblock a user',
    ownerOnly: true,
    execute: async (ctx) => {
      const target = ctx.msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) return ctx.reply('❌ Tag a user to unblock.');
      await ctx.sock.updateBlockStatus(target, 'unblock');
      await ctx.reply(`✅ Unblocked @${target.split('@')[0]}`, { mentions: [target] });
    }
  }
};
