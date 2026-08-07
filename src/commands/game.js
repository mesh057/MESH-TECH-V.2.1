module.exports={
  clan:{description:'Clan info',execute:async(c)=>{await c.reply('⚔️ *Clan System*\nCreate and manage your clan.');}},
  werewolf:{description:'Werewolf game',execute:async(c)=>{await c.reply('🐺 *Werewolf*\nGame starting...');}},
  war:{description:'War game',execute:async(c)=>{await c.reply('⚔️ *War*\nBattle begins!');}},
  msp:{description:'MSP game',execute:async(c)=>{await c.reply('🎮 MSP game.');}},
  uno:{description:'UNO game',execute:async(c)=>{await c.reply('🃏 *UNO*\nGame starting...');}},
  giveaway:{description:'Giveaway',execute:async(c)=>{await c.reply('🎉 *Giveaway*\nReact to enter!');}},
  blackjack:{description:'Blackjack',execute:async(c)=>{const cards=['A♠','K♥','Q♦','J♣'];await c.reply(`🃏 *Blackjack*\nYour hand: ${cards[Math.floor(Math.random()*4)]} ${cards[Math.floor(Math.random()*4)]}`);}},
  tictactoe:{description:'Tic Tac Toe',execute:async(c)=>{await c.reply('⭕ *Tic Tac Toe*\n\n1|2|3\n-+-+-\n4|5|6\n-+-+-\n7|8|9\n\nReply with number!');}},
  wrg:{description:'WRG game',execute:async(c)=>{await c.reply('🎮 WRG game.');}},
  wcg:{description:'WCG game',execute:async(c)=>{await c.reply('🎮 WCG game.');}},
};
