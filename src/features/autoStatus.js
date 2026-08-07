async function autoStatusView(sock) {
  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg.key || !msg.key.remoteJid) return;
      if (msg.key.remoteJid === 'status@broadcast') {
        await sock.readMessages([msg.key]);
        console.log('[AUTO-STATUS] Viewed status from', msg.pushName || 'unknown');
      }
    } catch (error) {
      console.error('[AUTO-STATUS ERROR]', error.message);
    }
  });
}

module.exports = { autoStatusView };
