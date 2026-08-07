const { initModels } = require('../database/models');

module.exports = {
  kick: {
    description: 'Remove a member from group',
    adminOnly: true,
    groupOnly: true,
    execute: async (ctx) => {
      if (!ctx.msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
        return ctx.reply('❌ Tag the user to kick. Usage: !kick @user');
      }
      const target = ctx.msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
      await ctx.sock.groupParticipantsUpdate(ctx.msg.key.remoteJid, [target], 'remove');
      await ctx.reply('✅ User has been removed.');
    }
  },

  add: {
    description: 'Add a member to group',
    adminOnly: true,
    groupOnly: true,
    execute: async (ctx) => {
      if (!ctx.fullArgs) return ctx.reply('❌ Provide a number. Usage: !add 254XXXXXXXXX');
      const number = ctx.fullArgs.replace(/\D/g, '');
      const jid = `${number}@s.whatsapp.net`;
      await ctx.sock.groupParticipantsUpdate(ctx.msg.key.remoteJid, [jid], 'add');
      await ctx.reply('✅ User added to group.');
    }
  },

  promote: {
    description: 'Promote a member to admin',
    adminOnly: true,
    groupOnly: true,
    execute: async (ctx) => {
      if (!ctx.msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
        return ctx.reply('❌ Tag the user to promote.');
      }
      const target = ctx.msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
      await ctx.sock.groupParticipantsUpdate(ctx.msg.key.remoteJid, [target], 'promote');
      await ctx.reply('✅ User promoted to admin.');
    }
  },

  demote: {
    description: 'Demote an admin to member',
    adminOnly: true,
    groupOnly: true,
    execute: async (ctx) => {
      if (!ctx.msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
        return ctx.reply('❌ Tag the admin to demote.');
      }
      const target = ctx.msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
      await ctx.sock.groupParticipantsUpdate(ctx.msg.key.remoteJid, [target], 'demote');
      await ctx.reply('✅ Admin demoted to member.');
    }
  },

  tagall: {
    description: 'Mention all group members',
    adminOnly: true,
    groupOnly: true,
    execute: async (ctx) => {
      const metadata = await ctx.sock.groupMetadata(ctx.msg.key.remoteJid);
      const mentions = metadata.participants.map(p => p.id);
      const text = ctx.fullArgs || '👋 Attention everyone!';
      await ctx.sock.sendMessage(ctx.msg.key.remoteJid, { text, mentions });
    }
  },

  setwelcome: {
    description: 'Toggle welcome messages',
    adminOnly: true,
    groupOnly: true,
    execute: async (ctx) => {
      const { Group } = initModels();
      let [group] = await Group.findOrCreate({ where: { gid: ctx.msg.key.remoteJid } });
      group.welcome = !group.welcome;
      await group.save();
      await ctx.reply(`✅ Welcome messages ${group.welcome ? 'enabled' : 'disabled'}.`);
    }
  },

  setgoodbye: {
    description: 'Toggle goodbye messages',
    adminOnly: true,
    groupOnly: true,
    execute: async (ctx) => {
      const { Group } = initModels();
      let [group] = await Group.findOrCreate({ where: { gid: ctx.msg.key.remoteJid } });
      group.goodbye = !group.goodbye;
      await group.save();
      await ctx.reply(`✅ Goodbye messages ${group.goodbye ? 'enabled' : 'disabled'}.`);
    }
  },

  antilink: {
    description: 'Toggle anti-link protection',
    adminOnly: true,
    groupOnly: true,
    execute: async (ctx) => {
      const { Group } = initModels();
      let [group] = await Group.findOrCreate({ where: { gid: ctx.msg.key.remoteJid } });
      group.antilink = !group.antilink;
      await group.save();
      await ctx.reply(`✅ Anti-link ${group.antilink ? 'enabled' : 'disabled'}.`);
    }
  },

  groupinfo: {
    description: 'Show group information',
    groupOnly: true,
    execute: async (ctx) => {
      const metadata = await ctx.sock.groupMetadata(ctx.msg.key.remoteJid);
      const info = `
📊 *Group Info*

📛 *Name:* ${metadata.subject}
👥 *Members:* ${metadata.participants.length}
👑 *Admins:* ${metadata.participants.filter(p => p.admin).length}
📝 *Description:* ${metadata.desc || 'No description'}
🔒 *Restricted:* ${metadata.restrict ? 'Yes' : 'No'}
      `.trim();
      await ctx.reply(info);
    }
  },

  mute: {
    description: 'Mute the group',
    adminOnly: true,
    groupOnly: true,
    execute: async (ctx) => {
      await ctx.sock.groupSettingUpdate(ctx.msg.key.remoteJid, 'announcement');
      await ctx.reply('🔇 Group has been muted. Only admins can send messages.');
    }
  },

  unmute: {
    description: 'Unmute the group',
    adminOnly: true,
    groupOnly: true,
    execute: async (ctx) => {
      await ctx.sock.groupSettingUpdate(ctx.msg.key.remoteJid, 'not_announcement');
      await ctx.reply('🔊 Group has been unmuted. Everyone can send messages.');
    }
  }
};
