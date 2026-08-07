module.exports={
  buypet:{description:'Buy pet',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !buypet <number>');await c.reply(`🐾 Pet #${c.args[0]} purchased!`);}},
  mypet:{description:'My pet',execute:async(c)=>{await c.reply('🐾 *Your Pet:*\n🐕 Name: Buddy\n❤️ HP: 100/100\n⭐ Level: 1');}},
  train:{description:'Train pet',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !train <number>');await c.reply(`🐾 Pet trained! +${c.args[0]} XP`);}},
  battle:{description:'Pet battle',execute:async(c)=>{const target=c.msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];if(!target)return c.reply('Usage: !battle @user');const win=Math.random()<0.5;await c.reply(win?'🐾 Your pet won!':'🐾 Your pet lost!',{mentions:[target]});}},
};
