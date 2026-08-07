const { initModels } = require('../database/models');
const { getSequelize } = require('../database/connection');

async function eventHandler(sock, update) {
  try {
    const { id, participants, action } = update;
    const groupMetadata = await sock.groupMetadata(id);
    const { Group } = initModels();

    let [group] = await Group.findOrCreate({
      where: { gid: id },
      defaults: { name: groupMetadata.subject }
    });

    for (const participant of participants) {
      const userTag = `@${participant.split('@')[0]}`;

      if (action === 'add' && group.welcome) {
        const welcomeMsg = `👋 Welcome ${userTag} to *${groupMetadata.subject}*!\n\n` +
          `📜 Please read the group rules.\n` +
          `🤖 Type *!menu* to see available commands.`;

        await sock.sendMessage(id, { text: welcomeMsg, mentions: [participant] });
      }

      if (action === 'remove' && group.goodbye) {
        const goodbyeMsg = `👋 Goodbye ${userTag}. We hope to see you again!`;
        await sock.sendMessage(id, { text: goodbyeMsg, mentions: [participant] });
      }

      if (action === 'promote') {
        await sock.sendMessage(id, {
          text: `🎉 Congratulations ${userTag}! You have been promoted to admin.`,
          mentions: [participant]
        });
      }

      if (action === 'demote') {
        await sock.sendMessage(id, {
          text: `⚠️ ${userTag} has been demoted from admin.`,
          mentions: [participant]
        });
      }
    }
  } catch (error) {
    console.error('[EVENT ERROR]', error);
  }
}

module.exports = eventHandler;
