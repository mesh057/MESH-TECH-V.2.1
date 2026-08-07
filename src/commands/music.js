const yts=require('yt-search');const ytdl=require('ytdl-core');
module.exports={
  play:{description:'Play audio',execute:async(c)=>{
    if(!c.fullArgs)return c.reply('Usage: !play <song>');
    await c.react('🎵');try{const s=await yts(c.fullArgs);const v=s.videos[0];if(!v)return c.reply('❌ No results.');
      await c.sock.sendMessage(c.msg.key.remoteJid,{image:{url:v.thumbnail},caption:`🎵 *${v.title}*\n👤 ${v.author.name}\n⏱️ ${v.timestamp}\n👁️ ${v.views}\n\n🔗 ${v.url}\n\n_Use !ytmp3 ${v.url}_`});
    }catch{await c.reply('❌ Failed.');}
  }},
  play2:{description:'Play v2',execute:async(c)=>{if(!c.fullArgs)return c.reply('Usage: !play2 <song>');await c.react('🎵');try{const s=await yts(c.fullArgs);const v=s.videos[0];if(!v)return c.reply('❌ No results.');await c.reply(`🎵 *${v.title}*\n👤 ${v.author.name}\n⏱️ ${v.timestamp}\n🔗 ${v.url}`);}catch{await c.reply('❌ Failed.');}}},
  song:{description:'Download song',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !song <url>');await c.react('🎵');try{const i=await ytdl.getInfo(c.args[0]);await c.reply(`🎵 *${i.videoDetails.title}*\n\nAudio info fetched.`);}catch{await c.reply('❌ Failed.');}}},
  video:{description:'Download video',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !video <url>');await c.react('🎬');try{const i=await ytdl.getInfo(c.args[0]);await c.reply(`🎬 *${i.videoDetails.title}*\n\nVideo info fetched.`);}catch{await c.reply('❌ Failed.');}}},
  playdoc:{description:'Play as document',execute:async(c)=>{if(!c.fullArgs)return c.reply('Usage: !playdoc <song>');await c.react('📄');try{const s=await yts(c.fullArgs);const v=s.videos[0];if(!v)return c.reply('❌ No results.');await c.reply(`📄 *${v.title}*\n🔗 ${v.url}`);}catch{await c.reply('❌ Failed.');}}},
  videodoc:{description:'Video as document',execute:async(c)=>{if(!c.fullArgs)return c.reply('Usage: !videodoc <video>');await c.react('📄');try{const s=await yts(c.fullArgs);const v=s.videos[0];if(!v)return c.reply('❌ No results.');await c.reply(`📄 *${v.title}*\n🔗 ${v.url}`);}catch{await c.reply('❌ Failed.');}}},
};
