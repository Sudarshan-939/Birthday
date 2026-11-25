import React, { useEffect, useRef, useState } from 'react';
import { PieceDef, F, H, Hint, Btn, Para, Img, Hidden, useSequence, useInView, demoPhotos, DEMO } from './core';
import { sfx } from '../lib/audio';
import { confetti, hearts, burst } from '../lib/fx';
import { vibrate, graphemes } from '../lib/util';

// ---------------- Festive ----------------
const Diyas: PieceDef = {
  type: 'diyas', label: 'Light the diyas', icon: '🪔', cat: 'festive', desc: 'A row of diyas; they tap each to light it',
  fields: [F.n('count', 'Diyas', 2, 9), F.s('lines', 'A line with each diya (optional)', 9), F.ta('after', 'When all are lit')],
  defaults: () => ({ count: 5, lines: ['Light', 'Love', 'Laughter', 'Luck', 'and us'], after: 'May your home always glow like this. Happy Diwali ✨' }),
  Render: ({ p }) => { const n = Math.max(2, Math.min(9, Number(p.count) || 5)); const s = useSequence(n); return (
    <div className={`pc-diyas ${s.all ? 'glow' : ''}`}><div className="row">{Array.from({ length: n }, (_, i) => <button key={i} className={`diya ${s.done.includes(i) ? 'lit' : ''}`} onClick={(e) => { if (s.hit(i)) { sfx('tap'); if (s.done.length + 1 === n) { sfx('win'); burst({ count: 80, emoji: ['✨', '🌟'] }); } } }}><i className="fl" /><span>🪔</span>{s.done.includes(i) && p.lines?.[i] && <small>{p.lines[i]}</small>}</button>)}</div>
      {s.all ? <div className="pc-reveal"><Para text={p.after} /></div> : <Hint>tap each diya to light it</Hint>}</div>); },
};

const Rangoli: PieceDef = {
  type: 'rangoli', label: 'Rangoli', icon: '🌸', cat: 'festive', desc: 'A rangoli that draws itself',
  fields: [F.t('text', 'Greeting'), F.c('c1', 'Colour 1'), F.c('c2', 'Colour 2'), F.c('c3', 'Colour 3')],
  defaults: () => ({ text: 'Shubh Deepavali', c1: '#e8436b', c2: '#f5a623', c3: '#3fb8af' }),
  Render: ({ p }) => { const [ref, seen] = useInView<HTMLDivElement>(0.3); const petals = (r: number, k: number, c: string, w: number) => Array.from({ length: k }, (_, i) => <ellipse key={r + '-' + i} cx="100" cy={100 - r} rx={w} ry={w * 2} fill={c} transform={`rotate(${(360 / k) * i} 100 100)`} />); return (
    <div ref={ref} className={`pc-rangoli ${seen ? 'draw' : ''}`}><svg viewBox="0 0 200 200"><g className="l1">{petals(70, 16, p.c1, 9)}</g><g className="l2">{petals(48, 12, p.c2, 9)}</g><g className="l3">{petals(26, 8, p.c3, 8)}</g><circle cx="100" cy="100" r="12" fill={p.c2} className="l4" /><circle cx="100" cy="100" r="88" fill="none" stroke={p.c3} strokeDasharray="2 6" strokeWidth="3" className="l4" /></svg><b>{p.text}</b></div>); },
};

const Rakhi: PieceDef = {
  type: 'rakhi', label: 'Tie the rakhi', icon: '🧵', cat: 'festive', desc: 'Braid the threads and tie the rakhi',
  fields: [F.t('title', 'Title'), F.e('charm', 'Charm emoji'), F.ta('after', 'After tying')],
  defaults: () => ({ title: 'Braid your rakhi, then tie it', charm: '🌼', after: 'Tied with love. Now where is my shagun? 😌' }),
  Render: ({ p }) => { const [k, setK] = useState(0); const steps = ['tap to braid the red thread', 'now the gold thread', 'add the charm', 'tie it on the wrist']; const done = k >= 4; return (
    <div className="pc-rakhi"><H>{p.title}</H><div className="wrist"><div className={`thread red ${k >= 1 ? 'on' : ''}`} /><div className={`thread gold ${k >= 2 ? 'on' : ''}`} /><div className={`charm ${k >= 3 ? 'on' : ''}`}>{p.charm || '🌼'}</div>{done && <div className="knot">🎀</div>}</div>
      {!done ? <Btn onClick={(e) => { setK(k + 1); sfx(k === 3 ? 'win' : 'tap'); if (k === 3) confetti(e.currentTarget, ['✨', '🌼', '💛']); }}>{steps[k]}</Btn> : <div className="pc-reveal"><Para text={p.after} /></div>}</div>); },
};

const Fireworks: PieceDef = {
  type: 'fireworks', label: 'Fireworks', icon: '🎆', cat: 'festive', desc: 'Tap the night sky to launch fireworks', bare: true,
  fields: [F.t('text', 'Text in the sky'), F.t('sub', 'Small line')],
  defaults: () => ({ text: 'Happy New Year!', sub: 'tap the sky ✨' }),
  Render: ({ p }) => {
    const cv = useRef<HTMLCanvasElement>(null); const parts = useRef<any[]>([]);
    useEffect(() => { let raf = 0; const c = cv.current!; const g = c.getContext('2d')!;
      const loop = () => { g.fillStyle = 'rgba(10,10,30,0.25)'; g.fillRect(0, 0, c.width, c.height); parts.current = parts.current.filter((q) => q.l > 0);
        for (const q of parts.current) { q.vy += 0.04; q.x += q.vx; q.y += q.vy; q.l--; g.fillStyle = q.c; g.globalAlpha = q.l / 80; g.beginPath(); g.arc(q.x, q.y, 2.2, 0, 7); g.fill(); g.globalAlpha = 1; }
        raf = requestAnimationFrame(loop); }; loop();
      const auto = setInterval(() => boom(Math.random() * c.width, 60 + Math.random() * c.height * 0.4), 1600);
      return () => { cancelAnimationFrame(raf); clearInterval(auto); }; }, []);
    const boom = (x: number, y: number) => { const col = ['#ff5d8f', '#ffd166', '#7cf3ff', '#b388ff', '#7dff9b'][Math.floor(Math.random() * 5)]; for (let i = 0; i < 70; i++) { const a = Math.random() * 7, v = 1 + Math.random() * 3.5; parts.current.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 60 + Math.random() * 30, c: col }); } };
    return <div className="pc-fireworks"><canvas ref={cv} width={600} height={500} onPointerDown={(e) => { const r = cv.current!.getBoundingClientRect(); boom((e.clientX - r.left) * (600 / r.width), (e.clientY - r.top) * (500 / r.height)); sfx('pop'); vibrate(10); }} /><div className="txt"><b>{p.text}</b><small>{p.sub}</small></div></div>;
  },
};

const Lanterns: PieceDef = {
  type: 'lanterns', label: 'Sky lanterns', icon: '🏮', cat: 'festive', desc: 'Release lanterns, each carrying a wish', bare: true,
  fields: [F.s('wishes', 'Wishes', 8), F.t('after', 'After all released')],
  defaults: () => ({ wishes: ['health', 'happiness', 'adventures', 'us, always'], after: 'All my wishes are up there, and all of them are for you.' }),
  Render: ({ p }) => { const w = p.wishes || []; const s = useSequence(w.length); return (
    <div className="pc-lanterns">{w.map((x: string, i: number) => <button key={i} className={`lan ${s.done.includes(i) ? 'up' : ''}`} style={{ left: 8 + (i * 84) / Math.max(1, w.length - 1 || 1) + '%' }} onClick={() => { if (s.hit(i)) sfx('tap'); }}>🏮<small>{x}</small></button>)}
      <div className="msg">{s.all ? p.after : 'tap a lantern to let it fly'}</div></div>); },
};

// ---------------- 3D & cards ----------------
const Popup: PieceDef = {
  type: 'popup', label: 'Pop-up card', icon: '💝', cat: 'cards', desc: 'A card that opens with a heart popping up', bare: true,
  fields: [F.t('front', 'Front of card'), F.ta('inside', 'Inside'), F.e('pop', 'Pop-up emoji')],
  defaults: () => ({ front: 'For you', inside: 'Some things are better said in a card. You are my favourite thing.', pop: '💖' }),
  Render: ({ p }) => { const [o, setO] = useState(false); return (
    <div className={`pc-popup ${o ? 'open' : ''}`} onClick={(e) => { if (!o) { setO(true); sfx('open'); hearts(e.currentTarget); } else setO(false); }}><div className="inside"><div className="pop">{p.pop || '💖'}</div><Para text={p.inside} /></div><div className="cover"><div className="f">{p.front}<small>tap to open</small></div><div className="b" /></div></div>); },
};

const Gatefold: PieceDef = {
  type: 'gatefold', label: 'Gatefold doors', icon: '🚪', cat: 'cards', desc: 'Two doors that swing open on your words', bare: true,
  fields: [F.t('label', 'On the doors'), F.ta('inside', 'Behind the doors'), F.ph('photo', 'Photo behind (optional)')],
  defaults: () => ({ label: 'Open me', inside: 'Behind every door, I would still choose you.', photo: '' }),
  Render: ({ p }) => { const [o, setO] = useState(false); return (
    <div className={`pc-gate ${o ? 'open' : ''}`} onClick={() => { setO(!o); sfx('open'); }}><div className="inside">{p.photo && <Img src={p.photo} />}<Para text={p.inside} /></div><div className="door l"><span>{p.label}</span></div><div className="door r"><span>♥</span></div></div>); },
};

const FlipBook: PieceDef = {
  type: 'flipbook', label: 'Flip book', icon: '📖', cat: 'cards', desc: 'A little book of your photos and lines', bare: true,
  fields: [F.t('cover', 'Cover title'), F.it('pages', 'Pages', [F.ph('photo', 'Photo'), F.t('text', 'Line')], 20), F.t('end', 'Last page')],
  defaults: () => ({ cover: 'Our little book', pages: [{ photo: DEMO(1).src, text: 'Chapter one: the first hello' }, { photo: DEMO(3).src, text: 'Chapter two: the first fight (you won)' }, { photo: DEMO(4).src, text: 'Chapter three: still writing it' }], end: 'The end ♡ (just kidding, to be continued)' }),
  Render: ({ p }) => {
    const pages = [{ cover: true }, ...(p.pages || []), { end: true }]; const [i, setI] = useState(0);
    return <div className="pc-book"><div className="bk">{pages.map((pg: any, k: number) => <div key={k} className={`pg ${k < i ? 'turned' : ''}`} style={{ zIndex: pages.length - k }} onClick={() => { sfx('page'); setI(k < i ? k : Math.min(pages.length - 1, k + 1)); }}>
      {pg.cover ? <div className="cv"><b>{p.cover}</b><small>tap to open</small></div> : pg.end ? <div className="cv end"><b>{p.end}</b></div> : <><Img src={pg.photo} /><div className="t">{pg.text}</div><small className="n">{k} / {pages.length - 2}</small></>}</div>)}</div>
      <Hint>{i === 0 ? 'tap the cover' : <a onClick={() => setI(0)}>back to cover</a>}</Hint></div>;
  },
};

const Cube: PieceDef = {
  type: 'cube', label: 'Photo cube', icon: '🧊', cat: 'cards', desc: 'A 3D cube of photos they spin with a finger', bare: true,
  fields: [F.phs('photos', 'Photos (6 faces)', 6), F.t('caption', 'Caption')],
  defaults: () => ({ photos: demoPhotos(4), caption: 'spin me ♡' }),
  Render: ({ p }) => {
    const ps = p.photos?.length ? p.photos : [{ src: '' }]; const [r, setR] = useState({ x: -20, y: 30 }); const d = useRef<any>(null);
    useEffect(() => { const t = setInterval(() => { if (!d.current) setR((v) => ({ ...v, y: v.y + 0.4 })); }, 30); return () => clearInterval(t); }, []);
    const faces = ['rotateY(0deg)', 'rotateY(90deg)', 'rotateY(180deg)', 'rotateY(-90deg)', 'rotateX(90deg)', 'rotateX(-90deg)'];
    return <div className="pc-cube" onPointerDown={(e) => { d.current = { x: e.clientX, y: e.clientY, r }; (e.target as any).setPointerCapture?.(e.pointerId); }} onPointerMove={(e) => { if (!d.current) return; setR({ x: d.current.r.x - (e.clientY - d.current.y) / 2, y: d.current.r.y + (e.clientX - d.current.x) / 2 }); }} onPointerUp={() => (d.current = null)}>
      <div className="scene"><div className="cb" style={{ transform: `rotateX(${r.x}deg) rotateY(${r.y}deg)` }}>{faces.map((f, i) => <div key={i} className="face" style={{ transform: `${f} translateZ(var(--half))` }}><Img src={ps[i % ps.length].src} /></div>)}</div></div><small>{p.caption}</small></div>;
  },
};

// ---------------- Decor ----------------
const BigSticker: PieceDef = {
  type: 'bigsticker', label: 'Big sticker', icon: '🦄', cat: 'decor', desc: 'One big animated sticker in the flow', bare: true,
  fields: [F.e('emoji', 'Sticker'), F.r('size', 'Size', 40, 220, 5), F.sel('anim', 'Animation', [['float', 'Float'], ['pulse', 'Heartbeat'], ['spin', 'Spin'], ['wiggle', 'Wiggle'], ['none', 'None']])],
  defaults: () => ({ emoji: '🧸', size: 110, anim: 'float' }),
  Render: ({ p }) => <div className="pc-bigsticker"><span className={`anim-${p.anim}`} style={{ fontSize: p.size || 110 }}>{p.emoji}</span></div>,
};
const Divider: PieceDef = {
  type: 'divider', label: 'Divider', icon: '〰️', cat: 'decor', desc: 'A cute line between things', bare: true,
  fields: [F.t('text', 'Divider symbols')],
  defaults: () => ({ text: '♡ ♥ ♡' }),
  Render: ({ p }) => <div className="pc-divider"><i /><span>{p.text}</span><i /></div>,
};
const Space: PieceDef = {
  type: 'space', label: 'Space', icon: '↕️', cat: 'decor', desc: 'Empty room between things', bare: true,
  fields: [F.r('h', 'Height', 10, 300, 10)],
  defaults: () => ({ h: 40 }),
  Render: ({ p }) => <div style={{ height: p.h || 40 }} />,
};
const NextBtn: PieceDef = {
  type: 'button', label: 'Next button', icon: '➡️', cat: 'decor', desc: 'A button to go to the next page', bare: true,
  fields: [F.t('label', 'Button text')],
  defaults: () => ({ label: 'Next →' }),
  Render: ({ p, ctx }) => <div style={{ textAlign: 'center' }}><Btn onClick={() => ctx.next?.()}>{p.label}</Btn></div>,
};
const EmojiRain: PieceDef = {
  type: 'emojirain', label: 'Emoji rain', icon: '💖', cat: 'decor', desc: 'Your favourite emoji falling softly', bare: true,
  fields: [F.t('emoji', 'Emoji (one or more)'), F.r('h', 'Height', 80, 400, 10), F.t('text', 'Text in the middle')],
  defaults: () => ({ emoji: '💖✨', h: 180, text: '' }),
  Render: ({ p }) => { const em = graphemes(String(p.emoji || '💖')); return <div className="pc-rain" style={{ height: p.h || 180 }}>{Array.from({ length: 18 }, (_, i) => <span key={i} style={{ left: (i * 53) % 100 + '%', animationDelay: `${(i * 0.37) % 4}s`, animationDuration: `${3 + (i % 4)}s` }}>{em[i % em.length]}</span>)}{p.text && <b>{p.text}</b>}</div>; },
};
const Drawing: PieceDef = {
  type: 'drawing', label: 'Drawing', icon: '🖍️', cat: 'decor', desc: 'Draw something with your finger', bare: true,
  fields: [F.dr('image', 'Your drawing'), F.t('caption', 'Caption')],
  defaults: () => ({ image: '', caption: 'I drew this for you' }),
  Render: ({ p }) => <div className="pc-drawing">{p.image ? <img src={p.image} alt="drawing" /> : <div className="empty">🖍️ draw something in the editor</div>}{p.caption && <div className="cap">{p.caption}</div>}</div>,
};

export const FESTIVE: PieceDef[] = [Diyas, Rangoli, Rakhi, Fireworks, Lanterns];
export const CARDS: PieceDef[] = [Popup, Gatefold, FlipBook, Cube];
export const DECOR: PieceDef[] = [BigSticker, Divider, Space, NextBtn, EmojiRain, Drawing];
