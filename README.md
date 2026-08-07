<div align="center">

<img src="https://i.postimg.cc/vHZz7VWG/bot-logo.png" alt="MESH-TECH-V2 Logo" width="180" style="border-radius: 50%; box-shadow: 0 0 40px rgba(0,242,96,0.3);"/>

# 🤖 MESH-TECH-V2

### *A Powerful Multi-Device WhatsApp Bot*

[![Version](https://img.shields.io/badge/Version-2.0.0-blue.svg)](https://github.com/mesh057/MESH-TECH-V.2.1)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)

**Built with ❤️ by [Mesh](https://github.com/mesh057)**

📢 [WhatsApp Channel](https://whatsapp.com/channel/0029VbDeTrNEKyZ9GlUude2R) | 💬 [Support Group](https://chat.whatsapp.com/DM1JxxnOJFp0vsTHpej89M)

</div>

---

## ✨ Features

- 🔗 **Multi-Device Support** — Works with WhatsApp Web & Mobile simultaneously
- 🛰️ **Pairing Control Center** — Futuristic dashboard with live bot, session, and pairing counters
- 📷 **Browser QR Scanner** — Scan from a camera or image locally in the browser
- 🗄️ **Dual Database** — PostgreSQL for production, SQLite for local/dev
- ⚡ **Auto Status** — Auto-view and auto-react to status updates
- 🛡️ **Group Management** — Kick, add, promote, demote, mute, antilink, welcome/goodbye
- 🎵 **Media Downloads** — YouTube, TikTok, Instagram, Facebook, Spotify
- 🎨 **Image Processing** — Sticker creation, blur, brightness, crop, format conversion
- 🤖 **AI Integration** — 35+ AI models: GPT-4o, Claude, DeepSeek, Gemini, Llama, etc.
- 🎨 **AI Image Gen** — Flux, Flux Pro, Diffusion, Text2Img
- 😂 **Fun Commands** — Jokes, memes, quotes, facts, shipping, roasting
- 👑 **Owner Controls** — Broadcast, ban/unban, restart, mode switching
- 🎮 **Games** — Blackjack, Tic Tac Toe, Werewolf, UNO
- 💰 **Economy** — Daily rewards, bank, shop, lottery, duels
- 🐾 **Pets & Weapons** — Battle system
- 📈 **Level System** — XP, leaderboards
- 🚀 **Multi-Platform Deploy** — Heroku, Render, Railway, Koyeb, VPS, Panels

---

## 📋 Requirements

| Requirement | Version |
|-------------|---------|
| Node.js     | >= 18.0.0 |
| FFmpeg      | Latest |
| Git         | Latest |

---

## 🚀 Quick Start

### 1️⃣ Fork & Clone

```bash
git clone https://github.com/mesh057/MESH-TECH-V.2.1.git
cd MESH-TECH-V.2.1
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your details:

```env
SESSION_ID=Mesh~your_session_id_here
MODE=public
OWNER_NUMBER=254746844168
TIME_ZONE=Africa/Nairobi
AUTO_READ_STATUS=true
AUTO_LIKE_STATUS=true
PREFIX=!.
```

### 4️⃣ Get Your Session ID

1. Start your bot: `npm start`
2. Visit the futuristic pairing dashboard at your server URL (for example, `http://localhost:3000`)
3. Choose **Pairing Code** or open the **QR workflow**
4. Use the built-in browser scanner for a camera or saved QR image when needed
5. Follow the WhatsApp instructions to link your device
6. Copy the session ID starting with `Mesh~`
7. Paste it into your `.env` file and restart the bot

### 5️⃣ Run the Bot

```bash
npm start
```

---

## 🌐 Deployment Options

### ☁️ Heroku (Recommended)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/mesh057/MESH-TECH-V.2.1)

- PostgreSQL is **auto-provisioned**
- Just add your `SESSION_ID`

### 🎨 Render

1. Fork this repo
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your forked repo
4. Render provisions the PostgreSQL database from `render.yaml`
5. Add `SESSION_ID` as a secret — the free tier has an ephemeral local filesystem, so do not rely on local `auth_info` files for persistence
6. Deploy and open the generated dashboard URL

> **Production note:** Render’s free web services cannot attach persistent disks. The bot is designed to rebuild its auth state from the `Mesh~` session secret on restart. Use a paid Render service with a persistent disk if you need local auth files to survive independently of the session secret.

### 🚂 Railway

1. Fork this repo
2. Go to [railway.app](https://railway.app)
3. New Project → Deploy from GitHub repo
4. Add PostgreSQL database
5. Set environment variables

### 🐳 Koyeb

1. Fork this repo
2. Go to [koyeb.com](https://koyeb.com)
3. Deploy from GitHub
4. Get a free PostgreSQL from [neon.tech](https://neon.tech)
5. Set `DATABASE_URL` and `SESSION_ID`

### 🖥️ VPS / Self-Hosted

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install -y nodejs npm ffmpeg git

git clone https://github.com/mesh057/MESH-TECH-V.2.1.git
cd MESH-TECH-V.2.1
npm install

# Create .env file
nano .env

# Start with PM2 (recommended)
npm install -g pm2
pm2 start index.js --name mesh-tech-v2
pm2 save
pm2 startup
```

---

## 📁 Project Structure

```
MESH-TECH-V2/
├── 📄 index.js                 # Main entry point (Bot + Session Gen)
├── 📄 meshqr.js                # QR Code session generator
├── 📄 meshpair.js              # Pairing code session generator
├── 📂 public/                   # Dashboard CSS, browser logic, and local QR decoder
├── 📄 id.js                    # ID generator utility
├── 📄 meshpage.html            # Session gen home page
├── 📄 pair.html                # Pairing code page
├── 📦 package.json             # Dependencies & scripts
├── 🔧 .env.example             # Environment template
├── 🐳 Dockerfile               # Container config
├── ☁️ app.json                 # Heroku config
├── 🎨 render.yaml              # Render config
├── 🚂 railway.toml             # Railway config
├── 🌍 koyeb.yaml               # Koyeb config
│
├── 📂 src/
│   ├── 📂 config/
│   │   └── config.js           # Bot configuration
│   ├── 📂 database/
│   │   ├── connection.js       # DB connection (SQLite/PostgreSQL)
│   │   └── models.js           # Sequelize models
│   ├── 📂 handlers/
│   │   ├── commandHandler.js   # Command routing (30+ modules)
│   │   └── eventHandler.js     # Group events (welcome, goodbye)
│   ├── 📂 commands/
│   │   ├── general.js          # Menu, alive, ping, owner
│   │   ├── ai.js               # Basic AI chat
│   │   ├── ai_extended.js      # 35+ AI models
│   │   ├── ai_image.js         # AI image generation
│   │   ├── music.js            # Music download & play
│   │   ├── download.js         # YouTube, TikTok, etc.
│   │   ├── downloader_extended.js # Extended downloaders
│   │   ├── media.js            # Sticker, image processing
│   │   ├── tools.js            # 80+ utility tools
│   │   ├── special.js          # Special features
│   │   ├── bug.js              # Bug commands
│   │   ├── anti.js             # Anti-link, anti-delete
│   │   ├── channel.js          # Channel management
│   │   ├── economy.js          # Economy system
│   │   ├── weapons.js          # Weapon system
│   │   ├── pet.js              # Pet system
│   │   ├── levelup.js          # Level system
│   │   ├── editor.js           # Image editor memes
│   │   ├── crypto.js           # Crypto prices
│   │   ├── tempmail.js         # Temp mail
│   │   ├── movie_downloader.js # Movie downloads
│   │   ├── premium_apps.js     # Premium app mods
│   │   ├── owner.js            # Owner commands
│   │   ├── owner_extended.js   # Extended owner commands
│   │   ├── islam.js            # Islamic features
│   │   ├── anime.js            # 70+ anime commands
│   │   ├── nsfw.js             # NSFW commands
│   │   ├── reactions.js        # Reaction GIFs
│   │   ├── emoji.js            # Emoji commands
│   │   ├── game.js             # Games
│   │   ├── user.js             # User utilities
│   │   ├── fun.js              # Basic fun commands
│   │   ├── fun_extended.js     # Extended fun commands
│   │   ├── voice_changer.js    # Voice effects
│   │   ├── group.js            # Basic group commands
│   │   ├── group_extended.js   # Extended group commands
│   │   ├── phoxy.js            # Text effects
│   │   ├── stalk.js            # Stalk commands
│   │   ├── video_logo.js       # Video logos
│   │   └── photo.js            # Photo text effects
│   ├── 📂 features/
│   │   ├── autoStatus.js       # Auto-view statuses
│   │   └── autoLikeStatus.js   # Auto-react to statuses
│   ├── 📂 utils/
│   │   ├── helpers.js          # Utility functions
│   │   └── logger.js           # Logging system
│   └── 📂 middleware/
│       ├── auth.js             # Permission middleware
│       └── antilink.js         # Anti-link protection
│
├── 📂 assets/                  # Images, logos, banners
├── 📂 auth_info/               # WhatsApp session data
├── 📂 tmp/                     # Temporary files
├── 📂 src/runtime/              # Runtime bot/session status tracking
├── 📄 README.md                 # Full documentation
└── 📄 LICENSE                  # MIT License
```

---

## 📝 Command Categories (300+ Commands)

| Category | Commands | Count |
|----------|----------|-------|
| AI | chatgpt, copilot, llama, gemini, claude, deepseek, gpt4, etc. | 35+ |
| AI Image | flux, fluxpro, diffusion, text2img, image, imagine | 6 |
| Music | play, play2, song, video, ytmp3, ytmp4 | 8 |
| Downloader | tiktok, twitter, facebook, instagram, gdrive, etc. | 20+ |
| Media | sticker, toimg, tovideo, tomp3, blur, brightness, crop | 8 |
| Tools | tts, weather, trackip, npm, translate, screenshot, etc. | 80+ |
| Group | add, kick, promote, demote, tagall, mute, antilink | 25+ |
| Fun | joke, meme, ship, dare, truth, horoscope, etc. | 30+ |
| Anime | waifu, naruto, nezuko, miku, etc. | 70+ |
| NSFW | genshin, swimsuit, bikini, etc. | 50+ |
| Games | blackjack, tictactoe, werewolf, uno | 10 |
| Economy | daily, bank, shop, lottery, duel | 13 |
| Owner | broadcast, ban, restart, mode, sudo | 40+ |
| Editor | wanted, drake, clown, tweet, album | 7 |
| Crypto | crypto-price, top-crypto, crypto-convert | 5 |
| Voice | bass, nightcore, robot, reverse | 12 |
| Photo | glitchtext, blackpinkstyle, galaxywallpaper | 30+ |
| Phoxy | shadow, flamingtext, writearts | 25+ |
| Stalk | githubstalk, igstalk, tiktokstalk | 4 |
| Reactions | kill, pat, slap, wink, hug | 19 |
| Islam | doaharian, kisahnabi, surah, jadwalsholat | 4 |

---

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SESSION_ID` | ✅ | — | WhatsApp session (starts with `Mesh~`; required for reliable Render restarts) |
| `MODE` | ✅ | `public` | `public` / `private` / `self` |
| `OWNER_NUMBER` | ✅ | `254746844168` | Your WhatsApp number |
| `TIME_ZONE` | ❌ | `Africa/Nairobi` | Your timezone |
| `AUTO_READ_STATUS` | ❌ | `true` | Auto-view statuses |
| `AUTO_LIKE_STATUS` | ❌ | `true` | Auto-react to statuses |
| `DATABASE_URL` | ❌ | — | PostgreSQL URL (blank = SQLite) |
| `PREFIX` | ❌ | `!.` | Command prefix |
| `OPENAI_API_KEY` | ❌ | — | For GPT commands |
| `GEMINI_API_KEY` | ❌ | — | For Gemini AI |

---

## 🛡️ Safety & Best Practices

- ✅ Always **fork** the repo before deploying
- ✅ Never share your `SESSION_ID` publicly
- ✅ Use a **dedicated WhatsApp number** for the bot
- ✅ Keep your `.env` file in `.gitignore`
- ✅ Regularly update dependencies: `npm update`
- ✅ Use PostgreSQL for production deployments

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `SESSION_ID` invalid | Regenerate from the session site |
| FFmpeg not found | Install FFmpeg: `sudo apt install ffmpeg` |
| Database error | Check `DATABASE_URL` or use SQLite |
| Bot not responding | Check logs: `pm2 logs mesh-tech-v2` |
| QR not showing | Open the dashboard’s QR workflow, use the browser scanner, or check the `/qr` endpoint response |

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Credits

- [Baileys](https://github.com/WhiskeySockets/Baileys) — WhatsApp Web API
- [Node.js](https://nodejs.org) — Runtime
- [Sequelize](https://sequelize.org) — ORM
- [FFmpeg](https://ffmpeg.org) — Media processing

---

<div align="center">

**⭐ Star this repo if you find it useful!**

📢 [Join Channel](https://whatsapp.com/channel/0029VbDeTrNEKyZ9GlUude2R) | 💬 [Join Group](https://chat.whatsapp.com/DM1JxxnOJFp0vsTHpej89M)

<img src="https://i.postimg.cc/vHZz7VWG/bot-logo.png" alt="MESH-TECH-V2 Logo" width="80"/>

**Made with ❤️ by Mesh**

</div>
