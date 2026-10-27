import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { config, withBearer } from "../app.config.js";

const JWT_REGEX = /^(?:Bearer\s+)?([\w-]+\.([\w-]+)\.[\w-]+)$/;

let current = load();

function load() {
  try {
    const saved = JSON.parse(readFileSync(config.tokenFile, "utf-8"));
    if (saved.token) return saved.token;
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw new Error(`Không đọc được file token: ${error.message}`, {
        cause: error,
      });
    }
  }
  const seed = process.env.AUTHORIZATION_TOKEN?.trim();
  return seed ? withBearer(seed) : null;
}

// báo lỗi nếu chư có token
export function getToken() {
  if (!current) {
    throw new Error("Chưa có token GHN. Dùng /updatetoken để cài đặt.");
  }
  return current;
}

/**
 * Kiểm tra định dạng và hạn của token (chưa lưu).
 * @returns {{ok: true, token: string, expiresAt: Date|null} | {ok: false, reason: string}}
 */
export function parseToken(raw) {
  const match = raw.trim().match(JWT_REGEX);
  if (!match) return { ok: false, reason: "Token sai định dạng." };

  let expiresAt = null;
  try {
    const payload = JSON.parse(Buffer.from(match[2], "base64url").toString());
    if (payload.exp) expiresAt = new Date(payload.exp * 1000);
  } catch {
    // không đọc được payload thì bỏ qua kiểm tra hạn
  }

  if (expiresAt && expiresAt < new Date()) {
    return { ok: false, reason: "Token này đã hết hạn, hãy lấy token mới!" };
  }

  return { ok: true, token: withBearer(match[1]), expiresAt };
}

// lưu lại token và file
export function saveToken(token) {
  current = token;
  mkdirSync(dirname(config.tokenFile), { recursive: true });
  writeFileSync(
    config.tokenFile,
    JSON.stringify({ token, updatedAt: new Date().toISOString() }),
    { mode: 0o600 },
  );
}
