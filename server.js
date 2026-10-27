const http = require('http');
const fs = require('fs');
const path = require('path');

let PORT = parseInt(process.env.PORT || 3000, 10);
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.map': 'application/json'
};

// Route aliases mapping to static HTML templates
const ROUTE_ALIASES = {
  '/': 'index.html',
  '/home': 'index.html',
  '/index': 'index.html',
  '/tshirts': 'tshirts.html',
  '/t-shirts': 'tshirts.html',
  '/pages/t-shirts': 'tshirts.html',
  '/pages/tshirts': 'tshirts.html',
  '/products/tshirts': 'tshirts.html',
  '/products/custom-t-shirts': 'tshirts.html',
  '/products/custom-roundneck': 'tshirts.html',
  '/products/roundneck': 'tshirts.html',
  '/products/custom-polo': 'tshirts.html',
  '/products/polo': 'tshirts.html',
  '/products/custom-oversized': 'tshirts.html',
  '/products/oversized': 'tshirts.html',
  '/stickers': 'stickers.html',
  '/pages/stickers': 'stickers.html',
  '/products/stickers': 'stickers.html',
  '/products/die-cuts-custom-stickers': 'stickers.html',
  '/products/kiss-cuts-custom-stickers': 'stickers.html',
  '/caps': 'caps.html',
  '/pages/caps': 'caps.html',
  '/products/caps': 'caps.html',
  '/products/custom-caps': 'caps.html',
  '/products/customized-cotton-caps': 'caps.html',
  '/gifts': 'gifts.html',
  '/pages/gifts': 'gifts.html',
  '/products/gifts': 'gifts.html',
  '/products/4-in-1-gift-set-diary-card-holder-keychain-and-pen-comes-with-box': 'gifts.html',
  '/products/executive-gift-sets': 'gifts.html',
  '/about': 'about.html',
  '/about-us': 'about.html',
  '/pages/about': 'about.html',
  '/pages/about-us': 'about.html',
  '/login': 'login.html',
  '/account': 'login.html',
  '/account/login': 'login.html',
  '/account/register': 'login.html'
};

const server = http.createServer((req, res) => {
  const reqUrl = req.url.split('?')[0];
  const normalizedPath = decodeURIComponent(reqUrl).toLowerCase().replace(/\/+$/, '') || '/';

  // 1. Mock Shopify Cart Endpoints for seamless AJAX responses
  if (normalizedPath === '/cart.js' || normalizedPath.startsWith('/cart/')) {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      status: 'success',
      token: 'local-dev-mock-cart',
      item_count: 0,
      items: [],
      total_price: 0
    }));
    return;
  }

  // 2. Resolve mapped route aliases
  let mappedFile = ROUTE_ALIASES[normalizedPath];
  let filePath;

  if (mappedFile) {
    filePath = path.join(PUBLIC_DIR, mappedFile);
  } else {
    // Direct or relative path lookup
    let cleanRelPath = decodeURIComponent(reqUrl);
    if (cleanRelPath.startsWith('/')) {
      cleanRelPath = cleanRelPath.slice(1);
    }
    filePath = path.join(PUBLIC_DIR, cleanRelPath);
  }

  // Prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/html; charset=UTF-8' });
    res.end('<h1>403 Forbidden</h1>');
    return;
  }

  // 3. Check file existence or try .html fallback
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Check if appending .html works
      const htmlFallbackPath = filePath + '.html';
      fs.stat(htmlFallbackPath, (errFallback, fallbackStats) => {
        if (!errFallback && fallbackStats.isFile()) {
          serveFile(htmlFallbackPath, req, res);
        } else {
          send404(res, reqUrl);
        }
      });
      return;
    }

    serveFile(filePath, req, res);
  });
});

function serveFile(filePath, req, res) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      send404(res, req.url);
      return;
    }

    // Support HTTP Range requests for video files (.mp4, .webm)
    const range = req.headers.range;
    if (range && (ext === '.mp4' || ext === '.webm')) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;

      const fileStream = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mimeType
      });
      fileStream.pipe(res);
      return;
    }

    // Standard static stream
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Length': stats.size,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

function send404(res, reqUrl) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
  res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>404 - Page Not Found | Elementa Dev Server</title>
  <link rel="stylesheet" href="/assets/main.css">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 60px 20px; text-align: center; }
    .card-404 { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    h1 { font-size: 52px; font-weight: 900; color: #ef4444; margin: 0 0 10px; }
    p { font-size: 16px; color: #64748b; margin-bottom: 24px; }
    .nav-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 20px; }
    .nav-btn { display: block; padding: 12px; background: #f1f5f9; color: #0f172a; font-weight: 700; text-decoration: none; border-radius: 10px; transition: all 0.2s; }
    .nav-btn:hover { background: #0284c7; color: #ffffff; }
  </style>
</head>
<body>
  <div class="card-404">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>Could not locate: <code>${reqUrl}</code></p>
    <p>Navigate to any available page on the local Elementa preview server:</p>
    <div class="nav-grid">
      <a class="nav-btn" href="/">🏠 Home (index.html)</a>
      <a class="nav-btn" href="/tshirts.html">👕 Custom T-Shirts</a>
      <a class="nav-btn" href="/stickers.html">🏷️ Custom Stickers</a>
      <a class="nav-btn" href="/caps.html">🧢 Customized Caps</a>
      <a class="nav-btn" href="/gifts.html">🎁 Custom Gifts</a>
      <a class="nav-btn" href="/about.html">✨ About Elementa</a>
      <a class="nav-btn" href="/login.html">👤 Customer Login</a>
    </div>
  </div>
</body>
</html>`);
}

function startServer(portToUse) {
  server.listen(portToUse, () => {
    console.log(`\n================================================================`);
    console.log(`   Elementa Studio Local Dev Server Fully Updated & Running!   `);
    console.log(`================================================================`);
    console.log(` > Local Preview:  http://localhost:${portToUse}`);
    console.log(` > Home:           http://localhost:${portToUse}/`);
    console.log(` > T-Shirts:       http://localhost:${portToUse}/tshirts.html`);
    console.log(` > Stickers:       http://localhost:${portToUse}/stickers.html`);
    console.log(` > Caps:           http://localhost:${portToUse}/caps.html`);
    console.log(` > Gifts:          http://localhost:${portToUse}/gifts.html`);
    console.log(` > About Us:       http://localhost:${portToUse}/about.html`);
    console.log(` > Login/Account:  http://localhost:${portToUse}/login.html`);
    console.log(`================================================================\n`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is in use, trying port ${PORT + 1}...`);
    PORT += 1;
    startServer(PORT);
  } else {
    console.error('Server error:', err);
  }
});

startServer(PORT);
