import { InlineKeyboard } from "grammy";
import { getPrintA5Url } from "../services/print-a5.service.js";

export function printA5Handler(bot) {
  bot.on("message:text", async (ctx, next) => {
    const text = ctx.message.text.trim();
    const lines = text.split("\n").map((line) => line.trim());
    const lastLine = lines[lines.length - 1].toLowerCase();

    if (lastLine !== "in") return next();

    const orderLines = lines.slice(0, -1);
    const invalidLine = orderLines.find((line) => !/^GY[A-Z0-9]+$/i.test(line));

    if (invalidLine || orderLines.length === 0) {
      return ctx.reply("Không tìm thấy mã đơn hợp lệ.");
    }

    const orderCodes = [
      ...new Set(orderLines.map((line) => line.toUpperCase())),
    ];

    try {
      const printUrl = await getPrintA5Url(orderCodes);

      await ctx.reply("In A5", {
        reply_parameters: { message_id: ctx.message.message_id },
        reply_markup: new InlineKeyboard().url("Open", printUrl),
      });
    } catch (error) {
      console.error("Error print A5:", error);
      await ctx.reply(`Có lỗi xảy ra: ${error.message}`);
    }
  });
}
