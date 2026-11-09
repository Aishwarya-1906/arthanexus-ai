/**
 * ArthaNexus Terminal — Full-Stack Local Web & Proxy Server
 * Serves static assets and seamlessly routes API calls to the engine.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { server: engineServer } = require('../engine/src/index.js');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // Route API and health requests to ArthaNexus Engine
  if (url.startsWith('/api/') || url.startsWith('/health')) {
    return engineServer.emit('request', req, res);
  }

  // Serve static files
  let filePath = path.join(PUBLIC_DIR, url === '/' ? 'index.html' : url);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server File Error');
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff'
      });
      res.end(content);
    }
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🚀 ArthaNexus Terminal & Engine running on http://localhost:${PORT}`);
    console.log(`📊 Mode: Full-Stack Edge Prototype (Everyday & Pro Terminal)`);
    console.log(`🛡️ Compliance: SEBI Non-Advisory Educational Guidelines Active`);
    console.log(`💰 Cost: $0.00 (ALLOW_PAID_SERVICES=false)`);
    console.log(`================================================================`);
  });
}

module.exports = { server };
