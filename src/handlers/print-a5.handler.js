import { InlineKeyboard } from 'grammy';
import { getPrintA5Url } from '../services/print-a5.service.js';

export function printA5OrderHandler(bot) {
  bot.on('message:text', async (ctx, next) => {
    const text = ctx.message.text.trim();
    const lines = text.split('\n').map((line) => line.trim());
    const lastLine = lines[lines.length - 1].toLowerCase();

    // không phải yêu cầu "in/In" thì bỏ qua, cho handler khác xử lý
    if (lastLine !== 'in') return next();

    // lấy mã đơn bắt đầu bằng GY, không trùng
    const orderCodes = [...new Set(text.match(/GY[A-Z0-9]+/g) ?? [])];

    if (orderCodes.length === 0) {
      return ctx.reply('Không tìm thấy mã đơn nào hợp lệ (bắt đầu bằng GY) trong tin nhắn.');
    }

    try {
      const printUrl = await getPrintA5Url(orderCodes);

      await ctx.reply('In phiếu trả hàng A5', {
        reply_parameters: { message_id: ctx.message.message_id },
        reply_markup: new InlineKeyboard().url('Link', printUrl),
      });
    } catch (error) {
      console.error('Lỗi in A5:', error);
      await ctx.reply(`Có lỗi rồi: ${error.message}`);
    }
  });
}