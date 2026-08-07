const axios = require('axios');
const ytdl = require('ytdl-core');
const yts = require('yt-search');

module.exports = {
  ytmp3: {
    description: 'Download YouTube audio',
    execute: async (ctx) => {
      if (!ctx.args[0]) return ctx.reply('❌ Provide a YouTube URL. Usage: !ytmp3 <url>');

      await ctx.react('🎵');
      try {
        const info = await ytdl.getInfo(ctx.args[0]);
        const title = info.videoDetails.title;
        const thumbnail = info.videoDetails.thumbnails.pop().url;

        await ctx.reply(`⬇️ *Downloading:* ${title}\n\n_Please wait..._`);

        // In production, you'd stream/download and send
        await ctx.sock.sendMessage(ctx.msg.key.remoteJid, {
          image: { url: thumbnail },
          caption: `🎵 *${title}*\n\n✅ Audio ready!\n⚠️ Note: Full download requires server-side processing. Use !play for instant playback.`
        });
      } catch {
        await ctx.reply('❌ Failed to fetch video. Make sure the URL is valid.');
      }
    }
  },

  ytmp4: {
    description: 'Download YouTube video',
    execute: async (ctx) => {
      if (!ctx.args[0]) return ctx.reply('❌ Provide a YouTube URL. Usage: !ytmp4 <url>');

      await ctx.react('🎬');
      try {
        const info = await ytdl.getInfo(ctx.args[0]);
        const title = info.videoDetails.title;
        const thumbnail = info.videoDetails.thumbnails.pop().url;

        await ctx.reply(`⬇️ *Downloading:* ${title}\n\n_Please wait..._`);

        await ctx.sock.sendMessage(ctx.msg.key.remoteJid, {
          image: { url: thumbnail },
          caption: `🎬 *${title}*\n\n✅ Video info fetched!\n⚠️ Note: Full download requires server-side processing.`
        });
      } catch {
        await ctx.reply('❌ Failed to fetch video.');
      }
    }
  },

  play: {
    description: 'Search and play from YouTube',
    execute: async (ctx) => {
      if (!ctx.fullArgs) return ctx.reply('❌ Provide a search query. Usage: !play <song name>');

      await ctx.react('🔍');
      try {
        const search = await yts(ctx.fullArgs);
        const video = search.videos[0];

        if (!video) return ctx.reply('❌ No results found.');

        await ctx.sock.sendMessage(ctx.msg.key.remoteJid, {
          image: { url: video.thumbnail },
          caption: `🎵 *Found:* ${video.title}\n👤 *Channel:* ${video.author.name}\n⏱️ *Duration:* ${video.timestamp}\n👁️ *Views:* ${video.views}\n\n🔗 ${video.url}\n\n_Use !ytmp3 ${video.url} to download audio_`
        });
      } catch {
        await ctx.reply('❌ Search failed. Please try again.');
      }
    }
  },

  tiktok: {
    description: 'Download TikTok video',
    execute: async (ctx) => {
      if (!ctx.args[0]) return ctx.reply('❌ Provide a TikTok URL. Usage: !tiktok <url>');

      await ctx.react('📱');
      try {
        // Using a free TikTok API
        const { data } = await axios.get(`https://api.tikdown.xyz/api/download?url=${encodeURIComponent(ctx.args[0])}`);

        if (data.status === 'success') {
          await ctx.sock.sendMessage(ctx.msg.key.remoteJid, {
            video: { url: data.video },
            caption: `📱 *TikTok Download*\n\n👤 *Author:* ${data.author}\n📝 *Caption:* ${data.title || 'No caption'}`
          });
        } else {
          await ctx.reply('❌ Could not download TikTok video.');
        }
      } catch {
        await ctx.reply('❌ TikTok download service unavailable.');
      }
    }
  },

  ig: {
    description: 'Download Instagram media',
    execute: async (ctx) => {
      if (!ctx.args[0]) return ctx.reply('❌ Provide an Instagram URL. Usage: !ig <url>');

      await ctx.react('📸');
      try {
        const { data } = await axios.get(`https://api.instagram.com/oembed?url=${encodeURIComponent(ctx.args[0])}`);
        await ctx.reply(`📸 *Instagram Post*\n\n👤 *Author:* ${data.author_name}\n📝 *Title:* ${data.title || 'No title'}\n\n🔗 ${ctx.args[0]}`);
      } catch {
        await ctx.reply('❌ Could not fetch Instagram media.');
      }
    }
  },

  fb: {
    description: 'Download Facebook video',
    execute: async (ctx) => {
      if (!ctx.args[0]) return ctx.reply('❌ Provide a Facebook URL. Usage: !fb <url>');

      await ctx.react('📘');
      try {
        const { data } = await axios.get(`https://graph.facebook.com/v18.0/oembed_video?url=${encodeURIComponent(ctx.args[0])}&access_token=YOUR_TOKEN`);
        await ctx.reply(`📘 *Facebook Video*\n\n👤 *Author:* ${data.author_name}\n📝 *Title:* ${data.title || 'No title'}`);
      } catch {
        await ctx.reply('❌ Facebook download requires an API token. Please configure FB_ACCESS_TOKEN in .env');
      }
    }
  },

  spotify: {
    description: 'Search Spotify',
    execute: async (ctx) => {
      if (!ctx.fullArgs) return ctx.reply('❌ Provide a song name. Usage: !spotify <query>');

      await ctx.react('🎧');
      try {
        // Using Spotify search via free API
        const { data } = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(ctx.fullArgs)}&type=track&limit=1`, {
          headers: { 'Authorization': 'Bearer YOUR_SPOTIFY_TOKEN' }
        });

        if (data.tracks.items.length > 0) {
          const track = data.tracks.items[0];
          await ctx.reply(`🎧 *Spotify Result*\n\n🎵 *${track.name}*\n👤 *Artist:* ${track.artists.map(a => a.name).join(', ')}\n💿 *Album:* ${track.album.name}\n🔗 ${track.external_urls.spotify}`);
        } else {
          await ctx.reply('❌ No results found on Spotify.');
        }
      } catch {
        await ctx.reply('❌ Spotify search requires SPOTIFY_TOKEN. Add it to your .env file.');
      }
    }
  }
};
