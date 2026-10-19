import { parseToken, saveToken } from '../services/token.service.js';
import { verifyToken } from '../services/token-check.service.js';
import { formatVN } from '../utils/datetime.util.js';
import { escapeHtml } from '../utils/html.util.js';

const SCRIPT = `javascript:(()=>{const t=localStorage.getItem('SESSION');if(!t){alert('Chưa đăng nhập nhanh.ghn.vn, hoặc đang không ở đúng trang!');return;}const v=t.replace(/^"|"$/g,'');const text='/updatetoken '+v;navigator.clipboard.writeText(text).then(()=>alert('Đã copy! Mở Telegram, dán vào chat với bot rồi gửi.'),()=>prompt('Copy thủ công:',text));})();`;

const GUIDE = `<b>Đéo má hướng dẫn cập nhật token GHN</b>

<b>Bước 1:</b> Mở trang <b>nhanh.ghn.vn</b> và đăng nhập (đứng nguyên ở trang này cho các bước sau).

<b>Bước 2:</b> Bấm vào đoạn mã bên dưới để copy:

<code>${escapeHtml(SCRIPT)}</code>

Rồi dán vào <b>thanh địa chỉ</b> (chỗ gõ link) của trình duyệt ngay tại trang nhanh.ghn.vn:
1. Bấm vào thanh địa chỉ, dán (Ctrl+V).
2. Gõ thêm chữ <code>javascript:</code> vào <b>đầu</b> dòng (trình duyệt tự xóa chữ này khi dán nên phải gõ lại).
3. Nhấn Enter. Hiện thông báo "Đã copy!" là xong.

<b>Bước 3:</b> Quay lại đây, dán (Ctrl+V) vào chat rồi gửi. Nội dung có dạng <code>/updatetoken eyJ...</code>`;

export function updateTokenCommand(bot) {
  bot.command('updatetoken', async (ctx) => {
    const raw = ctx.match?.trim();

    if (!raw) {
      return ctx.reply(GUIDE, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
      });
    }

    const parsed = parseToken(raw);
    if (!parsed.ok) return ctx.reply(`❌ ${parsed.reason}`);

    const wait = await ctx.reply('⏳ Đang kiểm tra token với GHN...');
    const edit = (text) =>
      ctx.api.editMessageText(ctx.chat.id, wait.message_id, text);

    const check = await verifyToken(parsed.token);
    if (!check.valid) {
      return edit(
        `Token không dùng được sai rồi ha sao á, lại i.\nLý do: ${check.reason}`,
      );
    }

    saveToken(parsed.token);

    const expiry = parsed.expiresAt
      ? `\nHết hạn: ${formatVN(parsed.expiresAt.toISOString())}`
      : '';
    await edit(`Cập nhật thành công token mới rồi á, bớt phá i.${expiry}`);
  });
}