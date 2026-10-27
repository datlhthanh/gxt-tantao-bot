import { getToken } from "../services/token.service.js";
import { escapeHtml } from "../utils/html.util.js";

const ALLOWED_USER_ID = 8807703123;

export function getTokenCommand(bot) {
  bot.command("gettoken", async (ctx) => {
    if (ctx.from?.id !== ALLOWED_USER_ID) {
      return ctx.reply("Bạn không có quyền sử dụng lệnh này.");
    }

    try {
      const token = getToken();
      await ctx.reply(`<code>${escapeHtml(token)}</code>`, {
        parse_mode: "HTML",
      });
    } catch (error) {
      console.error("Error get token:", error);
      await ctx.reply("Chưa có token GHN để gửi.");
    }
  });
}
