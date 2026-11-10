/**
 * ArthaNexus Terminal — Static Build Script
 * Copies static assets to dist/ for Cloudflare Pages deployment,
 * and syncs to deploy_vercel/ for Vercel production deployment.
 */

const fs = require('node:fs');
const path = require('node:path');

const publicDir = path.join(__dirname, '../public');
const distDir = path.join(__dirname, '../dist');
const vercelStaticDir = path.join(__dirname, '../../../deploy_vercel/.vercel/output/static');
const deployDir = path.join(__dirname, '../../../deploy_vercel');

// --- Sync to apps/web/dist/ ---
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}
fs.cpSync(publicDir, distDir, { recursive: true });
console.log('✅ Cloudflare Pages build: assets synced → apps/web/dist/');

// --- Sync to deploy_vercel/ ---
if (!fs.existsSync(vercelStaticDir)) {
  fs.mkdirSync(vercelStaticDir, { recursive: true });
}
fs.cpSync(publicDir, vercelStaticDir, { recursive: true });
// Also copy to deploy_vercel/ root for plain static serve fallback
fs.cpSync(publicDir, deployDir, { recursive: true, filter: (src) => !src.endsWith('.vercel') });
console.log('✅ Vercel build: assets synced → deploy_vercel/ and deploy_vercel/.vercel/output/static/');

console.log('🎉 Static build complete — all deployment targets synchronized.');

