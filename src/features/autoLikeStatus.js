async function autoLikeStatus(sock) {
  const reactions = ['❤️', '🔥', '👏', '😍', '💯', '⭐', '🎉', '👍'];

  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg.key || !msg.key.remoteJid) return;
      if (msg.key.remoteJid === 'status@broadcast') {
        const reaction = reactions[Math.floor(Math.random() * reactions.length)];
        await sock.sendMessage(msg.key.remoteJid, {
          react: { text: reaction, key: msg.key }
        });
        console.log('[AUTO-LIKE] Reacted to status with', reaction);
      }
    } catch (error) {
      console.error('[AUTO-LIKE ERROR]', error.message);
    }
  });
}

module.exports = { autoLikeStatus };
