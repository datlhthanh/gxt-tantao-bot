import { InlineKeyboard } from "grammy";
import {
  getPrintA5Url,
  validatePrintA5Codes,
} from "../services/print-a5.service.js";

export function printA5Handler(bot) {
  bot.on("message:text", async (ctx, next) => {
    const text = ctx.message.text.trim();
    const lines = text.split("\n").map((line) => line.trim());
    const lastLine = lines[lines.length - 1].toLowerCase();

    if (lastLine !== "in") return next();

    const orderLines = lines.slice(0, -1);

    if (orderLines.length === 0) {
      return ctx.reply("Vui lòng nhập ít nhất một mã đơn trước chữ In.");
    }

    const orderCodes = [
      ...new Set(orderLines.map((line) => line.toUpperCase())),
    ];

    try {
      const failed = await validatePrintA5Codes(orderCodes);
      if (failed.length > 0) {
        return ctx.reply(
          `Không in được ${failed.length} mã đơn:\n${failed
            .map((item) => `${item.code}: ${item.reason}`)
            .join("\n")}`,
        );
      }

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
