import React, { useEffect, useRef, useState } from 'react';
import { PieceDef, F, H, Hint, Para, Img, useInView, DEMO, demoPhotos } from './core';
import { sfx } from '../lib/audio';
import { hearts } from '../lib/fx';

const Photo: PieceDef = {
  type: 'photo', label: 'Photo', icon: '🖼️', cat: 'photos', desc: 'One photo in a cute frame', bare: true,
  fields: [F.ph('photo', 'Photo'), F.t('caption', 'Caption'), F.sel('frame', 'Frame', [['polaroid', 'Polaroid'], ['tape', 'Taped'], ['round', 'Round'], ['arch', 'Arch'], ['heart', 'Heart'], ['plain', 'Plain']])],
  defaults: () => ({ photo: DEMO(1).src, caption: 'us ♡', frame: 'polaroid' }),
  Render: ({ p }) => <div className={`pc-photo frame-${p.frame || 'polaroid'}`}><div className="fr"><Img src={p.photo} /></div>{p.caption && <div className="cap">{p.caption}</div>}</div>,
};

const Collage: PieceDef = {
  type: 'collage', label: 'Collage', icon: '🧩', cat: 'photos', desc: 'Up to 9 photos: grid, scatter or row',
  fields: [F.t('title', 'Title'), F.phs('photos', 'Photos', 9), F.sel('layout', 'Layout', [['grid', 'Grid'], ['scatter', 'Scatter'], ['row', 'Scrolling row']])],
  defaults: () => ({ title: '', photos: demoPhotos(4, ['this day ♡', 'and this one', 'you, being you', 'my favourite']), layout: 'scatter' }),
  Render: ({ p }) => {
    const [zoom, setZoom] = useState<string | null>(null);
    return (
      <div className={`pc-collage layout-${p.layout}`}><H>{p.title}</H>
        <div className="wrap">{(p.photos || []).map((ph: any, i: number) => <figure key={i} style={p.layout === 'scatter' ? { transform: `rotate(${((i * 47) % 16) - 8}deg)` } : undefined} onClick={() => setZoom(ph.src)}><Img src={ph.src} />{ph.caption && <figcaption>{ph.caption}</figcaption>}</figure>)}</div>
        {zoom && <div className="pc-lightbox" onClick={() => setZoom(null)}><img src={zoom} alt="" /></div>}
      </div>
    );
  },
};

const SwipeStack: PieceDef = {
  type: 'swipestack', label: 'Swipe stack', icon: '🃏', cat: 'photos', desc: 'Photos they swipe one by one', bare: true,
  fields: [F.phs('photos', 'Photos', 12), F.t('end', 'After the last photo')],
  defaults: () => ({ photos: demoPhotos(4, ['the first photo of us', 'that trip', 'chai dates', 'my favourite view']), end: 'That is all of them. For now ♡' }),
  Render: ({ p }) => {
    const ps = p.photos || []; const [i, setI] = useState(0); const [dx, setDx] = useState(0); const start = useRef<number | null>(null);
    const go = () => { sfx('page'); setI((v) => v + 1); setDx(0); };
    return (
      <div className="pc-stack">
        <div className="deck">
          {i >= ps.length ? <div className="end" onClick={() => setI(0)}>{p.end}<Hint>tap to see again</Hint></div> : ps.slice(i, i + 3).map((ph: any, k: number) => (
            <div key={i + k} className="card" style={{ zIndex: 10 - k, transform: k === 0 ? `translateX(${dx}px) rotate(${dx / 14}deg)` : `translateY(${k * 10}px) scale(${1 - k * 0.04}) rotate(${k % 2 ? 3 : -3}deg)`, transition: start.current != null && k === 0 ? 'none' : undefined }}
              onPointerDown={k === 0 ? (e) => { start.current = e.clientX; (e.target as any).setPointerCapture?.(e.pointerId); } : undefined}
              onPointerMove={k === 0 ? (e) => { if (start.current != null) setDx(e.clientX - start.current); } : undefined}
              onPointerUp={k === 0 ? () => { const d = dx; start.current = null; if (Math.abs(d) > 70 || Math.abs(d) < 4) go(); else setDx(0); } : undefined}>
              <Img src={ph.src} />{ph.caption && <div className="cap">{ph.caption}</div>}
            </div>))}
        </div>
        {i < ps.length && <Hint>swipe or tap · {i + 1} / {ps.length}</Hint>}
      </div>
    );
  },
};

const FlipCard: PieceDef = {
  type: 'flipcard', label: 'Flip card', icon: '🔄', cat: 'photos', desc: 'A photo that flips to a secret note', bare: true,
  fields: [F.ph('photo', 'Photo'), F.ta('note', 'Secret note on the back')],
  defaults: () => ({ photo: DEMO(1).src, note: 'This is my favourite photo of us. Look how happy we are.' }),
  Render: ({ p }) => { const [f, setF] = useState(false); return (
    <div className={`pc-flip pc-flipcard ${f ? 'flipped' : ''}`} onClick={() => { sfx('page'); setF(!f); }}>
      <div className="in"><div className="front"><Img src={p.photo} /></div><div className="back"><Para text={p.note} /></div></div><Hint>tap to flip</Hint></div>); },
};

const FilmRoll: PieceDef = {
  type: 'filmroll', label: 'Film roll', icon: '🎞️', cat: 'photos', desc: 'Photos on a strip of film', bare: true,
  fields: [F.phs('photos', 'Photos', 10), F.t('label', 'Label')],
  defaults: () => ({ photos: demoPhotos(4), label: 'KS 400 · our film' }),
  Render: ({ p }) => <div className="pc-film"><div className="strip">{[...(p.photos || []), ...(p.photos || [])].map((ph: any, i: number) => <div key={i} className="fr"><Img src={ph.src} /></div>)}</div><small>{p.label}</small></div>,
};

const PhotoStrip: PieceDef = {
  type: 'photostrip', label: 'Photo booth strip', icon: '📸', cat: 'photos', desc: 'A photobooth strip of four', bare: true,
  fields: [F.phs('photos', 'Photos', 4), F.t('label', 'Label')],
  defaults: () => ({ photos: demoPhotos(4), label: 'photobooth ♡' }),
  Render: ({ p }) => <div className="pc-strip">{(p.photos || []).slice(0, 4).map((ph: any, i: number) => <Img key={i} src={ph.src} />)}<div className="lab">{p.label}</div></div>,
};

const BeforeAfter: PieceDef = {
  type: 'beforeafter', label: 'Then & now', icon: '↔️', cat: 'photos', desc: 'Two photos, drag to see then and now', bare: true,
  fields: [F.ph('before', 'Then'), F.ph('after', 'Now'), F.t('l1', 'Left label'), F.t('l2', 'Right label')],
  defaults: () => ({ before: DEMO(2).src, after: DEMO(1).src, l1: 'Then', l2: 'Now' }),
  Render: ({ p }) => {
    const [x, setX] = useState(50); const ref = useRef<HTMLDivElement>(null); const drag = useRef(false);
    const mv = (e: React.PointerEvent) => { if (!drag.current) return; const r = ref.current!.getBoundingClientRect(); setX(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))); };
    return (
      <div ref={ref} className="pc-ba" onPointerDown={(e) => { drag.current = true; (e.target as any).setPointerCapture?.(e.pointerId); mv(e); }} onPointerMove={mv} onPointerUp={() => (drag.current = false)}>
        <Img src={p.after} /><div className="top" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}><Img src={p.before} /></div>
        <div className="bar" style={{ left: x + '%' }}><span>⟷</span></div><b className="l1">{p.l1}</b><b className="l2">{p.l2}</b>
      </div>
    );
  },
};

const Frame: PieceDef = {
  type: 'frame', label: 'Wall frame', icon: '🖼', cat: 'photos', desc: 'A photo in a pretty frame on the wall', bare: true,
  fields: [F.ph('photo', 'Photo'), F.t('caption', 'Little plaque'), F.sel('style', 'Frame', [['gold', 'Gold'], ['wood', 'Wood'], ['white', 'White'], ['black', 'Black']])],
  defaults: () => ({ photo: DEMO(1).src, caption: 'my favourite view', style: 'gold' }),
  Render: ({ p }) => <div className={`pc-wallframe ${p.style}`}><div className="nail" /><div className="fr"><Img src={p.photo} /></div>{p.caption && <div className="plaque">{p.caption}</div>}</div>,
};

const Hotspots: PieceDef = {
  type: 'hotspots', label: 'Photo hotspots', icon: '📍', cat: 'photos', desc: 'Tap little hearts on a photo for notes', bare: true,
  fields: [F.ph('photo', 'Photo'), F.it('spots', 'Hearts', [F.n('x', 'Across (%)', 0, 100), F.n('y', 'Down (%)', 0, 100), F.t('note', 'Note')], 8)],
  defaults: () => ({ photo: DEMO(1).src, spots: [{ x: 35, y: 45, note: 'that smile, every time' }, { x: 68, y: 40, note: 'me, hopelessly in love' }, { x: 50, y: 80, note: 'holding on to you' }] }),
  Render: ({ p }) => { const [o, setO] = useState<number | null>(null); return (
    <div className="pc-hot"><Img src={p.photo} />{(p.spots || []).map((s: any, i: number) => <button key={i} className={`spot ${o === i ? 'on' : ''}`} style={{ left: s.x + '%', top: s.y + '%' }} onClick={() => { sfx('pop'); setO(o === i ? null : i); }}>♥{o === i && <span className="tip">{s.note}</span>}</button>)}<Hint>tap the hearts</Hint></div>); },
};

const KenBurns: PieceDef = {
  type: 'kenburns', label: 'Moving photo', icon: '🎥', cat: 'photos', desc: 'A photo that slowly zooms like a film', bare: true,
  fields: [F.ph('photo', 'Photo'), F.t('caption', 'Caption over it')],
  defaults: () => ({ photo: DEMO(4).src, caption: 'some days I still cannot believe you are mine' }),
  Render: ({ p }) => <div className="pc-kb"><Img src={p.photo} /><div className="cap">{p.caption}</div></div>,
};

const HEART = [[0, 1, 1, 0, 1, 1, 0], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0]];
const HeartMosaic: PieceDef = {
  type: 'heartmosaic', label: 'Heart mosaic', icon: '💟', cat: 'photos', desc: 'Your photos arranged into a heart', bare: true,
  fields: [F.phs('photos', 'Photos', 24), F.t('caption', 'Caption')],
  defaults: () => ({ photos: demoPhotos(4), caption: 'all my favourite moments' }),
  Render: ({ p }) => { const ps = p.photos?.length ? p.photos : [{ src: '' }]; let k = 0; const [ref, seen] = useInView<HTMLDivElement>(0.3); return (
    <div ref={ref} className="pc-mosaic"><div className="g">{HEART.flat().map((on, i) => on ? <Img key={i} src={ps[k++ % ps.length].src} className={seen ? 'in' : ''} style={{ animationDelay: `${i * 0.04}s` }} /> : <span key={i} />)}</div><div className="cap">{p.caption}</div></div>); },
};

const Stories: PieceDef = {
  type: 'stories', label: 'Story viewer', icon: '⭕', cat: 'photos', desc: 'Tap-through photo stories, like Insta', bare: true,
  fields: [F.phs('photos', 'Story photos (caption = text on it)', 12), F.t('author', 'Posted by')],
  defaults: () => ({ photos: demoPhotos(3, ['this day ♡', 'and this one', 'you, being you']), author: '{sender}' }),
  Render: ({ p, ctx }) => {
    const ps = p.photos || []; const [i, setI] = useState(0); const [liked, setLiked] = useState(false);
    useEffect(() => { if (ctx.editing) return; const t = setTimeout(() => setI((v) => (v + 1) % Math.max(1, ps.length)), 4500); return () => clearTimeout(t); }, [i, ps.length, ctx.editing]);
    const ph = ps[i] || {};
    return (
      <div className="pc-stories" onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); sfx('page'); setI((v) => (e.clientX - r.left < r.width / 3 ? Math.max(0, v - 1) : (v + 1) % ps.length)); }}>
        <Img src={ph.src} key={i} />
        <div className="bars">{ps.map((_: any, k: number) => <i key={k}><b className={k < i ? 'full' : k === i ? 'run' : ''} key={k === i ? 'r' + i : k} /></i>)}</div>
        <div className="who"><span className="av">♥</span>{p.author}</div>
        {ph.caption && <div className="txt">{ph.caption}</div>}
        <button className={`like ${liked ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); setLiked(!liked); if (!liked) hearts(e.currentTarget); }}>♥</button>
      </div>
    );
  },
};

const PolaroidWall: PieceDef = {
  type: 'polaroidwall', label: 'Polaroid table', icon: '🗂️', cat: 'photos', desc: 'Polaroids scattered on a table — drag them around', bare: true,
  fields: [F.phs('photos', 'Photos', 8)],
  defaults: () => ({ photos: demoPhotos(4, ['first date', 'goa!!', 'chai', 'sunset girl']) }),
  Render: ({ p }) => {
    const ps = p.photos || [];
    const [pos, setPos] = useState(() => ps.map((_: any, i: number) => ({ x: 8 + ((i * 29) % 52), y: 6 + ((i * 41) % 46), r: ((i * 53) % 30) - 15, z: i })));
    const drag = useRef<{ i: number; sx: number; sy: number; ox: number; oy: number } | null>(null); const box = useRef<HTMLDivElement>(null); const z = useRef(100);
    useEffect(() => { setPos(ps.map((_: any, i: number) => pos[i] || { x: 20, y: 20, r: 0, z: i })); }, [ps.length]);
    return (
      <div ref={box} className="pc-table" onPointerMove={(e) => { const d = drag.current; if (!d) return; const r = box.current!.getBoundingClientRect(); setPos((P: any) => P.map((q: any, k: number) => k === d.i ? { ...q, x: d.ox + ((e.clientX - d.sx) / r.width) * 100, y: d.oy + ((e.clientY - d.sy) / r.height) * 100 } : q)); }} onPointerUp={() => (drag.current = null)}>
        {ps.map((ph: any, i: number) => { const q = pos[i] || { x: 10, y: 10, r: 0, z: 0 }; return (
          <div key={i} className="pol" style={{ left: q.x + '%', top: q.y + '%', transform: `rotate(${q.r}deg)`, zIndex: q.z }}
            onPointerDown={(e) => { (e.currentTarget as any).setPointerCapture?.(e.pointerId); drag.current = { i, sx: e.clientX, sy: e.clientY, ox: q.x, oy: q.y }; z.current++; setPos((P: any) => P.map((w: any, k: number) => k === i ? { ...w, z: z.current } : w)); }}>
            <Img src={ph.src} /><span>{ph.caption}</span></div>); })}
        <Hint>drag the polaroids</Hint>
      </div>
    );
  },
};

export const PHOTOS: PieceDef[] = [Photo, Collage, SwipeStack, FlipCard, FilmRoll, PhotoStrip, BeforeAfter, Frame, Hotspots, KenBurns, HeartMosaic, Stories, PolaroidWall];
