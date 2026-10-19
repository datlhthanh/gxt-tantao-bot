import { config } from '../app.config.js';
import { getToken } from './token.service.js';

const GEN_TOKEN_URL = 'https://nhanh-api.ghn.vn/api/lastmile/order/gen-a5-token';
const PRINT_URL = 'https://online-gateway.ghn.vn/a5/public-api/printA5';

/**
 * Gọi GHN lấy token in A5, trả về link in.
 * @param {string[]} orderCodes
 * @returns {Promise<string>} printUrl
 */
export async function getPrintA5Url(orderCodes) {
  const res = await fetch(GEN_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-warehouseid': config.gxt.warehouseId,
      'authorization': getToken(),
    },
    body: JSON.stringify({ order_codes: orderCodes.join(',') }),
  });

  const data = await res.json();

  if (data?.code !== 200) {
    throw new Error(data?.message || 'GHN trả về lỗi không rõ');
  }

  return `${PRINT_URL}?token=${data.data.token}`;
}