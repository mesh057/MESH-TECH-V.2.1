const os=require('os');
module.exports={
  afk:{description:'Set AFK',execute:async(c)=>{if(!c.fullArgs)return c.reply('Usage: !afk <reason>');await c.reply(`😴 *AFK:* ${c.fullArgs}`);}},
  server:{description:'Server info',execute:async(c)=>{await c.reply(`🖥️ *Server Info*\n\n💻 Platform: ${os.platform()}\n⚙️ Arch: ${os.arch()}\n💾 RAM: ${(os.totalmem()/1024/1024/1024).toFixed(2)} GB\n🆓 Free: ${(os.freemem()/1024/1024/1024).toFixed(2)} GB`);}},
  disk:{description:'Disk usage',execute:async(c)=>{await c.reply('💾 Disk usage info.');}},
  lookup:{description:'Lookup info',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !lookup <query>');await c.reply(`🔍 Looking up: ${c.args[0]}`);}},
  ping:{description:'Bot ping',execute:async(c)=>{const start=Date.now();await c.react('🏓');const end=Date.now();await c.reply(`🏓 *Pong!* ${end-start}ms`);}},
  alive:{description:'Bot alive',execute:async(c)=>{const uptime=process.uptime();const h=Math.floor(uptime/3600);const m=Math.floor((uptime%3600)/60);await c.reply(`🤖 *MESH-TECH-V2 is ONLINE* ✅\n\n⏱️ Uptime: ${h}h ${m}m\n📟 Version: 2.0.0\n👤 Owner: Mesh`);}},
  system:{description:'System info',execute:async(c)=>{await c.reply(`⚙️ *System*\n\n🖥️ Node: ${process.version}\n📦 Memory: ${(process.memoryUsage().heapUsed/1024/1024).toFixed(2)} MB\n⏱️ Uptime: ${Math.floor(process.uptime()/60)}m`);}},
  runtime:{description:'Runtime info',execute:async(c)=>{await c.reply(`⏱️ *Runtime:* ${Math.floor(process.uptime()/60)} minutes`);}},
};
