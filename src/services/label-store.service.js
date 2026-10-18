import { randomBytes } from 'node:crypto';
import { config } from '../app.config.js';

const store = new Map(); // id -> { html, expiresAt }

export function saveLabel(html) {
  const id = randomBytes(12).toString('base64url');
  store.set(id, { html, expiresAt: Date.now() + config.server.labelTtlMs });
  return id;
}

export function getLabel(id) {
  const item = store.get(id);
  if (!item) return null;
  if (item.expiresAt < Date.now()) {
    store.delete(id);
    return null;
  }
  return item.html;
}

// Dọn tem hết hạn mỗi 10 phút; unref để không giữ tiến trình sống
setInterval(() => {
  const now = Date.now();
  for (const [id, item] of store) {
    if (item.expiresAt < now) store.delete(id);
  }
}, 10 * 60 * 1000).unref();