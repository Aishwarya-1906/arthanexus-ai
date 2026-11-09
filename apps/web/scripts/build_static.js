/**
 * ArthaNexus Terminal — Static Build Script
 * Copies static assets to dist/ for Cloudflare Pages deployment.
 */

const fs = require('node:fs');
const path = require('node:path');

const publicDir = path.join(__dirname, '../public');
const distDir = path.join(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.cpSync(publicDir, distDir, { recursive: true });
console.log('Static build successful: assets generated in apps/web/dist/');
