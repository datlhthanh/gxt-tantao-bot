import { MongoClient } from "mongodb";
import { config, withBearer } from "../app.config.js";

const JWT_REGEX = /^(?:Bearer\s+)?([\w-]+\.([\w-]+)\.[\w-]+)$/;
const client = new MongoClient(config.mongodb.uri);
const tokens = client
  .db(config.mongodb.database)
  .collection("auth_tokens");

let connection;

async function getCollection() {
  if (!connection) {
    connection = client.connect().then(() => tokens);
  }
  return connection;
}

// báo lỗi nếu chư có token
export async function getToken() {
  const collection = await getCollection();
  const saved = await collection.findOne(
    { key: config.mongodb.tokenKey },
    { projection: { token: 1 } },
  );

  if (!saved?.token) {
    throw new Error("Chưa có token GHN. Dùng /updatetoken để cài đặt.");
  }

  return saved.token;
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

// lưu lại token vào MongoDB
export async function saveToken(token, updatedBy = "system") {
  const collection = await getCollection();
  await collection.updateOne(
    { key: config.mongodb.tokenKey },
    {
      $set: {
        token,
        updatedAt: new Date(),
        updatedBy,
      },
    },
    { upsert: true },
  );
}
