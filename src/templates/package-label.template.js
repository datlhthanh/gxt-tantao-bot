import { formatVN } from '../utils/datetime.util.js';
import { escapeHtml } from '../utils/html.util.js';

const BARCODE_BASE = 'https://barcode.ghn.vn/api/v1/barcode/generate';

const CSS = `
* { box-sizing: border-box; }
body {
  padding: 20px; margin: 0; font-family: Arial, sans-serif; color: #000;
  background-color: #555; display: flex; flex-direction: column;
  align-items: center; gap: 40px;
}
.content { position: relative; background: #fff; width: 800px; height: 800px; padding: 25px; }
.invert-heading { transform: rotate(180deg); }
.viewTop { width: 100%; height: fit-content; font-size: 22px; }
.viewTop span { font-weight: bold; }
.viewTopInfo { display: flex; justify-content: space-between; margin: 10px 0; }
.routeCode-sorting {
  font-weight: 700; font-size: 230px; line-height: 0; margin: 0; display: flex;
  flex: 1; min-width: 0; align-items: center; justify-content: center; height: 160px;
}
.routeCode-sorting.two-chars { transform: translateX(-40px); }
.viewTopInfo-side { width: 160px; flex: none; display: flex; justify-content: flex-end; }
.routeCodeInner { line-height: 1; white-space: nowrap; }
.firstmilePrefix { font-size: 0.625em; }
.package-code { height: fit-content; text-align: center; }
.package-code p { font-size: 32px; font-weight: bold; margin: 0; }
.viewBarcode { display: flex; justify-content: space-between; align-items: center; width: 800px; margin-left: -25px; }
.viewBarCode__line { border-bottom: 1px solid #000; height: 120px; width: 40px; }
.viewLineBarCodeLeft { display: flex; height: 240px; }
.viewLineBarCodeRight { display: flex; justify-content: flex-end; height: 240px; }
@media print {
  body { background: transparent; padding: 0; display: block; }
  .content { page-break-after: always; }
  @page { size: 800px 800px; margin: 0; }
}`;

function barcodeUrl(code, type, size) {
  return `${BARCODE_BASE}?code=${encodeURIComponent(code)};type=${type};${size}`;
}

/** Một nửa tem (phần đầu). Nửa dưới là bản xoay 180°. */
function renderHalf({ code, createdTime, firstmileSortCode, routeCode }) {
  const prefix = firstmileSortCode
    ? `<span class="firstmilePrefix">${escapeHtml(firstmileSortCode)}x</span>`
    : '';
  const twoChars = String(routeCode ?? '').length > 1 ? ' two-chars' : '';

  return `
    <div class="viewTop">
      <div>Tạo <span>${escapeHtml(formatVN(createdTime))}</span></div>
      <div class="viewTopInfo">
        <div class="viewTopInfo-side"></div>
        <div class="routeCode-sorting${twoChars}">
          <span class="routeCodeInner">${prefix}${escapeHtml(routeCode)}</span>
        </div>
        <div class="viewTopInfo-side">
          <img src="${barcodeUrl(code, 'QR', 'width=140;height=140')}">
        </div>
      </div>
      <div class="package-code"><p>${escapeHtml(code)}</p></div>
    </div>`;
}

function renderLabel(pkg) {
  const half = renderHalf(pkg);
  return `
  <div class="content">
    <div>${half}</div>
    <div class="viewBarcode">
      <div class="viewLineBarCodeLeft"><div class="viewBarCode__line"></div></div>
      <div><img src="${barcodeUrl(pkg.code, 'C128A', 'width=600;height=236')}"></div>
      <div class="viewLineBarCodeRight"><div class="viewBarCode__line"></div></div>
    </div>
    <div class="invert-heading">${half}</div>
  </div>`;
}

/**
 * @param {Array<{code, createdTime, firstmileSortCode, routeCode}>} packages
 * @returns {string} HTML trang in hoàn chỉnh
 */
export function renderLabelsPage(packages) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>In tem đóng bao</title>
  <style>${CSS}</style>
</head>
<body>
  ${packages.map(renderLabel).join('\n')}
  <script>
    window.addEventListener('load', () => setTimeout(() => window.print(), 300));
  </script>
</body>
</html>`;
}