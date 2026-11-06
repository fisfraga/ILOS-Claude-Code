'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');
const { buildData } = require('./lib/analytics');

const PORT   = process.env.PORT || 3100;
const PUBLIC = path.join(__dirname, 'public');

/* ============================================================
   MIME TYPES
   ============================================================ */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
};

/* ============================================================
   STATIC FILE SERVING
   ============================================================ */
function serveStatic(req, res) {
  let filePath = path.join(PUBLIC, req.url === '/' ? 'index.html' : req.url);

  // Strip query strings
  filePath = filePath.split('?')[0];

  // Security: prevent directory traversal
  if (!filePath.startsWith(PUBLIC)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Fallback to index.html for SPA routing
      fs.readFile(path.join(PUBLIC, 'index.html'), (err2, indexData) => {
        if (err2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(indexData);
      });
      return;
    }
    const ext = path.extname(filePath);
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

/* ============================================================
   REQUEST HANDLER
   ============================================================ */
const server = http.createServer((req, res) => {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');

  const url = req.url.split('?')[0];

  if (url === '/api/data') {
    try {
      const data = buildData();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
    } catch (err) {
      console.error('[/api/data] Error:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: err.message, stack: err.stack }));
    }
    return;
  }

  serveStatic(req, res);
});

/* ============================================================
   START
   ============================================================ */
server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n✦ ILOS Dashboard running at ${url}\n`);
  openBrowser(url);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try: PORT=3101 npm start`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

/* ============================================================
   AUTO OPEN BROWSER
   ============================================================ */
function openBrowser(url) {
  const { exec } = require('child_process');
  const platform = process.platform;
  let cmd;
  if (platform === 'darwin') cmd = `open "${url}"`;
  else if (platform === 'win32') cmd = `start "" "${url}"`;
  else cmd = `xdg-open "${url}"`;
  exec(cmd, err => { if (err) console.log(`Open ${url} in your browser.`); });
}
