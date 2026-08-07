module.exports = {
  delete: {
    description: 'Delete a message',
    adminOnly: true,
    groupOnly: true,
    execute: async (ctx) => {
      if (!ctx.msg.message.extendedTextMessage?.contextInfo?.stanzaId) {
        return ctx.reply('❌ Reply to the message you want to delete.');
      }
      await ctx.sock.sendMessage(ctx.msg.key.remoteJid, {
        delete: {
          remoteJid: ctx.msg.key.remoteJid,
          fromMe: false,
          id: ctx.msg.message.extendedTextMessage.contextInfo.stanzaId,
          participant: ctx.msg.message.extendedTextMessage.contextInfo.participant
        }
      });
    }
  },

  warn: {
    description: 'Warn a user',
    adminOnly: true,
    groupOnly: true,
    execute: async (ctx) => {
      if (!ctx.msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
        return ctx.reply('❌ Tag the user to warn.');
      }
      const target = ctx.msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
      await ctx.reply(`⚠️ @${target.split('@')[0]} has been warned.`, { mentions: [target] });
    }
  },

  warnings: {
    description: 'Check user warnings',
    groupOnly: true,
    execute: async (ctx) => {
      await ctx.reply('📋 Warning system is active.');
    }
  },

  setdesc: {
    description: 'Set group description',
    adminOnly: true,
    groupOnly: true,
    execute: async (ctx) => {
      if (!ctx.fullArgs) return ctx.reply('❌ Provide a description.');
      await ctx.sock.groupUpdateDescription(ctx.msg.key.remoteJid, ctx.fullArgs);
      await ctx.reply('✅ Group description updated.');
    }
  },

  setsubject: {
    description: 'Set group name',
    adminOnly: true,
    groupOnly: true,
    execute: async (ctx) => {
      if (!ctx.fullArgs) return ctx.reply('❌ Provide a group name.');
      await ctx.sock.groupUpdateSubject(ctx.msg.key.remoteJid, ctx.fullArgs);
      await ctx.reply('✅ Group name updated.');
    }
  },

  revoke: {
    description: 'Revoke group invite link',
    adminOnly: true,
    groupOnly: true,
    execute: async (ctx) => {
      await ctx.sock.groupRevokeInvite(ctx.msg.key.remoteJid);
      await ctx.reply('✅ Group invite link has been revoked.');
    }
  },

  invite: {
    description: 'Get group invite link',
    adminOnly: true,
    groupOnly: true,
    execute: async (ctx) => {
      const code = await ctx.sock.groupInviteCode(ctx.msg.key.remoteJid);
      await ctx.reply(`🔗 *Group Invite Link:*\nhttps://chat.whatsapp.com/${code}`);
    }
  }
};
