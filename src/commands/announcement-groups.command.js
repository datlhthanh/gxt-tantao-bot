import { ALLOWED_USER_ID } from "../constants.js";
import {
  addAnnouncementGroup,
  listAnnouncementGroups,
  removeAnnouncementGroup,
} from "../services/announcement-group.service.js";

function isGroup(ctx) {
  return ctx.chat?.type === "group" || ctx.chat?.type === "supergroup";
}

function isOwner(ctx) {
  return ctx.from?.id === ALLOWED_USER_ID;
}

export function announcementGroupsCommand(bot) {
  bot.command("addgroup", async (ctx) => {
    if (!isGroup(ctx)) {
      return ctx.reply("Lệnh này chỉ dùng được trong group hoặc supergroup.");
    }

    try {
      const { group, added } = addAnnouncementGroup(ctx.chat);
      await ctx.reply(
        added
          ? `Đã thêm group "${group.title}" vào danh sách gửi thông báo.`
          : `Group "${group.title}" đã có trong danh sách, tên group đã được cập nhật.`,
      );
    } catch (error) {
      console.error("Error adding announcement group:", error);
      await ctx.reply("Không thể lưu group. Vui lòng thử lại sau.");
    }
  });

  bot.command("listgroups", async (ctx) => {
    if (!isOwner(ctx)) {
      return ctx.reply("Bạn không có quyền xem danh sách group.");
    }

    try {
      const groups = listAnnouncementGroups();
      if (groups.length === 0) return ctx.reply("Chưa có group nào.");
      await ctx.reply(
        groups
          .map((group, index) => `${index + 1}. ${group.title} (${group.id})`)
          .join("\n"),
      );
    } catch (error) {
      console.error("Error listing announcement groups:", error);
      await ctx.reply("Không thể đọc danh sách group.");
    }
  });

  bot.command("removegroup", async (ctx) => {
    if (!isOwner(ctx)) {
      return ctx.reply("Bạn không có quyền xóa group khỏi danh sách.");
    }

    const rawId = ctx.match?.trim();
    const id = rawId ? Number(rawId) : NaN;
    if (!Number.isSafeInteger(id)) {
      return ctx.reply("Dùng lệnh: /removegroup <group_id>");
    }

    try {
      await ctx.reply(
        removeAnnouncementGroup(id)
          ? `Đã xóa group ${id} khỏi danh sách.`
          : `Không tìm thấy group ${id} trong danh sách.`,
      );
    } catch (error) {
      console.error("Error removing announcement group:", error);
      await ctx.reply("Không thể cập nhật danh sách group.");
    }
  });
}
