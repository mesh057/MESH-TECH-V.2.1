module.exports={
  level:{description:'Check level',execute:async(c)=>{await c.reply('📊 *Your Level:* 1\n⭐ XP: 0/100');}},
  levelup:{description:'Toggle levelup',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !levelup on/off');await c.reply(`✅ Level-up ${c.args[0]}.`);}},
  leaderboard:{description:'Leaderboard',execute:async(c)=>{await c.reply('🏆 *Leaderboard:*\n1. You - 100 XP\n2. Friend - 50 XP');}},
};
