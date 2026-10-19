import 'dotenv/config';

if (!process.env.BOT_TOKEN) {
  throw new Error('Thiếu BOT_TOKEN trong file .env');
}

export const withBearer = (token) =>
  token.startsWith('Bearer ') ? token : `Bearer ${token}`;

const warehouseId = process.env.WAREHOUSE_ID || '21606000';

export const config = {
  botToken: process.env.BOT_TOKEN,
  gxt: { warehouseId },
  inside: { locationId: process.env.INSIDE_LOCATION_ID || warehouseId },
  tokenFile: process.env.TOKEN_FILE || 'src/data/token.json',
  server: {
    host: process.env.HOST || '127.0.0.1',
    port: Number(process.env.PORT) || 3000,
    publicBaseUrl: (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, ''),
    labelTtlMs: 24 * 60 * 60 * 1000,
  },
};