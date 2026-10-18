import { Bot } from 'grammy';
import { config } from './app.config.js';
import { registerCommands } from './commands/index.js';
import { printA5OrderHandler } from './handlers/print-a5.handler.js';

export const bot = new Bot(config.botToken);

registerCommands(bot);
printA5OrderHandler(bot);

//bot.on('message:text', (ctx) => ctx.reply(`Bạn vừa nói: ${ctx.message.text}`));

bot.catch((err) => console.error('Lỗi bot:', err.error));