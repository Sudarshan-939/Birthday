import React, { useEffect, useRef, useState } from 'react';
import { PieceDef, F, H, Hint, Btn, Para, Hidden, useSequence } from './core';
import { sfx } from '../lib/audio';
import { confetti, hearts, burst } from '../lib/fx';
import { vibrate } from '../lib/util';

// Every desi special: a little scene, a set of lines revealed one by one, and a finale.
const base = (title: string, lines: string[], final: string) => ({ title, lines, final });
const fields = (linesLabel: string, max = 8) => [F.t('title', 'Title'), F.s('lines', linesLabel, max), F.ta('final', 'Final message')];

function Finale({ show, text, emoji }: { show: boolean; text: string; emoji?: string }) {
  return <Hidden open={show}><div className="pc-reveal">{emoji && <div style={{ fontSize: 44 }}>{emoji}</div>}<Para text={text} /></div></Hidden>;
}
function LineShow({ text, k }: { text?: string; k: any }) {
  return <div className="desi-line" key={k}>{text || '\u00a0'}</div>;
}

const Cooker: PieceDef = {
  type: 'cooker', label: 'Cooker ki seeti', icon: '♨️', cat: 'desi', desc: 'Every whistle blows out one of your lines, then the lid pops',
  fields: fields('One line per whistle', 5), defaults: () => base('Teen seeti surprise', ['Seeti 1: you are the best thing in my life', 'Seeti 2: even better than Maa ke rajma', 'Seeti 3: okay, equal to Maa ke rajma'], 'Lid pops… inside: my whole heart, fully cooked ♡'),
  Render: ({ p }) => { const L = p.lines || []; const [n, setN] = useState(0); const [steam, setSteam] = useState(false); const done = n >= L.length && L.length > 0; return (
    <div className="pc-desi pc-cooker"><H>{p.title}</H><div className={`cooker ${steam ? 'whistle' : ''} ${done ? 'popped' : ''}`} onClick={(e) => { if (done || steam) return; setSteam(true); sfx('pop'); vibrate([60, 30, 60]); setTimeout(() => { setSteam(false); setN(n + 1); if (n + 1 >= L.length) { sfx('win'); confetti(e.currentTarget); } }, 900); }}><div className="lid">{done ? '💝' : ''}</div><div className="pot">🍲</div><div className="steam">💨</div></div>
      <LineShow text={L[n - 1]} k={n} />{!done && <Hint>tap the cooker · {n} / {L.length} seeti</Hint>}<Finale show={done} text={p.final} /></div>); },
};

const Golgappa: PieceDef = {
  type: 'golgappa', label: 'Golgappa plate', icon: '🥟', cat: 'desi', desc: 'Puris with sweet lines, and one teekha roast',
  fields: [F.t('title', 'Title'), F.s('lines', 'Sweet lines (one per puri)', 7), F.t('teekha', 'The teekha roast'), F.ta('final', 'Final message')],
  defaults: () => ({ title: 'Golgappa challenge', lines: ['You are sweeter than meetha paani', 'Your smile > extra aloo', 'You never steal my last puri (mostly)', 'You are my favourite chaat partner', 'Bhaiya, ek aur — of you'], teekha: 'TEEKHA: You still owe me ₹40 from last time 😤', final: 'Plate khatam. Pyaar nahi ♡' }),
  Render: ({ p }) => { const L = [...(p.lines || []), p.teekha]; const s = useSequence(L.length); const cur = s.last; return (
    <div className="pc-desi pc-golgappa"><H>{p.title}</H><div className="plate">{L.map((_: any, i: number) => <button key={i} className={`puri ${s.done.includes(i) ? 'eaten' : ''}`} onClick={(e) => { if (s.hit(i)) { sfx('pop'); vibrate(i === L.length - 1 ? [80, 40, 80] : 15); if (i === L.length - 1) burst({ x: e.clientX, y: e.clientY, count: 30, emoji: ['🌶️', '🔥'] }); } }}>🥟</button>)}</div>
      <LineShow text={cur != null ? L[cur] : ''} k={cur} />{!s.all ? <Hint>{L.length - s.done.length} puris left — one is teekha!</Hint> : null}<Finale show={s.all} text={p.final} /></div>); },
};

const Carrom: PieceDef = {
  type: 'carrom', label: 'Carrom board', icon: '🎯', cat: 'desi', desc: 'Sink the coins, each one a line; the queen opens your note',
  fields: fields('One line per coin', 6), defaults: () => base('Sunday carrom club', ['You are my favourite opponent', 'You cheat, and I let you', 'Best Sundays are with you'], 'Queen covered! The prize: me, forever 👑'),
  Render: ({ p }) => { const L = p.lines || []; const s = useSequence(L.length + 1); const pos = [[30, 35], [65, 30], [40, 68], [70, 66], [22, 60], [55, 50]]; return (
    <div className="pc-desi pc-carrom"><H>{p.title}</H><div className="board"><i className="pk a" /><i className="pk b" /><i className="pk c" /><i className="pk d" />
      {L.map((_: any, i: number) => !s.done.includes(i) && <button key={i} className={`coin ${i % 2 ? 'w' : 'b'}`} style={{ left: pos[i % 6][0] + '%', top: pos[i % 6][1] + '%' }} onClick={() => { s.hit(i); sfx('pop'); vibrate(15); }} />)}
      {!s.done.includes(L.length) && <button className="coin q" style={{ left: '48%', top: '46%' }} onClick={(e) => { if (s.done.length < L.length) { vibrate([20, 20]); return; } s.hit(L.length); sfx('win'); confetti(e.currentTarget); }} />}</div>
      <LineShow text={s.last != null && s.last < L.length ? L[s.last] : ''} k={s.last} />{!s.all && <Hint>{s.done.length < L.length ? 'tap the coins to pocket them' : 'now the queen!'}</Hint>}<Finale show={s.all} text={p.final} /></div>); },
};

const Lucky: PieceDef = {
  type: 'luckyticket', label: 'Lucky ticket', icon: '🎰', cat: 'desi', desc: 'Scratch squares that each hide a prize',
  fields: [F.t('title', 'Ticket name'), F.s('lines', 'Prizes', 6), F.t('jackpot', 'Jackpot'), F.ta('final', 'Final message')],
  defaults: () => ({ title: 'Kismat ka ticket · Draw no. 143', lines: ['A lifetime supply of my bad jokes', 'Unlimited midnight talks', 'A front-row seat to my happy moments'], jackpot: 'JACKPOT: me. No tax, no terms and conditions.', final: 'Congratulations, you won the lottery (it was me).' }),
  Render: ({ p }) => { const L = [...(p.lines || []), p.jackpot]; const s = useSequence(L.length); return (
    <div className="pc-desi pc-lucky"><div className="tk"><b>{p.title}</b><div className="grid">{L.map((x: string, i: number) => <button key={i} className={`sq ${s.done.includes(i) ? 'open' : ''} ${i === L.length - 1 ? 'jp' : ''}`} onClick={(e) => { if (i === L.length - 1 && s.done.length < L.length - 1) { vibrate([20, 20]); return; } if (s.hit(i)) { sfx(i === L.length - 1 ? 'win' : 'pop'); if (i === L.length - 1) confetti(e.currentTarget); } }}>{s.done.includes(i) ? x : i === L.length - 1 ? 'Scratch the jackpot' : 'scratch'}</button>)}</div></div><Finale show={s.all} text={p.final} /></div>); },
};

const Torch: PieceDef = {
  type: 'torch', label: 'Light gayi!', icon: '🔦', cat: 'desi', desc: 'Power cut! Move the torch to find your notes', bare: true,
  fields: fields('Hidden notes', 5), defaults: () => base('Light gayi! Find 3 notes in the dark', ['Even in the dark, you shine', 'Scared? I am right here', 'Inverter is down, love is not'], 'Light aa gayi! And you are still the brightest thing here 💡'),
  Render: ({ p }) => {
    const L = p.lines || []; const box = useRef<HTMLDivElement>(null); const [t, setT] = useState({ x: 50, y: 50 }); const s = useSequence(L.length); const pos = [[20, 25], [75, 35], [40, 75], [80, 78], [15, 70]];
    const mv = (e: React.PointerEvent) => { const r = box.current!.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width) * 100, y = ((e.clientY - r.top) / r.height) * 100; setT({ x, y }); L.forEach((_: any, i: number) => { if (Math.hypot(pos[i % 5][0] - x, pos[i % 5][1] - y) < 9 && s.hit(i)) { sfx('pop'); vibrate(20); } }); };
    useEffect(() => { if (s.all) { sfx('win'); confetti(box.current); } }, [s.all]);
    return <div ref={box} className={`pc-torch ${s.all ? 'lit' : ''}`} onPointerMove={mv} onPointerDown={mv} style={{ ['--tx' as any]: t.x + '%', ['--ty' as any]: t.y + '%' }}>
      <div className="title">{p.title}</div>{L.map((x: string, i: number) => <div key={i} className={`nt ${s.done.includes(i) ? 'found' : ''}`} style={{ left: pos[i % 5][0] + '%', top: pos[i % 5][1] + '%' }}>✉️<span>{x}</span></div>)}
      {!s.all && <div className="dark" />}{s.all && <div className="fin">{p.final}</div>}<small className="ct">{s.done.length} / {L.length} found</small></div>;
  },
};

const Kite: PieceDef = {
  type: 'kite', label: 'Kite fight', icon: '🪁', cat: 'desi', desc: 'Cut down kites named after bad days',
  fields: [F.t('title', 'Title'), F.s('kites', 'Bad days (one per kite)', 5), F.s('lines', 'A line with every win', 5), F.ta('final', 'Final message')],
  defaults: () => ({ title: 'Chhat pe patang', kites: ['Monday Blues', 'Overthinking', 'Bad Mood'], lines: ['Wo kaata! Monday, gone.', 'Overthinking: cut. You are enough.', 'Bad mood? Not on my terrace.'], final: 'Sky is clear. Only one kite left flying: us 🪁' }),
  Render: ({ p }) => { const K = p.kites || []; const s = useSequence(K.length); return (
    <div className="pc-desi pc-kite"><H>{p.title}</H><div className="sky">{K.map((k: string, i: number) => <button key={i} className={`kt ${s.done.includes(i) ? 'cut' : ''}`} style={{ left: 10 + (i * 75) / Math.max(1, K.length - 1 || 1) + '%', animationDelay: `${i * 0.5}s` }} onClick={() => { if (s.hit(i)) { sfx('pop'); vibrate(20); } }}>🪁<small>{k}</small></button>)}<div className="mine">🪁</div></div>
      <LineShow text={s.last != null ? (p.lines || [])[s.last] : ''} k={s.last} />{!s.all && <Hint>tap a kite to cut it — "wo kaata!"</Hint>}<Finale show={s.all} text={p.final} /></div>); },
};

const Chai: PieceDef = {
  type: 'chai', label: 'Chai banao', icon: '☕', cat: 'desi', desc: 'Patti, adrak, elaichi, cheeni: a line with each',
  fields: [F.t('title', 'Title'), F.it('items', 'Ingredients', [F.t('name', 'Ingredient'), F.e('emoji', 'Emoji'), F.t('line', 'Line it stirs in')], 6), F.ta('final', 'Final message')],
  defaults: () => ({ title: 'Chai pe charcha', items: [{ name: 'Chai patti', emoji: '🍃', line: 'Strong, like you on Monday mornings' }, { name: 'Adrak', emoji: '🫚', line: 'A little spicy, just like your temper' }, { name: 'Elaichi', emoji: '🌿', line: 'The special thing that makes it you' }, { name: 'Cheeni', emoji: '🧂', line: 'And the sweetest part: you' }], final: 'One cutting chai, made with love. Come drink it with me ☕' }),
  Render: ({ p }) => { const I = p.items || []; const s = useSequence(I.length); return (
    <div className="pc-desi pc-chai"><H>{p.title}</H><div className="kulhad"><div className="fill" style={{ height: 20 + (s.done.length / Math.max(1, I.length)) * 70 + '%' }} />{s.all && <div className="steam">〰〰</div>}<span>🫖</span></div>
      <div className="ings">{I.map((x: any, i: number) => <button key={i} className={s.done.includes(i) ? 'in' : ''} onClick={() => { if (s.hit(i)) { sfx('pop'); if (s.done.length + 1 === I.length) { sfx('win'); hearts(); } } }}>{x.emoji} {x.name}</button>)}</div>
      <LineShow text={s.last != null ? I[s.last]?.line : ''} k={s.last} /><Finale show={s.all} text={p.final} /></div>); },
};

const Chuski: PieceDef = {
  type: 'chuski', label: 'Ice chuski', icon: '🍧', cat: 'desi', desc: 'Three flavours, a sweet line with each',
  fields: [F.t('title', 'Title'), F.it('items', 'Syrups', [F.t('name', 'Flavour'), F.c('color', 'Colour'), F.t('line', 'Line')], 5), F.ta('final', 'Final message')],
  defaults: () => ({ title: 'Ice chuski, extra syrup', items: [{ name: 'Kala khatta', color: '#5b2a6e', line: 'Tangy like our fights' }, { name: 'Rose', color: '#ff6f91', line: 'Pink like your cheeks when I tease you' }, { name: 'Mango', color: '#ffb627', line: 'Sweet like every summer with you' }], final: 'Brain freeze? No, just heart melt 🍧' }),
  Render: ({ p }) => { const I = p.items || []; const s = useSequence(I.length); return (
    <div className="pc-desi pc-chuski"><H>{p.title}</H><div className="ice">{s.done.map((i, k) => <i key={k} style={{ background: I[i]?.color, top: 10 + k * 22 + '%' }} />)}<span className="stick" /></div>
      <div className="ings">{I.map((x: any, i: number) => <button key={i} style={{ borderColor: x.color }} className={s.done.includes(i) ? 'in' : ''} onClick={() => { if (s.hit(i)) sfx('pop'); }}><span style={{ background: x.color }} />{x.name}</button>)}</div>
      <LineShow text={s.last != null ? I[s.last]?.line : ''} k={s.last} /><Finale show={s.all} text={p.final} /></div>); },
};

const Recharge: PieceDef = {
  type: 'recharge', label: 'Dil ka recharge', icon: '📶', cat: 'desi', desc: 'Recharge their heart with a lifetime love pack',
  fields: [F.t('title', 'Title'), F.it('plans', 'Plans', [F.t('name', 'Plan'), F.t('price', 'Price'), F.t('perks', 'Perks')], 4), F.ta('final', 'After recharge')],
  defaults: () => ({ title: 'Dil ka recharge — {name}', plans: [{ name: 'Daily Pyaar', price: '₹1 hug', perks: 'Unlimited good mornings' }, { name: 'Monthly Masti', price: '₹1 date', perks: 'Free roaming in my heart' }, { name: 'Lifetime Pack', price: '₹0, forever', perks: 'Unlimited love, no FUP, 5G hugs' }], final: 'Recharge successful! Validity: lifetime. Balance: infinite love 💯' }),
  Render: ({ p }) => { const P = p.plans || []; const [sel, setSel] = useState<number | null>(null); const [st, setSt] = useState(0); return (
    <div className="pc-desi pc-recharge"><div className="sim"><b>{p.title}</b><div className="sig">📶 <small>Pyaar Telecom 5G</small></div><div className="bal">Balance: <b>{st === 2 ? '∞' : '₹0.00'}</b></div></div>
      {st < 2 && P.map((x: any, i: number) => <div key={i} className={`plan ${sel === i ? 'on' : ''}`} onClick={() => { setSel(i); sfx('tap'); }}><div><b>{x.name}</b><small>{x.perks}</small></div><span>{x.price}</span></div>)}
      {st === 0 && sel != null && <Btn onClick={(e) => { setSt(1); sfx('tap'); setTimeout(() => { setSt(2); sfx('win'); confetti(); }, 1500); }}>Recharge now</Btn>}
      {st === 1 && <div className="proc">Processing… <span className="spin">⏳</span></div>}<Finale show={st === 2} text={p.final} emoji="✅" /></div>); },
};

const Cricket: PieceDef = {
  type: 'cricket', label: 'Player of the match', icon: '🏏', cat: 'desi', desc: 'Six balls, six shots and a trophy with their name',
  fields: [F.t('title', 'Title'), F.s('lines', 'A line for each shot', 6), F.t('trophy', 'Name on the trophy'), F.ta('final', 'Final message')],
  defaults: () => ({ title: 'Last over. 6 balls. You need 36.', lines: ['SIX! That is for your smile', 'SIX! For putting up with me', 'SIX! For your terrible jokes (I love them)', 'SIX! For the way you care', 'SIX! For being you', 'SIX! For winning my heart'], trophy: '{name}', final: 'Player of the match. Player of my life. 🏆' }),
  Render: ({ p }) => { const L = p.lines || []; const [n, setN] = useState(0); const [hit, setHit] = useState(false); const done = n >= L.length && L.length > 0; return (
    <div className="pc-desi pc-cricket"><H>{p.title}</H><div className="pitch"><div className="score">{n * 6} / 0 <small>({n} balls)</small></div><span className={`ball ${hit ? 'hit' : ''}`}>🏏</span>{hit && <span className="six">6</span>}</div>
      {!done && <Btn onClick={(e) => { if (hit) return; setHit(true); sfx('pop'); vibrate(30); setTimeout(() => { setHit(false); setN(n + 1); if (n + 1 >= L.length) { sfx('win'); confetti(); } }, 700); }}>Swing! 🏏</Btn>}
      <LineShow text={L[n - 1]} k={n} />{done && <div className="trophy">🏆<b>{p.trophy}</b></div>}<Finale show={done} text={p.final} /></div>); },
};

const Radio: PieceDef = {
  type: 'radio', label: 'FM dedication', icon: '📻', cat: 'desi', desc: 'Turn the dial; every station plays a dedication',
  fields: [F.t('title', 'Title'), F.it('stations', 'Stations', [F.t('freq', 'Frequency'), F.t('line', 'Dedication')], 6), F.ta('final', 'Final message')],
  defaults: () => ({ title: 'Dil Se FM — request show', stations: [{ freq: '91.1', line: '"Ye gaana jaata hai {name} ke liye, from someone who cannot stop smiling."' }, { freq: '93.5', line: '"Next caller says: you are the reason the sun comes up."' }, { freq: '98.3', line: '"Weather update: 100% chance of hugs tonight."' }, { freq: '104.8', line: '"And our top song this week: your laugh, on repeat."' }], final: 'You have been listening to {sender} FM. Never switch off ♡' }),
  Render: ({ p }) => { const S = p.stations || []; const [i, setI] = useState(-1); const s = useSequence(S.length); return (
    <div className="pc-desi pc-radio"><div className="set"><div className="spk">{Array.from({ length: 30 }, (_, k) => <i key={k} />)}</div><div className="scale"><div className="needle" style={{ left: (i < 0 ? 4 : 10 + (i * 80) / Math.max(1, S.length - 1 || 1)) + '%' }} />{S.map((x: any, k: number) => <small key={k}>{x.freq}</small>)}</div>
      <button className="dial" style={{ transform: `rotate(${(i + 1) * 70}deg)` }} onClick={() => { const n = (i + 1) % S.length; setI(n); s.hit(n); sfx('tap'); }} /></div><b>{p.title}</b>
      <div className="desi-line" key={i}>{i >= 0 ? <><small>📻 {S[i].freq} FM</small><br />{S[i].line}</> : 'turn the dial →'}</div><Finale show={s.all} text={p.final} /></div>); },
};

const Tota: PieceDef = {
  type: 'tota', label: 'Tota fortune', icon: '🦜', cat: 'desi', desc: 'A parrot picks three cards that tell their future',
  fields: fields('Fortunes (parrot picks one at a time)', 6), defaults: () => base('Tota bole — your future', ['Card 1: A big promotion… in my heart', 'Card 2: Travel is coming. With me. Pack snacks.', 'Card 3: Someone will love you forever. Spoiler: me.'], 'Mithu has spoken. 100% accurate, no refunds 🦜'),
  Render: ({ p }) => { const L = p.lines || []; const [n, setN] = useState(0); const [busy, setBusy] = useState(false); const done = n >= L.length && L.length > 0; return (
    <div className="pc-desi pc-tota"><H>{p.title}</H><div className="cage"><span className={`bird ${busy ? 'peck' : ''}`}>🦜</span><div className="cards">{L.map((_: any, i: number) => <i key={i} className={i < n ? 'gone' : ''} />)}</div></div>
      {!done && <Btn onClick={() => { if (busy) return; setBusy(true); sfx('tap'); setTimeout(() => { setBusy(false); setN(n + 1); sfx(n + 1 >= L.length ? 'win' : 'pop'); }, 900); }}>Mithu, pick a card</Btn>}
      <LineShow text={L[n - 1]} k={n} /><Finale show={done} text={p.final} /></div>); },
};

const DahiHandi: PieceDef = {
  type: 'dahihandi', label: 'Dahi handi', icon: '🏺', cat: 'desi', desc: 'Build the pyramid, break the handi, find the makhan',
  fields: fields('A line for each level', 4), defaults: () => base('Dahi handi todo!', ['Level 1: strong base, like our friendship', 'Level 2: higher, like my love for you', 'Level 3: almost there, like my patience'], 'Handi phooti! Inside: makhan, mishri, and me 🧈'),
  Render: ({ p }) => { const L = p.lines || []; const [n, setN] = useState(0); const [broke, setBroke] = useState(false); const ready = n >= L.length; return (
    <div className="pc-desi pc-handi"><H>{p.title}</H><div className="scene"><div className={`handi ${broke ? 'broke' : ''}`} onClick={(e) => { if (!ready || broke) return; setBroke(true); sfx('win'); vibrate(80); burst({ x: e.clientX, y: e.clientY, count: 60, emoji: ['🧈', '🥛', '✨'] }); }}>🏺</div>
      <div className="pyr">{Array.from({ length: n }, (_, k) => <div key={k} className="lvl" style={{ width: (100 - k * 22) + '%' }}>{'🧍'.repeat(Math.max(1, 4 - k))}</div>).reverse()}</div></div>
      {!ready ? <Btn onClick={() => { setN(n + 1); sfx('pop'); vibrate(20); }}>Add a level ({n}/{L.length})</Btn> : !broke && <Hint>now tap the handi!</Hint>}
      <LineShow text={L[n - 1]} k={n} /><Finale show={broke} text={p.final} /></div>); },
};

const Meter: PieceDef = {
  type: 'meter', label: 'Love meter ride', icon: '🛺', cat: 'desi', desc: 'Hop in; the meter ticks at every place you love',
  fields: [F.t('title', 'Title'), F.it('stops', 'Stops', [F.t('place', 'Place'), F.t('line', 'Memory')], 6), F.ta('final', 'Final fare')],
  defaults: () => ({ title: 'Pyaar ka meter, chalu', stops: [{ place: 'College gate', line: 'Where you first ignored me' }, { place: 'Chai tapri', line: 'Two cuttings, one umbrella' }, { place: 'Marine drive', line: 'Where I almost said it' }, { place: 'Your doorstep', line: 'Where I finally did' }], final: 'Fare: one lifetime. Paid in full ♡' }),
  Render: ({ p }) => { const S = p.stops || []; const [n, setN] = useState(0); const [moving, setMoving] = useState(false); const done = n >= S.length && S.length > 0; return (
    <div className="pc-desi pc-meter2"><H>{p.title}</H><div className="road"><span className={`auto ${moving ? 'go' : ''}`} style={{ left: (n / Math.max(1, S.length)) * 80 + '%' }}>🛺</span>{S.map((s: any, i: number) => <i key={i} className={i < n ? 'on' : ''} style={{ left: ((i + 1) / S.length) * 80 + 5 + '%' }} title={s.place} />)}</div>
      <div className="mtr">₹ {(n * 143).toString().padStart(4, '0')}</div>
      {!done && <Btn onClick={() => { if (moving) return; setMoving(true); sfx('tap'); setTimeout(() => { setMoving(false); setN(n + 1); sfx(n + 1 >= S.length ? 'win' : 'pop'); if (n + 1 >= S.length) confetti(); }, 1000); }}>{n === 0 ? 'Chalo bhaiya!' : 'Next stop'}</Btn>}
      {n > 0 && <div className="desi-line" key={n}><b>📍 {S[n - 1].place}</b><br />{S[n - 1].line}</div>}<Finale show={done} text={p.final} /></div>); },
};

const Tiffin: PieceDef = {
  type: 'tiffin', label: 'Tiffin dabba', icon: '🍱', cat: 'desi', desc: 'Open a steel tiffin, one tier at a time',
  fields: [F.t('title', 'Title'), F.it('tiers', 'Tiers', [F.t('food', 'Food (emoji + name)'), F.t('line', 'Line')], 4), F.ta('final', 'Final message')],
  defaults: () => ({ title: 'Teen dabba tiffin, packed with love', tiers: [{ food: '🍛 Dal chawal', line: 'Comfort, like your voice on a bad day' }, { food: '🫓 Garam roti', line: 'Warm, like your hugs' }, { food: '🍬 Gulab jamun', line: 'Sweet, like you (don\'t let it go to your head)' }], final: 'Finish everything. Maa said so. And I love you 🍱' }),
  Render: ({ p }) => { const T = p.tiers || []; const [n, setN] = useState(0); const done = n >= T.length && T.length > 0; return (
    <div className="pc-desi pc-tiffin"><H>{p.title}</H><div className="stack">{T.map((t: any, i: number) => <div key={i} className={`tier ${i < n ? 'open' : ''}`} onClick={() => { if (i === n) { setN(n + 1); sfx(n + 1 >= T.length ? 'win' : 'open'); if (n + 1 >= T.length) hearts(); } }}>{i < n ? <span>{t.food}</span> : i === n ? 'tap to open' : ''}</div>)}<div className="handle" /></div>
      <LineShow text={T[n - 1]?.line} k={n} /><Finale show={done} text={p.final} /></div>); },
};

const Filmy: PieceDef = {
  type: 'filmy', label: 'Filmy trailer', icon: '🎥', cat: 'desi', desc: 'A filmy trailer starring them, with your dialogues', bare: true,
  fields: [F.t('title', 'Film title'), F.s('lines', 'Trailer cards / dialogues', 8), F.t('starring', 'Starring'), F.t('release', 'Release line')],
  defaults: () => ({ title: 'PICTURE ABHI BAAKI HAI', lines: ['In a world full of ordinary people…', 'one person dared to be extraordinary.', '"Bade bade shehron mein, aisi chhoti chhoti baatein…"', 'This year, witness the story of…'], starring: '{name}', release: 'In cinemas near my heart. Forever.' }),
  Render: ({ p }) => { const L = p.lines || []; const [i, setI] = useState(-1); useEffect(() => { if (i < 0 || i > L.length) return; const t = setTimeout(() => setI(i + 1), 2600); return () => clearTimeout(t); }, [i, L.length]); return (
    <div className="pc-filmy" onClick={() => { if (i < 0) { setI(0); sfx('open'); } }}><div className="bars t" /><div className="bars b" />
      {i < 0 && <div className="card"><b>▶</b><small>tap to play the trailer</small></div>}
      {i >= 0 && i < L.length && <div className="card" key={i}>{L[i]}</div>}
      {i === L.length && <div className="card big" key="t"><small>starring</small><b>{p.starring}</b></div>}
      {i > L.length && <div className="card big" key="e"><b className="ttl">{p.title}</b><small>{p.release}</small><button className="pc-btn ghost" onClick={(e) => { e.stopPropagation(); setI(0); }}>Replay</button></div>}</div>); },
};

export const DESI: PieceDef[] = [Cooker, Golgappa, Carrom, Lucky, Torch, Kite, Chai, Chuski, Recharge, Cricket, Radio, Tota, DahiHandi, Meter, Tiffin, Filmy];
