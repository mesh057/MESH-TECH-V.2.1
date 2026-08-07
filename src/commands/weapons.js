module.exports={
  buyweapon:{description:'Buy weapon',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !buyweapon <name>');await c.reply(`⚔️ Bought weapon: *${c.args[0]}*`);}},
  myweapons:{description:'My weapons',execute:async(c)=>{await c.reply('⚔️ *Your Weapons:*\n1. Sword\n2. Shield');}},
  attack:{description:'Attack user',execute:async(c)=>{const target=c.msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];if(!target)return c.reply('Usage: !attack @user');const dmg=Math.floor(Math.random()*100);await c.reply(`⚔️ You dealt *${dmg}* damage to @${target.split('@')[0]}!`,{mentions:[target]});}},
};
