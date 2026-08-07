const{initModels}=require('../database/models');
module.exports={
  daily:{description:'Daily reward',execute:async(c)=>{const{User}=initModels();const[u]=await User.findOrCreate({where:{jid:c.sender}});u.messageCount=(u.messageCount||0)+100;await u.save();await c.reply('💰 *Daily Reward:* +100 coins!');}},
  transfer:{description:'Transfer coins',execute:async(c)=>{const target=c.msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];if(!target||!c.args[1])return c.reply('Usage: !transfer @user <amount>');await c.reply(`💸 Transferred ${c.args[1]} coins to @${target.split('@')[0]}`,{mentions:[target]});}},
  bank:{description:'Bank balance',execute:async(c)=>{await c.reply('🏦 *Bank:* 0 coins\n💳 Use !deposit and !withdraw');}},
  wallet:{description:'Wallet balance',execute:async(c)=>{await c.reply('👛 *Wallet:* 0 coins');}},
  withdraw:{description:'Withdraw coins',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !withdraw <amount>');await c.reply(`💵 Withdrew ${c.args[0]} coins.`);}},
  deposit:{description:'Deposit coins',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !deposit <amount>');await c.reply(`💵 Deposited ${c.args[0]} coins.`);}},
  shop:{description:'Shop items',execute:async(c)=>{await c.reply('🛒 *Shop:*\n1. Guard - 500 coins\n2. Premium - 1000 coins\n3. Weapon - 750 coins');}},
  buyguard:{description:'Buy guard',execute:async(c)=>{await c.reply('🛡️ Guard purchased!');}},
  buy:{description:'Buy item',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !buy <item>');await c.reply(`🛒 Bought: *${c.args[0]}*`);}},
  lottery:{description:'Lottery',execute:async(c)=>{await c.react('🎰');const win=Math.random()<0.1;await c.reply(win?'🎰 *JACKPOT!* You won!':'🎰 Better luck next time!');}},
  buyticket:{description:'Buy lottery ticket',execute:async(c)=>{await c.reply('🎫 Ticket purchased!');}},
  'roll-dice':{description:'Roll dice',execute:async(c)=>{const r=Math.floor(Math.random()*6)+1;await c.reply(`🎲 You rolled a *${r}*`);}},
  duel:{description:'Duel user',execute:async(c)=>{const target=c.msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];if(!target)return c.reply('Usage: !duel @user');const win=Math.random()<0.5;await c.reply(win?`⚔️ You defeated @${target.split('@')[0]}!`:`⚔️ @${target.split('@')[0]} defeated you!`,{mentions:[target]});}},
};
