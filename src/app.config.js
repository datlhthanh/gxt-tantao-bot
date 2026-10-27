import "dotenv/config";

if (!process.env.BOT_TOKEN) {
  throw new Error("Thiếu BOT_TOKEN trong file .env");
}

export const withBearer = (token) =>
  token.startsWith("Bearer ") ? token : `Bearer ${token}`;

const warehouseId = process.env.WAREHOUSE_ID || "21606000";
const port = Number(process.env.PORT || 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT phải là số nguyên trong khoảng 1-65535.");
}

export const config = {
  botToken: process.env.BOT_TOKEN,
  gxt: { warehouseId },
  inside: { locationId: process.env.INSIDE_LOCATION_ID || warehouseId },
  tokenFile: process.env.TOKEN_FILE || "data/token.json",
  server: {
    host: process.env.HOST || "127.0.0.1",
    port,
    publicBaseUrl: (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, ""),
    labelTtlMs: 24 * 60 * 60 * 1000,
  },
};
