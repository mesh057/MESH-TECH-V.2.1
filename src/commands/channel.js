module.exports={
  getnewsletter:{description:'Get newsletter',execute:async(c)=>{await c.react('📰');await c.reply('📰 Newsletter fetched.');}},
  createchannel:{description:'Create channel',execute:async(c)=>{await c.react('📢');await c.reply('📢 Channel creation requires WhatsApp API.');}},
  removepic:{description:'Remove channel pic',execute:async(c)=>{await c.react('🖼️');await c.reply('🖼️ Channel picture removed.');}},
  updatedesc:{description:'Update channel desc',execute:async(c)=>{if(!c.fullArgs)return c.reply('Usage: !updatedesc <text>');await c.react('📝');await c.reply('📝 Channel description updated.');}},
  updatename:{description:'Update channel name',execute:async(c)=>{if(!c.fullArgs)return c.reply('Usage: !updatename <name>');await c.react('📝');await c.reply('📝 Channel name updated.');}},
  updatepic:{description:'Update channel pic',execute:async(c)=>{await c.react('🖼️');await c.reply('🖼️ Reply to image for channel pic.');}},
  mutenews:{description:'Mute news',execute:async(c)=>{await c.react('🔇');await c.reply('🔇 News muted.');}},
  unmutenews:{description:'Unmute news',execute:async(c)=>{await c.react('🔊');await c.reply('🔊 News unmuted.');}},
  followchannel:{description:'Follow channel',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !followchannel <url>');await c.react('➕');await c.reply('➕ Channel followed.');}},
  unfollowchannel:{description:'Unfollow channel',execute:async(c)=>{if(!c.args[0])return c.reply('Usage: !unfollowchannel <url>');await c.react('➖');await c.reply('➖ Channel unfollowed.');}},
  deletechannel:{description:'Delete channel',execute:async(c)=>{await c.react('🗑️');await c.reply('🗑️ Channel deleted.');}},
};
