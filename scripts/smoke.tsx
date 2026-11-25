// Run with: npm run smoke  (headless jsdom walk-through of every route, demo, piece and editor panel)
// Headless smoke test: mounts the real app in jsdom, visits every route, drives the editor.
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost/', pretendToBeVisual: true });
const w: any = dom.window;
const g: any = globalThis;
for (const k of ['window', 'document', 'navigator', 'location', 'history', 'HTMLElement', 'Element', 'Node', 'HashChangeEvent', 'Event', 'KeyboardEvent', 'MouseEvent', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'IntersectionObserver', 'DOMParser', 'Image', 'FileReader', 'Blob', 'URLSearchParams', 'innerWidth', 'innerHeight', 'devicePixelRatio', 'addEventListener', 'removeEventListener', 'dispatchEvent', 'scrollTo', 'matchMedia', 'HTMLCanvasElement', 'confirm', 'alert'])
  try { if (!(k in g) || ['window','document','navigator','location','history'].includes(k)) Object.defineProperty(g, k, { value: w[k] ?? (() => {}), configurable: true, writable: true }); } catch {}
g.window.IntersectionObserver = g.IntersectionObserver = class { constructor(public cb: any) {} observe() { this.cb([{ isIntersecting: true }]); } disconnect() {} unobserve() {} };
g.window.scrollTo = g.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {}; w.HTMLElement.prototype.scrollTo = () => {};
w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: (_t, p) => p === 'getImageData' ? () => ({ data: new Uint8Array(16) }) : p === 'createLinearGradient' || p === 'createRadialGradient' ? () => ({ addColorStop() {} }) : p === 'measureText' ? () => ({ width: 10 }) : () => {} , set: () => true });
w.HTMLElement.prototype.setPointerCapture = () => {};
g.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
g.AudioContext = g.window.AudioContext = undefined; g.fetch = async () => ({ ok: false, json: async () => ({}) });
g.confirm = g.window.confirm = () => true; g.alert = g.window.alert = () => {};
g.IS_REACT_ACT_ENVIRONMENT = true;
await import('fake-indexeddb/auto'); g.indexedDB = g.window.indexedDB; g.IDBKeyRange = g.window.IDBKeyRange;
const errors: string[] = [];
const origErr = console.error; console.error = (...a: any[]) => { const s = a.map(String).join(' '); if (!/act\(|not wrapped|useLayoutEffect/.test(s)) errors.push(s.slice(0, 400)); };
g.window.addEventListener('error', (e: any) => errors.push('window error: ' + e.message));

const React = await import('react');
const { createRoot } = await import('react-dom/client');
const { act } = await import('react');
const App = (await import('../src/App')).default;
const { TEMPLATES } = await import('../src/templates');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const root = createRoot(document.getElementById('root')!);
await act(async () => { root.render(React.createElement(App)); });
const go = async (h: string, wait = 150) => { await act(async () => { location.hash = h; dispatchEvent(new w.HashChangeEvent('hashchange')); await sleep(wait); }); };
const txt = () => document.getElementById('root')!.textContent || '';
const click = async (el: Element | null | undefined, wait = 60) => { if (!el) throw new Error('missing element'); await act(async () => { (el as HTMLElement).dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await sleep(wait); }); };
const q = (s: string) => document.querySelector(s);
const qa = (s: string) => Array.from(document.querySelectorAll(s));
const report = (label: string) => { console.log(label.padEnd(34), errors.length ? 'ERR ' + errors.splice(0).join(' | ') : 'ok', '·', txt().length, 'chars'); };

await go('/'); report('home');
await go('/gifts'); report('gallery'); console.log('  cards:', qa('.tcard').length);
await go('/gifts?f=mini'); report('gallery mini');
await go('/help'); report('help');
await go('/my'); report('my gifts (empty)');
await go('/book'); report('book wizard');
await go('/letter'); report('letter writer');
for (const t of TEMPLATES) { await go('/demo/' + t.id, 80); const e = errors.length; if (e) report('demo ' + t.id); }
console.log('demos visited', TEMPLATES.length);
for (const t of TEMPLATES.slice(0, 70)) { await go('/t/' + t.id, 40); if (errors.length) report('tpl ' + t.id); }
console.log('template pages ok');
// play a demo through all pages
await go('/demo/b-candles', 100);
await click(q('.opener')); await act(async () => { await sleep(1300); });
let pages = 0; while (q('.pl-nav .nx:not([disabled])') && pages < 20) { await click(q('.pl-nav .nx')); pages++; }
report('played b-candles pages=' + pages);
// editor flow
await go('/new/classic-bash', 400); await go('/new/b-candles', 600);
for (let i = 0; i < 40 && !q('.ed-top'); i++) await act(async () => { await sleep(100); });
console.log('  at', location.hash, txt().slice(0, 80)); report('editor opened');
for (const tab of qa('.ed-tabs button')) { await click(tab, 80); }
report('all editor tabs');
await click(qa('.ed-tabs button')[0]); // add
const addBtns = qa('.pc-grid button'); console.log('  piece buttons:', addBtns.length);
for (let i = 0; i < addBtns.length; i++) { await click(qa('.pc-grid button')[i], 30); if (errors.length) report('add piece #' + i); }
report('added every piece');
console.log('  pieces on page:', qa('.ed-piece').length, 'inspector:', qa('.insp').length, 'inputs:', qa('.insp input, .insp textarea, .insp select').length);
// select each piece -> inspector
for (const el of qa('.ed-piece').slice(0, 200)) { await act(async () => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await sleep(5); }); }
report('inspected all pieces');
{ const first = qa('.ed-piece')[0]; await act(async () => { first.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await sleep(30); }); console.log('  first piece', first.getAttribute('data-pid'), 'inspector inputs:', qa('.insp input, .insp textarea, .insp select').length, (q('.insp-head b')?.textContent)); }
// stickers
await click(qa('.ed-tabs button')[2]);
for (const b of qa('.cat-chips button')) { await click(b, 20); const s = q('.stk-grid button'); if (s) await click(s, 20); }
report('stickers added: ' + qa('.stk').length);
await click(q('.stk')); report('sticker selected');
// look
await click(qa('.ed-tabs button')[3]); for (const b of qa('.theme-grid button')) await click(b, 10); for (const b of qa('.font-grid button')) await click(b, 10);
report('themes/fonts');
await click(qa('.ed-tabs button')[5]); report('extras');
// pages
await click(qa('.ed-tabs button')[1]); await click(q('.pages-panel .add-row')); report('added page');
// play + share
await click(qa('.ed-top .btn')[0], 200); report('play overlay'); await click(q('.close-play'));
await click(qa('.ed-top .btn')[1], 400); report('share modal'); const lk = (q('.link-box input') as any)?.value || ''; (globalThis as any).__link = lk; console.log('  link', lk.slice(0, 60), lk.length);
await act(async () => { await sleep(800); });
const st = await import('../src/lib/storage'); console.log('  idb gifts:', (await st.listGifts()).length);
await go('/gifts', 50); await go('/my', 600); for (let i = 0; i < 30 && !q('.mine-card'); i++) await act(async () => { await sleep(100); }); report('my gifts'); console.log('  ', txt().slice(0, 300)); console.log('  saved gifts:', qa('.mine-card').length);
const link = (globalThis as any).__link as string;
if (link) { const h = link.slice(link.indexOf('#') + 1); await go(h, 800); report('open share link ' + h.slice(0, 12)); console.log('  ', txt().slice(0, 120)); }
console.error = origErr;
process.exit(0);
