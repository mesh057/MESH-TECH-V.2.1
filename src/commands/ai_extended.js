const axios = require('axios');
const AI_APIS = {
  chatgpt:(q)=>`https://api.paxsenix.biz.id/ai/gpt4o?text=${encodeURIComponent(q)}`,
  copilot:(q)=>`https://api.paxsenix.biz.id/ai/copilot?text=${encodeURIComponent(q)}`,
  llama:(q)=>`https://api.paxsenix.biz.id/ai/llama3?text=${encodeURIComponent(q)}`,
  metaai:(q)=>`https://api.paxsenix.biz.id/ai/metaai?text=${encodeURIComponent(q)}`,
  gemini:(q)=>`https://api.paxsenix.biz.id/ai/gemini?text=${encodeURIComponent(q)}`,
  gemini2:(q)=>`https://api.paxsenix.biz.id/ai/gemini2?text=${encodeURIComponent(q)}`,
  gemma:(q)=>`https://api.paxsenix.biz.id/ai/gemma?text=${encodeURIComponent(q)}`,
  hermes:(q)=>`https://api.paxsenix.biz.id/ai/hermes?text=${encodeURIComponent(q)}`,
  blackbox:(q)=>`https://api.paxsenix.biz.id/ai/blackbox?text=${encodeURIComponent(q)}`,
  claude:(q)=>`https://api.paxsenix.biz.id/ai/claude?text=${encodeURIComponent(q)}`,
  deepseek:(q)=>`https://api.paxsenix.biz.id/ai/deepseek?text=${encodeURIComponent(q)}`,
  deepseekr1:(q)=>`https://api.paxsenix.biz.id/ai/deepseekr1?text=${encodeURIComponent(q)}`,
  gita:(q)=>`https://api.paxsenix.biz.id/ai/gita?text=${encodeURIComponent(q)}`,
  mistral:(q)=>`https://api.paxsenix.biz.id/ai/mistral?text=${encodeURIComponent(q)}`,
  muslimai:(q)=>`https://api.paxsenix.biz.id/ai/muslimai?text=${encodeURIComponent(q)}`,
  powerbrain:(q)=>`https://api.paxsenix.biz.id/ai/powerbrain?text=${encodeURIComponent(q)}`,
  qwen2:(q)=>`https://api.paxsenix.biz.id/ai/qwen2?text=${encodeURIComponent(q)}`,
  qvq:(q)=>`https://api.paxsenix.biz.id/ai/qvq?text=${encodeURIComponent(q)}`,
  teachai:(q)=>`https://api.paxsenix.biz.id/ai/teachai?text=${encodeURIComponent(q)}`,
  goody:(q)=>`https://api.paxsenix.biz.id/ai/goody?text=${encodeURIComponent(q)}`,
  humanai:(q)=>`https://api.paxsenix.biz.id/ai/humanai?text=${encodeURIComponent(q)}`,
  venice:(q)=>`https://api.paxsenix.biz.id/ai/venice?text=${encodeURIComponent(q)}`,
  degreeguru:(q)=>`https://api.paxsenix.biz.id/ai/degreeguru?text=${encodeURIComponent(q)}`,
  phi3:(q)=>`https://api.paxsenix.biz.id/ai/phi3?text=${encodeURIComponent(q)}`,
  mistralnemo:(q)=>`https://api.paxsenix.biz.id/ai/mistralnemo?text=${encodeURIComponent(q)}`,
  hermes3:(q)=>`https://api.paxsenix.biz.id/ai/hermes3?text=${encodeURIComponent(q)}`,
  lori:(q)=>`https://api.paxsenix.biz.id/ai/lori?text=${encodeURIComponent(q)}`,
  qwq:(q)=>`https://api.paxsenix.biz.id/ai/qwq?text=${encodeURIComponent(q)}`,
  commandrplus:(q)=>`https://api.paxsenix.biz.id/ai/commandrplus?text=${encodeURIComponent(q)}`,
  qwen2coder:(q)=>`https://api.paxsenix.biz.id/ai/qwen2coder?text=${encodeURIComponent(q)}`,
  gpt4:(q)=>`https://api.paxsenix.biz.id/ai/gpt4?text=${encodeURIComponent(q)}`,
  nemotron:(q)=>`https://api.paxsenix.biz.id/ai/nemotron?text=${encodeURIComponent(q)}`,
};
async function callAI(ctx,api,label){
  if(!ctx.fullArgs)return ctx.reply(`Usage: !${api} <query>`);
  await ctx.react('🤖');
  try{const{data}=await axios.get(AI_APIS[api](ctx.fullArgs),{timeout:30000});
    const r=data.result||data.response||data.message||data.text||data;
    await ctx.reply(`🤖 *${label}*\n\n${r}`);
  }catch{await ctx.reply(`❌ ${label} unavailable.`);}
}
module.exports={
  chatgpt:{description:'GPT-4o',execute:async(c)=>callAI(c,'chatgpt','GPT-4o')},
  copilot:{description:'Copilot',execute:async(c)=>callAI(c,'copilot','Copilot')},
  llama:{description:'Llama 3',execute:async(c)=>callAI(c,'llama','Llama 3')},
  metaai:{description:'Meta AI',execute:async(c)=>callAI(c,'metaai','Meta AI')},
  gemini:{description:'Gemini',execute:async(c)=>callAI(c,'gemini','Gemini')},
  gemini2:{description:'Gemini 2',execute:async(c)=>callAI(c,'gemini2','Gemini 2')},
  gemma:{description:'Gemma',execute:async(c)=>callAI(c,'gemma','Gemma')},
  githubroaster:{description:'Roast GitHub',execute:async(c)=>{
    if(!c.fullArgs)return c.reply('❌ Provide GitHub username.');
    await c.react('🔥');
    try{const{data}=await axios.get(`https://api.github.com/users/${c.fullArgs}`);
      const roast=`🔥 *GitHub Roast: ${data.login}*\n\n📛 ${data.name||'No name'}\n📊 Repos: ${data.public_repos}\n👥 Followers: ${data.followers}\n📝 ${data.bio||'No bio'}\n\n_${data.public_repos<10?'Barely any repos...':data.followers<10?'Where are followers?':'Not bad!'}_`;
      await c.reply(roast);
    }catch{await c.reply('❌ User not found.');}
  }},
  copilot2trip:{description:'Copilot Trip',execute:async(c)=>callAI(c,'copilot','Copilot Trip')},
  hermes:{description:'Hermes',execute:async(c)=>callAI(c,'hermes','Hermes')},
  blackbox:{description:'BlackBox',execute:async(c)=>callAI(c,'blackbox','BlackBox')},
  claude:{description:'Claude',execute:async(c)=>callAI(c,'claude','Claude')},
  deepseek:{description:'DeepSeek',execute:async(c)=>callAI(c,'deepseek','DeepSeek')},
  deepseekr1:{description:'DeepSeek R1',execute:async(c)=>callAI(c,'deepseekr1','DeepSeek R1')},
  metaai2:{description:'Meta AI v2',execute:async(c)=>callAI(c,'metaai','Meta AI v2')},
  gita:{description:'Gita',execute:async(c)=>callAI(c,'gita','Gita')},
  mistral:{description:'Mistral',execute:async(c)=>callAI(c,'mistral','Mistral')},
  muslimai:{description:'Muslim AI',execute:async(c)=>callAI(c,'muslimai','Muslim AI')},
  powerbrain:{description:'PowerBrain',execute:async(c)=>callAI(c,'powerbrain','PowerBrain')},
  qwen2:{description:'Qwen 2',execute:async(c)=>callAI(c,'qwen2','Qwen 2')},
  qvq:{description:'QvQ',execute:async(c)=>callAI(c,'qvq','QvQ')},
  teachai:{description:'Teach AI',execute:async(c)=>callAI(c,'teachai','Teach AI')},
  goody:{description:'Goody',execute:async(c)=>callAI(c,'goody','Goody')},
  'human-ai':{description:'Human AI',execute:async(c)=>callAI(c,'humanai','Human AI')},
  venice:{description:'Venice',execute:async(c)=>callAI(c,'venice','Venice')},
  degreeguru:{description:'Degree Guru',execute:async(c)=>callAI(c,'degreeguru','Degree Guru')},
  'phi-3':{description:'Phi-3',execute:async(c)=>callAI(c,'phi3','Phi-3')},
  'mistral-nemo':{description:'Mistral Nemo',execute:async(c)=>callAI(c,'mistralnemo','Mistral Nemo')},
  'hermes-3':{description:'Hermes 3',execute:async(c)=>callAI(c,'hermes3','Hermes 3')},
  lori:{description:'Lori',execute:async(c)=>callAI(c,'lori','Lori')},
  qwq:{description:'QwQ',execute:async(c)=>callAI(c,'qwq','QwQ')},
  'command-r-plus':{description:'Command R+',execute:async(c)=>callAI(c,'commandrplus','Command R+')},
  qwen2coder:{description:'Qwen 2 Coder',execute:async(c)=>callAI(c,'qwen2coder','Qwen 2 Coder')},
  gpt4:{description:'GPT-4',execute:async(c)=>callAI(c,'gpt4','GPT-4')},
  nemotron:{description:'Nemotron',execute:async(c)=>callAI(c,'nemotron','Nemotron')},
  'gemini-vision':{description:'Gemini Vision',execute:async(c)=>{
    const q=c.msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
    if(!q?.imageMessage)return c.reply('❌ Reply to an image.');
    await c.react('👁️');await c.reply('🤖 *Gemini Vision*\n\nProcessing...');
  }},
};
