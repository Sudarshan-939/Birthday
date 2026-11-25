import React, { useState } from 'react';
import { Header } from './common';
import { findTemplate, makeGift, page, pc } from '../templates';
import { saveGift } from '../lib/storage';
import { compressImage } from '../lib/image';
import { nav, parseHash } from '../lib/router';
import { PIECES } from '../pieces';

type A = Record<string, string>;
const Q: { key: string; q: string; ph: string; long?: boolean }[] = [
  { key: 'met', q: 'How did you two meet?', ph: 'At a friend\'s birthday, she spilled cold coffee on my shoes…', long: true },
  { key: 'first', q: 'What did you first notice about them?', ph: 'Her laugh. It was louder than the music.' },
  { key: 'firstdate', q: 'Your first date, or the first time it felt like one?', ph: 'Golgappas at Marina beach, then walking till 2am', long: true },
  { key: 'knew', q: 'When did you know?', ph: 'When she remembered I hate onions without being told', long: true },
  { key: 'hard', q: 'A hard time you got through together?', ph: 'The six months I worked in Pune and we lived on video calls', long: true },
  { key: 'little', q: 'Little things they do that you love?', ph: 'Steals my hoodies, sends me songs at 1am, hums while cooking' },
  { key: 'place', q: 'Your place?', ph: 'The bench by the lake / our tiny balcony' },
  { key: 'joke', q: 'An inside joke?', ph: '"One more episode" (it is never one more)' },
  { key: 'future', q: 'A dream for your future?', ph: 'A small house with too many plants and a dog named Biscuit', long: true },
  { key: 'reasons', q: 'Reasons you love them (one per line)', ph: 'your laugh\nhow you take care of everyone\nyour terrible jokes', long: true },
];

const EN = (a: A, n: string, s: string) => [
  a.met && { title: 'The first hello', text: `Every story has a beginning, and ours started like this: ${a.met}\n\nNeither of us knew it then, but that was page one.` },
  a.first && { title: 'What I noticed', text: `The first thing I noticed about you, ${n}, was ${lc(a.first)}\n\nI pretended to be calm. I was not calm.` },
  a.firstdate && { title: 'Our first date', text: `${a.firstdate}\n\nI remember checking the time and being annoyed at how fast it went.` },
  a.knew && { title: 'The moment I knew', text: `People ask how you know. For me it was this: ${lc(a.knew)}\n\nSomething small, and it changed everything.` },
  a.hard && { title: 'The hard chapter', text: `Not every page was easy. ${a.hard}\n\nWe held on anyway, and it taught me we could get through anything as long as we did it together.` },
  a.little && { title: 'Little things', text: `It's the little things. ${a.little}\n\nNobody else would notice. I always do.` },
  a.place && { title: 'Our place', text: `Some places are just places. ${a.place} is ours. A part of us lives there now.` },
  a.joke && { title: 'Only we would get it', text: `${a.joke}\n\nIf anyone else read this, they would be confused. That's what makes it ours.` },
  a.future && { title: 'The chapters ahead', text: `Here's what I see when I think about later: ${lc(a.future)}\n\nThe best part of this book is that it isn't finished.` },
].filter(Boolean) as { title: string; text: string }[];

const HI = (a: A, n: string, s: string) => [
  a.met && { title: 'Pehli mulaqaat', text: `Har kahani kahin se shuru hoti hai, aur hamari aise hui: ${a.met}\n\nTab kisko pata tha ki yeh page one hai.` },
  a.first && { title: 'Pehli nazar', text: `${n}, tumhare baare mein sabse pehle jo notice kiya woh tha ${lc(a.first)}\n\nMain cool ban raha tha. Main bilkul cool nahi tha.` },
  a.firstdate && { title: 'Pehli date', text: `${a.firstdate}\n\nTime itni jaldi kyun nikal gaya, aaj tak samajh nahi aaya.` },
  a.knew && { title: 'Jab pata chala', text: `Log poochte hain, kaise pata chalta hai? Mujhe tab pata chala jab ${lc(a.knew)}\n\nChhoti si baat, par sab badal gaya.` },
  a.hard && { title: 'Mushkil waqt', text: `Har page aasaan nahi tha. ${a.hard}\n\nPar humne haath nahi chhoda, aur samajh aaya ki saath ho toh sab ho jaata hai.` },
  a.little && { title: 'Chhoti chhoti baatein', text: `${a.little}\n\nKisi aur ko dikhe na dikhe, mujhe hamesha dikhta hai.` },
  a.place && { title: 'Hamari jagah', text: `Kuch jagah sirf jagah hoti hain. ${a.place} hamari hai.` },
  a.joke && { title: 'Sirf hum samjhenge', text: `${a.joke}\n\nKoi aur padhega toh confuse ho jaayega. Wahi toh maza hai.` },
  a.future && { title: 'Aage ki kahani', text: `Jab aage ka sochta hoon toh dikhta hai: ${lc(a.future)}\n\nIs kitaab ki sabse achhi baat? Yeh abhi khatam nahi hui.` },
].filter(Boolean) as { title: string; text: string }[];

const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const DESIGNS = [['classic', 'Romantic classic'], ['blush', 'Dreamy blush'], ['midnight', 'Midnight stars'], ['vintage', 'Vintage journal']];

export default function LoveBook() {
  const q0 = parseHash().query;
  const [step, setStep] = useState(0);
  const [to, setTo] = useState(q0.to || '');
  const [from, setFrom] = useState(q0.from || '');
  const [a, setA] = useState<A>({});
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [design, setDesign] = useState('classic');
  const [title, setTitle] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const addPhotos = async (files: FileList | null) => {
    if (!files) return; setBusy(true);
    const out: string[] = [];
    for (const f of Array.from(files).slice(0, 24 - photos.length)) out.push(await compressImage(f, 1000, 0.72));
    setPhotos([...photos, ...out]); setBusy(false);
  };

  const create = async () => {
    const n = to || 'you', s = from || 'me';
    const chapters = (lang === 'en' ? EN : HI)(a, n, s);
    if (!chapters.length) chapters.push(...PIECES.storybook.defaults().chapters);
    // spread photos across the chapters; extra photos get their own "memories" chapters
    const ph = [...photos];
    const cover = ph.shift() || '';
    chapters.forEach((c: any) => { c.photo = ph.shift() || ''; });
    while (ph.length) {
      const k = chapters.length;
      chapters.push({ title: lang === 'en' ? 'More memories' : 'Aur yaadein', text: lang === 'en' ? 'A few more pages I couldn\'t leave out.' : 'Kuch aur pal jo chhod nahi sakta tha.', photo: ph.shift() } as any);
      if (k > 140) break;
    }
    const reasons = (a.reasons || '').split('\n').map((x) => x.trim()).filter(Boolean);
    const tpl = findTemplate('love-story-book')!;
    const g = makeGift(tpl, { to: to || 'Aanya', from: from || 'Kabir' });
    g.title = title || `Our story — for ${to || 'you'}`;
    g.theme = design === 'midnight' ? 'midnight' : design === 'vintage' ? 'kraft' : design === 'blush' ? 'blush' : 'rose';
    g.pages = [page('The book', pc('storybook', {
      title: title || (lang === 'en' ? 'The Story of {name} & {sender}' : '{name} aur {sender} ki kahani'),
      subtitle: lang === 'en' ? 'a true story, mostly' : 'ek sacchi kahani (zyada tar)',
      design, coverPhoto: cover || (photos.length ? '' : PIECES.storybook.defaults().coverPhoto), chapters,
      reasons: reasons.length ? reasons : PIECES.storybook.defaults().reasons,
      letter: lang === 'en' ? `Thank you for being my favourite story, {name}.\n\nHere's to every chapter still unwritten.\n\nLove, {sender}` : `Meri sabse pyaari kahani banne ke liye shukriya, {name}.\n\nAage ke saare chapters tumhare naam.\n\nTumhara, {sender}`,
    }))];
    await saveGift(g);
    nav('/edit/' + g.id);
  };

  const steps = ['Names', 'Your story', 'Photos', 'Design'];
  return (
    <div className="site">
      <Header />
      <section className="block narrow wizard">
        <div className="block-head"><span className="pill">Love Story Book · free</span><h1>Write your <em>book</em></h1><p>Answer what you like and skip the rest. Every word can be changed afterwards.</p></div>
        <div className="wz-steps">{steps.map((s, i) => <button key={s} className={i === step ? 'on' : i < step ? 'done' : ''} onClick={() => setStep(i)}>{i + 1}. {s}</button>)}</div>
        {step === 0 && <div className="wz-card">
          <label>Their name<input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Aanya" /></label>
          <label>Your name<input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Kabir" /></label>
          <label>Book title (optional)<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The Story of Aanya & Kabir" /></label>
          <div className="seg"><span>Language</span><button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>English</button><button className={lang === 'hi' ? 'on' : ''} onClick={() => setLang('hi')}>Hinglish</button></div>
        </div>}
        {step === 1 && <div className="wz-card">{Q.map((x) => <label key={x.key}>{x.q}{x.long ? <textarea rows={3} value={a[x.key] || ''} onChange={(e) => setA({ ...a, [x.key]: e.target.value })} placeholder={x.ph} /> : <input value={a[x.key] || ''} onChange={(e) => setA({ ...a, [x.key]: e.target.value })} placeholder={x.ph} />}</label>)}</div>}
        {step === 2 && <div className="wz-card">
          <p>Up to 24 photos. The first one goes on the cover, the rest go on the chapter pages in order.</p>
          <div className="wz-photos">{photos.map((p, i) => <div key={i}><img src={p} /><button onClick={() => setPhotos(photos.filter((_, k) => k !== i))}>✕</button>{i === 0 && <small>cover</small>}</div>)}
            {photos.length < 24 && <label className="add">{busy ? '…' : '+ Add'}<input type="file" accept="image/*" multiple hidden onChange={(e) => addPhotos(e.target.files)} /></label>}</div>
        </div>}
        {step === 3 && <div className="wz-card">
          <div className="designs">{DESIGNS.map(([id, nm]) => <button key={id} className={`mini-book design-${id} ${design === id ? 'on' : ''}`} onClick={() => setDesign(id)}><b>{title || 'Our Story'}</b><small>{nm}</small></button>)}</div>
          <p className="muted">You get a flip-book link and can save it as a PDF from the book itself.</p>
        </div>}
        <div className="row center">
          {step > 0 && <button className="btn ghost" onClick={() => setStep(step - 1)}>Back</button>}
          {step < 3 ? <button className="btn" onClick={() => setStep(step + 1)}>Next</button> : <button className="btn" onClick={create}>✨ Write my book</button>}
        </div>
      </section>
    </div>
  );
}
