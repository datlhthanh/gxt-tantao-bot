import { parseToken, saveToken } from "../services/token.service.js";
import { verifyToken } from "../services/token-check.service.js";
import { formatVN } from "../utils/datetime.util.js";
import { escapeHtml } from "../utils/html.util.js";

const SCRIPT = `javascript:(()=>{const t=localStorage.getItem('SESSION');if(!t){alert('Chưa đăng nhập, hoặc đang không ở đúng trang!');return;}const v=t.replace(/^"|"$/g,'');const text='/updatetoken '+v;navigator.clipboard.writeText(text).then(()=>alert('Đã copy!'),()=>prompt('Copy thủ công:',text));})();`;

const GUIDE = `<b>Hướng dẫn cập nhật TOken GHN</b>

<b>Bước 1:</b> Mở trang <b>nhanh.ghn.vn</b> và đăng nhập (đứng nguyên ở trang này cho các bước sau).

<b>Bước 2:</b> Bấm vào đoạn mã bên dưới để copy:

<code>${escapeHtml(SCRIPT)}</code>

1. Xóa hết chữ trên URL (thanh địa chỉ) của trình duyệt.
2. Gõ thêm chữ <code>javascript:</code> vào <b>đầu</b> dòng.
3. Dán mã đã copy vào (phải tại trang GHN và đã đăng nhập).
4. Nhấn Enter. Hiện thông báo "Đã copy!" là xong.

<b>Bước 3:</b> Quay lại gửi cho Bot. Nội dung có dạng kiểu <code>/updatetoken eyJ...</code>`;

export function updateTokenCommand(bot) {
  bot.command("updatetoken", async (ctx) => {
    const raw = ctx.match?.trim();

    if (!raw) {
      return ctx.reply(GUIDE, {
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      });
    }

    const parsed = parseToken(raw);
    if (!parsed.ok) return ctx.reply(`Lỗi: ${parsed.reason}`);

    const wait = await ctx.reply("Đang kiểm tra Token sau khi cập nhật.");
    const edit = (text) =>
      ctx.api.editMessageText(ctx.chat.id, wait.message_id, text);

    const check = await verifyToken(parsed.token);
    if (!check.valid) {
      return edit(
        `Token không dùng được, vui lòng cập nhật lại.\nLý do: ${check.reason}`,
      );
    }

    saveToken(parsed.token);

    const expiry = parsed.expiresAt
      ? `\nHết hạn: ${formatVN(parsed.expiresAt.toISOString())}`
      : "";
    await edit(`Đã cập nhật lại thành công Token mới.${expiry}`);
  });
}
