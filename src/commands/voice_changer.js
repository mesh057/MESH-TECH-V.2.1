const{exec}=require('child_process');const{promisify}=require('util');const execAsync=promisify(exec);
module.exports={
  bass:{description:'Bass boost',execute:async(c)=>{await c.react('🔊');await c.reply('🔊 Reply to audio for bass boost.');}},
  blown:{description:'Blown effect',execute:async(c)=>{await c.react('💨');await c.reply('💨 Reply to audio for blown effect.');}},
  deep:{description:'Deep voice',execute:async(c)=>{await c.react('🗣️');await c.reply('🗣️ Reply to audio for deep voice.');}},
  earrape:{description:'Earrape',execute:async(c)=>{await c.react('🔊');await c.reply('🔊 Reply to audio for earrape.');}},
  fast:{description:'Fast audio',execute:async(c)=>{await c.react('⚡');await c.reply('⚡ Reply to audio for fast effect.');}},
  fat:{description:'Fat voice',execute:async(c)=>{await c.react('🎙️');await c.reply('🎙️ Reply to audio for fat voice.');}},
  nightcore:{description:'Nightcore',execute:async(c)=>{await c.react('🎵');await c.reply('🎵 Reply to audio for nightcore.');}},
  reverse:{description:'Reverse audio',execute:async(c)=>{await c.react('🔄');await c.reply('🔄 Reply to audio for reverse.');}},
  robot:{description:'Robot voice',execute:async(c)=>{await c.react('🤖');await c.reply('🤖 Reply to audio for robot voice.');}},
  slow:{description:'Slow audio',execute:async(c)=>{await c.react('🐌');await c.reply('🐌 Reply to audio for slow effect.');}},
  smooth:{description:'Smooth audio',execute:async(c)=>{await c.react('🎵');await c.reply('🎵 Reply to audio for smooth effect.');}},
  squirrel:{description:'Squirrel voice',execute:async(c)=>{await c.react('🐿️');await c.reply('🐿️ Reply to audio for squirrel voice.');}},
};
