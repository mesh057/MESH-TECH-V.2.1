const axios = require('axios');
const config = require('../config/config');

module.exports = {
  ai: {
    description: 'Chat with AI',
    execute: async (ctx) => {
      if (!ctx.fullArgs) return ctx.reply('❌ Ask me something. Usage: !ai What is JavaScript?');

      await ctx.react('🤖');
      try {
        // Using a free AI API (Pollinations AI)
        const { data } = await axios.get(
          `https://text.pollinations.ai/${encodeURIComponent(ctx.fullArgs)}?seed=${Date.now()}`,
          { timeout: 30000 }
        );
        await ctx.reply(`🤖 *AI Response:*\n\n${data}`);
      } catch (error) {
        await ctx.reply('❌ AI service is currently unavailable. Please try again later.');
      }
    }
  },

  gpt: {
    description: 'Get GPT-style response',
    execute: async (ctx) => {
      if (!ctx.fullArgs) return ctx.reply('❌ Provide a prompt. Usage: !gpt Explain quantum physics');

      await ctx.react('🧠');
      try {
        const { data } = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: ctx.fullArgs }],
            max_tokens: 500
          },
          {
            headers: {
              'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );
        await ctx.reply(`🧠 *GPT:*\n\n${data.choices[0].message.content}`);
      } catch (error) {
        // Fallback to free API
        try {
          const { data } = await axios.get(
            `https://text.pollinations.ai/${encodeURIComponent(ctx.fullArgs)}?seed=${Date.now()}`
          );
          await ctx.reply(`🧠 *AI:*\n\n${data}`);
        } catch {
          await ctx.reply('❌ AI service unavailable. Add OPENAI_API_KEY for premium responses.');
        }
      }
    }
  },

  image: {
    description: 'Generate an image from text',
    execute: async (ctx) => {
      if (!ctx.fullArgs) return ctx.reply('❌ Describe the image. Usage: !image a cat in space');

      await ctx.react('🎨');
      try {
        const prompt = encodeURIComponent(ctx.fullArgs);
        const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&seed=${Date.now()}&nologo=true`;

        await ctx.sock.sendMessage(ctx.msg.key.remoteJid, {
          image: { url: imageUrl },
          caption: `🎨 *Generated Image*\n\nPrompt: _${ctx.fullArgs}_`
        });
      } catch (error) {
        await ctx.reply('❌ Image generation failed. Please try again.');
      }
    }
  },

  imagine: {
    description: 'Generate AI art',
    execute: async (ctx) => {
      if (!ctx.fullArgs) return ctx.reply('❌ Describe the art. Usage: !imagine cyberpunk city');

      await ctx.react('🎨');
      try {
        const prompt = encodeURIComponent(ctx.fullArgs + ', high quality, detailed, 4k');
        const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&seed=${Date.now()}&nologo=true`;

        await ctx.sock.sendMessage(ctx.msg.key.remoteJid, {
          image: { url: imageUrl },
          caption: `🎨 *AI Art*\n\nPrompt: _${ctx.fullArgs}_`
        });
      } catch {
        await ctx.reply('❌ Art generation failed.');
      }
    }
  }
};
