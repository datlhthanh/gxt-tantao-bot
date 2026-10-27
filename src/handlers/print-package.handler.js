import { InlineKeyboard, InputFile } from "grammy";
import { config } from "../app.config.js";
import { saveLabel } from "../services/label-store.service.js";
import { getPackages } from "../services/print-package.service.js";
import { renderLabelsPage } from "../templates/package-label.template.js";
import { MAX_CODES, parsePackageCodes } from "../utils/package-codes.util.js";

export function printPackageHandler(bot) {
  bot.on("message:text", async (ctx, next) => {
    const codes = parsePackageCodes(ctx.message.text);
    if (!codes) return next();

    if (codes.length > MAX_CODES) {
      return ctx.reply(
        `Tối đa ${MAX_CODES} mã bao mỗi lần, vui lòng tách bớt dùm :/`,
      );
    }

    try {
      const { packages, failed } = await getPackages(codes);

      if (packages.length === 0) {
        const detail = failed.map((f) => `${f.code}: ${f.reason}`).join("\n");

        if (detail.includes("Access token is invalid")) {
          return ctx.reply(
            "Token hết hạn, vui lòng sử dụng lệnh /updatetoken để cập nhật lại.",
          );
        }

        return ctx.reply(`Không lấy được mã bao nào:\n${detail}`);
      }

      const html = renderLabelsPage(packages);
      const replyParams = { message_id: ctx.message.message_id };

      let caption = `Đã tạo ${packages.length} mã bao`;
      if (failed.length > 0) {
        caption += `\n\nLỗi ${failed.length} mã bao:\n${failed
          .map((f) => `${f.code}: ${f.reason}`)
          .join("\n")}`;
      }

      if (config.server.publicBaseUrl) {
        const url = `${config.server.publicBaseUrl}/print/${saveLabel(html)}`;
        await ctx.reply(caption, {
          reply_parameters: replyParams,
          reply_markup: new InlineKeyboard().url("Open", url),
        });
      } else {
        await ctx.replyWithDocument(
          new InputFile(Buffer.from(html, "utf-8"), "ma-dong-bao.html"),
          { caption, reply_parameters: replyParams },
        );
      }
    } catch (error) {
      console.error("Error print package:", error);
      await ctx.reply(`Có lỗi xảy ra: ${error.message}`);
    }
  });
}
