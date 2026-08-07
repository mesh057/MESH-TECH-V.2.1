const axios=require('axios');
module.exports={
  githubstalk:{description:'Stalk GitHub',execute:async(c)=>{if(!c.fullArgs)return c.reply('Usage: !githubstalk <username>');await c.react('🐙');try{const{data}=await axios.get(`https://api.github.com/users/${c.fullArgs}`);await c.reply(`🐙 *${data.login}*\n📛 ${data.name||'No name'}\n📊 Repos: ${data.public_repos}\n👥 Followers: ${data.followers}\n📝 ${data.bio||'No bio'}`);}catch{await c.reply('❌ User not found.');}}},
  igstalk:{description:'Stalk Instagram',execute:async(c)=>{if(!c.fullArgs)return c.reply('Usage: !igstalk <username>');await c.react('📸');await c.reply(`📸 https://instagram.com/${c.fullArgs}`);}},
  tiktokstalk:{description:'Stalk TikTok',execute:async(c)=>{if(!c.fullArgs)return c.reply('Usage: !tiktokstalk <username>');await c.react('📱');await c.reply(`📱 https://tiktok.com/@${c.fullArgs}`);}},
  ffstalk:{description:'Stalk Free Fire',execute:async(c)=>{if(!c.fullArgs)return c.reply('Usage: !ffstalk <id>');await c.react('🎮');await c.reply(`🎮 Free Fire ID: ${c.fullArgs}`);}},
};
