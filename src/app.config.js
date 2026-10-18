import 'dotenv/config';

const required = ['BOT_TOKEN', 'AUTHORIZATION_TOKEN'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Thiếu ${key} trong file .env`);
  }
}

export const config = {
  botToken: process.env.BOT_TOKEN,
  gxt: {
    authorization: process.env.AUTHORIZATION_TOKEN,
    warehouseId: process.env.WAREHOUSE_ID || '21606000',
  },
};