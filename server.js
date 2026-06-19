// May chu localhost tinh (khong can cai them gi) - Qua An Sinh
// Chay: node server.js   (hoac nhap dup start.bat)
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;
const DEFAULT_FILE = 'index.html';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/' || urlPath === '') urlPath = '/' + DEFAULT_FILE;

  // Chong truy cap ra ngoai thu muc
  const filePath = path.join(ROOT, path.normalize(urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        fs.readFile(path.join(ROOT, DEFAULT_FILE), (fallbackErr, fallbackData) => {
          if (fallbackErr) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>404</h1><p>Khong tim thay file.</p>');
            return;
          }
          res.writeHead(200, { 'Content-Type': MIME['.html'] });
          res.end(fallbackData);
        });
        return;
      }
      res.end('<h1>404</h1><p>Khong tim thay file. Hay mo <a href="/' + DEFAULT_FILE + '">/' + DEFAULT_FILE + '</a></p>');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

function lanIPs() {
  const out = [];
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const ni of ifaces[name]) {
      if (ni.family === 'IPv4' && !ni.internal) out.push(ni.address);
    }
  }
  return out;
}

server.listen(PORT, '0.0.0.0', () => {
  const local = `http://localhost:${PORT}/`;
  console.log('==============================================');
  console.log('  QUA AN SINH - May chu localhost da chay!');
  console.log('==============================================');
  console.log('  Tren may nay : ' + local);
  lanIPs().forEach((ip) =>
    console.log('  Tren dien thoai (cung Wi-Fi): http://' + ip + ':' + PORT + '/')
  );
  console.log('----------------------------------------------');
  console.log('  Nhan Ctrl + C de tat may chu.');
  console.log('==============================================');
  // Tu mo trinh duyet tren may nay (dat NO_OPEN=1 de tat)
  if (!process.env.NO_OPEN) exec('start "" "' + local + '"');
});
