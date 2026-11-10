import { config } from "../app.config.js";
import { getToken } from "./token.service.js";

const GEN_TOKEN_URL =
  "https://nhanh-api.ghn.vn/api/lastmile/order/gen-a5-token";
const PRINT_URL = "https://online-gateway.ghn.vn/a5/public-api/printA5";

async function getPrintA5Token(orderCodes) {
  let res;
  try {
    res = await fetch(GEN_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-warehouseid": config.gxt.warehouseId,
        authorization: getToken(),
      },
      body: JSON.stringify({ order_codes: orderCodes.join(",") }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new Error("Không kết nối được tới GHN, thử lại sau.");
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || data?.code !== 200 || !data.data?.token) {
    throw new Error(
      data?.message || `GHN trả về lỗi HTTP ${res.status || "không rõ"}`,
    );
  }

  return data.data.token;
}

/**
 * Gọi GHN lấy token in A5, trả về link in.
 * @param {string[]} orderCodes
 * @returns {Promise<string>} printUrl
 */
export async function getPrintA5Url(orderCodes) {
  const token = await getPrintA5Token(orderCodes);
  return `${PRINT_URL}?token=${token}`;
}

/**
 * Kiểm tra từng mã đơn để có thể báo chính xác mã nào không in được.
 * @param {string[]} orderCodes
 * @returns {Promise<Array<{code: string, reason: string}>>}
 */
export async function validatePrintA5Codes(orderCodes) {
  const results = await Promise.allSettled(
    orderCodes.map((code) => getPrintA5Token([code])),
  );

  return results.flatMap((result, index) =>
    result.status === "rejected"
      ? [{ code: orderCodes[index], reason: result.reason.message }]
      : [],
  );
}
