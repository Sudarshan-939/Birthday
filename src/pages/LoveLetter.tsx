import React, { useEffect, useRef, useState } from 'react';
import { Header } from './common';
import { findTemplate, makeGift, page, pc } from '../templates';
import { saveGift } from '../lib/storage';
import { nav, parseHash } from '../lib/router';

const ASK = [
  { key: 'to', q: "Hi! I'll help you write it. Who is this letter for?", ph: 'Their name' },
  { key: 'from', q: 'And how do you sign your letters?', ph: 'Your name' },
  { key: 'mood', q: 'What kind of letter is it?', opts: ['Romantic', 'Thank you', 'Sorry', 'Missing you', 'Birthday'] },
  { key: 'memory', q: 'Tell me one memory with them that you go back to.', ph: 'That evening on the terrace when the power went out…' },
  { key: 'love', q: 'What do you love most about them?', ph: 'How they make everyone feel at home' },
  { key: 'unsaid', q: "Is there something you've never quite said out loud?", ph: "That you're the first person I want to tell everything" },
  { key: 'promise', q: 'Last one. A promise, or a wish for them?', ph: "I'll always save you the last bite" },
];
const OPEN: Record<string, string> = {
  Romantic: "I've started this letter a few times. Words feel too small for you, but I'm going to try.",
  'Thank you': "I don't say thank you enough, so I'm writing it down where it can't get lost.",
  Sorry: "I've been thinking about what to say, and I realised the most honest place to start is: I'm sorry.",
  'Missing you': "It's quiet without you. Quieter than I expected. So I'm writing to you instead.",
  Birthday: "Happy birthday! Before the cake and the noise, I wanted to give you something that lasts longer.",
};
const CLOSE: Record<string, [string, string]> = {
  Romantic: ['You are my favourite person.', 'Forever yours,'],
  'Thank you': ['Thank you for being exactly you.', 'With so much gratitude,'],
  Sorry: ['You matter more to me than being right.', 'Still yours, and sorry,'],
  'Missing you': ['Same sky, same moon, counting days.', 'Missing you always,'],
  Birthday: ['The world got luckier the day you arrived.', 'Happy birthday, with love,'],
};
const lc = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const PAPERS = [['lined', 'Lined'], ['plain', 'Plain'], ['kraft', 'Kraft'], ['grid', 'Grid'], ['parchment', 'Parchment'], ['night', 'Night']];
const SEALS = ['💗', '🌹', '💌', '🕊️', '⭐', '🌸', '🔐', '🧸'];

export default function LoveLetter() {
  const q0 = parseHash().query;
  const [ans, setAns] = useState<Record<string, string>>({ ...(q0.to ? { to: q0.to } : {}), ...(q0.from ? { from: q0.from } : {}) });
  const [input, setInput] = useState('');
  const [paper, setPaper] = useState('parchment');
  const [seal, setSeal] = useState('💗');
  const [body, setBody] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const idx = ASK.findIndex((x) => !(x.key in ans));
  const done = idx === -1;
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [idx, done]);
  useEffect(() => {
    if (!done) return;
    const m = ans.mood || 'Romantic';
    const parts = [OPEN[m] || OPEN.Romantic];
    if (ans.memory) parts.push(`I keep going back to ${lc(ans.memory)} I don't think you know how often I replay it.`);
    if (ans.love) parts.push(`What I love most about you is ${lc(ans.love)} You do it without even trying, and that's what makes it special.`);
    if (ans.unsaid) parts.push(`There's something I've never said properly, so here it is: ${lc(ans.unsaid)}`);
    if (ans.promise) parts.push(`And this is my promise: ${lc(ans.promise)}`);
    setBody(parts.map((p) => p.replace(/([^.!?])( I don't| You do)/, '$1.$2')).join('\n\n'));
  }, [done]);
  const answer = (v: string) => { if (idx < 0) return; setAns({ ...ans, [ASK[idx].key]: v.trim() }); setInput(''); };
  const create = async () => {
    const m = ans.mood || 'Romantic';
    const tpl = findTemplate('love-letter')!;
    const g = makeGift(tpl, { to: ans.to, from: ans.from });
    g.title = `A letter for ${ans.to || 'you'}`;
    g.theme = paper === 'night' ? 'midnight' : 'kraft';
    g.music.track = m === 'Sorry' ? 'sorry' : m === 'Missing you' ? 'stars' : m === 'Birthday' ? 'birthday' : 'thread';
    g.pages = [
      page('Envelope', pc('envelope', { front: 'For {name}', seal, letter: 'Some things are better on paper. Turn the page, slowly.', signature: '— {sender}' })),
      page('The letter', pc('letter', { greeting: 'Dear {name},', body, highlight: CLOSE[m][0], notes: [], closing: CLOSE[m][1], signature: '{sender}', paper, typewriter: true })),
    ];
    await saveGift(g);
    nav('/edit/' + g.id);
  };
  return (
    <div className="site">
      <Header />
      <section className="block narrow">
        <div className="block-head"><span className="pill">Love Letter writer · free</span><h1>Let's write it <em>together</em></h1></div>
        <div className="chatbox">
          {ASK.map((x, i) => (i <= idx || done) && (
            <React.Fragment key={x.key}>
              <div className="msg bot">{x.q.replace('them', ans.to || 'them')}</div>
              {x.key in ans && <div className="msg me">{ans[x.key] || <i>skipped</i>}</div>}
            </React.Fragment>
          ))}
          {!done && (ASK[idx].opts ? <div className="opts">{ASK[idx].opts!.map((o) => <button key={o} onClick={() => answer(o)}>{o}</button>)}</div> : (
            <form className="chat-in" onSubmit={(e) => { e.preventDefault(); answer(input); }}>
              <input autoFocus value={input} onChange={(e) => setInput(e.target.value)} placeholder={ASK[idx].ph} />
              <button className="btn small" type="submit">{input ? 'Send' : 'Skip'}</button>
            </form>
          ))}
          {done && <div className="msg bot">Here's your letter. Change anything you like, then pick the paper.</div>}
          <div ref={endRef} />
        </div>
        {done && <div className="wz-card">
          <label>Your letter<textarea rows={12} value={body} onChange={(e) => setBody(e.target.value)} /></label>
          <div className="seg"><span>Paper</span>{PAPERS.map(([id, n]) => <button key={id} className={paper === id ? 'on' : ''} onClick={() => setPaper(id)}>{n}</button>)}</div>
          <div className="seg"><span>Seal</span>{SEALS.map((s) => <button key={s} className={seal === s ? 'on' : ''} onClick={() => setSeal(s)}>{s}</button>)}</div>
          <div className="row center"><button className="btn ghost" onClick={() => setAns({})}>Start over</button><button className="btn" onClick={create}>Seal it & continue →</button></div>
        </div>}
      </section>
    </div>
  );
}
