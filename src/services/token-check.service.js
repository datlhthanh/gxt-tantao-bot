import { config } from "../app.config.js";

const API_URL = "https://inside-prd-api.ghn.vn/pms/v1/package/multi";
const SOURCE = "INSIDE_WEB_APP/ktc-van-tai/package/print";
const DUMMY_CODE = "26CYG12863"; // mã giả, chỉ để thử quyền truy cập
const AUTH_ERROR = /quyền|partner|unauthor|forbidden|token|hết hạn|expired/i;

/**
 * Gọi thử một API chỉ-đọc để biết token có dùng được không.
 * @param {string} token đã gồm "Bearer "
 * @returns {Promise<{valid: true} | {valid: false, reason: string}>}
 */
export async function verifyToken(token) {
  const url =
    `${API_URL}?packageCode=${DUMMY_CODE}` +
    `&locationId=${config.inside.locationId}` +
    `&locationType=GHN_HUB&source=${SOURCE}`;

  let res;
  try {
    res = await fetch(url, {
      headers: { accept: "application/json", authorization: token },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return { valid: false, reason: "Không kết nối được tới GHN, thử lại sau." };
  }

  const json = await res.json().catch(() => null);
  const message = String(json?.message ?? "");

  if (res.status === 401 || res.status === 403 || AUTH_ERROR.test(message)) {
    return {
      valid: false,
      reason: message || `GHN từ chối (HTTP ${res.status}).`,
    };
  }

  if (!res.ok || json?.status !== "OK") {
    return {
      valid: false,
      reason: `Không thể xác minh token với GHN (HTTP ${res.status}).`,
    };
  }

  return { valid: true };
}
