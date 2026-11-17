import { Bot } from "grammy";
import { config } from "./app.config.js";
import { registerCommands } from "./commands/index.js";
import { printPackageHandler } from "./handlers/print-package.handler.js";

export const bot = new Bot(config.botToken);

registerCommands(bot);
printPackageHandler(bot);

//bot.on('message:text', (ctx) => ctx.reply(`Bạn vừa nói: ${ctx.message.text}`));

bot.catch((err) => console.error("Lỗi bot:", err.error));
