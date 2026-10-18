import 'dotenv/config';

const required = ['BOT_TOKEN', 'AUTHORIZATION_TOKEN'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Thiếu ${key} trong file .env`);
  }
}

const withBearer = (token) =>
  token.startsWith('Bearer ') ? token : `Bearer ${token}`;

const warehouseId = process.env.WAREHOUSE_ID || '21606000';
const authorization = withBearer(process.env.AUTHORIZATION_TOKEN.trim());

export const config = {
  botToken: process.env.BOT_TOKEN,
  ghn: {
    authorization,
    warehouseId,
  },
  inside: {
    authorization: process.env.INSIDE_AUTHORIZATION_TOKEN
      ? withBearer(process.env.INSIDE_AUTHORIZATION_TOKEN.trim())
      : authorization,
    locationId: process.env.INSIDE_LOCATION_ID || warehouseId,
  },
  server: {
    host: process.env.HOST || '127.0.0.1',
    port: Number(process.env.PORT) || 3000,
    publicBaseUrl: (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, ''),
    labelTtlMs: 24 * 60 * 60 * 1000,
  },
};