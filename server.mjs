// Small production server: serves the built app and stores shared gifts on disk
// (data/gifts/<id>.json) so share links stay short. Usage: npm run build && npm start
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PORT = Number(process.env.PORT || 3000);
const DIST = path.resolve('dist');
const DATA = path.resolve('data/gifts');
fs.mkdirSync(DATA, { recursive: true });
const MAX = 25 * 1024 * 1024;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const rand = (n) => Array.from(crypto.randomBytes(n), (b) => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('');
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/api/gift') {
    const json = (code, o) => res.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' }).end(JSON.stringify(o));
    const id = url.searchParams.get('id') || '';
    const idOk = /^[a-z0-9]{6,32}$/i.test(id);
    if (req.method === 'POST' || req.method === 'PUT') {
      let size = 0; const chunks = [];
      req.on('data', (c) => { size += c.length; if (size > MAX) { json(413, { error: 'too large' }); req.destroy(); } else chunks.push(c); });
      req.on('end', () => {
        if (size > MAX) return;
        const body = Buffer.concat(chunks).toString('utf8');
        try { JSON.parse(body); } catch { return json(400, { error: 'bad json' }); }
        if (req.method === 'PUT') {
          if (!idOk) return json(400, { error: 'bad id' });
          const kf = path.join(DATA, id + '.key');
          if (!fs.existsSync(kf) || fs.readFileSync(kf, 'utf8') !== sha(req.headers['x-edit-key'] || '')) return json(403, { error: 'wrong edit key' });
          fs.writeFileSync(path.join(DATA, id + '.json'), body);
          return json(200, { id });
        }
        const nid = rand(10), key = rand(24);
        fs.writeFileSync(path.join(DATA, nid + '.json'), body);
        fs.writeFileSync(path.join(DATA, nid + '.key'), sha(key));
        json(200, { id: nid, key });
      });
      return;
    }
    if (!idOk) return json(400, { error: 'bad id' });
    const f = path.join(DATA, id + '.json');
    if (!fs.existsSync(f)) return json(404, { error: 'not found' });
    return res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' }).end(fs.readFileSync(f));
  }
  let p = path.normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
  let file = path.join(DIST, p);
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html');
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': file.endsWith('.html') ? 'no-cache' : 'public, max-age=86400' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, '0.0.0.0', () => console.log(`Keepsake running on http://0.0.0.0:${PORT}`));
