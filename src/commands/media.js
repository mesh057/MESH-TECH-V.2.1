const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

module.exports = {
  sticker: {
    description: 'Convert image/video to sticker',
    execute: async (ctx) => {
      const quoted = ctx.msg.message.extendedTextMessage?.contextInfo;
      if (!quoted) return ctx.reply('❌ Reply to an image or video.');

      const message = quoted.quotedMessage;
      const mediaType = message.imageMessage ? 'image' : message.videoMessage ? 'video' : null;
      if (!mediaType) return ctx.reply('❌ Reply to an image or video only.');

      await ctx.react('🎨');
      const stream = await downloadContentFromMessage(message[mediaType + 'Message'], mediaType);
      const buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const tmpFile = path.join(__dirname, '../../tmp', `sticker_${Date.now()}.webp`);
      await fs.writeFile(tmpFile.replace('.webp', mediaType === 'image' ? '.jpg' : '.mp4'), buffer);

      // Convert to sticker using ffmpeg
      await execAsync(`ffmpeg -i ${tmpFile.replace('.webp', mediaType === 'image' ? '.jpg' : '.mp4')} -vf "scale=512:512:flags=lanczos" -loop 0 -an -vsync 2 ${tmpFile}`);

      const stickerBuffer = await fs.readFile(tmpFile);
      await ctx.sock.sendMessage(ctx.msg.key.remoteJid, {
        sticker: stickerBuffer,
        packname: 'MESH-TECH-V2',
        author: 'Mesh'
      });

      await fs.remove(tmpFile);
      await fs.remove(tmpFile.replace('.webp', mediaType === 'image' ? '.jpg' : '.mp4'));
    }
  },

  toimg: {
    description: 'Convert sticker to image',
    execute: async (ctx) => {
      const quoted = ctx.msg.message.extendedTextMessage?.contextInfo;
      if (!quoted?.quotedMessage?.stickerMessage) {
        return ctx.reply('❌ Reply to a sticker.');
      }

      await ctx.react('🖼️');
      const stream = await downloadContentFromMessage(quoted.quotedMessage.stickerMessage, 'sticker');
      const buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const tmpWebp = path.join(__dirname, '../../tmp', `sticker_${Date.now()}.webp`);
      const tmpPng = tmpWebp.replace('.webp', '.png');
      await fs.writeFile(tmpWebp, buffer);
      await execAsync(`ffmpeg -i ${tmpWebp} ${tmpPng}`);

      const imgBuffer = await fs.readFile(tmpPng);
      await ctx.sock.sendMessage(ctx.msg.key.remoteJid, { image: imgBuffer });

      await fs.remove(tmpWebp);
      await fs.remove(tmpPng);
    }
  },

  tomp3: {
    description: 'Convert video to audio',
    execute: async (ctx) => {
      const quoted = ctx.msg.message.extendedTextMessage?.contextInfo;
      if (!quoted?.quotedMessage?.videoMessage) {
        return ctx.reply('❌ Reply to a video.');
      }

      await ctx.react('🎵');
      const stream = await downloadContentFromMessage(quoted.quotedMessage.videoMessage, 'video');
      const buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const tmpMp4 = path.join(__dirname, '../../tmp', `video_${Date.now()}.mp4`);
      const tmpMp3 = tmpMp4.replace('.mp4', '.mp3');
      await fs.writeFile(tmpMp4, buffer);
      await execAsync(`ffmpeg -i ${tmpMp4} -vn -ar 44100 -ac 2 -b:a 192k ${tmpMp3}`);

      const audioBuffer = await fs.readFile(tmpMp3);
      await ctx.sock.sendMessage(ctx.msg.key.remoteJid, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: false
      });

      await fs.remove(tmpMp4);
      await fs.remove(tmpMp3);
    }
  },

  blur: {
    description: 'Blur an image',
    execute: async (ctx) => {
      const quoted = ctx.msg.message.extendedTextMessage?.contextInfo;
      if (!quoted?.quotedMessage?.imageMessage) {
        return ctx.reply('❌ Reply to an image.');
      }

      await ctx.react('🔮');
      const stream = await downloadContentFromMessage(quoted.quotedMessage.imageMessage, 'image');
      const buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const tmpIn = path.join(__dirname, '../../tmp', `blur_in_${Date.now()}.jpg`);
      const tmpOut = path.join(__dirname, '../../tmp', `blur_out_${Date.now()}.jpg`);
      await fs.writeFile(tmpIn, buffer);
      await execAsync(`ffmpeg -i ${tmpIn} -vf "boxblur=10:10" ${tmpOut}`);

      const outBuffer = await fs.readFile(tmpOut);
      await ctx.sock.sendMessage(ctx.msg.key.remoteJid, { image: outBuffer });

      await fs.remove(tmpIn);
      await fs.remove(tmpOut);
    }
  },

  brightness: {
    description: 'Adjust image brightness',
    execute: async (ctx) => {
      const level = parseFloat(ctx.args[0]) || 0.2;
      const quoted = ctx.msg.message.extendedTextMessage?.contextInfo;
      if (!quoted?.quotedMessage?.imageMessage) {
        return ctx.reply('❌ Reply to an image. Usage: !brightness 0.5');
      }

      await ctx.react('☀️');
      const stream = await downloadContentFromMessage(quoted.quotedMessage.imageMessage, 'image');
      const buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const tmpIn = path.join(__dirname, '../../tmp', `bright_in_${Date.now()}.jpg`);
      const tmpOut = path.join(__dirname, '../../tmp', `bright_out_${Date.now()}.jpg`);
      await fs.writeFile(tmpIn, buffer);
      await execAsync(`ffmpeg -i ${tmpIn} -vf "eq=brightness=${level}" ${tmpOut}`);

      const outBuffer = await fs.readFile(tmpOut);
      await ctx.sock.sendMessage(ctx.msg.key.remoteJid, { image: outBuffer });

      await fs.remove(tmpIn);
      await fs.remove(tmpOut);
    }
  },

  crop: {
    description: 'Crop an image',
    execute: async (ctx) => {
      const quoted = ctx.msg.message.extendedTextMessage?.contextInfo;
      if (!quoted?.quotedMessage?.imageMessage) {
        return ctx.reply('❌ Reply to an image.');
      }

      await ctx.react('✂️');
      const stream = await downloadContentFromMessage(quoted.quotedMessage.imageMessage, 'image');
      const buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const tmpIn = path.join(__dirname, '../../tmp', `crop_in_${Date.now()}.jpg`);
      const tmpOut = path.join(__dirname, '../../tmp', `crop_out_${Date.now()}.jpg`);
      await fs.writeFile(tmpIn, buffer);
      await execAsync(`ffmpeg -i ${tmpIn} -vf "crop=ih:ih" ${tmpOut}`);

      const outBuffer = await fs.readFile(tmpOut);
      await ctx.sock.sendMessage(ctx.msg.key.remoteJid, { image: outBuffer });

      await fs.remove(tmpIn);
      await fs.remove(tmpOut);
    }
  }
};
