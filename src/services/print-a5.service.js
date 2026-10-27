import { config } from "../app.config.js";
import { getToken } from "./token.service.js";

const GEN_TOKEN_URL =
  "https://nhanh-api.ghn.vn/api/lastmile/order/gen-a5-token";
const PRINT_URL = "https://online-gateway.ghn.vn/a5/public-api/printA5";

/**
 * Gọi GHN lấy token in A5, trả về link in.
 * @param {string[]} orderCodes
 * @returns {Promise<string>} printUrl
 */
export async function getPrintA5Url(orderCodes) {
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

  return `${PRINT_URL}?token=${data.data.token}`;
}
