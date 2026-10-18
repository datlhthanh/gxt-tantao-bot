import { randomBytes } from 'node:crypto';
import { config } from '../app.config.js';

const store = new Map(); // id -> { html, expiresAt }

export function saveLabel(html) {
  const id = randomBytes(24).toString('base64url');
  store.set(id, { html, expiresAt: Date.now() + config.server.labelTtlMs });
  return id;
}

/** Lấy tem và xóa token ngay: mỗi link chỉ mở được 1 lần. */
export function consumeLabel(id) {
  const item = store.get(id);
  if (!item) return null;
  store.delete(id);
  return item.expiresAt < Date.now() ? null : item.html;
}

// Dọn token chưa dùng đã hết hạn mỗi 10 phút
setInterval(() => {
  const now = Date.now();
  for (const [id, item] of store) {
    if (item.expiresAt < now) store.delete(id);
  }
}, 10 * 60 * 1000).unref();