const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
const { makeid } = require('./id');
const pino = require("pino");

const {
  default: Mesh_Tech,
  useMultiFileAuthState,
  Browsers,
  delay,
} = require("@whiskeysockets/baileys");

let router = express.Router();

function removeFile(FilePath) {
  if (!fs.existsSync(FilePath)) return false;
  fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
  const id = makeid();

  async function MESH_TECH_QR() {
    const tempDir = path.join(__dirname, 'temp', id);
    const { state, saveCreds } = await useMultiFileAuthState(tempDir);

    try {
      let Mesh_QR = Mesh_Tech({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: Browsers.ubuntu('Chrome'),
      });

      Mesh_QR.ev.on('creds.update', saveCreds);

      Mesh_QR.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect, qr } = s;

        if (qr) {
          await res.end(await QRCode.toBuffer(qr));
        }

        if (connection == "open") {
          await delay(5000);
          let data = fs.readFileSync(path.join(tempDir, 'creds.json'));
          await delay(800);
          let b64data = Buffer.from(data).toString('base64');
          let sessionId = 'Mesh~' + b64data;

          let session = await Mesh_QR.sendMessage(Mesh_QR.user.id, {
            text: sessionId
          });

          let MESH_TEXT = `
╔════════════════════════════════════════════╗
║  ✅ *MESH-TECH-V2 SESSION CONNECTED*      ║
╚════════════════════════════════════════════╝

🤖 *Bot Name:* MESH-TECH-V2
👤 *Owner:* Mesh
📱 *Number:* ${Mesh_QR.user.id.split(':')[0]}
🔐 *Session ID:* Sent above (starts with Mesh~)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *NEXT STEPS:*
1️⃣ Copy the Session ID above (the long text starting with Mesh~)
2️⃣ Paste it in your bot's .env file as SESSION_ID
3️⃣ Deploy your bot and enjoy!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 *Links:*
📢 Channel: https://whatsapp.com/channel/0029VbDeTrNEKyZ9GlUude2R
💬 Group: https://chat.whatsapp.com/DM1JxxnOJFp0vsTHpej89M
📦 Repo: https://github.com/mesh057/MESH-TECH-V2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_⭐ Don't forget to star the repo!_
          `.trim();

          await Mesh_QR.sendMessage(Mesh_QR.user.id, {
            text: MESH_TEXT
          }, { quoted: session });

          await delay(100);
          await Mesh_QR.ws.close();
          return await removeFile(tempDir);

        } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
          await delay(10000);
          MESH_TECH_QR();
        }
      });

    } catch (err) {
      if (!res.headersSent) {
        await res.json({ code: "Service is Currently Unavailable" });
      }
      console.log(err);
      await removeFile(tempDir);
    }
  }

  return await MESH_TECH_QR();
});

module.exports = router;
