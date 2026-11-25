import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PieceDef, F, Img, Para, useInView } from './core';
import { sfx, isPlaying, isPaused, pauseMusic, resumeMusic, playMusic } from '../lib/audio';

/* "Birthday Cinema": the premium long-scroll birthday website.
   Each section is its own piece, so people can reorder, remove or reuse any of them. */

export const PD = (n: number) => `/demo/photo-${n}.webp`;
export const PP = (ns: number[], caps: string[] = []) => ns.map((n, i) => ({ src: PD(n), caption: caps[i] || '' }));
const srcOf = (x: any): string => (typeof x === 'string' ? x : x?.src || '');
const toInt = (v: any, d: number) => { const n = parseInt(String(v ?? '').replace(/[^\d-]/g, ''), 10); return Number.isFinite(n) ? n : d; };
const list = <T,>(v: any): T[] => (Array.isArray(v) ? v : []);
const rid = () => 'pm' + Math.random().toString(36).slice(2, 9);
/** fill `n` slots by repeating whatever photos were given */
const fillTo = (ps: any[], n: number) => (ps.length ? Array.from({ length: n }, (_, i) => ps[i % ps.length]) : []);

function Sparks({ n = 46, colors = ['#ff3b3b', '#ff8a1f', '#ffd166', '#ff5e7a'] }: { n?: number; colors?: string[] }) {
  const sp = useMemo(() => Array.from({ length: n }, (_, i) => ({ a: (i / n) * 360 + Math.random() * 12, d: 90 + Math.random() * 220, s: 3 + Math.random() * 6, c: colors[i % colors.length], t: Math.random() * 0.25 })), [n]);
  return <div className="pm-sparks" aria-hidden>{sp.map((x, i) => <i key={i} style={{ '--a': x.a + 'deg', '--d': x.d + 'px', width: x.s, height: x.s, background: x.c, animationDelay: x.t + 's', boxShadow: `0 0 10px ${x.c}` } as any} />)}</div>;
}

function useWidth<T extends HTMLElement>(): [React.RefObject<T>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const m = () => setW(el.clientWidth || (typeof innerWidth === 'number' ? innerWidth : 400));
    m();
    if (typeof ResizeObserver === 'undefined') { addEventListener('resize', m); return () => removeEventListener('resize', m); }
    const ro = new ResizeObserver(m); ro.observe(el); return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/* ------------------------------------------------------------------ 1. counting the years */
const Count: PieceDef = {
  type: 'pm-count', label: 'Counting the years', icon: '🔢', cat: 'premium', bare: true,
  desc: 'A full-screen number that flips through the years and lands on their age, then sparks',
  fields: [F.t('age', 'Land on', '{age}'), F.n('from', 'Start counting from', 0, 200), F.t('caption', 'Caption'), F.t('done', 'Line when it lands')],
  defaults: () => ({ age: '{age}', from: 33, caption: 'COUNTING THE YEARS', done: 'years of you ✨' }),
  Render: ({ p }) => {
    const target = toInt(p.age, 23);
    const from = p.from === '' || p.from == null ? target + 10 : toInt(p.from, target + 10);
    const [ref, seen] = useInView<HTMLDivElement>(0.45);
    const [v, setV] = useState(from);
    const [run, setRun] = useState(0);
    const done = v === target;
    useEffect(() => {
      if (!seen) return;
      setV(from);
      const steps = Math.abs(target - from); if (!steps) return;
      const dir = target > from ? 1 : -1; let k = 0; let tm: any;
      const tick = () => { k++; setV(from + dir * k); if (k < steps) tm = setTimeout(tick, 110 + 620 * Math.pow(k / steps, 3)); else sfx('win'); };
      tm = setTimeout(tick, 1300);
      return () => clearTimeout(tm);
    }, [seen, run, from, target]);
    return (
      <div className="pm pm-count" ref={ref} onClick={() => done && setRun((r) => r + 1)}>
        <div className="pm-count-num"><span key={v}>{v}</span></div>
        <div className="pm-count-cap">{done && p.done ? p.done : p.caption}</div>
        {done && <Sparks key={run} />}
      </div>
    );
  },
};

/* ------------------------------------------------------------------ 2. balloons hero + music pill */
const BALLOON_COLORS = ['#e8283c', '#f6c443', '#ff7aa8', '#fff4e6', '#e8283c', '#ffb02e', '#d61f4f', '#f8d7e3', '#ffcf5a'];
function Balloon({ c }: { c: string }) {
  const id = useMemo(rid, []);
  return (
    <svg viewBox="0 0 60 120" className="pm-balloon-svg">
      <defs><radialGradient id={id} cx="35%" cy="30%" r="70%"><stop offset="0" stopColor="#fff" stopOpacity=".95" /><stop offset=".18" stopColor={c} stopOpacity=".95" /><stop offset="1" stopColor={c} /></radialGradient></defs>
      <path d="M30 76 C 30 90, 22 98, 32 108 S 28 118, 30 120" stroke="rgba(255,255,255,.7)" strokeWidth="1" fill="none" />
      <ellipse cx="30" cy="36" rx="25" ry="31" fill={`url(#${id})`} />
      <path d="M26 66 L34 66 L30 72 Z" fill={c} />
      <ellipse cx="21" cy="22" rx="5" ry="9" fill="#fff" opacity=".45" transform="rotate(20 21 22)" />
    </svg>
  );
}

export function MusicPill({ title, sub, cover, song, className = '' }: { title: string; sub: string; cover?: string; song?: string; className?: string }) {
  const [on, setOn] = useState(isPlaying());
  useEffect(() => { const t = setInterval(() => setOn(isPlaying()), 700); return () => clearInterval(t); }, []);
  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying()) { pauseMusic(); setOn(false); }
    else { if (song) playMusic('custom', song); else resumeMusic('birthday'); setOn(true); }
  };
  return (
    <div className={`pm-pill ${on ? 'on' : ''} ${className}`} onClick={toggle} role="button" aria-label={on ? 'Pause music' : 'Play music'}>
      <div className="cv"><Img src={cover} /></div>
      <div className="tx"><b>{title}</b><small>{sub}</small><div className="bar"><i /></div></div>
      <button className="pl" tabIndex={-1}>{on ? <svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg> : <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}</button>
    </div>
  );
}

const Hero: PieceDef = {
  type: 'pm-hero', label: 'Balloons hero', icon: '🎈', cat: 'premium', bare: true,
  desc: 'Their photo, softly blurred, a giant age, glossy balloons floating up and a music player',
  fields: [F.au('audio', '🎵 Your own song (upload an audio file, it plays for the whole page)'), F.ph('photo', 'Background photo'), F.t('big', 'Big number', '{age}'), F.t('w1', 'First word'), F.t('w2', 'Second word'), F.e('emoji', 'Emoji'), F.r('blur', 'Background blur', 0, 20),
    F.t('song', 'Song name'), F.t('songSub', 'Under the song name'), F.ph('cover', 'Song cover')],
  defaults: () => ({ photo: PD(6), big: '{age}', w1: 'Happy', w2: 'Birthday', emoji: '🎂', blur: 7, song: 'Lovely Song', songSub: 'BIRTHDAY PLAYLIST', cover: PD(11), audio: '' }),
  Render: ({ p, ctx }) => {
    const [ref, seen] = useInView<HTMLDivElement>(0.3);
    // their own song replaces the template track as soon as the gift opens
    useEffect(() => { if (p.audio && !ctx.editing && !isPaused()) playMusic('custom', p.audio); }, [p.audio, ctx.editing]);
    const letters = (w: string, base: number) => Array.from(w || '').map((ch, i) => <span key={i} style={{ animationDelay: `${(base + i) * 0.09}s`, '--r': `${((i * 37 + base * 11) % 24) - 12}deg`, '--y': `${((i * 53 + base * 7) % 30) - 15}px` } as any}>{ch === ' ' ? '\u00a0' : ch}</span>);
    return (
      <div className={`pm pm-hero ${seen ? 'in' : ''}`} ref={ref}>
        <div className="bg"><Img src={p.photo} style={{ filter: `blur(${toInt(p.blur, 7)}px) brightness(.72) saturate(1.1)` }} /></div>
        <div className="balloons" aria-hidden>{BALLOON_COLORS.map((c, i) => <div key={i} className="bl" style={{ left: `${4 + ((i * 41) % 92)}%`, animationDelay: `${-(i * 1.7) % 11}s`, animationDuration: `${9 + (i % 4) * 2.2}s`, width: `${54 + (i % 3) * 18}px` }}><Balloon c={c} /></div>)}</div>
        <div className="words">
          <div className="w1">{letters(p.w1, 0)}</div>
          <div className="big"><span>{p.big}</span></div>
          <div className="w2">{letters(p.w2, 6)}<em>{p.emoji}</em></div>
        </div>
        <MusicPill title={p.song} sub={p.songSub} cover={p.cover} song={p.audio} />
      </div>
    );
  },
};

/* ------------------------------------------------------------------ 3. name + winding photo ribbon */
const RIBBON = 'M 430 -60 C 330 40, 110 40, 120 170 C 128 270, 290 290, 292 205 C 294 120, 150 130, 160 250 C 172 380, 330 420, 470 560';
const Ribbon: PieceDef = {
  type: 'pm-ribbon', label: 'Name + photo ribbon', icon: '🎞️', cat: 'premium', bare: true,
  desc: 'Happy / Birthday / their name in big type, with a ribbon of photos winding past in a loop',
  fields: [F.t('l1', 'Line 1'), F.t('l2', 'Line 2'), F.t('l3', 'Line 3 (in colour)'), F.ta('text', 'Paragraph'), F.phs('photos', 'Ribbon photos', 14), F.b('mono', 'Black & white ribbon'), F.r('speed', 'Ribbon speed (seconds per lap)', 8, 60)],
  defaults: () => ({ l1: 'Happy', l2: 'Birthday', l3: '{name}', text: 'Today is all about you — the girl who makes ordinary days feel like a celebration. Here is a little website, made with a lot of love, to remind you how special you are.', photos: PP([1, 5, 7, 8, 9, 10, 11, 12, 2, 3]), mono: true, speed: 26 }),
  Render: ({ p }) => {
    const ps = fillTo(list<any>(p.photos), 14);
    const dur = toInt(p.speed, 26);
    const [ref, seen] = useInView<HTMLDivElement>(0.25);
    return (
      <div className={`pm pm-ribbon ${seen ? 'in' : ''}`} ref={ref}>
        <div className="txt">
          <div className="l1">{p.l1}</div>
          <div className="l2">{p.l2}</div>
          <div className="l3">{p.l3}</div>
          <Para text={p.text} className="pm-p" />
        </div>
        <div className="rib" aria-hidden>
          <div className={`pm-track ${p.mono ? 'mono' : ''}`}>
            {ps.map((ph, i) => <div key={i} className="sq" style={{ offsetPath: `path('${RIBBON}')`, animationDuration: dur + 's', animationDelay: `${-(i * dur) / ps.length}s` } as any}><Img src={srcOf(ph)} /></div>)}
          </div>
        </div>
      </div>
    );
  },
};

/* ------------------------------------------------------------------ 4. polaroid board */
const Board: PieceDef = {
  type: 'pm-board', label: 'Polaroid board', icon: '📌', cat: 'premium', bare: true,
  desc: 'Pinned polaroids with handwritten captions that drop onto a board',
  fields: [F.t('title', 'Title (optional)'), F.phs('photos', 'Polaroids (add a caption to each)', 12)],
  defaults: () => ({ title: '', photos: PP([11, 5, 8, 9, 7, 10, 1, 12], ['Cutie 😍', 'My Love', 'Beautiful 💗', 'Dream Girl', 'Always You 🫶', 'Queen 👑', 'Teddu 🧸', 'Forever ♡']) }),
  Render: ({ p }) => {
    const [ref, seen] = useInView<HTMLDivElement>(0.15);
    const [zoom, setZoom] = useState<any>(null);
    return (
      <div className={`pm pm-board ${seen ? 'in' : ''}`} ref={ref}>
        {p.title && <h2 className="pm-title">{p.title}</h2>}
        <div className="panel">
          {list<any>(p.photos).map((ph, i) => (
            <figure key={i} className="pol" style={{ '--r': `${[-6, 4, -3, 7, -5, 3, -7, 5][i % 8]}deg`, transitionDelay: `${i * 0.12}s` } as any} onClick={() => { sfx('pop'); setZoom(ph); }}>
              <span className="pin" />{i % 3 === 1 && <span className="tape" />}
              <Img src={srcOf(ph)} />
              <figcaption>{ph.caption}</figcaption>
            </figure>
          ))}
        </div>
        {zoom && <div className="pc-lightbox pm-lb" onClick={() => setZoom(null)}><figure className="pol big"><Img src={srcOf(zoom)} /><figcaption>{zoom.caption}</figcaption></figure></div>}
      </div>
    );
  },
};

/* ------------------------------------------------------------------ 5. Vogue cover + flip magazine */
function Barcode({ seed = 'birthday' }: { seed?: string }) {
  const bars = useMemo(() => { let h = 7; const out: number[] = []; for (let i = 0; i < 34; i++) { h = (h * 31 + seed.charCodeAt(i % seed.length)) % 997; out.push(1 + (h % 3)); } return out; }, [seed]);
  let x = 0;
  return <svg className="pm-barcode" viewBox="0 0 100 40" preserveAspectRatio="none">{bars.map((w, i) => { const r = <rect key={i} x={x} y="0" width={w} height="34" fill={i % 2 ? 'transparent' : '#111'} />; x += w + 0.6; return r; })}<text x="50" y="40" fontSize="6" textAnchor="middle" fill="#111">0 74470 2026 9</text></svg>;
}

function Cover({ p }: { p: any }) {
  return (
    <div className="mg-cover">
      <Img src={p.cover} />
      <div className="mast">{p.mast}</div>
      <div className="kick"><small>{p.kicker}</small>{list<string>(p.lines).map((l, i) => <b key={i}>{l}</b>)}</div>
      <div className="nm">{p.coverName}</div>
      <div className="edn">{p.edition}</div>
      <Barcode seed={String(p.coverName || 'x')} />
    </div>
  );
}

const Mag: PieceDef = {
  type: 'pm-mag', label: 'Vogue magazine', icon: '📰', cat: 'premium', bare: true,
  desc: 'A fashion-magazine cover of them that opens into a flip magazine: contents, who\'s that girl, things I love, memories',
  fields: [
    F.t('mast', 'Magazine name'), F.ph('cover', 'Cover photo'), F.t('coverName', 'Cover name'), F.t('kicker', 'Small cover line'), F.s('lines', 'Cover headlines', 4), F.t('edition', 'Edition line'),
    F.phs('gallery', 'Page 2: photo grid', 7), F.s('contents', 'Table of contents', 8),
    F.t('whoTitle', 'Feature title'), F.t('whoScript', 'Feature script line'), F.ta('whoText', 'Feature story'), F.phs('whoPhotos', 'Feature photos', 3),
    F.ph('portrait', 'Portrait photo'), F.it('facts', 'Facts about them', [F.t('k', 'Label'), F.t('v', 'Answer')], 8),
    F.t('lovesTitle', 'Love list title'), F.it('loves', 'Things I love about you', [F.ph('photo', 'Thumbnail'), F.t('text', 'Line')], 6),
    F.t('memTitle', 'Memories title'), F.phs('memories', 'Favourite memories (with captions)', 4),
    F.ta('letter', 'Letter page'), F.t('back', 'Back cover line'),
  ],
  defaults: () => ({
    mast: 'VOGUE', cover: PD(11), coverName: '{name}', kicker: 'IS A …', lines: ['UNSTOPPABLE', 'THE RISE OF {name}'], edition: '{age} BIRTHDAY EDITION',
    gallery: PP([5, 7, 8, 9, 10, 12, 1]),
    contents: ['The archive', "Who's that girl?", 'In her own light', 'Things I love about you', 'Favourite memories', 'A letter, just for you'],
    whoTitle: "WHO'S", whoScript: 'that girl?', whoText: 'Equal parts sunshine and chaos. She laughs at her own jokes before the punchline, collects flowers from every walk, and somehow makes every room softer just by walking in.', whoPhotos: PP([12, 9, 5]),
    portrait: PD(5), facts: [{ k: 'Name', v: '{name}' }, { k: 'Born to', v: 'make everyone smile' }, { k: 'Favourite thing', v: 'flowers & long drives' }, { k: 'Superpower', v: 'that laugh' }, { k: 'Weakness', v: 'chocolate, always' }, { k: 'Age', v: '{age} & glowing' }],
    lovesTitle: 'Things I love about you', loves: [{ photo: PD(7), text: 'The way you laugh with your whole face' }, { photo: PD(8), text: 'How you care about everyone' }, { photo: PD(9), text: 'Your terrible, perfect jokes' }, { photo: PD(10), text: 'How calm I feel with you' }, { photo: PD(1), text: 'That you are simply you' }],
    memTitle: 'FAVOURITE Memories', memories: PP([5, 12, 9, 6], ['that flower walk', 'lazy lake day', 'city lights', 'our sunset']),
    letter: 'Happy birthday, {name}.\n\nThis little magazine is only a few pages, but you are my whole collection. Thank you for every laugh, every late night call and every ordinary day you made special.\n\nHere is to your best year yet.\n— {sender}',
    back: 'to be continued… ♡',
  }),
  Render: ({ p }) => {
    const [wrap, w] = useWidth<HTMLDivElement>();
    const [ref, seen] = useInView<HTMLDivElement>(0.2);
    const wide = w >= 720;
    const pw = Math.max(220, Math.min(wide ? 390 : 400, wide ? (w - 40) / 2 : w - 32));
    const ph = Math.round(pw * 1.36);
    const gal = list<any>(p.gallery), who = list<any>(p.whoPhotos), mem = list<any>(p.memories);
    const pages: React.ReactNode[] = [
      <Cover p={p} />,
      <div className="mg-grid"><div className="hd"><small>the archive</small><b>{p.mast}</b></div><div className="g">{gal.slice(0, 7).map((x, i) => <Img key={i} src={srcOf(x)} />)}</div></div>,
      <div className="mg-toc"><div className="v">TABLE OF CONTENTS</div><ol>{list<string>(p.contents).map((c, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span>{c}</li>)}</ol><small className="ft">{p.edition}</small></div>,
      <div className="mg-who"><h3>{p.whoTitle}<em>{p.whoScript}</em></h3><Para text={p.whoText} className="mg-p" /><div className="posts">{who.slice(0, 3).map((x, i) => <div key={i} className="post"><div className="u"><i />{p.coverName}</div><Img src={srcOf(x)} /><div className="lk">♡ 2,{(i + 3) * 137} likes</div></div>)}</div></div>,
      <div className="mg-portrait"><Img src={p.portrait} /><div className="cap">In her own light</div></div>,
      <div className="mg-facts"><small>the profile</small><h3>{p.coverName}</h3><dl>{list<any>(p.facts).map((f, i) => <React.Fragment key={i}><dt>{f.k}</dt><dd>{f.v}</dd></React.Fragment>)}</dl></div>,
      <div className="mg-loves"><h3>{p.lovesTitle}</h3>{list<any>(p.loves).map((x, i) => <div key={i} className="lv"><Img src={srcOf(x.photo)} /><span><small>0{i + 1}</small>{x.text}</span></div>)}</div>,
      <div className="mg-mem"><h3>{String(p.memTitle || '').split(' ')[0]}<em>{String(p.memTitle || '').split(' ').slice(1).join(' ')}</em></h3><div className="m">{mem.slice(0, 4).map((x, i) => <figure key={i}><Img src={srcOf(x)} /><figcaption>{x.caption}</figcaption></figure>)}</div></div>,
      <div className="mg-letter"><small>a letter</small><Para text={p.letter} className="mg-p" /></div>,
      <div className="mg-back"><div className="mast">{p.mast}</div><p>{p.back}</p><Barcode seed={String(p.mast)} /></div>,
    ];
    const leaves = wide ? Array.from({ length: Math.ceil(pages.length / 2) }, (_, k) => [pages[2 * k], pages[2 * k + 1]]) : pages.map((x) => [x, null]);
    const N = leaves.length;
    const [cur, setCur] = useState(0); // number of leaves turned
    const [turning, setTurning] = useState(-1);
    useEffect(() => { setCur((c) => Math.min(c, N)); }, [N]);
    const go = (d: number) => {
      const n = Math.max(0, Math.min(N, cur + d)); if (n === cur) return;
      sfx('page'); setTurning(d > 0 ? cur : cur - 1); setCur(n);
      setTimeout(() => setTurning(-1), 900);
    };
    const sx = useRef<number | null>(null);
    const shift = wide ? (cur === 0 ? -pw / 2 : cur === N ? pw / 2 : 0) : 0;
    const total = wide ? N + 1 : N;
    const shown = wide ? cur + 1 : Math.min(cur + 1, N);
    return (
      <div className={`pm pm-mag ${seen ? 'in' : ''}`} ref={ref}>
        <div className="wrap" ref={wrap}>
          <div className={`book ${wide ? 'wide' : 'single'}`} style={{ width: wide ? pw * 2 : pw, height: ph, transform: `translateX(${shift}px)` }}
            onPointerDown={(e) => { sx.current = e.clientX; }}
            onPointerUp={(e) => { if (sx.current == null) return; const dx = e.clientX - sx.current; sx.current = null; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); else { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); go(wide ? (e.clientX > r.left + r.width / 2 ? 1 : -1) : (e.clientX > r.left + r.width * 0.35 ? 1 : -1)); } }}>
            {leaves.map(([front, back], k) => {
              const flipped = k < cur;
              const z = turning === k ? 100 : flipped ? k + 1 : N - k + 1;
              return (
                <div key={k} className={`leaf ${flipped ? 'flipped' : ''}`} style={{ width: pw, height: ph, left: wide ? pw : 0, zIndex: z }}>
                  <div className="face front">{front}<span className="pg">{wide ? 2 * k + 1 : k + 1}</span></div>
                  <div className="face back">{back}{back && <span className="pg">{2 * k + 2}</span>}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="ctl"><button onClick={() => go(-1)} disabled={cur === 0}>PREV</button><span>{shown} / {total}</span><button onClick={() => go(1)} disabled={cur >= (wide ? N : N - 1)}>NEXT</button></div>
      </div>
    );
  },
};

/* ------------------------------------------------------------------ 6. full-bleed photo + masonry */
const Bleed: PieceDef = {
  type: 'pm-bleed', label: 'Full-screen photo', icon: '🌅', cat: 'premium', bare: true,
  desc: 'One photo edge to edge with a slow cinematic zoom',
  fields: [F.ph('photo', 'Photo'), F.t('caption', 'Line over the photo (optional)')],
  defaults: () => ({ photo: PD(5), caption: '' }),
  Render: ({ p }) => {
    const [ref, seen] = useInView<HTMLDivElement>(0.25);
    return <div className={`pm pm-bleed ${seen ? 'in' : ''}`} ref={ref}><div className="frame"><Img src={p.photo} />{p.caption && <div className="cap">{p.caption}</div>}</div></div>;
  },
};

const Masonry: PieceDef = {
  type: 'pm-masonry', label: 'Masonry collage', icon: '🧱', cat: 'premium', bare: true,
  desc: 'A dark, tight photo wall that fades in tile by tile',
  fields: [F.t('title', 'Title (optional)'), F.phs('photos', 'Photos', 12)],
  defaults: () => ({ title: '', photos: PP([7, 6, 9, 11, 12, 8, 10, 1, 5]) }),
  Render: ({ p }) => {
    const [ref, seen] = useInView<HTMLDivElement>(0.12);
    const [zoom, setZoom] = useState<string | null>(null);
    return (
      <div className={`pm pm-masonry ${seen ? 'in' : ''}`} ref={ref}>
        {p.title && <h2 className="pm-title">{p.title}</h2>}
        <div className="cols">{list<any>(p.photos).map((ph, i) => <figure key={i} style={{ '--d': `${i * 0.09}s` } as any} onClick={() => setZoom(srcOf(ph))}><Img src={srcOf(ph)} /></figure>)}</div>
        {zoom && <div className="pc-lightbox" onClick={() => setZoom(null)}><img src={zoom} alt="" /></div>}
      </div>
    );
  },
};

/* ------------------------------------------------------------------ 7. wishes with brush-reveal photo */
const Wish: PieceDef = {
  type: 'pm-wish', label: 'Wishes + brush reveal', icon: '🖌️', cat: 'premium', bare: true,
  desc: 'Big serif "Happy Birthday" and a photo that paints itself in with brush strokes, with a message on the back',
  fields: [F.t('script', 'Gold script line'), F.t('title', 'Big title'), F.ta('line', 'Wish'), F.ph('photo', 'Photo'), F.ta('back', 'Message on the back'), F.t('btn', 'Button')],
  defaults: () => ({ script: '♥ Wishing you the best day ♥', title: 'Happy Birthday', line: 'To the most beautiful soul, may your year ahead shine as brightly as your smile.', photo: PD(8), back: 'You are my favourite person to celebrate.\nHappy birthday, {name} ♡', btn: 'Show back' }),
  Render: ({ p }) => {
    const [ref, seen] = useInView<HTMLDivElement>(0.3);
    const [flip, setFlip] = useState(false);
    const id = useMemo(rid, []);
    return (
      <div className={`pm pm-wish ${seen ? 'in' : ''}`} ref={ref}>
        <div className="script">{p.script}</div>
        <h2>{p.title}</h2>
        <p className="line">{p.line}</p>
        <div className={`card ${flip ? 'flip' : ''}`}>
          <div className="in">
            <div className="front">
              <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <filter id={id + 'f'}><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4" /><feDisplacementMap in="SourceGraphic" scale="34" /></filter>
                  <mask id={id + 'm'}><g filter={`url(#${id}f)`} fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="92">
                    <path className="br b1" pathLength={1} d="M 20 60 C 120 30, 260 40, 380 70" />
                    <path className="br b2" pathLength={1} d="M 380 130 C 280 110, 130 120, 20 150" />
                    <path className="br b3" pathLength={1} d="M 20 220 C 140 200, 270 200, 380 230" />
                    <path className="br b4" pathLength={1} d="M 370 290 C 260 270, 130 280, 30 300" />
                  </g></mask>
                </defs>
                <image href={p.photo} x="0" y="0" width="400" height="300" preserveAspectRatio="xMidYMid slice" mask={`url(#${id}m)`} />
              </svg>
            </div>
            <div className="back"><Para text={p.back} className="pm-hand" /></div>
          </div>
        </div>
        <button className="pm-showback" onClick={() => { sfx('tap'); setFlip((f) => !f); }}>↻ {flip ? 'Show front' : p.btn}</button>
      </div>
    );
  },
};

/* ------------------------------------------------------------------ 8. swinging lanyard ID badge */
function Mandala() {
  const petals = (n: number, r: number, len: number, w: number) => Array.from({ length: n }, (_, i) => <ellipse key={`${n}-${i}`} cx="0" cy={-r} rx={w} ry={len} transform={`rotate(${(i * 360) / n})`} />);
  return (
    <svg className="pm-mandala" viewBox="-100 -100 200 200" fill="none" stroke="#c9a24b" strokeWidth="1.1">
      <circle r="96" /><circle r="88" strokeDasharray="2 4" />{petals(24, 72, 14, 6)}<circle r="56" />{petals(16, 42, 12, 7)}<circle r="28" />{petals(8, 16, 9, 5)}<circle r="5" fill="#c9a24b" />
    </svg>
  );
}

const Badge: PieceDef = {
  type: 'pm-badge', label: 'Lanyard ID badge', icon: '🪪', cat: 'premium', bare: true,
  desc: 'A lanyard drops in with a swinging birthday ID badge. Drag it to swing, tap to flip to the photo',
  fields: [F.t('top', 'Small gold line'), F.t('name', 'Name on the badge'), F.t('sub', 'Under the name'), F.t('strap', 'Printed on the strap'), F.ph('photo', 'Photo on the back'), F.t('backLine', 'Line on the back'), F.t('btn', 'Button')],
  defaults: () => ({ top: 'HAPPY BIRTHDAY', name: '{name}', sub: 'ALL ACCESS · AGE {age}', strap: 'HAPPY BIRTHDAY {name} ✦ ', photo: PD(11), backLine: 'certified cutie ♡', btn: 'Show back' }),
  Render: ({ p }) => {
    const [ref, seen] = useInView<HTMLDivElement>(0.35);
    const [ang, setAng] = useState(0);
    const [flip, setFlip] = useState(false);
    const st = useRef({ a: 28, v: 0, drag: false, moved: false, raf: 0, run: false });
    const pivot = useRef<HTMLDivElement>(null);
    const id = useMemo(rid, []);
    const loop = () => {
      const s = st.current;
      if (!s.drag) { s.v += -0.012 * s.a; s.v *= 0.985; s.a += s.v; }
      setAng(s.a);
      if (s.drag || Math.abs(s.a) > 0.05 || Math.abs(s.v) > 0.01) s.raf = requestAnimationFrame(loop); else { s.run = false; setAng(0); }
    };
    const kick = () => { const s = st.current; if (!s.run) { s.run = true; s.raf = requestAnimationFrame(loop); } };
    useEffect(() => { if (seen) { st.current.a = 28; st.current.v = 0; const t = setTimeout(kick, 650); return () => clearTimeout(t); } }, [seen]);
    useEffect(() => () => cancelAnimationFrame(st.current.raf), []);
    const down = (e: React.PointerEvent) => {
      const s = st.current; s.drag = true; s.moved = false; kick();
      const r = pivot.current!.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top; let lastA = s.a;
      const mv = (ev: PointerEvent) => { const a = Math.max(-60, Math.min(60, (Math.atan2(cx - ev.clientX, Math.max(20, ev.clientY - cy)) * 180) / Math.PI)); if (Math.abs(a - s.a) > 1.5) s.moved = true; s.v = a - lastA; lastA = a; s.a = a; };
      const up = () => { s.drag = false; removeEventListener('pointermove', mv); removeEventListener('pointerup', up); if (!s.moved) { sfx('tap'); setFlip((f) => !f); } };
      addEventListener('pointermove', mv); addEventListener('pointerup', up);
    };
    const strapText = Array.from({ length: 6 }, () => p.strap).join('');
    return (
      <div className={`pm pm-badge ${seen ? 'in' : ''}`} ref={ref}>
        <button className="pm-showback top" onClick={() => { sfx('tap'); setFlip((f) => !f); st.current.v += 1.2; kick(); }}>↻ {flip ? 'Show front' : p.btn}</button>
        <div className="pivot" ref={pivot}>
          <div className="swing" style={{ transform: `rotate(${ang}deg)` }}>
            <svg className="strap" viewBox="0 0 200 330" aria-hidden>
              <defs><path id={id + 'l'} d="M 34 -10 L 96 318" /><path id={id + 'r'} d="M 104 318 L 166 -10" /></defs>
              <path d="M 34 -10 L 96 318" stroke="#121212" strokeWidth="15" strokeLinecap="round" />
              <path d="M 166 -10 L 104 318" stroke="#1b1b1b" strokeWidth="15" strokeLinecap="round" />
              <text fontSize="6.4" fill="#e8d9a8" letterSpacing="1.4" dy="2.2"><textPath href={`#${id}l`}>{strapText}</textPath></text>
              <text fontSize="6.4" fill="#e8d9a8" letterSpacing="1.4" dy="2.2"><textPath href={`#${id}r`}>{strapText}</textPath></text>
              <rect x="91" y="306" width="18" height="16" rx="3" fill="#b9bcc2" stroke="#8a8d93" />
            </svg>
            <div className="clip"><i /></div>
            <div className={`id ${flip ? 'flip' : ''}`} onPointerDown={down}>
              <div className="face f"><span className="hole" /><small>{p.top}</small><b>{p.name}</b><em>{p.sub}</em><Mandala /></div>
              <div className="face b"><span className="hole" /><Img src={p.photo} /><em>{p.backLine}</em></div>
            </div>
          </div>
        </div>
        <div className="hint">drag to swing · tap to flip</div>
      </div>
    );
  },
};

/* ------------------------------------------------------------------ 9. iPhone chat */
const Chat: PieceDef = {
  type: 'pm-chat', label: 'iPhone chat', icon: '📱', cat: 'premium', bare: true,
  desc: 'An iPhone on a coral and blue backdrop where your messages type themselves in, then your last one gets sent',
  fields: [F.t('contact', 'Contact name'), F.t('status', 'Under the name'), F.ph('avatar', 'Contact photo'), F.t('time', 'Phone clock'), F.t('day', 'Date pill'), F.s('msgs', 'Messages (they type in one by one)', 10), F.t('draft', 'Last message, typed in the box'), F.b('send', 'Send the last message at the end'), F.t('replay', 'Replay label')],
  defaults: () => ({ contact: 'My love 💗', status: 'iMessage · online now', avatar: PD(11), time: '11:48 PM', day: 'TODAY 11:40 PM',
    msgs: ['Happppyyyee birthday love.', 'ik last bday pr ek problem hogyi thi isliye ye wala bilkul special banana chahta hu.', 'i hope ye dekh ke apke chehre pe badi si smile aa gai hogi.'],
    draft: 'nahi bhi aai to koi ni baby, main hu na hamesha ❤️', send: true, replay: 'replay' }),
  Render: ({ p }) => {
    const msgs = list<string>(p.msgs).filter(Boolean);
    const draft = String(p.draft || '');
    const [ref, seen] = useInView<HTMLDivElement>(0.4);
    const [s, setS] = useState({ i: 0, n: 0, typing: false, d: 0, sent: false, done: false });
    const [run, setRun] = useState(0);
    const body = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (!seen) return;
      let alive = true; const tms: any[] = [];
      const wait = (ms: number) => new Promise<void>((r) => tms.push(setTimeout(r, ms)));
      (async () => {
        setS({ i: 0, n: 0, typing: false, d: 0, sent: false, done: false });
        await wait(600);
        for (let i = 0; i < msgs.length && alive; i++) {
          setS((x) => ({ ...x, i, n: 0, typing: true })); await wait(850); if (!alive) return;
          for (let n = 1; n <= msgs[i].length && alive; n++) { setS((x) => ({ ...x, typing: false, n })); await wait(28); }
          sfx('pop'); setS((x) => ({ ...x, i: i + 1, n: 0 })); await wait(650);
        }
        const g = Array.from(draft);
        for (let d = 1; d <= g.length && alive; d++) { setS((x) => ({ ...x, d })); await wait(55); }
        if (!alive) return;
        if (p.send && g.length) { await wait(900); if (!alive) return; sfx('pop'); setS((x) => ({ ...x, sent: true })); }
        setS((x) => ({ ...x, done: true }));
      })();
      return () => { alive = false; tms.forEach(clearTimeout); };
    }, [seen, run, msgs.join('|'), draft, p.send]);
    useEffect(() => { const b = body.current; if (b) b.scrollTop = b.scrollHeight; }, [s]);
    const shown = msgs.slice(0, s.i);
    const typingText = s.i < msgs.length ? msgs[s.i].slice(0, s.n) : '';
    const draftShown = s.sent ? '' : Array.from(draft).slice(0, s.d).join('');
    return (
      <div className={`pm pm-chat ${seen ? 'in' : ''}`} ref={ref}>
        <div className="pm-phone">
          <div className="island" />
          <div className="pm-sb"><b>{p.time}</b><span>▂▄▆ ◔ ▭</span></div>
          <div className="hdr"><span className="bk">‹</span><div className="av"><Img src={p.avatar} /></div><div><b>{p.contact}</b><small><i />{p.status}</small></div></div>
          <div className="body" ref={body}>
            <div className="day">{p.day}</div>
            {shown.map((m, i) => <div key={i} className="bub">{m}</div>)}
            {s.i < msgs.length && (s.typing ? <div className="bub dots"><i /><i /><i /></div> : s.n > 0 && <div className="bub">{typingText}<span className="car" /></div>)}
            {s.sent && <div className="bub">{draft}</div>}
            {s.done && <div className="rd">Delivered</div>}
          </div>
          <div className="inp"><div className="f">{draftShown ? <>{draftShown}<span className="car" /></> : <span className="ph">iMessage</span>}</div><button className={draftShown ? 'on' : ''}>↑</button></div>
        </div>
        <button className="replay" onClick={() => { sfx('tap'); setRun((r) => r + 1); }}>↻ {p.replay}</button>
      </div>
    );
  },
};

export const PREMIUM: PieceDef[] = [Count, Hero, Ribbon, Board, Mag, Bleed, Masonry, Wish, Badge, Chat];
