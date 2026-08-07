const axios = require('axios');

module.exports = {
  joke: {
    description: 'Get a random joke',
    execute: async (ctx) => {
      try {
        const { data } = await axios.get('https://official-joke-api.appspot.com/random_joke');
        await ctx.reply(`😂 *${data.setup}*\n\n${data.punchline}`);
      } catch {
        await ctx.reply('❌ Could not fetch a joke right now.');
      }
    }
  },

  meme: {
    description: 'Get a random meme',
    execute: async (ctx) => {
      try {
        const { data } = await axios.get('https://meme-api.com/gimme');
        await ctx.sock.sendMessage(ctx.msg.key.remoteJid, {
          image: { url: data.url },
          caption: `🤣 *${data.title}*`
        });
      } catch {
        await ctx.reply('❌ Could not fetch a meme right now.');
      }
    }
  },

  quote: {
    description: 'Get an inspirational quote',
    execute: async (ctx) => {
      try {
        const { data } = await axios.get('https://api.quotable.io/random');
        await ctx.reply(`💬 *"${data.content}"*\n\n— *${data.author}*`);
      } catch {
        await ctx.reply('❌ Could not fetch a quote right now.');
      }
    }
  },

  fact: {
    description: 'Get a random fact',
    execute: async (ctx) => {
      const facts = [
        'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old.',
        'Octopuses have three hearts.',
        'Bananas are berries, but strawberries are not.',
        'A day on Venus is longer than a year on Venus.',
        'Wombat poop is cube-shaped.',
        'The Eiffel Tower can be 15 cm taller during the summer.',
        'A group of flamingos is called a flamboyance.'
      ];
      const fact = facts[Math.floor(Math.random() * facts.length)];
      await ctx.reply(`🧠 *Did you know?*\n\n${fact}`);
    }
  },

  ship: {
    description: 'Ship two users',
    execute: async (ctx) => {
      const mentioned = ctx.msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned || mentioned.length < 2) {
        return ctx.reply('❌ Tag two users. Usage: !ship @user1 @user2');
      }
      const percentage = Math.floor(Math.random() * 100) + 1;
      const bar = '█'.repeat(Math.floor(percentage / 10)) + '░'.repeat(10 - Math.floor(percentage / 10));
      await ctx.reply(
        `💘 *Shipping Calculator* 💘\n\n` +
        `@${mentioned[0].split('@')[0]} + @${mentioned[1].split('@')[0]}\n\n` +
        `${bar} ${percentage}%\n\n` +
        `${percentage > 80 ? '🔥 Perfect match!' : percentage > 50 ? '💕 Not bad!' : '💔 Maybe next time...'}`
      );
    }
  },

  roast: {
    description: 'Roast someone',
    execute: async (ctx) => {
      const roasts = [
        "You're like a cloud. When you disappear, it's a beautiful day.",
        "I'm not saying you're stupid, but you have bad luck when thinking.",
        "You're the reason the gene pool needs a lifeguard.",
        "I'd agree with you but then we'd both be wrong.",
        "You're not dumb, you just have bad luck when it comes to thinking.",
        "If laughter is the best medicine, your face must be curing the world.",
        "You're like a software update. Whenever I see you, I think 'Not now.'"
      ];
      const roast = roasts[Math.floor(Math.random() * roasts.length)];
      const target = ctx.msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (target) {
        await ctx.reply(`🔥 @${target.split('@')[0]} ${roast}`, { mentions: [target] });
      } else {
        await ctx.reply(`🔥 ${roast}`);
      }
    }
  },

  roll: {
    description: 'Roll a dice',
    execute: async (ctx) => {
      const sides = parseInt(ctx.args[0]) || 6;
      const result = Math.floor(Math.random() * sides) + 1;
      await ctx.reply(`🎲 You rolled a *${result}* (1-${sides})`);
    }
  },

  coin: {
    description: 'Flip a coin',
    execute: async (ctx) => {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      await ctx.reply(`🪙 *${result}*`);
    }
  },

  riddle: {
    description: 'Get a riddle',
    execute: async (ctx) => {
      const riddles = [
        { q: 'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?', a: 'A map' },
        { q: 'What has keys but no locks?', a: 'A piano' },
        { q: 'What has to be broken before you can use it?', a: 'An egg' },
        { q: 'I am tall when I am young, and short when I am old. What am I?', a: 'A candle' }
      ];
      const riddle = riddles[Math.floor(Math.random() * riddles.length)];
      await ctx.reply(`🧩 *Riddle:*\n\n${riddle.q}\n\n_Reply with !answer to reveal the answer._`);
      // Store riddle answer in temp memory (simplified)
    }
  }
};
