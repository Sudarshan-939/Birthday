import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Gift, Page, Piece, Sticker } from '../lib/types';
import { getGift, saveGift } from '../lib/storage';
import { uid, clone, fillDeep } from '../lib/util';
import { THEMES, FONTS, themeVars, isDark } from '../lib/themes';
import { TRACKS, SFX_SETS, previewTrack, stopMusic, setSfxSet, sfx } from '../lib/audio';
import { STICKER_PACKS, doodleSvg } from '../lib/stickers';
import { PIECES, ALL_PIECES, CATS } from '../pieces';
import { StickerView, PageView } from '../player/Player';
import Player from '../player/Player';
import { findTemplate } from '../templates';
import { FieldInput, PhotoInput, AudioInput } from './fields';
import SharePanel from './SharePanel';
import { compressImage, readFile } from '../lib/image';
import { nav, parseHash } from '../lib/router';
import { ErrorBoundary } from './ErrorBoundary';

type Tab = 'pages' | 'add' | 'stickers' | 'look' | 'sound' | 'extras';
type Device = 'phone' | 'tablet' | 'desktop' | 'all';

const PAGE_BGS = ['', 'linear-gradient(160deg,#fde2e4,#fff1e6)', 'linear-gradient(160deg,#e0f7fa,#ede7f6)', 'linear-gradient(160deg,#fff8e1,#ffe0b2)', 'linear-gradient(160deg,#e8f5e9,#f1f8e9)', 'radial-gradient(circle at 50% 0%,#3b2b5a,#120c22)', 'linear-gradient(160deg,#1e3c72,#2a5298)', 'linear-gradient(160deg,#ffecd2,#fcb69f)', 'linear-gradient(160deg,#f6d365,#fda085)', 'linear-gradient(160deg,#a18cd1,#fbc2eb)', 'repeating-linear-gradient(0deg,#fffdf6 0 27px,#e8dfd0 27px 28px)', 'radial-gradient(#e9dccb 1px, #fbf6ee 1px) 0 0/18px 18px'];

export default function Editor({ id }: { id: string }) {
  const [gift, setGift] = useState<Gift | null | undefined>(undefined);
  const [pi, setPi] = useState(0);
  const [selPiece, setSelPiece] = useState<string | null>(null);
  const [selSticker, setSelSticker] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('add');
  const [mtab, setMtab] = useState<'build' | 'preview' | 'edit'>('preview');
  const [device, setDevice] = useState<Device>('phone');
  const [playing, setPlaying] = useState(false);
  const [sharing, setSharing] = useState(() => parseHash().query.share === '1');
  const [saved, setSaved] = useState<'saved' | 'saving'>('saved');
  const stageRef = useRef<HTMLDivElement>(null);
  const undo = useRef<Gift[]>([]); const redo = useRef<Gift[]>([]); const lastPush = useRef(0);

  useEffect(() => { getGift(id).then((g) => setGift(g ? migrate(g) : null)); return () => stopMusic(); }, [id]);
  useEffect(() => { if (!gift) return; setSaved('saving'); const t = setTimeout(() => saveGift(gift).then(() => setSaved('saved')), 450); return () => clearTimeout(t); }, [gift]);
  useEffect(() => { if (gift) setSfxSet(gift.sfx); }, [gift?.sfx]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && tag !== 'INPUT' && tag !== 'TEXTAREA') { e.preventDefault(); e.shiftKey ? doRedo() : doUndo(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selSticker && tag !== 'INPUT' && tag !== 'TEXTAREA') { delSticker(selSticker); }
    };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  });

  if (gift === undefined) return <div className="center-msg"><div className="spinner" />Opening the editor…</div>;
  if (gift === null) return <div className="center-msg">This gift isn't saved on this device.<br /><a href="#/my">My gifts</a> · <a href="#/gifts">Make a new one</a></div>;

  const page = gift.pages[Math.min(pi, gift.pages.length - 1)];
  const piece = page?.pieces.find((x) => x.id === selPiece) || null;
  const sticker = page?.stickers.find((x) => x.id === selSticker) || null;

  // ---------- state helpers (immutable, shallow) ----------
  function commit(n: Gift) {
    const now = Date.now();
    if (now - lastPush.current > 700) { undo.current.push(gift!); if (undo.current.length > 80) undo.current.shift(); redo.current = []; }
    lastPush.current = now;
    setGift(n);
  }
  const setG = (patch: Partial<Gift>) => commit({ ...gift, ...patch });
  const setPages = (pages: Page[]) => setG({ pages });
  const setPage = (i: number, patch: Partial<Page>) => setPages(gift.pages.map((p, k) => (k === i ? { ...p, ...patch } : p)));
  const curI = gift.pages.indexOf(page);
  const setPieces = (pieces: Piece[]) => setPage(curI, { pieces });
  const setProps = (pid: string, props: Record<string, any>) => setPieces(page.pieces.map((x) => (x.id === pid ? { ...x, props } : x)));
  function doUndo() { const p = undo.current.pop(); if (p) { redo.current.push(gift!); setGift(p); lastPush.current = 0; } }
  function doRedo() { const p = redo.current.pop(); if (p) { undo.current.push(gift!); setGift(p); lastPush.current = 0; } }

  const addPiece = (type: string) => {
    const def = PIECES[type]; const np: Piece = { id: uid(6), type, props: def.defaults() };
    const at = piece ? page.pieces.indexOf(piece) + 1 : page.pieces.length;
    setPieces([...page.pieces.slice(0, at), np, ...page.pieces.slice(at)]);
    setSelPiece(np.id); setSelSticker(null); setMtab('edit'); sfx('pop');
    setTimeout(() => document.querySelector(`[data-pid="${np.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
  };
  const movePiece = (pid: string, d: number) => { const a = [...page.pieces]; const i = a.findIndex((x) => x.id === pid); const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setPieces(a); };
  const dupPiece = (pid: string) => { const i = page.pieces.findIndex((x) => x.id === pid); const c = { ...clone(page.pieces[i]), id: uid(6) }; setPieces([...page.pieces.slice(0, i + 1), c, ...page.pieces.slice(i + 1)]); setSelPiece(c.id); };
  const delPiece = (pid: string) => { setPieces(page.pieces.filter((x) => x.id !== pid)); if (selPiece === pid) setSelPiece(null); };
  const movePieceToPage = (pid: string, to: number) => { const p = page.pieces.find((x) => x.id === pid)!; setPages(gift.pages.map((pg, k) => (k === curI ? { ...pg, pieces: pg.pieces.filter((x) => x.id !== pid) } : k === to ? { ...pg, pieces: [...pg.pieces, p] } : pg))); setPi(to); };

  const addPage = () => { const np: Page = { id: uid(6), title: `Page ${gift.pages.length + 1}`, pieces: [], stickers: [] }; setPages([...gift.pages.slice(0, curI + 1), np, ...gift.pages.slice(curI + 1)]); setPi(curI + 1); setSelPiece(null); setTab('add'); };
  const dupPage = (i: number) => { const c = clone(gift.pages[i]); c.id = uid(6); c.pieces.forEach((x) => (x.id = uid(6))); c.stickers.forEach((x) => (x.id = uid(6))); c.title = (c.title || 'Page') + ' copy'; setPages([...gift.pages.slice(0, i + 1), c, ...gift.pages.slice(i + 1)]); setPi(i + 1); };
  const delPage = (i: number) => { if (gift.pages.length <= 1) return alert('A gift needs at least one page.'); if (!confirm(`Delete page "${gift.pages[i].title || i + 1}"?`)) return; setPages(gift.pages.filter((_, k) => k !== i)); setPi(Math.max(0, Math.min(pi, gift.pages.length - 2))); setSelPiece(null); };
  const movePage = (i: number, d: number) => { const a = [...gift.pages]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setPages(a); setPi(j); };

  const addSticker = (kind: Sticker['kind'], value: string) => {
    const sc = stageRef.current?.querySelector('.ed-scroll') as HTMLElement | null;
    const y = (sc?.scrollTop || 0) + Math.min(260, (sc?.clientHeight || 500) / 2) + (Math.random() * 80 - 40);
    const s: Sticker = { id: uid(6), kind, value, x: 30 + Math.random() * 40, y, scale: kind === 'word' ? 1 : 1.2, rot: Math.round(Math.random() * 24 - 12), anim: 'none' };
    setPage(curI, { stickers: [...page.stickers, s] }); setSelSticker(s.id); setSelPiece(null); sfx('pop');
  };
  const setSticker = (s: Sticker) => setPage(curI, { stickers: page.stickers.map((x) => (x.id === s.id ? s : x)) });
  const delSticker = (sid: string) => { setPage(curI, { stickers: page.stickers.filter((x) => x.id !== sid) }); setSelSticker(null); };

  const vars = themeVars(gift.theme, gift.colors, gift.font) as any;
  const ctx = { name: gift.to, sender: gift.from, age: gift.age, editing: true };

  const stage = (
    <div className={`player editing ${isDark(gift.theme) ? 'dark' : ''}`} style={vars}>
      <div className="ed-scroll" onPointerDown={() => setSelSticker(null)}>
        <div className="gift-page-inner" style={page.bg ? { background: page.bg } : undefined}>
          {page.pieces.map((pc, k) => {
            const def = PIECES[pc.type]; if (!def) return null;
            const R = def.Render;
            return (
              <div key={pc.id} data-pid={pc.id} className={`ed-piece ${selPiece === pc.id ? 'sel' : ''}`} onClickCapture={() => { if (selPiece !== pc.id) { setSelPiece(pc.id); setSelSticker(null); } }}>
                <div className="ed-ptools" onClick={(e) => e.stopPropagation()}>
                  <span>{def.icon} {def.label}</span>
                  <button onClick={() => movePiece(pc.id, -1)} disabled={k === 0} title="Move up">↑</button>
                  <button onClick={() => movePiece(pc.id, 1)} disabled={k === page.pieces.length - 1} title="Move down">↓</button>
                  <button onClick={() => dupPiece(pc.id)} title="Duplicate">⧉</button>
                  <button onClick={() => { setSelPiece(pc.id); setMtab('edit'); }} title="Edit" className="m-only">✎</button>
                  <button onClick={() => delPiece(pc.id)} title="Delete">✕</button>
                </div>
                <section className={def.bare ? 'piece bare' : 'piece pc-card'} data-type={pc.type}><ErrorBoundary resetKey={pc.props}><R p={fillProps(pc.props, ctx)} ctx={ctx} /></ErrorBoundary></section>
              </div>
            );
          })}
          {page.pieces.length === 0 && <div className="empty-page"><p>This page is empty.</p><button className="btn small" onClick={() => { setTab('add'); setMtab('build'); }}>＋ Add a piece</button></div>}
          <div className="stk-layer">{page.stickers.map((s) => <StickerView key={s.id} s={s} editable selected={selSticker === s.id} onSelect={() => { setSelSticker(s.id); setSelPiece(null); }} onChange={setSticker} onDelete={() => delSticker(s.id)} />)}</div>
        </div>
        <div className="ed-add-under"><button onClick={() => { setSelPiece(page.pieces[page.pieces.length - 1]?.id || null); setTab('add'); setMtab('build'); }}>＋ Add to this page</button></div>
      </div>
    </div>
  );

  return (
    <div className={`ed m-${mtab}`}>
      <header className="ed-top">
        <a href="#/my" className="ed-back" title="My gifts">←</a>
        <a href="#/" className="logo sm">💝</a>
        <input className="ed-title" value={gift.title} onChange={(e) => setG({ title: e.target.value })} />
        <span className={`saved ${saved}`}>{saved === 'saved' ? '✓ Saved' : 'Saving…'}</span>
        <div className="ed-undo"><button onClick={doUndo} disabled={!undo.current.length} title="Undo (Ctrl+Z)">↶</button><button onClick={doRedo} disabled={!redo.current.length} title="Redo">↷</button></div>
        <div className="seg devices">{(['phone', 'tablet', 'desktop', 'all'] as Device[]).map((d) => <button key={d} className={device === d ? 'on' : ''} onClick={() => setDevice(d)} title={d}>{{ phone: '📱', tablet: '▭', desktop: '🖥', all: '⧉' }[d]}<span>{{ phone: 'Phone', tablet: 'Tablet', desktop: 'Desktop', all: 'All' }[d]}</span></button>)}</div>
        <button className="btn ghost small" onClick={() => { stopMusic(); setPlaying(true); }}>▶ Play</button>
        <button className="btn small" onClick={() => setSharing(true)}>Share 💌</button>
      </header>

      <div className="ed-body">
        <aside className="ed-left">
          <div className="ed-tabs">{([['add', '＋', 'Add'], ['pages', '📄', 'Pages'], ['stickers', '😍', 'Stickers'], ['look', '🎨', 'Look'], ['sound', '🎵', 'Sound'], ['extras', '🔒', 'Extras']] as [Tab, string, string][]).map(([t, i, l]) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}><span>{i}</span>{l}</button>)}</div>
          <div className="ed-panel">
            {tab === 'add' && <AddPanel onAdd={addPiece} />}
            {tab === 'pages' && <PagesPanel gift={gift} cur={curI} setCur={(i) => { setPi(i); setSelPiece(null); setSelSticker(null); }} addPage={addPage} dupPage={dupPage} delPage={delPage} movePage={movePage} rename={(i, title) => setPage(i, { title })} />}
            {tab === 'stickers' && <StickerPanel onAdd={addSticker} />}
            {tab === 'look' && <LookPanel gift={gift} setG={setG} />}
            {tab === 'sound' && <SoundPanel gift={gift} setG={setG} />}
            {tab === 'extras' && <ExtrasPanel gift={gift} setG={setG} />}
          </div>
        </aside>

        <main className="ed-stage" ref={stageRef}>
          <div className="page-tabs">
            {gift.pages.map((p, k) => <button key={p.id} className={k === curI ? 'on' : ''} onClick={() => { setPi(k); setSelPiece(null); setSelSticker(null); }}>{k + 1}. {p.title || 'Page'}</button>)}
            <button className="add" onClick={addPage}>＋ Page</button>
          </div>
          {device === 'all' ? (
            <div className="all-devices">{(['phone', 'tablet', 'desktop'] as Device[]).map((d) => <div key={d} className={`dev-wrap ${d}`}><small>{d}</small><div className={`device ${d} readonly`}><div className={`player ${isDark(gift.theme) ? 'dark' : ''}`} style={vars}><div className="ed-scroll"><PageView page={page} gift={gift} /></div></div></div></div>)}</div>
          ) : (
            <div className={`device ${device}`}>{stage}</div>
          )}
          <p className="stage-hint">Tap a piece to edit it · drag stickers to move · ⤡ resizes & turns</p>
        </main>

        <aside className="ed-right">
          {sticker ? <StickerInspector s={sticker} set={setSticker} del={() => delSticker(sticker.id)} /> : piece ? (
            <PieceInspector key={piece.id} piece={piece} setProps={(p) => setProps(piece.id, p)} pages={gift.pages} cur={curI}
              onMove={(d) => movePiece(piece.id, d)} onDup={() => dupPiece(piece.id)} onDel={() => delPiece(piece.id)} onToPage={(to) => movePieceToPage(piece.id, to)} onClose={() => setSelPiece(null)} />
          ) : <PageInspector page={page} index={curI} set={(patch) => setPage(curI, patch)} gift={gift} setG={setG} />}
        </aside>
      </div>

      <nav className="ed-mtabs">
        <button className={mtab === 'build' ? 'on' : ''} onClick={() => setMtab('build')}>＋ Build</button>
        <button className={mtab === 'preview' ? 'on' : ''} onClick={() => setMtab('preview')}>👁 Preview</button>
        <button className={mtab === 'edit' ? 'on' : ''} onClick={() => setMtab('edit')}>✎ Edit{piece ? ': ' + PIECES[piece.type]?.label : ''}</button>
      </nav>

      {playing && <div className="play-overlay"><div className={`device ${device === 'all' ? 'phone' : device} playing`}><Player gift={gift} onExit={() => setPlaying(false)} /></div><button className="close-play" onClick={() => { stopMusic(); setPlaying(false); }}>✕ Back to editing</button></div>}
      {sharing && <SharePanel gift={gift} onShared={(share) => setGift((g) => (g ? { ...g, share } : g))} onClose={() => setSharing(false)} onPlay={() => { setSharing(false); setPlaying(true); }} />}
    </div>
  );
}

// fill {name}/{sender}/{age} for preview, same as the player
const fillProps = (p: any, ctx: any) => fillDeep(p, ctx);

function migrate(g: Gift): Gift {
  return { ...g, pages: g.pages.map((p) => ({ ...p, stickers: p.stickers || [], pieces: p.pieces || [] })), opener: g.opener || { enabled: true, style: 'envelope', line: 'For {name} ♡' }, music: g.music || { track: 'bloom' }, effect: g.effect || { type: 'none' } };
}

// ================================================================ panels
function AddPanel({ onAdd }: { onAdd: (t: string) => void }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const list = ALL_PIECES.filter((p) => (cat === 'all' || p.cat === cat) && (!q || (p.label + p.desc + p.type).toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="add-panel">
      <h4>Add to this page <small>{ALL_PIECES.length} pieces</small></h4>
      <input type="search" placeholder="Search: cake, quiz, letter…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="cat-chips"><button className={cat === 'all' ? 'on' : ''} onClick={() => setCat('all')}>All</button>{CATS.map((c) => <button key={c.id} className={cat === c.id ? 'on' : ''} onClick={() => setCat(c.id)}>{c.label}</button>)}</div>
      {(cat === 'all' && !q ? CATS : CATS.filter((c) => list.some((p) => p.cat === c.id))).map((c) => {
        const items = list.filter((p) => p.cat === c.id); if (!items.length) return null;
        return <div key={c.id} className="pc-group"><h5>{c.label}</h5><div className="pc-grid">{items.map((p) => <button key={p.type} onClick={() => onAdd(p.type)} title={p.desc}><span className="i">{p.icon}</span><b>{p.label}</b><small>{p.desc}</small></button>)}</div></div>;
      })}
      {!list.length && <p className="muted">Nothing matches “{q}”.</p>}
    </div>
  );
}

function PagesPanel({ gift, cur, setCur, addPage, dupPage, delPage, movePage, rename }: { gift: Gift; cur: number; setCur: (i: number) => void; addPage: () => void; dupPage: (i: number) => void; delPage: (i: number) => void; movePage: (i: number, d: number) => void; rename: (i: number, t: string) => void }) {
  return (
    <div className="pages-panel">
      <h4>Pages <small>{gift.pages.length}</small></h4>
      <p className="muted">They swipe through these in order. Tap one to edit it.</p>
      {gift.pages.map((p, i) => (
        <div key={p.id} className={`pg-row ${i === cur ? 'on' : ''}`} onClick={() => setCur(i)}>
          <span className="n">{i + 1}</span>
          <div className="pg-info"><input value={p.title || ''} placeholder={`Page ${i + 1}`} onChange={(e) => rename(i, e.target.value)} onClick={(e) => e.stopPropagation()} /><small>{p.pieces.map((x) => PIECES[x.type]?.icon).join(' ') || 'empty'}{p.stickers.length ? ` · ${p.stickers.length} stickers` : ''}</small></div>
          <div className="mini-acts" onClick={(e) => e.stopPropagation()}><button onClick={() => movePage(i, -1)} title="Move up">↑</button><button onClick={() => movePage(i, 1)} title="Move down">↓</button><button onClick={() => dupPage(i)} title="Duplicate">⧉</button><button onClick={() => delPage(i)} title="Delete">✕</button></div>
        </div>
      ))}
      <button className="add-row" onClick={addPage}>＋ Add a page</button>
    </div>
  );
}

function StickerPanel({ onAdd }: { onAdd: (k: Sticker['kind'], v: string) => void }) {
  const [pack, setPack] = useState(STICKER_PACKS[0].id);
  const [word, setWord] = useState('');
  const [emoji, setEmoji] = useState('');
  const [color, setColor] = useState('#e0567a');
  const fileRef = useRef<HTMLInputElement>(null);
  const p = STICKER_PACKS.find((x) => x.id === pack)!;
  return (
    <div className="stk-panel">
      <h4>Stickers <small>tap to add</small></h4>
      <div className="cat-chips">{STICKER_PACKS.map((x) => <button key={x.id} className={pack === x.id ? 'on' : ''} onClick={() => setPack(x.id)}>{x.name}</button>)}<button className={pack === 'own' ? 'on' : ''} onClick={() => setPack('own')}>Text, emoji & photo</button></div>
      {pack === 'own' ? (
        <div className="own-stk">
          <label className="fld"><span className="fl">Your own words</span><div className="color-row"><input value={word} onChange={(e) => setWord(e.target.value)} placeholder="Type anything" /><button className="btn small" disabled={!word.trim()} onClick={() => { onAdd('word', word.trim()); setWord(''); }}>Add</button></div></label>
          <label className="fld"><span className="fl">Any emoji</span><div className="color-row"><input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="Paste or type an emoji 🫶" /><button className="btn small" disabled={!emoji.trim()} onClick={() => { onAdd('emoji', emoji.trim()); setEmoji(''); }}>Add</button></div></label>
          <div className="fld"><span className="fl">Your own photo or PNG as a sticker</span><button className="add-row" onClick={() => fileRef.current?.click()}>＋ Upload image</button><input ref={fileRef} type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) onAdd('img', f.type === 'image/png' || f.type === 'image/gif' ? await compressPng(f) : await compressImage(f, 500, 0.8)); e.target.value = ''; }} /></div>
        </div>
      ) : (
        <>
          {p.kind === 'doodle' && <div className="color-row doodle-color"><span>Ink</span>{['#e0567a', '#ff9f43', '#f6c90e', '#2ecc71', '#3498db', '#9b59b6', '#2b2b2b', '#ffffff'].map((c) => <button key={c} className={`sw ${color === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setColor(c)} />)}<input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></div>}
          <div className={`stk-grid k-${p.kind}`}>{p.items.map((it, i) => <button key={i} onClick={() => onAdd(p.kind, p.kind === 'doodle' ? `${it}|${color}` : it)}>{p.kind === 'doodle' ? <img src={doodleSvg(it, color)} alt={it} /> : p.kind === 'word' ? <span className="w">{it}</span> : it}</button>)}</div>
        </>
      )}
    </div>
  );
}
async function compressPng(f: File) { return f.size < 400000 ? readFile(f) : compressImage(f, 600, 0.85); }

function LookPanel({ gift, setG }: { gift: Gift; setG: (p: Partial<Gift>) => void }) {
  const base = THEMES.find((t) => t.id === gift.theme) || THEMES[0];
  const cur = { ...base.colors, ...(gift.colors || {}) };
  const COLS: [keyof typeof cur, string][] = [['page', 'Page'], ['card', 'Cards'], ['text', 'Text'], ['accent', 'Accent'], ['accent2', 'Second accent']];
  return (
    <div className="look-panel">
      <h4>Colour theme</h4>
      <div className="theme-grid">{THEMES.map((t) => <button key={t.id} className={gift.theme === t.id ? 'on' : ''} onClick={() => setG({ theme: t.id, colors: undefined })}><span className="sw3" style={{ background: t.colors.page }}><i style={{ background: t.colors.card }} /><i style={{ background: t.colors.accent }} /><i style={{ background: t.colors.accent2 }} /></span>{t.name}</button>)}</div>
      <h4>Custom colours {gift.colors && <button className="link" onClick={() => setG({ colors: undefined })}>reset</button>}</h4>
      <div className="col-grid">{COLS.map(([k, l]) => <label key={k}><input type="color" value={cur[k]} onChange={(e) => setG({ colors: { ...(gift.colors || {}), [k]: e.target.value } })} />{l}</label>)}</div>
      <h4>Font</h4>
      <div className="font-grid">{FONTS.map((f) => <button key={f.id} className={gift.font === f.id ? 'on' : ''} onClick={() => setG({ font: f.id })} style={{ fontFamily: f.display }}>{f.name}<small style={{ fontFamily: f.body }}>For {gift.to}</small></button>)}</div>
      <h4>Page turn</h4>
      <div className="seg wrap">{(['slide', 'fade', 'flip', 'zoom', 'curtain'] as Gift['transition'][]).map((t) => <button key={t} className={gift.transition === t ? 'on' : ''} onClick={() => setG({ transition: t })}>{t[0].toUpperCase() + t.slice(1)}</button>)}</div>
      <h4>Falling in the background</h4>
      <div className="seg wrap">{([['none', 'Nothing'], ['hearts', '💗 Hearts'], ['confetti', '🎊 Confetti'], ['stars', '✨ Stars'], ['petals', '🌸 Petals'], ['snow', '❄ Snow'], ['bubbles', '🫧 Bubbles'], ['emoji', 'Your emoji']] as [Gift['effect']['type'], string][]).map(([t, l]) => <button key={t} className={gift.effect?.type === t ? 'on' : ''} onClick={() => setG({ effect: { ...gift.effect, type: t } })}>{l}</button>)}</div>
      {gift.effect?.type === 'emoji' && <label className="fld"><span className="fl">Which emoji (one or more)</span><input value={gift.effect.emoji || ''} placeholder="🍫🧸" onChange={(e) => setG({ effect: { ...gift.effect, emoji: e.target.value } })} /></label>}
    </div>
  );
}

function SoundPanel({ gift, setG }: { gift: Gift; setG: (p: Partial<Gift>) => void }) {
  const [prev, setPrev] = useState<string | null>(null);
  useEffect(() => () => stopMusic(), []);
  const m = gift.music || { track: 'bloom' };
  const toggle = (id: string) => { if (prev === id) { stopMusic(); setPrev(null); } else { previewTrack(id); setPrev(id); } };
  return (
    <div className="sound-panel">
      <h4>Music <small>starts when they open it</small></h4>
      <div className="track-list">
        <button className={m.track === 'none' ? 'on' : ''} onClick={() => setG({ music: { ...m, track: 'none' } })}><span className="pl">🔇</span><b>No music</b></button>
        {TRACKS.map((t) => <div key={t.id} className={`track ${m.track === t.id ? 'on' : ''}`} onClick={() => setG({ music: { ...m, track: t.id } })}><button className="pl" onClick={(e) => { e.stopPropagation(); toggle(t.id); }}>{prev === t.id ? '■' : '▶'}</button><b>{t.name}</b><small>{t.mood}</small></div>)}
        <div className={`track ${m.track === 'custom' ? 'on' : ''}`} onClick={() => m.custom && setG({ music: { ...m, track: 'custom' } })}><span className="pl">🎧</span><b>Your own song</b><small>{m.customName || 'upload below'}</small></div>
      </div>
      <div className="fld"><span className="fl">Upload your own song (audio or MP4, up to 25 MB) or record one</span>
        <AudioInput v={m.custom} set={(v) => setG({ music: { ...m, custom: v || undefined, customName: v ? m.customName || 'My song' : undefined, track: v ? 'custom' : m.track === 'custom' ? 'bloom' : m.track } })} />
        {m.custom && <input value={m.customName || ''} placeholder="Song name" onChange={(e) => setG({ music: { ...m, customName: e.target.value } })} />}
      </div>
      <label className="fld"><span className="fl">Volume</span><input type="range" min={0.1} max={1} step={0.05} value={m.volume ?? 0.6} onChange={(e) => setG({ music: { ...m, volume: +e.target.value } })} /></label>
      <h4>Tap sounds</h4>
      <div className="seg wrap">{SFX_SETS.map((s) => <button key={s.id} className={gift.sfx === s.id ? 'on' : ''} onClick={() => { setG({ sfx: s.id }); setSfxSet(s.id); setTimeout(() => sfx('tap'), 30); }}>{s.name}</button>)}</div>
    </div>
  );
}

function ExtrasPanel({ gift, setG }: { gift: Gift; setG: (p: Partial<Gift>) => void }) {
  const lock = gift.lock || {};
  const setLock = (p: Partial<NonNullable<Gift['lock']>>) => setG({ lock: { ...lock, ...p } });
  const tpl = findTemplate(gift.templateId);
  const reminder = () => {
    const d = lock.until ? new Date(lock.until) : new Date(Date.now() + 86400000);
    const f = (x: Date) => x.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Keepsake//EN\nBEGIN:VEVENT\nUID:${gift.id}@keepsake\nDTSTAMP:${f(new Date())}\nDTSTART:${f(d)}\nDTEND:${f(new Date(d.getTime() + 900000))}\nSUMMARY:Send ${gift.to} their gift 💝\nDESCRIPTION:Open Keepsake → My gifts → ${gift.title.replace(/\n/g, ' ')} → Share\nBEGIN:VALARM\nTRIGGER:-PT10M\nACTION:DISPLAY\nDESCRIPTION:Send the gift\nEND:VALARM\nEND:VEVENT\nEND:VCALENDAR`;
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'send-gift-reminder.ics'; a.click();
  };
  return (
    <div className="extras-panel">
      <h4>Names</h4>
      <p className="muted">Write <code>{'{name}'}</code>, <code>{'{sender}'}</code> or <code>{'{age}'}</code> anywhere and they get filled in.</p>
      <label className="fld"><span className="fl">For (their name)</span><input value={gift.to} onChange={(e) => setG({ to: e.target.value })} /></label>
      <label className="fld"><span className="fl">From (your name)</span><input value={gift.from} onChange={(e) => setG({ from: e.target.value })} /></label>
      <label className="fld"><span className="fl">Age (optional)</span><input value={gift.age || ''} onChange={(e) => setG({ age: e.target.value })} /></label>

      <h4>Opening</h4>
      <label className="toggle"><input type="checkbox" checked={gift.opener.enabled} onChange={(e) => setG({ opener: { ...gift.opener, enabled: e.target.checked } })} /><span />Show an opening screen first (it also starts the music)</label>
      {gift.opener.enabled && <>
        <div className="seg wrap">{([['envelope', '✉️ Sealed envelope'], ['giftbox', '🎁 Gift box'], ['curtain', '🎭 Curtain'], ['tap', '💗 Tap heart']] as [Gift['opener']['style'], string][]).map(([s, l]) => <button key={s} className={gift.opener.style === s ? 'on' : ''} onClick={() => setG({ opener: { ...gift.opener, style: s } })}>{l}</button>)}</div>
        <label className="fld"><span className="fl">Line on it</span><input value={gift.opener.line} onChange={(e) => setG({ opener: { ...gift.opener, line: e.target.value } })} /></label>
      </>}

      <h4>Seal until a date & time <span className="free">free</span></h4>
      <p className="muted">Send it early. Until then they see a countdown with your note.</p>
      <label className="fld"><span className="fl">Opens on</span><div className="color-row"><input type="datetime-local" value={lock.until || ''} onChange={(e) => setLock({ until: e.target.value })} />{lock.until && <button className="btn ghost small" onClick={() => setLock({ until: '' })}>Clear</button>}</div></label>
      <label className="fld"><span className="fl">Message on the countdown</span><input value={lock.message || ''} placeholder="Something special is waiting for {name}" onChange={(e) => setLock({ message: e.target.value })} /></label>

      <h4>Secret word <span className="free">free</span></h4>
      <label className="fld"><span className="fl">Secret word (leave empty for none)</span><input value={lock.password || ''} placeholder="e.g. biscuit" onChange={(e) => setLock({ password: e.target.value })} /></label>
      {lock.password && <label className="fld"><span className="fl">Hint</span><input value={lock.hint || ''} placeholder="our dog's name" onChange={(e) => setLock({ hint: e.target.value })} /></label>}

      <h4>Remind me to send it</h4>
      <p className="muted">Download a calendar reminder{lock.until ? ' for the unlock time' : ' for tomorrow'}. Works with Google, Apple and Outlook calendars.</p>
      <button className="add-row" onClick={reminder}>📅 Add reminder to my calendar</button>

      {tpl && <><h4>Template</h4><p className="muted">Started from <a href={`#/t/${tpl.id}`}>{tpl.name}</a>.</p></>}
    </div>
  );
}

// ================================================================ inspectors
function PieceInspector({ piece, setProps, pages, cur, onMove, onDup, onDel, onToPage, onClose }: { piece: Piece; setProps: (p: any) => void; pages: Page[]; cur: number; onMove: (d: number) => void; onDup: () => void; onDel: () => void; onToPage: (i: number) => void; onClose: () => void }) {
  const def = PIECES[piece.type];
  if (!def) return <div className="insp"><p>Unknown piece.</p><button onClick={onDel}>Delete</button></div>;
  return (
    <div className="insp">
      <div className="insp-head"><span className="i">{def.icon}</span><div><b>{def.label}</b><small>{def.desc}</small></div><button className="x" onClick={onClose} title="Close">✕</button></div>
      <div className="insp-acts"><button onClick={() => onMove(-1)}>↑ Up</button><button onClick={() => onMove(1)}>↓ Down</button><button onClick={onDup}>⧉ Copy</button><button className="danger" onClick={onDel}>✕ Delete</button></div>
      <div className="insp-fields">
        {def.fields.map((f) => <FieldInput key={f.key} f={f} v={piece.props[f.key]} set={(v) => setProps({ ...piece.props, [f.key]: v })} />)}
        {!def.fields.length && <p className="muted">Nothing to set here.</p>}
      </div>
      <div className="insp-foot">
        {pages.length > 1 && <label className="fld"><span className="fl">Move to page</span><select value={cur} onChange={(e) => onToPage(+e.target.value)}>{pages.map((p, i) => <option key={p.id} value={i}>{i + 1}. {p.title || 'Page'}</option>)}</select></label>}
        <button className="link" onClick={() => confirm('Put back the example content for this piece?') && setProps(def.defaults())}>↺ Reset to example content</button>
      </div>
    </div>
  );
}

function PageInspector({ page, index, set, gift, setG }: { page: Page; index: number; set: (p: Partial<Page>) => void; gift: Gift; setG: (p: Partial<Gift>) => void }) {
  const [custom, setCustom] = useState('#fde2e4');
  const isImg = page.bg?.startsWith('url(');
  return (
    <div className="insp">
      <div className="insp-head"><span className="i">📄</span><div><b>Page {index + 1}</b><small>Tap any piece in the preview to edit its words and photos.</small></div></div>
      <label className="fld"><span className="fl">Page name (only you see this)</span><input value={page.title || ''} onChange={(e) => set({ title: e.target.value })} /></label>
      <div className="fld"><span className="fl">Page background</span>
        <div className="bg-grid">{PAGE_BGS.map((b) => <button key={b} className={(page.bg || '') === b ? 'on' : ''} style={{ background: b || 'var(--ed-theme-page, #fff)' }} onClick={() => set({ bg: b || undefined })}>{b ? '' : 'Theme'}</button>)}</div>
        <div className="color-row"><input type="color" value={custom} onChange={(e) => { setCustom(e.target.value); set({ bg: e.target.value }); }} /><span>Any colour</span></div>
        <div className="fld"><span className="fl">Or a photo</span><PhotoInput v={isImg ? page.bg!.slice(5, -2).replace(/\) center\/cover.*$/, '') : ''} set={(v) => set({ bg: v ? `url("${v}") center/cover` : undefined })} /></div>
      </div>
      <div className="tip-card"><b>Quick tips</b><ul><li>Use <b>＋ Add</b> for letters, games, photos and {ALL_PIECES.length - 10}+ more.</li><li><b>😍 Stickers</b> can be dragged anywhere on the page.</li><li><b>🎨 Look</b> changes colours and fonts for the whole gift.</li><li><b>🔒 Extras</b> has the seal-until-a-date lock and the secret word.</li></ul></div>
    </div>
  );
}

function StickerInspector({ s, set, del }: { s: Sticker; set: (s: Sticker) => void; del: () => void }) {
  const [name, color] = s.kind === 'doodle' ? s.value.split('|') : ['', ''];
  return (
    <div className="insp">
      <div className="insp-head"><span className="i">😍</span><div><b>Sticker</b><small>Drag it on the page. Use the ⤡ handle to resize and turn.</small></div></div>
      {(s.kind === 'word' || s.kind === 'emoji') && <label className="fld"><span className="fl">{s.kind === 'word' ? 'Words' : 'Emoji'}</span><input value={s.value} onChange={(e) => set({ ...s, value: e.target.value })} /></label>}
      {s.kind === 'doodle' && <label className="fld"><span className="fl">Ink colour</span><input type="color" value={color || '#e0567a'} onChange={(e) => set({ ...s, value: `${name}|${e.target.value}` })} /></label>}
      <label className="fld"><span className="fl">Size</span><input type="range" min={0.3} max={6} step={0.05} value={s.scale} onChange={(e) => set({ ...s, scale: +e.target.value })} /></label>
      <label className="fld"><span className="fl">Turn</span><input type="range" min={-180} max={180} value={Math.round(((s.rot + 540) % 360) - 180)} onChange={(e) => set({ ...s, rot: +e.target.value })} /></label>
      <div className="fld"><span className="fl">Movement</span><div className="seg wrap">{(['none', 'float', 'spin', 'pulse', 'wiggle'] as Sticker['anim'][]).map((a) => <button key={a} className={(s.anim || 'none') === a ? 'on' : ''} onClick={() => set({ ...s, anim: a })}>{a === 'none' ? 'Still' : a![0].toUpperCase() + a!.slice(1)}</button>)}</div></div>
      <button className="btn ghost small danger" onClick={del}>✕ Remove sticker</button>
    </div>
  );
}
