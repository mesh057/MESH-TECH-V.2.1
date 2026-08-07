const axios=require('axios');
module.exports={
  'crypto-price':{description:'Crypto price',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !crypto-price <coin>');await c.react('💰');try{const{data}=await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${c.args[0]}&vs_currencies=usd`);await c.reply(`💰 *${c.args[0].toUpperCase()}:* $${data[c.args[0]]?.usd||'N/A'}`);}catch{await c.reply('❌ Coin not found.');}}},
  'top-crypto':{description:'Top cryptos',execute:async(c)=>{await c.react('📈');try{const{data}=await axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5');let t='📈 *Top Cryptos*\n\n';data.forEach((coin,i)=>{t+=`${i+1}. *${coin.name}* (${coin.symbol.toUpperCase()})\n   💰 $${coin.current_price}\n`;});await c.reply(t);}catch{await c.reply('❌ Failed.');}}},
  'crypto-index':{description:'Crypto index',execute:async(c)=>{await c.react('📊');await c.reply('📊 Crypto market index.');}},
  'crypto-convert':{description:'Convert crypto',execute:async(c)=>{if(!c.args[0]||!c.args[1])return c.reply('Usage: !crypto-convert <amount> <coin>');await c.reply(`🔄 Converting ${c.args[0]} ${c.args[1]}...`);}},
  'crypto-news':{description:'Crypto news',execute:async(c)=>{await c.react('📰');await c.reply('📰 Crypto news feed.');}},
};
