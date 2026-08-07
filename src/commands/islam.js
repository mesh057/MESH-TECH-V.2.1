const axios=require('axios');
module.exports={
  doaharian:{description:'Daily prayer',execute:async(c)=>{await c.react('🤲');await c.reply('🤲 *Daily Doa:*\n\n"Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-nar"');}},
  kisahnabi:{description:'Prophet story',execute:async(c)=>{await c.react('📖');const stories=['Prophet Muhammad (PBUH)','Prophet Ibrahim (AS)','Prophet Musa (AS)','Prophet Isa (AS)'];await c.reply(`📖 *Kisah Nabi:* ${stories[Math.floor(Math.random()*stories.length)]}`);}},
  surah:{description:'Quran surah',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !surah <number>');await c.react('☪️');try{const{data}=await axios.get(`https://api.alquran.cloud/v1/surah/${c.args[0]}`);await c.reply(`☪️ *${data.data.englishName}* (${data.data.name})\n📖 Verses: ${data.data.numberOfAyahs}`);}catch{await c.reply('❌ Invalid surah.');}}},
  jadwalsholat:{description:'Prayer schedule',execute:async(c)=>{if(!c.fullArgs)return c.reply('Usage: !jadwalsholat <city>');await c.react('🕌');await c.reply(`🕌 Prayer schedule for *${c.fullArgs}*`);}},
};
