// Vercel serverless function: stores gifts so share links stay short.
// Needs a Vercel Blob store connected to the project (BLOB_READ_WRITE_TOKEN).
// Without it, it answers 501 and the app falls back to links that carry the gift inside them.
//   POST /api/gift            → { id, key }   new short link (key = private edit key, kept on the maker's device)
//   PUT  /api/gift?id=… + x-edit-key → { id }  update the same link after editing ("edit later")
//   GET  /api/gift?id=…       → gift JSON
import { put, head } from '@vercel/blob';
import crypto from 'node:crypto';

const MAX = 4.4 * 1024 * 1024; // Vercel request body limit is 4.5 MB
const idOk = (id) => /^[a-z0-9]{6,32}$/i.test(id || '');
const rand = (n) => Array.from(crypto.randomBytes(n), (b) => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('');
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const opts = { access: 'public', addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 };
const read = async (p) => { const m = await head(p).catch(() => null); if (!m) return null; const r = await fetch(`${m.url}?v=${Date.parse(m.uploadedAt) || Date.now()}`, { cache: 'no-store' }); return r.ok ? r.text() : null; };

export default async function handler(req, res) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(501).json({ error: 'storage not configured' });
  try {
    if (req.method === 'POST' || req.method === 'PUT') {
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      if (!body || body.length > MAX) return res.status(413).json({ error: 'too large' });
      if (req.method === 'PUT') {
        const id = req.query.id;
        if (!idOk(id)) return res.status(400).json({ error: 'bad id' });
        const stored = await read(`keys/${id}.txt`);
        if (!stored || stored.trim() !== sha(req.headers['x-edit-key'] || '')) return res.status(403).json({ error: 'wrong edit key' });
        await put(`gifts/${id}.json`, body, { ...opts, contentType: 'application/json' });
        return res.status(200).json({ id });
      }
      const id = rand(10), key = rand(24);
      await put(`gifts/${id}.json`, body, { ...opts, contentType: 'application/json' });
      await put(`keys/${id}.txt`, sha(key), { ...opts, contentType: 'text/plain' });
      return res.status(200).json({ id, key });
    }
    if (req.method === 'GET') {
      const id = req.query.id;
      if (!idOk(id)) return res.status(400).json({ error: 'bad id' });
      const txt = await read(`gifts/${id}.json`);
      if (!txt) return res.status(404).json({ error: 'not found' });
      res.setHeader('content-type', 'application/json');
      res.setHeader('cache-control', 'no-store');
      return res.status(200).send(txt);
    }
    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
