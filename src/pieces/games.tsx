import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PieceDef, F, H, Hint, Btn, Para, Img, Hidden, demoPhotos, DEMO } from './core';
import { sfx } from '../lib/audio';
import { confetti, hearts, burst } from '../lib/fx';
import { vibrate, lines } from '../lib/util';

const Quiz: PieceDef = {
  type: 'quiz', label: 'Quiz', icon: '❓', cat: 'games', desc: 'How well do they know you?',
  fields: [F.t('title', 'Title'), F.it('questions', 'Questions', [F.t('q', 'Question'), F.ta('options', 'Options (one per line)'), F.n('answer', 'Correct option number (1, 2, 3…)', 1, 6), F.t('note', 'Note after answering')], 12), F.t('end', 'Final message')],
  defaults: () => ({ title: 'How well do you know us?', end: 'Whatever your score, you are 100% my favourite.', questions: [
    { q: 'Where did we first meet?', options: 'College\nA friend\'s party\nOnline', answer: 1, note: 'You stole my pen. I never got it back.' },
    { q: 'Who says sorry first?', options: '{name}\n{sender}\nNobody, we send memes', answer: 3, note: 'Memes are a love language.' },
    { q: 'My favourite thing about you?', options: 'Your smile\nYour heart\nAll of the above', answer: 3, note: 'Trick question. It is always all of it.' }] }),
  Render: ({ p }) => {
    const qs = p.questions || []; const [i, setI] = useState(0); const [pick, setPick] = useState<number | null>(null); const [score, setScore] = useState(0);
    if (i >= qs.length) return <div className="pc-quiz"><H>{p.title}</H><div className="score">{score} / {qs.length}</div><Para text={p.end} /><Btn ghost onClick={() => { setI(0); setScore(0); setPick(null); }}>Play again</Btn></div>;
    const q = qs[i]; const opts = lines(q.options); const ans = (Number(q.answer) || 1) - 1;
    return (
      <div className="pc-quiz"><H>{p.title}</H><small>Question {i + 1} of {qs.length}</small><b className="q">{q.q}</b>
        <div className="opts">{opts.map((o, k) => <button key={k} className={pick == null ? '' : k === ans ? 'right' : k === pick ? 'wrong' : 'dim'} onClick={(e) => { if (pick != null) return; setPick(k); if (k === ans) { setScore(score + 1); sfx('win'); hearts(e.currentTarget); } else { sfx('tap'); vibrate([30, 30]); } }}>{o}</button>)}</div>
        {pick != null && <><div className="note">{pick === ans ? 'Correct! ' : 'Nope! '}{q.note}</div><Btn onClick={() => { setI(i + 1); setPick(null); if (i + 1 >= qs.length) confetti(); }}>{i + 1 >= qs.length ? 'See score' : 'Next question'}</Btn></>}
      </div>
    );
  },
};

const RunawayNo: PieceDef = {
  type: 'runawayno', label: 'Runaway "No"', icon: '🏃', cat: 'games', desc: 'A question where "No" runs away',
  fields: [F.t('question', 'Question'), F.ph('photo', 'Photo (optional)'), F.t('yes', 'Yes button'), F.t('no', 'No button'), F.s('pleas', 'What "No" says as it runs', 8), F.ta('after', 'After they say yes')],
  defaults: () => ({ question: 'Will you be mine forever?', photo: '', yes: 'Yes!', no: 'No', pleas: ['Are you sure?', 'Think again!', 'Pretty please?', 'I will cry 🥺', 'Not an option!'], after: 'I knew it! ♡' }),
  Render: ({ p }) => {
    const [pos, setPos] = useState<{ x: number; y: number } | null>(null); const [n, setN] = useState(0); const [yes, setYes] = useState(false); const box = useRef<HTMLDivElement>(null);
    const run = () => { const r = box.current!.getBoundingClientRect(); setPos({ x: Math.random() * (r.width - 110), y: Math.random() * (r.height - 50) }); setN(n + 1); sfx('pop'); vibrate(); };
    const plea = (p.pleas || [])[(n - 1) % Math.max(1, (p.pleas || []).length)];
    if (yes) return <div className="pc-runaway"><div className="big">💞</div><div className="pc-reveal"><Para text={p.after} /></div></div>;
    return (
      <div className="pc-runaway" ref={box}>{p.photo && <Img src={p.photo} className="ph" />}<h3 className="pc-h">{p.question}</h3>
        <div className="btns"><button className="pc-btn yes" style={{ transform: `scale(${1 + Math.min(n, 8) * 0.12})` }} onClick={(e) => { setYes(true); sfx('win'); hearts(e.currentTarget); confetti(); }}>{p.yes}</button>
          <button className="pc-btn ghost no" style={pos ? { position: 'absolute', left: pos.x, top: pos.y } : undefined} onPointerEnter={run} onClick={run}>{n > 0 && plea ? plea : p.no}</button></div>
      </div>
    );
  },
};

const Puzzle: PieceDef = {
  type: 'puzzle', label: 'Photo puzzle', icon: '🧩', cat: 'games', desc: 'Slide the tiles back into place',
  fields: [F.ph('photo', 'Photo'), F.sel('size', 'Grid', [['3', '3 × 3'], ['4', '4 × 4'], ['2', '2 × 2 (easy)']]), F.t('after', 'When solved')],
  defaults: () => ({ photo: DEMO(1).src, size: '3', after: 'You put us back together ♡' }),
  Render: ({ p }) => {
    const n = Number(p.size) || 3; const N = n * n;
    const shuffle = () => { let t = Array.from({ length: N }, (_, i) => i); let e = N - 1; for (let k = 0; k < 200; k++) { const nb = [e - n, e + n, e % n ? e - 1 : -1, (e + 1) % n ? e + 1 : -1].filter((x) => x >= 0 && x < N); const s = nb[Math.floor(Math.random() * nb.length)]; [t[e], t[s]] = [t[s], t[e]]; e = s; } return t; };
    const [tiles, setTiles] = useState<number[]>(shuffle); const solved = tiles.every((v, i) => v === i);
    useEffect(() => setTiles(shuffle()), [n, p.photo]);
    const move = (i: number, e: React.MouseEvent) => { const e0 = tiles.indexOf(N - 1); const ok = (Math.abs(i - e0) === n) || (Math.abs(i - e0) === 1 && Math.floor(i / n) === Math.floor(e0 / n)); if (!ok || solved) return; const t = [...tiles]; [t[i], t[e0]] = [t[e0], t[i]]; setTiles(t); sfx('tap'); if (t.every((v, k) => v === k)) { sfx('win'); confetti(e.currentTarget); } };
    return (
      <div className="pc-puzzle"><div className="board" style={{ gridTemplateColumns: `repeat(${n},1fr)` }}>{tiles.map((v, i) => <div key={i} onClick={(e) => move(i, e)} className={`tile ${v === N - 1 && !solved ? 'empty' : ''}`} style={{ backgroundImage: `url(${p.photo})`, backgroundSize: `${n * 100}%`, backgroundPosition: `${(v % n) * 100 / (n - 1)}% ${Math.floor(v / n) * 100 / (n - 1)}%` }} />)}</div>
        {solved ? <div className="pc-reveal">{p.after}</div> : <Hint>tap a tile next to the gap · <a onClick={() => setTiles(Array.from({ length: N }, (_, i) => i))}>solve it for me</a></Hint>}</div>
    );
  },
};

const Memory: PieceDef = {
  type: 'memory', label: 'Memory match', icon: '🃏', cat: 'games', desc: 'Flip cards to find the pairs of your photos',
  fields: [F.phs('photos', 'Photos (each becomes a pair)', 8), F.t('after', 'When all matched')],
  defaults: () => ({ photos: demoPhotos(4), after: 'Perfect match, just like us!' }),
  Render: ({ p }) => {
    const ps = p.photos || [];
    const deck = useMemo(() => [...ps.map((_: any, i: number) => i), ...ps.map((_: any, i: number) => i)].sort(() => Math.random() - 0.5), [ps.length]);
    const [open, setOpen] = useState<number[]>([]); const [got, setGot] = useState<number[]>([]);
    const flip = (k: number, e: React.MouseEvent) => {
      if (open.length === 2 || open.includes(k) || got.includes(deck[k])) return; sfx('tap'); const o = [...open, k]; setOpen(o);
      if (o.length === 2) setTimeout(() => { if (deck[o[0]] === deck[o[1]]) { const g = [...got, deck[o[0]]]; setGot(g); sfx(g.length === ps.length ? 'win' : 'pop'); if (g.length === ps.length) confetti(); } setOpen([]); }, 700);
    };
    return <div className="pc-memory"><div className="grid">{deck.map((v, k) => <div key={k} className={`pc-flip mc ${open.includes(k) || got.includes(v) ? 'flipped' : ''}`} onClick={(e) => flip(k, e)}><div className="in"><div className="front">♡</div><div className="back"><Img src={ps[v]?.src} /></div></div></div>)}</div>{got.length === ps.length && ps.length ? <div className="pc-reveal">{p.after}</div> : <Hint>find the pairs</Hint>}</div>;
  },
};

const Treasure: PieceDef = {
  type: 'treasure', label: 'Treasure hunt', icon: '🗝️', cat: 'games', desc: 'Clue after clue; each answer opens the next',
  fields: [F.it('clues', 'Clues', [F.t('q', 'Clue / question'), F.t('a', 'Answer (not case-sensitive)'), F.t('hint', 'Hint')], 8), F.ta('after', 'The treasure')],
  defaults: () => ({ clues: [{ q: 'Where did we first meet?', a: 'college', hint: 'Lectures, canteen, you know it' }, { q: 'My nickname for you?', a: 'bubu', hint: 'Starts with B' }], after: 'You found the treasure: it was me all along. Sorry, no refunds ♡' }),
  Render: ({ p }) => {
    const cs = p.clues || []; const [i, setI] = useState(0); const [v, setV] = useState(''); const [bad, setBad] = useState(false); const [hint, setHint] = useState(false);
    if (i >= cs.length) return <div className="pc-treasure"><div className="chest">💰</div><div className="pc-reveal"><Para text={p.after} /></div></div>;
    const check = (e: any) => { if (v.trim().toLowerCase() === String(cs[i].a).trim().toLowerCase()) { setI(i + 1); setV(''); setHint(false); sfx('win'); confetti(e.currentTarget); } else { setBad(true); vibrate([30, 30]); setTimeout(() => setBad(false), 500); } };
    return <div className="pc-treasure"><div className="map">🗺️</div><small>Clue {i + 1} of {cs.length}</small><b>{cs[i].q}</b><div className={`in ${bad ? 'bad' : ''}`}><input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && check(e)} placeholder="your answer" /><Btn onClick={check}>Check</Btn></div>
      {cs[i].hint && (hint ? <small className="hint">{cs[i].hint}</small> : <a className="hint" onClick={() => setHint(true)}>need a hint?</a>)}</div>;
  },
};

const MatchPairs: PieceDef = {
  type: 'matchpairs', label: 'Match the pairs', icon: '🔗', cat: 'games', desc: 'Tap one on the left, then its match',
  fields: [F.it('pairs', 'Pairs', [F.t('a', 'Left'), F.t('b', 'Right')], 6), F.t('after', 'When all matched')],
  defaults: () => ({ pairs: [{ a: 'Chai', b: 'Our mornings' }, { a: 'Rain', b: 'Our first walk' }, { a: 'Maggi', b: '2 a.m. hunger' }], after: 'You remember everything. That is why I love you.' }),
  Render: ({ p }) => {
    const ps = p.pairs || []; const right = useMemo(() => ps.map((_: any, i: number) => i).sort(() => Math.random() - 0.5), [ps.length]);
    const [sel, setSel] = useState<number | null>(null); const [got, setGot] = useState<number[]>([]); const [bad, setBad] = useState<number | null>(null);
    return <div className="pc-match"><div className="cols"><div>{ps.map((x: any, i: number) => <button key={i} className={got.includes(i) ? 'got' : sel === i ? 'sel' : ''} onClick={() => { if (!got.includes(i)) { setSel(i); sfx('tap'); } }}>{x.a}</button>)}</div>
      <div>{right.map((i) => <button key={i} className={got.includes(i) ? 'got' : bad === i ? 'bad' : ''} onClick={(e) => { if (sel == null || got.includes(i)) return; if (sel === i) { const g = [...got, i]; setGot(g); setSel(null); sfx(g.length === ps.length ? 'win' : 'pop'); if (g.length === ps.length) hearts(e.currentTarget); } else { setBad(i); vibrate([20, 20]); setTimeout(() => setBad(null), 400); } }}>{ps[i].b}</button>)}</div></div>
      {got.length === ps.length && ps.length ? <div className="pc-reveal">{p.after}</div> : <Hint>tap left, then its match</Hint>}</div>;
  },
};

const Riddle: PieceDef = {
  type: 'riddle', label: 'Riddle', icon: '🤔', cat: 'games', desc: 'A riddle to solve before you go on',
  fields: [F.ta('riddle', 'Riddle'), F.t('answer', 'Answer'), F.ta('after', 'After solving')],
  defaults: () => ({ riddle: 'I am always with you, I steal your fries, and I love you anyway. Who am I?', answer: '{sender}', after: 'Correct! And I am not giving the fries back.' }),
  Render: ({ p }) => {
    const [v, setV] = useState(''); const [ok, setOk] = useState(false); const [give, setGive] = useState(false);
    return <div className="pc-riddle"><div className="q">?</div><Para text={p.riddle} />{!ok ? <><div className="in"><input value={v} onChange={(e) => { setV(e.target.value); if (e.target.value.trim().toLowerCase() === String(p.answer).trim().toLowerCase()) { setOk(true); sfx('win'); hearts(); } }} placeholder="answer" /></div><a className="hint" onClick={() => setGive(!give)}>{give ? `It is: ${p.answer}` : 'give up?'}</a></> : <div className="pc-reveal"><Para text={p.after} /></div>}</div>;
  },
};

const CatchStars: PieceDef = {
  type: 'catchstars', label: 'Catch the stars', icon: '🌟', cat: 'games', desc: 'Catch falling stars in a basket to unlock a message', bare: true,
  fields: [F.t('title', 'Title'), F.e('emoji', 'Falling emoji'), F.e('basket', 'Basket emoji'), F.n('goal', 'How many to catch', 3, 50), F.ta('after', 'Unlocked message')],
  defaults: () => ({ title: 'Catch 10 stars for your wish', emoji: '⭐', basket: '🧺', goal: 10, after: 'Wish granted: one whole year of happiness, delivered by me.' }),
  Render: ({ p }) => {
    const box = useRef<HTMLDivElement>(null); const [bx, setBx] = useState(50); const [items, setItems] = useState<{ id: number; x: number; y: number; v: number }[]>([]); const [n, setN] = useState(0); const [play, setPlay] = useState(false);
    const goal = Number(p.goal) || 10; const done = n >= goal; const bxr = useRef(50); bxr.current = bx;
    useEffect(() => {
      if (!play || done) return; let id = 0, raf = 0, last = performance.now(), spawn = 0;
      const step = (t: number) => { const dt = Math.min(50, t - last); last = t; spawn += dt;
        setItems((its) => { let out = its.map((s) => ({ ...s, y: s.y + s.v * dt / 16 })); if (spawn > 650) { spawn = 0; out.push({ id: id++, x: 5 + Math.random() * 90, y: -8, v: 0.6 + Math.random() * 0.6 }); }
          const caught = out.filter((s) => s.y > 82 && s.y < 96 && Math.abs(s.x - bxr.current) < 11);
          if (caught.length) { setN((k) => k + caught.length); sfx('pop'); vibrate(10); }
          return out.filter((s) => !caught.includes(s) && s.y < 105); });
        raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
    }, [play, done]);
    useEffect(() => { if (done) { sfx('win'); confetti(box.current); } }, [done]);
    const mv = (e: React.PointerEvent) => { const r = box.current!.getBoundingClientRect(); setBx(Math.max(6, Math.min(94, ((e.clientX - r.left) / r.width) * 100))); };
    return (
      <div className="pc-catch" ref={box} onPointerMove={mv} onPointerDown={mv}>
        <div className="hud">{p.title} · <b>{Math.min(n, goal)} / {goal}</b></div>
        {!play && !done && <button className="pc-btn start" onClick={() => { setPlay(true); sfx('tap'); }}>Start</button>}
        {!done && items.map((s) => <span key={s.id} className="fall" style={{ left: s.x + '%', top: s.y + '%' }}>{p.emoji || '⭐'}</span>)}
        {!done && <span className="basket" style={{ left: bx + '%' }}>{p.basket || '🧺'}</span>}
        {done && <div className="win pc-reveal"><Para text={p.after} /></div>}
      </div>
    );
  },
};

const Coupons: PieceDef = {
  type: 'coupons', label: 'Love coupons', icon: '🎫', cat: 'games', desc: 'Coupons they tap to redeem',
  fields: [F.t('title', 'Title'), F.it('items', 'Coupons', [F.t('title', 'Coupon'), F.t('sub', 'Small print')], 10)],
  defaults: () => ({ title: 'Coupons, just for you', items: [{ title: 'One free hug', sub: 'Valid anytime, anywhere' }, { title: 'Dinner on me', sub: 'You choose the place' }, { title: 'Win any argument', sub: 'Use wisely. One time only.' }] }),
  Render: ({ p }) => { const [r, setR] = useState<number[]>([]); return (
    <div className="pc-coupons"><H>{p.title}</H>{(p.items || []).map((c: any, i: number) => <div key={i} className={`cp ${r.includes(i) ? 'used' : ''}`}><div><b>{c.title}</b><small>{c.sub}</small></div><button onClick={(e) => { if (!r.includes(i)) { setR([...r, i]); sfx('win'); hearts(e.currentTarget); } }}>{r.includes(i) ? 'Redeemed ♥' : 'REDEEM'}</button></div>)}</div>); },
};

const Candles: PieceDef = {
  type: 'candles', label: 'Cake & candles', icon: '🎂', cat: 'games', desc: 'Light or blow out the candles, then the wish shows', bare: true,
  fields: [F.t('title', 'Title'), F.n('count', 'Candles', 1, 12), F.sel('mode', 'They have to…', [['blow', 'Blow out the candles'], ['light', 'Light the candles first, then blow']]), F.sel('flavor', 'Cake', [['pink', 'Strawberry'], ['choc', 'Chocolate'], ['vanilla', 'Vanilla'], ['blue', 'Blueberry']]), F.ta('wish', 'Wish after blowing'), F.b('mic', 'Let them really blow into the mic')],
  defaults: () => ({ title: 'Make a wish, {name}', count: 5, mode: 'blow', flavor: 'pink', wish: 'May all your wishes come true, today and always ♡', mic: true }),
  Render: ({ p }) => {
    const n = Math.max(1, Math.min(12, Number(p.count) || 5));
    const [lit, setLit] = useState<boolean[]>(() => Array(n).fill(p.mode !== 'light'));
    const [phase, setPhase] = useState<'light' | 'blow' | 'done'>(p.mode === 'light' ? 'light' : 'blow');
    const [micOn, setMicOn] = useState(false); const stream = useRef<MediaStream | null>(null);
    useEffect(() => { setLit(Array(n).fill(p.mode !== 'light')); setPhase(p.mode === 'light' ? 'light' : 'blow'); }, [n, p.mode]);
    useEffect(() => () => stream.current?.getTracks().forEach((t) => t.stop()), []);
    const blowOne = (i: number) => setLit((L) => { const c = [...L]; c[i] = false; if (c.every((x) => !x)) finish(); return c; });
    const finish = () => { setPhase('done'); sfx('win'); burst({ count: 140 }); stream.current?.getTracks().forEach((t) => t.stop()); };
    const tap = (i: number) => { if (phase === 'light') { setLit((L) => { const c = [...L]; c[i] = true; if (c.every(Boolean)) setTimeout(() => setPhase('blow'), 400); return c; }); sfx('tap'); } else if (phase === 'blow' && lit[i]) { blowOne(i); sfx('pop'); } };
    const startMic = async () => {
      try { const s = await navigator.mediaDevices.getUserMedia({ audio: true }); stream.current = s; setMicOn(true);
        const a = new AudioContext(); const an = a.createAnalyser(); a.createMediaStreamSource(s).connect(an); const d = new Uint8Array(an.frequencyBinCount);
        const loop = () => { if (!stream.current?.active) return; an.getByteFrequencyData(d); const lvl = d.slice(0, 40).reduce((x, y) => x + y, 0) / 40; if (lvl > 95) setLit((L) => { const i = L.findIndex(Boolean); if (i < 0) return L; const c = [...L]; c[i] = false; if (c.every((x) => !x)) finish(); return c; }); requestAnimationFrame(loop); }; loop();
      } catch { setMicOn(false); }
    };
    return (
      <div className={`pc-cake flavor-${p.flavor || 'pink'}`}>
        <h3 className="pc-h">{p.title}</h3>
        <div className="cake"><div className="candles">{lit.map((l, i) => <div key={i} className="candle" onClick={() => tap(i)}><i className={l ? 'flame' : 'smoke'} /></div>)}</div><div className="tier t2"><i /></div><div className="tier t1"><i /></div><div className="plate" /></div>
        {phase === 'light' && <Hint>tap each candle to light it</Hint>}
        {phase === 'blow' && <><Hint>tap the flames to blow them out{p.mic ? ' — or blow into your mic' : ''}</Hint>{p.mic && !micOn && <Btn ghost onClick={startMic}>🎤 Blow for real</Btn>}</>}
        <Hidden open={phase === 'done'}><div className="pc-reveal"><Para text={p.wish} /></div></Hidden>
      </div>
    );
  },
};

const Wheel: PieceDef = {
  type: 'wheel', label: 'Spin the wheel', icon: '🎡', cat: 'games', desc: 'A prize wheel — every slice is a treat',
  fields: [F.t('title', 'Title'), F.s('items', 'Slices', 10)],
  defaults: () => ({ title: 'Spin for your birthday treat', items: ['Pizza night', 'Movie marathon', 'Breakfast in bed', 'Shopping spree', 'Long drive', '100 kisses'] }),
  Render: ({ p }) => {
    const it = p.items?.length ? p.items : ['♡']; const [rot, setRot] = useState(0); const [res, setRes] = useState<string | null>(null); const [spin, setSpin] = useState(false);
    const seg = 360 / it.length; const cols = ['#ff8fab', '#ffd166', '#8ce99a', '#74c0fc', '#b197fc', '#ffa94d', '#63e6be', '#f783ac', '#e599f7', '#ffe066'];
    const go = () => { if (spin) return; setSpin(true); setRes(null); sfx('tap'); const k = Math.floor(Math.random() * it.length); const target = rot + 360 * 5 + (360 - (k * seg + seg / 2)) - (rot % 360); setRot(target); setTimeout(() => { setRes(it[k]); setSpin(false); sfx('win'); confetti(); }, 4200); };
    return <div className="pc-wheel"><H>{p.title}</H><div className="wrap"><div className="ptr">▼</div><div className="wh" style={{ transform: `rotate(${rot}deg)`, background: `conic-gradient(${it.map((_: any, i: number) => `${cols[i % cols.length]} ${i * seg}deg ${(i + 1) * seg}deg`).join(',')})` }}>{it.map((x: string, i: number) => <span key={i} style={{ transform: `rotate(${i * seg + seg / 2}deg) translateY(-38%)` }}>{x}</span>)}</div><button className="hub" onClick={go}>SPIN</button></div>{res && <div className="pc-reveal">You won: <b>{res}</b>!</div>}</div>;
  },
};

export const GAMES: PieceDef[] = [Quiz, RunawayNo, Puzzle, Memory, Treasure, MatchPairs, Riddle, CatchStars, Coupons, Candles, Wheel];
