import LZ from 'lz-string';
import type { Gift } from './types';
import { shrink, toDataUrl } from './image';

export const encodeGift = (g: Gift) => LZ.compressToEncodedURIComponent(JSON.stringify(g));
export const decodeGift = (s: string): Gift | null => {
  try { return JSON.parse(LZ.decompressFromEncodedURIComponent(s) || 'null'); } catch { return null; }
};

const base = () => location.origin + location.pathname;

async function mapStrings(v: any, fn: (s: string, key: string) => Promise<string>, key = ''): Promise<any> {
  if (typeof v === 'string') return fn(v, key);
  if (Array.isArray(v)) return Promise.all(v.map((x) => mapStrings(x, fn, key)));
  if (v && typeof v === 'object') {
    const o: any = {};
    for (const k of Object.keys(v)) o[k] = await mapStrings(v[k], fn, k);
    return o;
  }
  return v;
}

/** Store on the server (short link). Returns null when the server has no storage. */
/** Publish to a short link. If this gift was shared before, the same link is updated in place. */
export async function uploadGift(g: Gift): Promise<{ url: string; share: { id: string; key: string }; updated: boolean } | null> {
  const { share, ...pub } = g;
  const body = JSON.stringify(pub);
  try {
    if (share?.id && share.key) {
      const r = await fetch('/api/gift?id=' + encodeURIComponent(share.id), { method: 'PUT', headers: { 'content-type': 'application/json', 'x-edit-key': share.key }, body });
      if (r.ok) return { url: `${base()}#/g/${share.id}`, share, updated: true };
      if (r.status === 501) return null;
    }
    const r = await fetch('/api/gift', { method: 'POST', headers: { 'content-type': 'application/json' }, body });
    if (!r.ok) return null;
    const { id, key } = await r.json();
    return id ? { url: `${base()}#/g/${id}`, share: { id, key }, updated: false } : null;
  } catch { return null; }
}

export async function fetchSharedGift(id: string): Promise<Gift | null> {
  const r = await fetch('/api/gift?id=' + encodeURIComponent(id));
  if (!r.ok) return null;
  return r.json();
}

/** A link that carries the whole gift inside it (works without any server). */
export function dataLink(g: Gift) { const { share, ...pub } = g; return `${base()}#/d/${encodeGift(pub as Gift)}`; }

/** Same, but photos are shrunk and big custom songs dropped so the link stays shareable. */
export async function liteLink(g: Gift, maxDim = 420, q = 0.5) {
  const lite = await mapStrings(g, async (s) => (s.startsWith('data:image/') && s.length > 4000 ? shrink(s, maxDim, q).catch(() => s) : s));
  if (lite.music?.custom && lite.music.custom.length > 250000) { lite.music.custom = undefined; lite.music.customName = undefined; }
  return dataLink(lite);
}

/** One self-contained .html file — the app itself with the gift baked in. Opens offline. */
export async function exportHtml(g: Gift) {
  // Production serves a fully-inlined copy of the app at /offline.html; dev falls back to the page itself.
  const dir = base().replace(/[^/]*$/, '');
  let html = '';
  try { const r = await fetch(dir + 'offline.html', { cache: 'no-cache' }); if (r.ok) { const t = await r.text(); if (t.includes('<script') && !t.includes('/src/main.tsx')) html = t; } } catch {}
  if (!html) html = await (await fetch(base(), { cache: 'no-cache' })).text();
  const { share, ...pub } = g;
  const inlined = await mapStrings(pub, async (s) => (s.startsWith('/demo/') ? toDataUrl(s).catch(() => s) : s));
  const json = JSON.stringify(inlined).replace(/</g, '\\u003c');
  const inject = `<script>window.__KEEPSAKE_GIFT__=${json};</script>`;
  const out = html.replace('<head>', '<head>' + inject).replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(g.title || 'A gift for ' + g.to)}</title>`);
  const blob = new Blob([out], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${(g.title || 'gift').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
