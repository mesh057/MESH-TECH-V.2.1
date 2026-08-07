const config = require('../config/config');
const moment = require('moment-timezone');

module.exports = {
  menu: {
    description: 'Show the bot menu',
    execute: async (ctx) => {
      const time = moment().tz(config.TIME_ZONE).format('HH:mm:ss');
      const date = moment().tz(config.TIME_ZONE).format('dddd, MMMM Do YYYY');

      const menuText = `
╭━━━❮ *${config.BOT_NAME}* ❯━━━╮
┃
┃ ⏰ *Time:* ${time}
┃ 📅 *Date:* ${date}
┃ 🌐 *Mode:* ${config.MODE.toUpperCase()}
┃ 📟 *Version:* ${config.VERSION}
┃ 👤 *Owner:* ${config.AUTHOR}
┃
╰━━━❮ *COMMANDS* ❯━━━╯

📌 *GENERAL*
┃ !menu — Show this menu
┃ !alive — Check bot status
┃ !ping — Bot latency
┃ !owner — Contact owner
┃ !channel — Bot channel
┃ !group — Support group

📌 *AI MENU*
┃ !chatgpt, !copilot, !llama, !metaai
┃ !gemini, !gemini2, !gemma, !hermes
┃ !blackbox, !claude, !deepseek, !deepseekr1
┃ !gita, !mistral, !muslimai, !powerbrain
┃ !qwen2, !qvq, !teachai, !goody
┃ !human-ai, !venice, !degreeguru, !phi-3
┃ !mistral-nemo, !hermes-3, !lori, !qwq
┃ !command-r-plus, !qwen2coder, !gpt4, !nemotron
┃ !gemini-vision — Reply to image
┃ !githubroaster <user>

📌 *AI IMAGE GENERATOR*
┃ !flux <prompt> — Generate image
┃ !fluxpro <prompt> — Pro quality
┃ !diffusion <prompt> — Diffusion art
┃ !text2img <prompt> — Text to image
┃ !image <prompt> — AI image
┃ !imagine <prompt> — AI art

📌 *MUSIC MENU*
┃ !play <song> — Search & play
┃ !play2 <song> — Play v2
┃ !song <url> — Download song
┃ !video <url> — Download video
┃ !playdoc <song> — As document
┃ !videodoc <video> — As document
┃ !ytmp3 <url> — YouTube MP3
┃ !ytmp4 <url> — YouTube MP4

📌 *DOWNLOADER MENU*
┃ !tiktok <url> — TikTok video
┃ !tt2 <url> — TikTok v2
┃ !tt3 <url> — TikTok v3
┃ !ttslide <url> — TikTok slides
┃ !igmp4 <url> — Instagram video
┃ !igdl <url> — Instagram DL
┃ !gdrive <url> — Google Drive
┃ !sfile <url> — SolidFiles
┃ !aio <url> — All-in-one
┃ !goredl <url> — Gore DL
┃ !twitter <url> — Twitter/X
┃ !gitclone <url> — GitHub repo
┃ !instagram <url> — Instagram
┃ !apk <app> — Download APK
┃ !mediafire <url> — MediaFire
┃ !yts <query> — YouTube search
┃ !facebook <url> — Facebook
┃ !terabox <url> — Terabox
┃ !lyrics <song> — Song lyrics

📌 *SPECIAL MENU*
┃ !lockotp — Lock OTP
┃ !antibug — Anti bug
┃ !xxxsearch <query>
┃ !xxxdownload <url>
┃ !xnxxsearch <query>
┃ !xnxxdownload <url>
┃ !hentai — Hentai image
┃ !text2pdf <text>
┃ !livescores — Sports scores
┃ !reactchannel — React channel
┃ !faceswap — Face swap
┃ !sureodds — Betting odds
┃ !bin <number> — BIN checker
┃ !fakeid — Fake ID
┃ !anime <episode>
┃ !cut <start/end>
┃ !savevideo — Save video
┃ !addmusic — Add music

📌 *BUG MENU*
┃ !unlimitedlag <number>
┃ !rideordie <number>
┃ !zoro <number>
┃ !elite <number>
┃ !fusion <number>
┃ !airforce <number>
┃ !ioskill <number>
┃ !benkai <number>
┃ !zenitsu <number>

📌 *TOOLS MENU*
┃ !tts <text> — Text to speech
┃ !pin <query> — Pinterest
┃ !diary <entry>
┃ !googleimage <query>
┃ !post — Post audio
┃ !shazam — Identify song
┃ !audiomack <song>
┃ !photoleap — Edit photo
┃ !picsum — Random image
┃ !npm <package>
┃ !sketch — Sketch effect
┃ !playstore <app>
┃ !pixiv <query>
┃ !font <text>
┃ !searchgroup <name>
┃ !toimg — Sticker to image
┃ !tovideo — Sticker to video
┃ !tomp3 — Video to MP3
┃ !spotifysearch <song>
┃ !ngl <user> <msg>
┃ !technews — Tech news
┃ !steamsearch <game>
┃ !chord <song>
┃ !ttsearch <query>
┃ !tr <lang> <text>
┃ !filmsearch <movie>
┃ !groupsearch <name>
┃ !trackip <ip>
┃ !get <url>
┃ !fetch <url>
┃ !fdroid <app>
┃ !styletext <text>
┃ !cinema <movie>
┃ !quotess — Quotes
┃ !wattpad <story>
┃ !vv — View once
┃ !translate <text>
┃ !readmore <text>
┃ !pinchat — Pin chat
┃ !quran — Quran verse
┃ !bible — Bible verse
┃ !emojimix 😂 😭
┃ !periodic-tablr
┃ !unpinchat
┃ !ocr — OCR image
┃ !calculator <expr>
┃ !fact — Random fact
┃ !hdvideo — HD enhance
┃ !convert <value>
┃ !converttime <time>
┃ !listcurrency
┃ !creatememe
┃ !password <len>
┃ !remindme <time> <msg>
┃ !wanumner <number>
┃ !save — Save msg
┃ !ss <url> — Screenshot
┃ !couplepp — Couple PFP
┃ !encryp <text>
┃ !languages
┃ !credits
┃ !support
┃ !repost
┃ !vv2
┃ !tiktoksearch <query>
┃ !movie <title>
┃ !volvid — Volume video
┃ !remini — Enhance photo
┃ !upscale — Upscale image
┃ !kdrama <title>
┃ !channel — Channel link
┃ !fliptext <text>
┃ !spamsms <number>
┃ !weather <city>
┃ !modapk <app>
┃ !terabox <url>
┃ !tinyurl <url>
┃ !shorturl <url>
┃ !cuttly <url>
┃ !bitly <url>
┃ !sound1-!sound161

📌 *ANTI MENU*
┃ !antilink — Toggle
┃ !antilink-kick <on/off>
┃ !antilink-warn <on/off>
┃ !antilink-delete <on/off>
┃ !antidelete <on/off>
┃ !antispam <on/off>
┃ !antitag <on/off>
┃ !antitemu <on/off>

📌 *CHANNEL MENU*
┃ !getnewsletter
┃ !createchannel
┃ !removepic
┃ !updatedesc <text>
┃ !updatename <name>
┃ !updatepic
┃ !mutenews
┃ !unmutenews
┃ !followchannel <url>
┃ !unfollowchannel <url>
┃ !deletechannel

📌 *ECONOMY MENU*
┃ !daily — Daily reward
┃ !transfer @user <amount>
┃ !bank — Bank balance
┃ !wallet — Wallet
┃ !withdraw <amount>
┃ !deposit <amount>
┃ !shop — Shop items
┃ !buyguard
┃ !buy <item>
┃ !lottery
┃ !buyticket
┃ !roll-dice
┃ !duel @user

📌 *WEAPONS MENU*
┃ !buyweapon <name>
┃ !myweapons
┃ !attack @user

📌 *PET MENU*
┃ !buypet <number>
┃ !mypet
┃ !train <number>
┃ !battle @user

📌 *LEVEL-UP MENU*
┃ !level
┃ !levelup <on/off>
┃ !leaderboard

📌 *EDITOR MENU*
┃ !wanted — Wanted poster
┃ !drake <top> <bottom>
┃ !clown — Clown meme
┃ !alert <text>
┃ !petgif — Pet GIF
┃ !tweet <text>
┃ !album <text>

📌 *CRYPTO MENU*
┃ !crypto-price <coin>
┃ !top-crypto
┃ !crypto-index
┃ !crypto-convert
┃ !crypto-news

📌 *TEMP-MAIL MENU*
┃ !tempmail
┃ !tempmail-inbox <email>

📌 *MOVIE DOWNLOADER*
┃ !movie <title>
┃ !selectmovie <number>
┃ !dlmovie <number>

📌 *PREMIUM APPS*
┃ !ff_headshot
┃ !capcut, !capcut2
┃ !netflix, !telegram
┃ !sms_bomber
┃ !remini_apk
┃ !youtube_apk
┃ !prime_video

📌 *OWNER MENU*
┃ !chatbot <on/off>
┃ !chatbotgc <on/off>
┃ !chatbotall <on/off>
┃ !update
┃ !shutdown
┃ !setbio <text>
┃ !mode-private, !mode-public
┃ !report <issue>
┃ !clearchat
┃ !setpp, !getpp
┃ !listblock
┃ !block @user, !unblock @user
┃ !getbio
┃ !restart
┃ !antiviewonce <on/off>
┃ !antidelete <on/off>
┃ !anticall <on/off>
┃ !autoviewstatus <on/off>
┃ !autostatusreact <on/off>
┃ !autobio <on/off>
┃ !autoreact <on/off>
┃ !autotyping <on/off>
┃ !autorecording <on/off>
┃ !alwaysonline <on/off>
┃ !autoread <on/off>
┃ !unavailable
┃ !delete
┃ !mode <type>
┃ !sudo, !delsudo, !listsudo
┃ !$, !=>, !>
┃ !premium, !buypremium
┃ !addcase, !delcase
┃ !stop

📌 *ISLAM MENU*
┃ !doaharian
┃ !kisahnabi
┃ !surah <number>
┃ !jadwalsholat <city>

📌 *ANIME MENU*
┃ !bluearchive, !animecharacter
┃ !waifu, !quotesanime
┃ !kiryuu, !9anime, !webtoon
┃ !akira, !akiyama, !asuna
┃ !boruto, !chiho, !cosplay
┃ !deidera, !eliana, !ezra
┃ !emilia, !hestia, !hinata
┃ !inori, !isuzu, !itori
┃ !itachi, !justina, !kaga
┃ !kagura, !kakasih, !kaoshi
┃ !keneki, !kotori, !kurumi
┃ !madara, !megumin, !mikasa
┃ !miku, !naruto, !nezuko
┃ !onepiece, !pentol, !rize
┃ !sagiri, !sakura, !sasuke
┃ !shota, !toukachan, !tsunade
┃ !yotsuba, !yuki, !yumeko
┃ +50 more anime commands

📌 *NSFW MENU*
┃ !genshin, !swimsuit, !white
┃ !barefoot, !touhou, !gamecg
┃ !hololive, !uncensored
┃ !sunglasses, !glasses, !weapon
┃ !shirtlift, !chain, !fingering
┃ !flatchest, !torncloth, !bondage
┃ !demon, !pantypull, !headphone
┃ !headdress, !anusview, !shorts
┃ !stokings, !topless, !beach
┃ !bunnygirl, !bunnyear, !vampire
┃ !bikini, !nobra, !whitehair
┃ !blonde, !pinkhair, !bed
┃ !ponytail, !nude, !dress
┃ !underwear, !uniform, !foxgirl
┃ !skirt, !breast, !twintail
┃ !spreadpussy, !seethrough
┃ !breasthold, !fateseries
┃ !spreadlegs, !openshirt
┃ !headband, !nipples
┃ !erectnipples, !greenhair
┃ !wolfgirl

📌 *REACTIONS MENU*
┃ !kill, !pat, !lick, !bite
┃ !yeet, !bonk, !wink, !poke
┃ !nom, !slap, !smile, !wave
┃ !blush, !smug, !glomp
┃ !happy, !dance, !cringe
┃ !highfive

📌 *EMOJI MENU*
┃ !laugh, !shy, !sad, !kiss
┃ !moon, !anger, !happy
┃ !confused, !heart

📌 *GAME MENU*
┃ !clan, !werewolf, !war
┃ !msp, !uno, !giveaway
┃ !blackjack, !tictactoe
┃ !wrg, !wcg

📌 *USER MENU*
┃ !afk <reason>
┃ !server, !disk, !lookup
┃ !ping, !alive, !system
┃ !runtime

📌 *FUN MENU*
┃ !top, !fact, !flipcoin
┃ !rate, !rizz, !flirt
┃ !pickupline, !joke, !ship
┃ !dare, !truth, !trivia
┃ !answer, !scoreboard
┃ !horoscope, !stupidcheck
┃ !gaycheck, !waifucheck
┃ !hotcheck, !uncleancheck
┃ !evilcheck, !smartcheck
┃ !soulmate @user, !couple @user
┃ !what, !where, !when, !is

📌 *VOICE CHANGER*
┃ !bass, !blown, !deep
┃ !earrape, !fast, !fat
┃ !nightcore, !reverse
┃ !robot, !slow, !smooth
┃ !squirrel

📌 *GROUP MENU*
┃ !add <number>, !kick @user
┃ !remove <code>, !everyone
┃ !tagall, !leavegc, !join
┃ !invite, !getname, !getdeskgc
┃ !getppgc, !setppgc, !svcontact
┃ !listonline, !opengroup
┃ !closegroup, !linkgc
┃ !resetlink, !creategc
┃ !hidetag, !promote @user
┃ !demote @user, !promoteall
┃ !demoteall, !kickall
┃ !warn @user

📌 *PHOXY MENU*
┃ !shadow, !romantic, !write
┃ !burnpaper, !smoke
┃ !narutobanner, !love
┃ !undergrass, !doublelove
┃ !coffeecup, !underwaterocean
┃ !smokyneon, !startexts
┃ !ballontexts, !rainboeffect
┃ !metalliceffect, !embroiderytexts
┃ !stonetexts, !flamingtext
┃ !writearts, !summertexts
┃ !nature3dtexts, !rosestexts
┃ !wolfmetaltexts, !naturaltypography
┃ !shinetexts, !quotesunder

📌 *STALK MENU*
┃ !githubstalk <user>
┃ !igstalk <user>
┃ !tiktokstalk <user>
┃ !ffstalk <id>

📌 *VIDEO LOGO*
┃ !logointro, !elegant
┃ !pubg, !tiger

📌 *PHOTO MENU*
┃ !glitchtext, !writetext
┃ !advancedglow, !typographytext
┃ !pixelglitch, !neonglitch
┃ !flagtext, !flag3dtext
┃ !deletingtext, !blackpinkstyle
┃ !glowingtext, !underwatertext
┃ !logomaker, !cartoonstyle
┃ !papercutstyle, !watercolor
┃ !effectcloud, !blackpinklogo
┃ !gradienttext, !luxurygold
┃ !sandsummer, !multicoloredneon
┃ !makingneon, !galaxywallpaper
┃ !1917style, !freecreate
┃ !galaxystyle, !lighteffects

📌 *MEDIA*
┃ !sticker — Convert to sticker
┃ !toimg — Sticker to image
┃ !tovideo — Sticker to video
┃ !tomp3 — Video to audio
┃ !blur — Blur image
┃ !brightness — Adjust brightness
┃ !crop — Crop image

╰━━━❮ *${config.BOT_NAME}* ❯━━━╯
      `.trim();

      await ctx.reply(menuText);
    }
  },

  alive: {
    description: 'Check if bot is running',
    execute: async (ctx) => {
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const aliveText = `
🤖 *${config.BOT_NAME}* is *ONLINE* ✅

⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s
📟 *Version:* ${config.VERSION}
👤 *Owner:* ${config.AUTHOR}
🌐 *Mode:* ${config.MODE}

📢 *Channel:* ${config.CHANNEL_LINK}
💬 *Group:* ${config.GROUP_LINK}
      `.trim();

      await ctx.reply(aliveText);
    }
  },

  ping: {
    description: 'Check bot response time',
    execute: async (ctx) => {
      const start = Date.now();
      await ctx.react('🏓');
      const end = Date.now();
      await ctx.reply(`🏓 *Pong!* ${end - start}ms`);
    }
  },

  owner: {
    description: 'Get owner contact',
    execute: async (ctx) => {
      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${config.AUTHOR}\nTEL;type=CELL;type=VOICE;waid=${config.OWNER_NUMBER}:${config.OWNER_NUMBER}\nEND:VCARD`;
      await ctx.sock.sendMessage(ctx.msg.key.remoteJid, {
        contacts: { displayName: config.AUTHOR, contacts: [{ vcard }] }
      });
    }
  },

  channel: {
    description: 'Get bot channel link',
    execute: async (ctx) => {
      await ctx.reply(`📢 *Join our Channel:*\n${config.CHANNEL_LINK}`);
    }
  },

  group: {
    description: 'Get support group link',
    execute: async (ctx) => {
      await ctx.reply(`💬 *Join our Group:*\n${config.GROUP_LINK}`);
    }
  },

  help: {
    description: 'Get help for a command',
    execute: async (ctx) => {
      if (!ctx.fullArgs) {
        return ctx.reply('Usage: !help <command>');
      }
      await ctx.reply(`ℹ️ Help for *${ctx.fullArgs}* — use !menu to see all commands.`);
    }
  }
};
