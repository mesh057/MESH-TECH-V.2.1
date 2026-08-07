const axios=require('axios');
module.exports={
  tempmail:{description:'Get temp email',execute:async(c)=>{await c.react('📧');try{const{data}=await axios.get('https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1');await c.reply(`📧 *Temp Email:*\n\`${data[0]}\``);}catch{await c.reply('❌ Service down.');}}},
  'tempmail-inbox':{description:'Check temp inbox',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !tempmail-inbox <email>');await c.react('📧');try{const parts=c.args[0].split('@');const{data}=await axios.get(`https://www.1secmail.com/api/v1/?action=getMessages&login=${parts[0]}&domain=${parts[1]}`);if(data.length===0)return c.reply('📭 Inbox empty.');let t='📧 *Inbox:*\n\n';data.forEach(m=>{t+=`📨 From: ${m.from}\n📝 Subject: ${m.subject}\n\n`;});await c.reply(t);}catch{await c.reply('❌ Failed.');}}},
};
