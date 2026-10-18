import { bot } from './bot.js';

bot.start({
  onStart: (info) => console.log(`Bot @${info.username} đã khởi động thành công!`),
});

// Tắt an toàn khi PM2/hệ thống gửi tín hiệu dừng
process.once('SIGINT', () => bot.stop());
process.once('SIGTERM', () => bot.stop());