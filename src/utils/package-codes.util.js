// 2 số (năm) + 8 ký tự chữ/số, ví dụ 26CYG12863
// phía sau mã có thể có ghi chú ngăn cách bằng khoảng trắng (e, d, n...)
const LINE_REGEX = /^(\d{2}[A-Z0-9]{8})(?:\s+.*)?$/i;

export const MAX_CODES = 30;

/**
 * Trả về mảng mã bao (viết hoa, đã loại trùng) nếu MỌI dòng đều hợp lệ.
 * Trả về null nếu tin nhắn không phải danh sách mã bao.
 */
export function parsePackageCodes(text) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  const codes = [];
  for (const line of lines) {
    const match = line.match(LINE_REGEX);
    if (!match) return null;
    codes.push(match[1].toUpperCase());
  }

  return [...new Set(codes)];
}