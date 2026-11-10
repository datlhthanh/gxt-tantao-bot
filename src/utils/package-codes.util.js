// 2 số (năm) + 8 ký tự chữ/số, ví dụ 26CYG12863
// phía sau mã có thể có ghi chú ngăn cách bằng khoảng trắng (e, d, n...)
const LINE_REGEX = /^(\d{2}[A-Z0-9]{8})(?:\s+.*)?$/i;

// tối đa 30 mã bao mỗi lần
export const MAX_CODES = 30;

export function parsePackageInput(text) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { codes: [], invalidLines: [] };
  }

  const codes = [];
  const invalidLines = [];
  for (const line of lines) {
    const match = line.match(LINE_REGEX);
    if (match) {
      codes.push(match[1].toUpperCase());
    } else {
      invalidLines.push(line);
    }
  }

  return {
    codes: [...new Set(codes)],
    invalidLines,
  };
}

export function parsePackageCodes(text) {
  const { codes, invalidLines } = parsePackageInput(text);
  return invalidLines.length > 0 || codes.length === 0 ? null : codes;
}
