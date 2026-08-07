const axios=require('axios');
module.exports={
  wanted:{description:'Wanted poster',execute:async(c)=>{await c.react('🎯');await c.sock.sendMessage(c.msg.key.remoteJid,{image:{url:`https://api.popcat.xyz/wanted?image=https://i.postimg.cc/vHZz7VWG/bot-logo.png`},caption:'🎯 Wanted!'});}},
  drake:{description:'Drake meme',execute:async(c)=>{if(!c.args[0]||!c.args[1])return c.reply('Usage: !drake <top> <bottom>');await c.react('😂');await c.sock.sendMessage(c.msg.key.remoteJid,{image:{url:`https://api.popcat.xyz/drake?text1=${encodeURIComponent(c.args[0])}&text2=${encodeURIComponent(c.args[1])}`},caption:'😂 Drake'});}},
  clown:{description:'Clown meme',execute:async(c)=>{await c.react('🤡');await c.sock.sendMessage(c.msg.key.remoteJid,{image:{url:`https://api.popcat.xyz/clown?image=https://i.postimg.cc/vHZz7VWG/bot-logo.png`},caption:'🤡 Clown'});}},
  alert:{description:'Alert meme',execute:async(c)=>{if(!c.fullArgs)return c.reply('Usage: !alert <text>');await c.react('🚨');await c.sock.sendMessage(c.msg.key.remoteJid,{image:{url:`https://api.popcat.xyz/alert?text=${encodeURIComponent(c.fullArgs)}`},caption:'🚨 Alert'});}},
  petgif:{description:'Pet GIF',execute:async(c)=>{await c.react('🐾');await c.sock.sendMessage(c.msg.key.remoteJid,{image:{url:`https://api.popcat.xyz/pet?image=https://i.postimg.cc/vHZz7VWG/bot-logo.png`},caption:'🐾 Pet'});}},
  tweet:{description:'Fake tweet',execute:async(c)=>{if(!c.fullArgs)return c.reply('Usage: !tweet <text>');await c.react('🐦');await c.sock.sendMessage(c.msg.key.remoteJid,{image:{url:`https://api.popcat.xyz/tweet?text=${encodeURIComponent(c.fullArgs)}`},caption:'🐦 Tweet'});}},
  album:{description:'Album cover',execute:async(c)=>{if(!c.fullArgs)return c.reply('Usage: !album <text>');await c.react('💿');await c.sock.sendMessage(c.msg.key.remoteJid,{image:{url:`https://api.popcat.xyz/album?text=${encodeURIComponent(c.fullArgs)}`},caption:'💿 Album'});}},
};
