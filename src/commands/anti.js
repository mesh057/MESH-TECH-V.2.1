const{initModels}=require('../database/models');
module.exports={
  antilink:{description:'Toggle anti-link',execute:async(c)=>{const{Group}=initModels();let[g]=await Group.findOrCreate({where:{gid:c.msg.key.remoteJid}});g.antilink=!g.antilink;await g.save();await c.reply(`✅ Anti-link ${g.antilink?'enabled':'disabled'}.`);}},
  'antilink-kick':{description:'Anti-link kick',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !antilink-kick on/off');await c.reply(`✅ Anti-link kick ${c.args[0]}.`);}},
  'antilink-warn':{description:'Anti-link warn',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !antilink-warn on/off');await c.reply(`✅ Anti-link warn ${c.args[0]}.`);}},
  'antilink-delete':{description:'Anti-link delete',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !antilink-delete on/off');await c.reply(`✅ Anti-link delete ${c.args[0]}.`);}},
  antidelete:{description:'Anti-delete',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !antidelete on/off');await c.reply(`✅ Anti-delete ${c.args[0]}.`);}},
  antispam:{description:'Anti-spam',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !antispam on/off');await c.reply(`✅ Anti-spam ${c.args[0]}.`);}},
  antitag:{description:'Anti-tag',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !antitag on/off');await c.reply(`✅ Anti-tag ${c.args[0]}.`);}},
  antitemu:{description:'Anti-temu',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !antitemu on/off');await c.reply(`✅ Anti-temu ${c.args[0]}.`);}},
};
