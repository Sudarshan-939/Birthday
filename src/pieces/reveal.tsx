import React, { useEffect, useRef, useState } from 'react';
import { PieceDef, F, H, Hint, Btn, Para, Hidden, useSequence } from './core';
import { sfx } from '../lib/audio';
import { confetti, hearts, burst } from '../lib/fx';
import { vibrate, pick } from '../lib/util';

const SwipeDeck: PieceDef = {
  type: 'swipedeck', label: 'Swipe deck', icon: '🎴', cat: 'reveal', desc: 'Cards they swipe away one by one', bare: true,
  fields: [F.s('items', 'Cards', 15), F.t('end', 'After the last card')],
  defaults: () => ({ items: ['You make every room warmer', 'You laugh at my worst jokes', 'You are my favourite hello', 'And my hardest goodbye'], end: 'That is all of them. For now ♡' }),
  Render: ({ p }) => {
    const it = p.items || []; const [i, setI] = useState(0); const [gone, setGone] = useState<string | null>(null);
    const go = (d: string) => { setGone(d); sfx('page'); setTimeout(() => { setGone(null); setI((v) => v + 1); }, 280); };
    return (
      <div className="pc-deck">
        {i >= it.length ? <div className="card end" onClick={() => setI(0)}>{p.end}</div> : it.slice(i, i + 3).reverse().map((t: string, k: number, arr: string[]) => { const top = k === arr.length - 1; return (
          <div key={i + (arr.length - 1 - k)} className={`card ${top && gone ? 'gone-' + gone : ''}`} style={{ transform: top ? undefined : `translateY(${(arr.length - 1 - k) * 8}px) scale(${1 - (arr.length - 1 - k) * 0.05})` }} onClick={top ? () => go(Math.random() > 0.5 ? 'r' : 'l') : undefined}>
            <span className="n">{i + (arr.length - k)} / {it.length}</span><div>{t}</div></div>); })}
        <Hint>{it.length - i > 0 ? `${it.length - i} cards to swipe` : 'tap to start over'}</Hint>
      </div>
    );
  },
};

const ThisOrThat: PieceDef = {
  type: 'thisorthat', label: 'This or that', icon: '⚖️', cat: 'reveal', desc: 'Two choices; see if you match',
  fields: [F.it('items', 'Questions', [F.t('a', 'Option A'), F.t('b', 'Option B'), F.sel('mine', 'My pick', [['a', 'A'], ['b', 'B']])], 10), F.t('end', 'At the end')],
  defaults: () => ({ items: [{ a: 'Chai', b: 'Coffee', mine: 'a' }, { a: 'Mountains', b: 'Beaches', mine: 'b' }, { a: 'Movie night', b: 'Night drive', mine: 'b' }], end: 'Different or same, I pick you every time.' }),
  Render: ({ p }) => {
    const it = p.items || []; const [i, setI] = useState(0); const [match, setMatch] = useState(0); const [last, setLast] = useState<boolean | null>(null);
    const choose = (c: string, e: React.MouseEvent) => { const m = c === it[i].mine; setLast(m); if (m) { setMatch(match + 1); hearts(e.currentTarget); } sfx(m ? 'win' : 'tap'); setTimeout(() => { setI(i + 1); setLast(null); }, 700); };
    if (i >= it.length) return <div className="pc-tot"><b className="score">{match} / {it.length} matched</b><Para text={p.end} /><Btn ghost onClick={() => { setI(0); setMatch(0); }}>Play again</Btn></div>;
    return <div className="pc-tot"><small>{i + 1} / {it.length}</small><div className="opts"><button onClick={(e) => choose('a', e)}>{it[i].a}</button><span>or</span><button onClick={(e) => choose('b', e)}>{it[i].b}</button></div>{last != null && <div className="res">{last ? 'Same as me! ♡' : 'Hmm, I picked the other one 😄'}</div>}</div>;
  },
};

const TapCounter: PieceDef = {
  type: 'tapcounter', label: 'Tap counter', icon: '👆', cat: 'reveal', desc: 'Tap the heart enough times to open it',
  fields: [F.t('label', 'Instruction'), F.e('emoji', 'Emoji'), F.n('target', 'Taps needed', 1, 100), F.ta('message', 'Hidden message')],
  defaults: () => ({ label: 'Tap the heart 10 times', emoji: '❤️', target: 10, message: 'Every tap was a "you are cute". You owe me 10 hugs now.' }),
  Render: ({ p }) => { const [n, setN] = useState(0); const t = Number(p.target) || 10; const done = n >= t; return (
    <div className="pc-tapc"><b>{p.label}</b><button className={`big ${done ? 'done' : ''}`} style={{ transform: `scale(${1 + Math.min(n, t) / t * 0.5})` }} onClick={(e) => { if (done) return; vibrate(); sfx('pop'); const k = n + 1; setN(k); if (k >= t) { sfx('win'); hearts(e.currentTarget); } }}>{p.emoji || '❤️'}</button>
      <small>{Math.min(n, t)} / {t}</small><Hidden open={done}><div className="pc-reveal"><Para text={p.message} /></div></Hidden></div>); },
};

const Shake: PieceDef = {
  type: 'shake', label: 'Shake to reveal', icon: '📳', cat: 'reveal', desc: 'They shake the phone (or tap) to open it',
  fields: [F.t('label', 'Instruction'), F.ta('message', 'Hidden message')],
  defaults: () => ({ label: 'Shake your phone!', message: 'Haha, you shook it. Now imagine that was me hugging you.' }),
  Render: ({ p }) => {
    const [n, setN] = useState(0); const done = n >= 3;
    useEffect(() => {
      let last = 0;
      const h = (e: DeviceMotionEvent) => { const a = e.accelerationIncludingGravity; if (!a) return; const m = Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0); if (m > 32 && Date.now() - last > 400) { last = Date.now(); setN((v) => v + 1); vibrate(); } };
      window.addEventListener('devicemotion', h); return () => window.removeEventListener('devicemotion', h);
    }, []);
    useEffect(() => { if (done) { sfx('win'); confetti(); } }, [done]);
    return <div className="pc-shake"><b>{p.label}</b><div className={`ph ${n > 0 && !done ? 'shaking' : ''}`} onClick={() => { const D = (DeviceMotionEvent as any); if (D?.requestPermission) D.requestPermission().catch(() => {}); setN(n + 1); sfx('tap'); vibrate(); }}>📱</div><small>{done ? '' : 'or tap it 3 times'}</small><Hidden open={done}><div className="pc-reveal"><Para text={p.message} /></div></Hidden></div>;
  },
};

const Passcode: PieceDef = {
  type: 'passcode', label: 'Passcode lock', icon: '🔢', cat: 'reveal', desc: 'A lock that opens with your secret code',
  fields: [F.t('hint', 'Hint'), F.t('code', 'Code (numbers)'), F.ta('message', 'Hidden message')],
  defaults: () => ({ hint: 'Hint: the day we met (DDMM)', code: '1402', message: 'You remembered! Of course you did. That is why I love you.' }),
  Render: ({ p }) => {
    const [v, setV] = useState(''); const [bad, setBad] = useState(false); const ok = v === String(p.code);
    const press = (k: string, e: React.MouseEvent) => { if (ok) return; sfx('tap'); if (k === '⌫') return setV(v.slice(0, -1)); if (k === '✓') { if (v === String(p.code)) { sfx('win'); confetti(e.currentTarget); } else { setBad(true); vibrate([40, 40, 40]); setTimeout(() => { setBad(false); setV(''); }, 600); } return; } const nv = (v + k).slice(0, 8); setV(nv); if (nv === String(p.code)) { sfx('win'); confetti(e.currentTarget); } };
    return <div className="pc-pass"><div className="ic">{ok ? '🔓' : '🔒'}</div><small>{p.hint}</small><div className={`dots ${bad ? 'bad' : ''}`}>{Array.from({ length: String(p.code).length }, (_, i) => <i key={i} className={i < v.length ? 'on' : ''} />)}</div>
      {!ok ? <div className="pad">{['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'].map((k) => <button key={k} onClick={(e) => press(k, e)}>{k}</button>)}</div> : <div className="pc-reveal"><Para text={p.message} /></div>}</div>;
  },
};

const HoldReveal: PieceDef = {
  type: 'holdreveal', label: 'Hold to reveal', icon: '✋', cat: 'reveal', desc: 'Press and hold until it opens',
  fields: [F.t('label', 'Instruction'), F.ta('message', 'Hidden message')],
  defaults: () => ({ label: 'Hold here', message: 'I love you more than chai. And that is saying a lot.' }),
  Render: ({ p }) => {
    const [v, setV] = useState(0); const t = useRef<any>(null); const done = v >= 100;
    const start = () => { if (done) return; clearInterval(t.current); t.current = setInterval(() => setV((x) => { const n = Math.min(100, x + 2.5); if (n >= 100) { clearInterval(t.current); sfx('win'); hearts(); } return n; }), 30); };
    const stop = () => { clearInterval(t.current); if (!done) t.current = setInterval(() => setV((x) => { if (x <= 0) { clearInterval(t.current); return 0; } return x - 4; }), 30); };
    useEffect(() => () => clearInterval(t.current), []);
    return <div className="pc-hold"><button className="ring" style={{ background: `conic-gradient(var(--accent) ${v * 3.6}deg, var(--line) 0)` }} onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onContextMenu={(e) => e.preventDefault()}><span>{done ? '♥' : '♥'}</span></button><b>{done ? '' : p.label}</b><Hidden open={done}><div className="pc-reveal"><Para text={p.message} /></div></Hidden></div>;
  },
};

const Scratch: PieceDef = {
  type: 'scratch', label: 'Scratch card', icon: '🪙', cat: 'reveal', desc: 'Scratch with a finger to reveal', bare: true,
  fields: [F.t('label', 'Text on the cover'), F.ta('message', 'Hidden message'), F.c('cover', 'Cover colour')],
  defaults: () => ({ label: 'Scratch me', message: 'One free hug, valid forever ♡', cover: '#c0c0c8' }),
  Render: ({ p }) => {
    const cv = useRef<HTMLCanvasElement>(null); const [done, setDone] = useState(false); const down = useRef(false);
    useEffect(() => {
      const c = cv.current!; const g = c.getContext('2d')!; g.globalCompositeOperation = 'source-over';
      const grd = g.createLinearGradient(0, 0, c.width, c.height); grd.addColorStop(0, p.cover || '#c0c0c8'); grd.addColorStop(0.5, '#ffffff88'); grd.addColorStop(1, p.cover || '#c0c0c8');
      g.fillStyle = p.cover || '#c0c0c8'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = grd; g.fillRect(0, 0, c.width, c.height);
      g.fillStyle = '#ffffffdd'; g.font = 'bold 34px sans-serif'; g.textAlign = 'center'; g.fillText(p.label || 'Scratch me', c.width / 2, c.height / 2 + 12);
      for (let i = 0; i < 40; i++) { g.fillStyle = '#ffffff55'; g.fillText('✦', Math.random() * c.width, Math.random() * c.height); }
      setDone(false);
    }, [p.label, p.cover]);
    const scratch = (e: React.PointerEvent) => {
      if (!down.current || done) return; const c = cv.current!; const r = c.getBoundingClientRect(); const g = c.getContext('2d')!;
      g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc((e.clientX - r.left) * (c.width / r.width), (e.clientY - r.top) * (c.height / r.height), 32, 0, Math.PI * 2); g.fill();
      if (Math.random() < 0.15) { const d = g.getImageData(0, 0, c.width, c.height).data; let cl = 0; for (let i = 3; i < d.length; i += 64) if (d[i] === 0) cl++; if (cl / (d.length / 64) > 0.5) { setDone(true); sfx('win'); confetti(c); } }
    };
    return <div className="pc-scratch"><div className="msg"><Para text={p.message} /></div><canvas ref={cv} width={600} height={300} className={done ? 'gone' : ''} onPointerDown={(e) => { down.current = true; (e.target as any).setPointerCapture?.(e.pointerId); scratch(e); }} onPointerMove={scratch} onPointerUp={() => (down.current = false)} /></div>;
  },
};

const GiftBox: PieceDef = {
  type: 'giftbox', label: 'Gift box', icon: '🎁', cat: 'reveal', desc: 'A gift box they tap open',
  fields: [F.t('label', 'Line on the box'), F.ta('message', 'Inside the box'), F.e('inside', 'Emoji that pops out')],
  defaults: () => ({ label: 'Tap to open', message: 'You are my favourite person in the whole world ♡', inside: '💝' }),
  Render: ({ p }) => { const [o, setO] = useState(false); return (
    <div className={`pc-gift ${o ? 'open' : ''}`}><div className="box" onClick={(e) => { if (o) return; setO(true); sfx('open'); confetti(e.currentTarget); vibrate(30); }}><div className="lid"><i /></div><div className="body"><i /></div><div className="pop">{p.inside || '💝'}</div></div>
      {!o ? <b>{p.label}</b> : <div className="pc-reveal"><Para text={p.message} /></div>}</div>); },
};

const OpenWhen: PieceDef = {
  type: 'openwhen', label: 'Open when…', icon: '📨', cat: 'reveal', desc: 'Envelopes for different moods',
  fields: [F.t('title', 'Title'), F.it('items', 'Envelopes', [F.t('label', 'Open when…'), F.ta('text', 'Letter inside')], 10)],
  defaults: () => ({ title: 'Open when…', items: [{ label: 'you miss me', text: 'Close your eyes. I am thinking of you right now. Probably smiling like an idiot.' }, { label: 'you are sad', text: 'You are allowed to have bad days. Call me, I will bring snacks.' }, { label: 'you cannot sleep', text: 'Count the times I said I love you. You will run out of numbers first.' }] }),
  Render: ({ p }) => { const [o, setO] = useState<number | null>(null); const it = p.items || []; return (
    <div className="pc-openwhen"><H>{p.title}</H>
      {o == null ? <div className="envs">{it.map((e: any, i: number) => <button key={i} className="env" onClick={() => { setO(i); sfx('open'); }}><span className="seal">♥</span><small>Open when</small><b>{e.label}</b></button>)}</div>
        : <div className="opened"><small>Open when {it[o].label}</small><Para text={it[o].text} /><Btn ghost onClick={() => setO(null)}>Fold it back</Btn></div>}</div>); },
};

const Jar: PieceDef = {
  type: 'jar', label: 'Jar of notes', icon: '🫙', cat: 'reveal', desc: 'Pull out little notes one by one',
  fields: [F.t('title', 'Title'), F.s('notes', 'Notes', 50)],
  defaults: () => ({ title: 'Little notes for you', notes: ['You are braver than you think.', 'Your laugh is my favourite sound.', 'I am proud of you. Always.', 'Drink water. Then text me.'] }),
  Render: ({ p }) => { const ns = p.notes || []; const [i, setI] = useState(-1); const [k, setK] = useState(0); return (
    <div className="pc-jar"><H>{p.title}</H><div className="jar" onClick={() => { sfx('pop'); setI((i + 1) % ns.length); setK(k + 1); }}><div className="lid" />{ns.map((_: any, j: number) => <i key={j} style={{ left: 15 + ((j * 37) % 70) + '%', bottom: 8 + ((j * 23) % 50) + '%', background: ['#ffd6e0', '#fff1b8', '#d4f4dd', '#dbe7ff'][j % 4], transform: `rotate(${(j * 53) % 60 - 30}deg)` }} />)}</div>
      {i >= 0 ? <div className="note" key={k}>{ns[i]}</div> : <Hint>{ns.length} notes inside · tap the jar</Hint>}</div>); },
};

const FortuneCookie: PieceDef = {
  type: 'fortune', label: 'Fortune cookie', icon: '🥠', cat: 'reveal', desc: 'They crack it open for a little message',
  fields: [F.ta('message', 'Fortune')],
  defaults: () => ({ message: 'You will be loved, a lot, by someone who made this cookie.' }),
  Render: ({ p }) => { const [o, setO] = useState(false); return (
    <div className={`pc-cookie ${o ? 'open' : ''}`} onClick={(e) => { if (!o) { setO(true); sfx('pop'); burst({ x: e.clientX, y: e.clientY, count: 20, emoji: ['✨'] }); } }}><div className="halves"><span className="l">🥠</span><span className="r">🥠</span></div>{o ? <div className="slip">{p.message}</div> : <Hint>tap to crack it</Hint>}</div>); },
};

const Oracle: PieceDef = {
  type: 'oracle', label: 'Oracle cards', icon: '🔮', cat: 'reveal', desc: 'They pick a face-down card for a message',
  fields: [F.it('items', 'Cards', [F.t('title', 'Card title'), F.t('text', 'Message')], 6)],
  defaults: () => ({ items: [{ title: 'Love', text: 'Someone is thinking of you right now. Hi, it is me.' }, { title: 'Luck', text: 'Free chai is in your near future.' }, { title: 'Destiny', text: 'You and me. Obviously.' }] }),
  Render: ({ p }) => { const [f, setF] = useState<number[]>([]); return (
    <div className="pc-oracle"><div className="cards">{(p.items || []).map((c: any, i: number) => <div key={i} className={`pc-flip oc ${f.includes(i) ? 'flipped' : ''}`} onClick={() => { if (!f.includes(i)) { setF([...f, i]); sfx('open'); } }}><div className="in"><div className="front">✦</div><div className="back"><b>{c.title}</b><span>{c.text}</span></div></div></div>)}</div><Hint>pick a card</Hint></div>); },
};

const Magic8: PieceDef = {
  type: 'magic8', label: 'Magic 8 ball', icon: '🎱', cat: 'reveal', desc: 'Ask anything, shake for a (biased) answer',
  fields: [F.t('question', 'Prompt'), F.s('answers', 'Answers', 15)],
  defaults: () => ({ question: 'Ask the ball anything about us', answers: ['Obviously yes', 'Ask again after a hug', 'It is certain ♡', 'Only if pizza is involved', 'Signs point to forever'] }),
  Render: ({ p }) => { const [a, setA] = useState(''); const [sh, setSh] = useState(false); return (
    <div className="pc-8"><b>{p.question}</b><div className={`ball ${sh ? 'shaking' : ''}`} onClick={() => { setSh(true); sfx('tap'); vibrate(80); setTimeout(() => { setSh(false); setA(pick(p.answers || ['Yes'])); sfx('pop'); }, 700); }}><div className="win">{a ? <span key={a}>{a}</span> : '8'}</div></div><Hint>tap to shake it</Hint></div>); },
};

const LoveMeter: PieceDef = {
  type: 'lovemeter', label: 'Love meter', icon: '🌡️', cat: 'reveal', desc: 'Hold a thumb on it; watch it go off the chart',
  fields: [F.t('label', 'Instruction'), F.t('result', 'Result line')],
  defaults: () => ({ label: 'Hold your thumb here', result: 'Off the charts. As expected.' }),
  Render: ({ p }) => {
    const [v, setV] = useState(0); const t = useRef<any>(null);
    const start = () => { clearInterval(t.current); t.current = setInterval(() => setV((x) => { const n = x + 1.6; if (n >= 140) { clearInterval(t.current); sfx('win'); hearts(); } return Math.min(140, n); }), 25); };
    const stop = () => clearInterval(t.current);
    useEffect(() => () => clearInterval(t.current), []);
    return <div className="pc-meter"><div className="tube"><i style={{ height: Math.min(100, v / 1.0) + '%' }} /></div><b className="pct">{Math.round(v)}%</b><button className="thumb" onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onContextMenu={(e) => e.preventDefault()}>👍</button><small>{p.label}</small><Hidden open={v >= 140}><div className="pc-reveal">{p.result}</div></Hidden></div>;
  },
};

const LoveCalc: PieceDef = {
  type: 'lovecalc', label: 'Love calculator', icon: '🧮', cat: 'reveal', desc: 'Two names in, a (scientific) score out',
  fields: [F.t('a', 'Name 1'), F.t('b', 'Name 2'), F.t('score', 'Score'), F.t('result', 'Verdict')],
  defaults: () => ({ a: '{sender}', b: '{name}', score: '100', result: 'Science has spoken. Perfect match.' }),
  Render: ({ p }) => { const [v, setV] = useState<number | null>(null); return (
    <div className="pc-calc"><div className="names"><span>{p.a}</span><b>♥</b><span>{p.b}</span></div>
      {v == null ? <Btn onClick={() => { let n = 0; const target = parseInt(p.score) || 100; const id = setInterval(() => { n = Math.min(target, n + Math.ceil(Math.random() * 9)); setV(n); sfx('tap'); if (n >= target) { clearInterval(id); sfx('win'); hearts(); } }, 70); }}>Calculate ♥</Btn>
        : <><div className="score">{v}%</div>{v >= (parseInt(p.score) || 100) && <div className="pc-reveal">{p.result}</div>}</>}</div>); },
};

const Bubbles: PieceDef = {
  type: 'bubbles', label: 'Pop the bubbles', icon: '🫧', cat: 'reveal', desc: 'Pop every bubble; each holds a word',
  fields: [F.s('words', 'Words', 12), F.t('after', 'After all popped')],
  defaults: () => ({ words: ['kind', 'funny', 'brave', 'gorgeous', 'mine'], after: 'All of that, and so much more.' }),
  Render: ({ p }) => { const w = p.words || []; const s = useSequence(w.length); return (
    <div className="pc-bubbles"><div className="field">{w.map((x: string, i: number) => <button key={i} className={`bub ${s.done.includes(i) ? 'popped' : ''}`} style={{ left: 8 + ((i * 41) % 72) + '%', top: 8 + ((i * 29) % 62) + '%', animationDelay: `${i * 0.4}s` }} onClick={(e) => { if (s.hit(i)) { sfx('pop'); vibrate(); burst({ x: e.clientX, y: e.clientY, count: 12, emoji: ['💧'] }); } }}>{s.done.includes(i) ? x : ''}</button>)}</div>
      {s.all ? <div className="pc-reveal">{w.join(' · ')}<br />{p.after}</div> : <Hint>{w.length - s.done.length} bubbles to pop</Hint>}</div>); },
};

const Balloons: PieceDef = {
  type: 'balloons', label: 'Balloon pop', icon: '🎈', cat: 'reveal', desc: 'Balloons float up — pop each for a message',
  fields: [F.s('items', 'Messages', 10), F.t('after', 'After all popped')],
  defaults: () => ({ items: ['Happy', 'Birthday', 'to the', 'best human', 'ever!'], after: 'Now go eat cake 🎂' }),
  Render: ({ p }) => { const it = p.items || []; const s = useSequence(it.length); const cols = ['#ff6b8b', '#ffd166', '#06d6a0', '#4cc9f0', '#b388ff', '#ff9f68']; return (
    <div className="pc-balloons"><div className="sky">{it.map((x: string, i: number) => s.done.includes(i) ? <span key={i} className="word" style={{ left: 6 + (i * 88) / Math.max(1, it.length) + '%' }}>{x}</span> :
      <button key={i} className="bal" style={{ left: 6 + (i * 88) / Math.max(1, it.length) + '%', background: cols[i % cols.length], animationDelay: `${i * 0.3}s` }} onClick={(e) => { s.hit(i); sfx('pop'); vibrate(20); confetti(e.currentTarget); }}><i /></button>)}</div>
      {s.all ? <div className="pc-reveal">{p.after}</div> : <Hint>pop the balloons</Hint>}</div>); },
};

const Stars: PieceDef = {
  type: 'stars', label: 'Memory sky', icon: '🌌', cat: 'reveal', desc: 'Tap twinkling stars to read memories', bare: true,
  fields: [F.t('title', 'Title'), F.s('items', 'Memories (one per star)', 15), F.t('after', 'After all stars')],
  defaults: () => ({ title: 'Every star is a memory', items: ['The first time you held my hand', 'Midnight maggi in the hostel', 'You, singing in the rain', 'That hug at the airport'], after: 'And a whole sky still waiting for us.' }),
  Render: ({ p }) => { const it = p.items || []; const [o, setO] = useState<number | null>(null); const [seen, setSeen] = useState<number[]>([]); return (
    <div className="pc-sky"><div className="tw" />{p.title && <h3>{p.title}</h3>}
      {it.map((_: any, i: number) => <button key={i} className={`st ${seen.includes(i) ? 'seen' : ''}`} style={{ left: 8 + ((i * 47) % 80) + '%', top: 22 + ((i * 31) % 55) + '%', animationDelay: `${i * 0.3}s` }} onClick={() => { setO(i); if (!seen.includes(i)) setSeen([...seen, i]); sfx('tap'); }}>★</button>)}
      <div className="msg">{o != null ? <span key={o}>{it[o]}</span> : 'tap a star'}</div>
      {seen.length === it.length && it.length > 0 && <div className="after">{p.after}</div>}</div>); },
};

const Hug: PieceDef = {
  type: 'hug', label: 'Hold for a hug', icon: '🤗', cat: 'reveal', desc: 'Hold the button; the hug gets tighter',
  fields: [F.t('label', 'Instruction'), F.ta('message', 'After the hug')],
  defaults: () => ({ label: 'Hold to get a hug', message: 'Sent you the tightest hug. Refill anytime.' }),
  Render: ({ p }) => {
    const [v, setV] = useState(0); const t = useRef<any>(null); const done = v >= 100;
    const start = () => { clearInterval(t.current); t.current = setInterval(() => setV((x) => { const n = Math.min(100, x + 2); if (n >= 100) { clearInterval(t.current); sfx('win'); hearts(); vibrate([30, 30, 60]); } return n; }), 30); };
    const stop = () => { clearInterval(t.current); };
    return <div className="pc-hug"><div className="bears" style={{ gap: `${(100 - v) * 0.6}px` }}><span style={{ transform: `rotate(${v / 8}deg)` }}>🧸</span><span style={{ transform: `rotate(${-v / 8}deg) scaleX(-1)` }}>🧸</span></div>{done && <div className="h">💞</div>}
      {!done && <button className="pc-btn" onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onContextMenu={(e) => e.preventDefault()}>{p.label} · {v}%</button>}<Hidden open={done}><div className="pc-reveal"><Para text={p.message} /></div></Hidden></div>;
  },
};

export const REVEAL: PieceDef[] = [SwipeDeck, ThisOrThat, TapCounter, Shake, Passcode, HoldReveal, Scratch, GiftBox, OpenWhen, Jar, FortuneCookie, Oracle, Magic8, LoveMeter, LoveCalc, Bubbles, Balloons, Stars, Hug];
