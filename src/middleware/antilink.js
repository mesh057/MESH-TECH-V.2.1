const { initModels } = require('../database/models');

async function antiLinkMiddleware(sock, msg) {
  try {
    if (!msg.key.remoteJid.endsWith('@g.us')) return;

    const body = msg.message.conversation || 
                 msg.message.extendedTextMessage?.text || '';

    const linkRegex = /(https?:\/\/)?(www\.)?(chat\.whatsapp\.com|wa\.me|instagram\.com|facebook\.com|twitter\.com|tiktok\.com|youtube\.com|youtu\.be)\/[^\s]+/gi;

    if (linkRegex.test(body)) {
      const { Group } = initModels();
      const group = await Group.findByPk(msg.key.remoteJid);

      if (group && group.antilink) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `⚠️ @${msg.key.participant.split('@')[0]} links are not allowed here!`,
          mentions: [msg.key.participant]
        });

        await sock.sendMessage(msg.key.remoteJid, {
          delete: {
            remoteJid: msg.key.remoteJid,
            fromMe: false,
            id: msg.key.id,
            participant: msg.key.participant
          }
        });
      }
    }
  } catch (error) {
    console.error('[ANTILINK ERROR]', error.message);
  }
}

module.exports = { antiLinkMiddleware };
