import { createServer } from 'node:http';
import { config } from '../app.config.js';
import { consumeLabel } from '../services/label-store.service.js';

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Link không hợp lệ hoặc đã hết hạn (chỉ mở được 1 lần)');
}

export function startServer() {
  if (!config.server.publicBaseUrl) return null;

  const server = createServer((req, res) => {
    const match = req.url?.match(/^\/print\/([\w-]+)$/);

    // Chỉ GET mới tiêu token (HEAD/OPTIONS không làm mất link)
    if (!match || req.method !== 'GET') return notFound(res);

    const html = consumeLabel(match[1]);
    if (!html) return notFound(res);

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'X-Robots-Tag': 'noindex',
    });
    res.end(html);
  });

  server.listen(config.server.port, config.server.host, () =>
    console.log(`Web server: ${config.server.host}:${config.server.port}`),
  );

  return server;
}