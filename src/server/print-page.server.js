import { createServer } from 'node:http';
import { config } from '../app.config.js';
import { getLabel } from '../services/label-store.service.js';

export function startServer() {
  // Chưa cấu hình link công khai thì không mở cổng
  if (!config.server.publicBaseUrl) return null;

  const server = createServer((req, res) => {
    const match = req.method === 'GET' && req.url?.match(/^\/print\/([\w-]+)$/);
    const html = match ? getLabel(match[1]) : null;

    if (!html) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Link không tồn tại hoặc đã hết hạn');
    }

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    });
    res.end(html);
  });

  server.listen(config.server.port, () =>
    console.log(`Web server đang chạy ở cổng ${config.server.port}`),
  );

  return server;
}