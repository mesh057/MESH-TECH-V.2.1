module.exports={
  movie:{description:'Search movie',execute:async(c)=>{if(!c.fullArgs)return c.reply('Usage: !movie <title>');await c.react('🎬');await c.reply(`🎬 https://www.imdb.com/find?q=${encodeURIComponent(c.fullArgs)}`);}},
  selectmovie:{description:'Select movie',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !selectmovie <number>');await c.react('🎬');await c.reply(`🎬 Selected movie #${c.args[0]}`);}},
  dlmovie:{description:'Download movie',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !dlmovie <number>');await c.react('⬇️');await c.reply('⬇️ Movie download started...');}},
};
