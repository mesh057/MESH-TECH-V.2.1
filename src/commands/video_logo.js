module.exports={
  logointro:{description:'Logo intro video',execute:async(c)=>{if(!c.fullArgs)return c.reply('Usage: !logointro <text>');await c.react('🎬');await c.reply('🎬 Logo intro video processing...');}},
  elegant:{description:'Elegant video',execute:async(c)=>{if(!c.fullArgs)return c.reply('Usage: !elegant <text>');await c.react('✨');await c.reply('✨ Elegant video processing...');}},
  pubg:{description:'PUBG video',execute:async(c)=>{if(!c.fullArgs)return c.reply('Usage: !pubg <text>');await c.react('🎮');await c.reply('🎮 PUBG video processing...');}},
  tiger:{description:'Tiger video',execute:async(c)=>{if(!c.fullArgs)return c.reply('Usage: !tiger <text>');await c.react('🐯');await c.reply('🐯 Tiger video processing...');}},
};
