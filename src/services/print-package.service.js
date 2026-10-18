import { config } from '../app.config.js';

const API_URL = 'https://inside-prd-api.ghn.vn/pms/v1/package/multi';
const SOURCE = 'INSIDE_WEB_APP/ktc-van-tai/package/print';

/**
 * Lấy thông tin 1 bao, chỉ giữ các trường cần để in tem.
 * @param {string} packageCode
 */
export async function getPackage(packageCode) {
  const url = new URL(API_URL);
  url.searchParams.set('packageCode', packageCode);
  url.searchParams.set('locationId', config.inside.locationId);
  url.searchParams.set('locationType', 'GHN_HUB');
  url.searchParams.set('source', SOURCE);

  const res = await fetch(url, {
    headers: { authorization: config.inside.authorization },
    signal: AbortSignal.timeout(10_000),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || json?.status !== 'OK') {
    throw new Error(json?.message || `GHN trả về lỗi HTTP ${res.status}`);
  }

  const pkg = json.data?.[0];
  if (!pkg) throw new Error('Không tìm thấy bao');

  return {
    code: pkg.code,
    createdTime: pkg.createdTime,
    firstmileSortCode: pkg.firstmileSortCode,
    routeCode: pkg.routeCode,
  };
}

/**
 * Lấy nhiều bao song song, tách thành công / thất bại.
 * @param {string[]} codes
 */
export async function getPackages(codes) {
  const results = await Promise.allSettled(codes.map(getPackage));

  const packages = [];
  const failed = [];

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      packages.push(result.value);
    } else {
      failed.push({ code: codes[i], reason: result.reason.message });
    }
  });

  return { packages, failed };
}