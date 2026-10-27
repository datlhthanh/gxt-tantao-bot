import { bot } from "./bot.js";
import { startServer } from "./server/print-page.server.js";

const server = startServer();

bot.start({
  onStart: (info) => console.log(`Bot @${info.username} đang chạy`),
});

function shutdown() {
  bot.stop();
  server?.close();
}
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
