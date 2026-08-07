const config = require('../config/config');
const { initModels } = require('../database/models');

async function authMiddleware(ctx, next) {
  const { User } = initModels();

  // Check if user is banned
  const user = await User.findByPk(ctx.sender);
  if (user && user.isBanned) {
    return ctx.reply('🚫 You are banned from using this bot.');
  }

  // Check mode restrictions
  if (config.MODE === 'self' && !ctx.isOwner) {
    return; // Silent ignore in self mode
  }

  if (config.MODE === 'private' && !ctx.isOwner) {
    return ctx.reply('🔒 Bot is in private mode. Only the owner can use it.');
  }

  await next();
}

module.exports = { authMiddleware };
