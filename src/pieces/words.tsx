import React, { useEffect, useRef, useState } from 'react';
import { PieceDef, F, H, Hint, Btn, Para, Img, useTypewriter, useInView, Hidden, DEMO } from './core';
import { sfx } from '../lib/audio';
import { confetti, hearts } from '../lib/fx';
import { lines } from '../lib/util';

const Heading: PieceDef = {
  type: 'heading', label: 'Heading', icon: '🔤', cat: 'words', desc: 'A big title with a little line under it', bare: true,
  fields: [F.t('title', 'Title'), F.t('subtitle', 'Line under it'), F.sel('align', 'Align', [['center', 'Center'], ['left', 'Left']]), F.sel('size', 'Size', [['l', 'Large'], ['xl', 'Huge'], ['m', 'Medium']])],
  defaults: () => ({ title: 'Happy Birthday, {name}!', subtitle: 'a little something, made by hand', align: 'center', size: 'l' }),
  Render: ({ p }) => (
    <div className={`pc-heading size-${p.size || 'l'}`} style={{ textAlign: p.align || 'center' }}>
      <h1>{p.title}</h1>
      {p.subtitle && <p>{p.subtitle}</p>}
    </div>
  ),
};

const Text: PieceDef = {
  type: 'text', label: 'Words', icon: '✍️', cat: 'words', desc: 'A paragraph in your own words',
  fields: [F.ta('text', 'Text', 'Leave a blank line between paragraphs.'), F.sel('align', 'Align', [['left', 'Left'], ['center', 'Center']]), F.sel('style', 'Style', [['normal', 'Normal'], ['big', 'Big & bold'], ['hand', 'Handwritten']])],
  defaults: () => ({ text: 'Some people make the world softer just by being in it. You are one of them.', align: 'center', style: 'normal' }),
  Render: ({ p }) => <div className={`pc-text style-${p.style}`} style={{ textAlign: p.align }}><Para text={p.text} /></div>,
};

const Letter: PieceDef = {
  type: 'letter', label: 'Letter', icon: '💌', cat: 'words', desc: 'A letter on paper that types itself',
  fields: [F.t('greeting', 'Greeting'), F.ta('body', 'Letter', 'Leave a blank line between paragraphs.'), F.t('highlight', 'Highlighted line'), F.s('notes', 'Sticky notes', 4), F.t('closing', 'Closing'), F.t('signature', 'Signature'),
    F.sel('paper', 'Paper', [['lined', 'Lined'], ['plain', 'Plain'], ['kraft', 'Kraft'], ['grid', 'Grid'], ['parchment', 'Parchment'], ['night', 'Night']]), F.b('typewriter', 'Type it out letter by letter')],
  defaults: () => ({ greeting: 'Dear {name},', body: "I tried to fit everything I feel into a card and it didn't fit, so I made you this instead.\n\nThank you for every laugh, every late-night talk, and every time you stayed when it would have been easier to go.", highlight: 'You are my favourite person.', notes: ['you + me = ♡'], closing: 'Always yours,', signature: '{sender}', paper: 'lined', typewriter: true }),
  Render: ({ p, ctx }) => {
    const [ref, seen] = useInView<HTMLDivElement>(0.2);
    const typed = useTypewriter(p.body || '', 22, !!p.typewriter && seen && !ctx.editing);
    const body = p.typewriter && !ctx.editing ? typed : p.body;
    const done = !p.typewriter || ctx.editing || typed.length >= (p.body || '').length;
    return (
      <div ref={ref} className={`pc-letter paper-${p.paper || 'lined'}`}>
        {(p.notes || []).filter(Boolean).map((n: string, i: number) => <div key={i} className="pc-sticky" style={{ transform: `rotate(${i % 2 ? 4 : -5}deg)`, right: i % 2 ? 'auto' : -8, left: i % 2 ? -8 : 'auto', top: -14 + i * 70 }}>{n}</div>)}
        <div className="pc-letter-greet">{p.greeting}</div>
        <div className="pc-letter-body"><Para text={body} />{!done && <span className="caret">|</span>}</div>
        {done && p.highlight && <div className="pc-letter-hl">{p.highlight}</div>}
        {done && <div className="pc-letter-sign"><div>{p.closing}</div><div className="sig">{p.signature}</div></div>}
      </div>
    );
  },
};

const Envelope: PieceDef = {
  type: 'envelope', label: 'Envelope letter', icon: '✉️', cat: 'words', desc: 'A sealed envelope they tap open', bare: true,
  fields: [F.t('front', 'On the envelope'), F.t('seal', 'Seal emoji'), F.ta('letter', 'Letter inside'), F.t('signature', 'Signed')],
  defaults: () => ({ front: 'For {name}', seal: '💗', letter: 'If you are reading this, it means you opened my heart again. Please be careful with it, it only knows how to love you.', signature: '— {sender}' }),
  Render: ({ p }) => {
    const [open, setOpen] = useState(false);
    return (
      <div className={`pc-env ${open ? 'open' : ''}`} onClick={(e) => { if (!open) { setOpen(true); sfx('open'); hearts(e.currentTarget); } }}>
        <div className="pc-env-back" />
        <div className="pc-env-paper"><Para text={p.letter} /><div className="sig">{p.signature}</div></div>
        <div className="pc-env-front"><span>{p.front}</span></div>
        <div className="pc-env-flap" />
        <div className="pc-env-seal">{p.seal || '💗'}</div>
        {!open && <Hint>tap to open</Hint>}
      </div>
    );
  },
};

const Chat: PieceDef = {
  type: 'chat', label: 'Chat', icon: '💬', cat: 'words', desc: 'A chat that plays out like real messages',
  fields: [F.t('contact', 'Contact name'), F.t('status', 'Status line'), F.it('messages', 'Messages', [F.sel('from', 'Who', [['them', 'Them (left)'], ['me', 'Me (right)']]), F.t('text', 'Message')], 30), F.b('autoplay', 'Play messages one by one')],
  defaults: () => ({ contact: '{name} ♡', status: 'online', autoplay: true, messages: [
    { from: 'me', text: 'hey, you awake?' }, { from: 'them', text: 'always for you' }, { from: 'me', text: 'I just wanted to say...' }, { from: 'me', text: 'you make my days better 🥺' }, { from: 'them', text: 'stoppp 🙈' }, { from: 'them', text: 'you too, idiot ♡' }] }),
  Render: ({ p, ctx }) => {
    const [ref, seen] = useInView<HTMLDivElement>(0.3);
    const msgs = p.messages || [];
    const [n, setN] = useState(p.autoplay && !ctx.editing ? 0 : msgs.length);
    useEffect(() => {
      if (!p.autoplay || ctx.editing) { setN(msgs.length); return; }
      if (!seen || n >= msgs.length) return;
      const t = setTimeout(() => { setN(n + 1); sfx('pop'); }, n === 0 ? 400 : 900);
      return () => clearTimeout(t);
    }, [seen, n, msgs.length, p.autoplay, ctx.editing]);
    return (
      <div ref={ref} className="pc-chat">
        <div className="pc-chat-top"><div className="av">{(p.contact || '?').slice(0, 1)}</div><div><b>{p.contact}</b><small>{p.status}</small></div></div>
        <div className="pc-chat-body">
          {msgs.slice(0, n).map((m: any, i: number) => <div key={i} className={`bubble ${m.from === 'me' ? 'me' : 'them'}`}>{m.text}</div>)}
          {n < msgs.length && seen && <div className={`bubble typing ${msgs[n]?.from === 'me' ? 'me' : 'them'}`}><i /><i /><i /></div>}
        </div>
      </div>
    );
  },
};

const Quote: PieceDef = {
  type: 'quote', label: 'Quote', icon: '❝', cat: 'words', desc: 'A big quote or line that matters',
  fields: [F.ta('text', 'Quote'), F.t('by', 'Said by')],
  defaults: () => ({ text: 'In a room full of people, my eyes will always look for you.', by: '' }),
  Render: ({ p }) => <figure className="pc-quote"><blockquote>“{p.text}”</blockquote>{p.by && <figcaption>— {p.by}</figcaption>}</figure>,
};

const Reasons: PieceDef = {
  type: 'reasons', label: 'Reasons list', icon: '💯', cat: 'words', desc: 'Reasons why, appearing one by one',
  fields: [F.t('title', 'Title'), F.s('items', 'Reasons', 100), F.sel('style', 'Style', [['hearts', 'Hearts'], ['numbered', 'Numbered'], ['cards', 'Cards']])],
  defaults: () => ({ title: 'Reasons I love you', style: 'numbered', items: ['The way you laugh at your own jokes', 'How you remember tiny things', 'Your terrible singing in the car', 'You make home feel like a person', 'Everything else, honestly'] }),
  Render: ({ p }) => {
    const [ref, seen] = useInView<HTMLDivElement>(0.2);
    return (
      <div ref={ref} className={`pc-reasons style-${p.style}`}>
        <H>{p.title}</H>
        <ol>{(p.items || []).map((r: string, i: number) => <li key={i} style={{ animationDelay: seen ? `${i * 0.18}s` : '0s' }} className={seen ? 'in' : ''}><span className="n">{p.style === 'hearts' ? '♥' : i + 1}</span><span>{r}</span></li>)}</ol>
      </div>
    );
  },
};

const Promises: PieceDef = {
  type: 'promises', label: 'Promises', icon: '🤞', cat: 'words', desc: 'Promises they tick, then tap to accept',
  fields: [F.t('title', 'Title'), F.s('items', 'Promises', 12), F.t('accept', 'Tap-to-accept line'), F.t('after', 'After accepting')],
  defaults: () => ({ title: 'My promises to you', items: ['I will always share my fries', 'I will listen, even to the long stories', 'I will be your loudest cheerleader', 'I will never stop choosing you'], accept: 'I accept these promises ♡', after: 'Signed, sealed, forever.' }),
  Render: ({ p }) => {
    const [ok, setOk] = useState(false);
    const [tick, setTick] = useState<number[]>([]);
    return (
      <div className="pc-promises">
        <H>{p.title}</H>
        <ul>{(p.items || []).map((x: string, i: number) => <li key={i} className={tick.includes(i) ? 'on' : ''} onClick={() => { sfx('tap'); setTick((t) => t.includes(i) ? t.filter((y) => y !== i) : [...t, i]); }}><span className="box">{tick.includes(i) ? '✓' : ''}</span>{x}</li>)}</ul>
        {!ok ? <Btn onClick={(e) => { setOk(true); sfx('win'); hearts(e.currentTarget); }}>{p.accept}</Btn> : <div className="pc-stamp">{p.after}</div>}
      </div>
    );
  },
};

const Agreement: PieceDef = {
  type: 'agreement', label: 'Official agreement', icon: '📜', cat: 'words', desc: 'A funny agreement they sign with a finger',
  fields: [F.t('title', 'Title'), F.s('clauses', 'Clauses', 12), F.t('signLabel', 'Sign line'), F.t('after', 'After signing')],
  defaults: () => ({ title: 'The Official Birthday Agreement', clauses: ['The birthday person shall eat the biggest slice of cake.', 'All bad moods are hereby cancelled for 24 hours.', 'Hugs are mandatory and non-refundable.', '{sender} reserves the right to be the favourite person.'], signLabel: 'Sign here, {name}', after: 'Agreement legally binding (in our hearts).' }),
  Render: ({ p }) => {
    const cv = useRef<HTMLCanvasElement>(null);
    const [signed, setSigned] = useState(false);
    const drawing = useRef(false);
    const pos = (e: React.PointerEvent) => { const r = cv.current!.getBoundingClientRect(); return [(e.clientX - r.left) * (cv.current!.width / r.width), (e.clientY - r.top) * (cv.current!.height / r.height)]; };
    return (
      <div className="pc-agree">
        <div className="seal">📜</div>
        <H>{p.title}</H>
        <ol>{(p.clauses || []).map((c: string, i: number) => <li key={i}>{c}</li>)}</ol>
        <div className="pc-sign">
          <canvas ref={cv} width={600} height={180}
            onPointerDown={(e) => { drawing.current = true; const g = cv.current!.getContext('2d')!; const [x, y] = pos(e); g.beginPath(); g.moveTo(x, y); (e.target as any).setPointerCapture(e.pointerId); }}
            onPointerMove={(e) => { if (!drawing.current) return; const g = cv.current!.getContext('2d')!; g.lineWidth = 5; g.lineCap = 'round'; g.strokeStyle = getComputedStyle(cv.current!).color; const [x, y] = pos(e); g.lineTo(x, y); g.stroke(); }}
            onPointerUp={() => { drawing.current = false; }} />
          <div className="line">{p.signLabel}</div>
        </div>
        {!signed ? <Btn onClick={(e) => { setSigned(true); sfx('win'); confetti(e.currentTarget); }}>Sign & seal</Btn> : <div className="pc-stamp">✔ {p.after}</div>}
      </div>
    );
  },
};

const Wishes: PieceDef = {
  type: 'wishes', label: 'Typed wishes', icon: '⌨️', cat: 'words', desc: 'Lines that type themselves one after another',
  fields: [F.t('title', 'Title'), F.s('lines', 'Lines', 12)],
  defaults: () => ({ title: 'Wishing you…', lines: ['a year full of slow mornings', 'cake that never runs out', 'adventures that scare you a little', 'and me, annoying you forever'] }),
  Render: ({ p, ctx }) => {
    const [ref, seen] = useInView<HTMLDivElement>(0.3);
    const ls: string[] = p.lines || [];
    const [i, setI] = useState(0);
    const cur = useTypewriter(ls[i] || '', 40, seen && !ctx.editing);
    useEffect(() => { if (cur.length >= (ls[i] || '').length && i < ls.length - 1 && seen) { const t = setTimeout(() => setI(i + 1), 700); return () => clearTimeout(t); } }, [cur, i, seen]);
    const shown = ctx.editing ? ls : [...ls.slice(0, i), cur];
    return <div ref={ref} className="pc-wishes"><H>{p.title}</H>{shown.map((l, k) => <div key={k} className="w">✦ {l}{k === i && !ctx.editing && cur.length < (ls[i] || '').length && <span className="caret">|</span>}</div>)}</div>;
  },
};

const Counter: PieceDef = {
  type: 'counter', label: 'Live counter', icon: '⏱️', cat: 'words', desc: 'Time together (or until) — ticking live',
  fields: [F.sel('mode', 'Count', [['since', 'Time since a date'], ['until', 'Countdown to a date']]), F.dt('date', 'Date & time'), F.t('label', 'Label'), F.t('after', 'Line under it')],
  defaults: () => ({ mode: 'since', date: '2022-02-14T19:00', label: 'together and counting', after: 'and every second was worth it' }),
  Render: ({ p }) => {
    const [now, setNow] = useState(Date.now());
    useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
    const target = new Date(p.date).getTime();
    let diff = Math.max(0, Math.floor((p.mode === 'until' ? target - now : now - target) / 1000));
    if (isNaN(diff)) diff = 0;
    const parts = [['days', Math.floor(diff / 86400)], ['hours', Math.floor(diff / 3600) % 24], ['mins', Math.floor(diff / 60) % 60], ['secs', diff % 60]];
    return (
      <div className="pc-counter">
        <div className="row">{parts.map(([l, v]) => <div key={l as string} className="cell"><b>{String(v).padStart(2, '0')}</b><small>{l}</small></div>)}</div>
        <div className="lab">{p.label}</div>{p.after && <div className="after">{p.after}</div>}
      </div>
    );
  },
};

const Profile: PieceDef = {
  type: 'profile', label: 'Profile card', icon: '🪪', cat: 'words', desc: 'Their very own social profile',
  fields: [F.ph('photo', 'Profile photo'), F.t('name', 'Name'), F.t('handle', 'Handle'), F.ta('bio', 'Bio'), F.it('stats', 'Stats', [F.t('value', 'Number'), F.t('label', 'Label')], 4), F.s('tags', 'Tags', 8), F.b('verified', 'Verified tick')],
  defaults: () => ({ photo: DEMO(1).src, name: '{name}', handle: '@my.favourite.human', bio: 'Professional heart-stealer. Part-time chef, full-time cutie. Taken by {sender} ♡', stats: [{ value: '∞', label: 'hugs' }, { value: '1', label: 'girlfriend' }, { value: '100%', label: 'cute' }], tags: ['gamer', 'foodie', 'my person'], verified: true }),
  Render: ({ p }) => {
    const [follow, setFollow] = useState(false);
    return (
      <div className="pc-profile">
        <div className="cover" />
        <Img src={p.photo} className="av" />
        <div className="nm">{p.name} {p.verified && <span className="tick">✔</span>}</div>
        <div className="hd">{p.handle}</div>
        <div className="stats">{(p.stats || []).map((s: any, i: number) => <div key={i}><b>{s.value}</b><small>{s.label}</small></div>)}</div>
        <Para text={p.bio} className="bio" />
        <div className="tags">{(p.tags || []).map((t: string, i: number) => <span key={i}>#{t}</span>)}</div>
        <Btn onClick={(e) => { setFollow(!follow); if (!follow) hearts(e.currentTarget); }} ghost={follow}>{follow ? 'Following ♡' : 'Follow'}</Btn>
      </div>
    );
  },
};

const Poem: PieceDef = {
  type: 'poem', label: 'Poem', icon: '🪶', cat: 'words', desc: 'Lines that fade in like a poem',
  fields: [F.t('title', 'Title'), F.ta('text', 'Poem (one line per row)')],
  defaults: () => ({ title: 'For you', text: 'Of all the places I have been,\nthe best one is beside you.\nOf all the words I ever learned,\nmy favourite is your name.' }),
  Render: ({ p }) => {
    const [ref, seen] = useInView<HTMLDivElement>(0.3);
    return <div ref={ref} className="pc-poem"><H>{p.title}</H>{lines(p.text).map((l, i) => <div key={i} className={seen ? 'in' : ''} style={{ animationDelay: `${i * 0.6}s` }}>{l}</div>)}</div>;
  },
};

export const WORDS: PieceDef[] = [Heading, Text, Letter, Envelope, Chat, Quote, Reasons, Promises, Agreement, Wishes, Counter, Profile, Poem];
