import React, { useEffect, useState } from 'react';
import { PieceDef, F, H, Hint, Btn, Para, Img, useInView, useCountUp, Hidden, DEMO } from './core';
import { sfx } from '../lib/audio';
import { confetti, hearts } from '../lib/fx';

const Checklist: PieceDef = {
  type: 'checklist', label: 'Checklist', icon: '☑️', cat: 'story', desc: 'A list they can tick off',
  fields: [F.t('title', 'Title'), F.s('items', 'Items', 15), F.t('after', 'When all ticked')],
  defaults: () => ({ title: 'Birthday to-do list', items: ['Eat cake for breakfast', 'Ignore all responsibilities', 'Read this gift twice', 'Call {sender} ♡'], after: 'All done! Best birthday ever unlocked.' }),
  Render: ({ p }) => {
    const [on, setOn] = useState<number[]>([]);
    const all = on.length === (p.items || []).length && on.length > 0;
    return (
      <div className="pc-check">
        <H>{p.title}</H>
        {(p.items || []).map((x: string, i: number) => <label key={i} className={on.includes(i) ? 'on' : ''}><input type="checkbox" checked={on.includes(i)} onChange={(e) => { sfx('tap'); const n = on.includes(i) ? on.filter((y) => y !== i) : [...on, i]; setOn(n); if (n.length === p.items.length) confetti(e.currentTarget); }} /><span>{x}</span></label>)}
        <Hidden open={all}><div className="pc-reveal">{p.after}</div></Hidden>
      </div>
    );
  },
};

const Stat = ({ v, l, run }: { v: string; l: string; run: boolean }) => {
  const num = parseInt(String(v).replace(/[^0-9]/g, ''), 10);
  const isNum = /^[0-9,]+$/.test(String(v).trim());
  const c = useCountUp(isNum ? num : 0, run);
  return <div className="cell"><b>{isNum ? c.toLocaleString() : v}</b><small>{l}</small></div>;
};
const Stats: PieceDef = {
  type: 'stats', label: 'Stats counter', icon: '📊', cat: 'story', desc: 'Your numbers, counting up',
  fields: [F.t('title', 'Title'), F.it('items', 'Numbers', [F.t('value', 'Number'), F.t('label', 'Label')], 6)],
  defaults: () => ({ title: 'Us, in numbers', items: [{ value: '1349', label: 'days together' }, { value: '4812', label: 'memes sent' }, { value: '∞', label: 'hugs owed' }] }),
  Render: ({ p }) => { const [ref, seen] = useInView<HTMLDivElement>(0.4); return <div ref={ref} className="pc-stats"><H>{p.title}</H><div className="grid">{(p.items || []).map((s: any, i: number) => <Stat key={i} v={s.value} l={s.label} run={seen} />)}</div></div>; },
};

const Progress: PieceDef = {
  type: 'progress', label: 'Progress bar', icon: '⏳', cat: 'story', desc: 'A labelled bar that fills up',
  fields: [F.t('label', 'Label'), F.n('percent', 'Fills to (%)', 0, 999), F.t('after', 'Line when full')],
  defaults: () => ({ label: 'Loading my love for you…', percent: 100, after: 'Error: too much love to load ♡' }),
  Render: ({ p }) => {
    const [ref, seen] = useInView<HTMLDivElement>(0.5);
    const v = useCountUp(Number(p.percent) || 0, seen, 2600);
    return <div ref={ref} className="pc-progress"><div className="lab">{p.label}</div><div className="bar"><i style={{ width: Math.min(100, v) + '%' }} /></div><div className="pct">{v}%</div><Hidden open={v >= (Number(p.percent) || 0) && seen}><div className="after">{p.after}</div></Hidden></div>;
  },
};

const Ticket: PieceDef = {
  type: 'ticket', label: 'Ticket', icon: '🎟️', cat: 'story', desc: 'An admit-one ticket for a date', bare: true,
  fields: [F.t('title', 'Title'), F.t('where', 'Where'), F.t('when', 'When'), F.t('time', 'Time'), F.t('seat', 'Seat'), F.t('foot', 'Small print')],
  defaults: () => ({ title: 'Our next date', where: 'Wherever you want', when: 'This Saturday', time: '7:00 PM', seat: 'Right next to me', foot: 'Admit one · valid forever' }),
  Render: ({ p }) => (
    <div className="pc-ticket">
      <div className="main"><small>ADMIT ONE</small><h4>{p.title}</h4>
        <div className="kv"><span>Where</span><b>{p.where}</b></div><div className="kv"><span>When</span><b>{p.when}</b></div>
        <div className="kv"><span>Time</span><b>{p.time}</b></div><div className="kv"><span>Seat</span><b>{p.seat}</b></div></div>
      <div className="stub"><b>♥</b><small>No. {String((p.title || '').length * 731 + 1000).slice(0, 4)}</small><small>{p.foot}</small></div>
    </div>
  ),
};

const Calendar: PieceDef = {
  type: 'calendar', label: 'Calendar', icon: '📅', cat: 'story', desc: 'A month with one special day circled',
  fields: [F.d('date', 'The special day'), F.t('caption', 'Caption')],
  defaults: () => ({ date: '2024-02-14', caption: 'The day it all began' }),
  Render: ({ p }) => {
    const d = new Date(p.date + 'T00:00'); const ok = !isNaN(d.getTime());
    const y = ok ? d.getFullYear() : 2024, m = ok ? d.getMonth() : 1, day = ok ? d.getDate() : 14;
    const first = new Date(y, m, 1).getDay(); const n = new Date(y, m + 1, 0).getDate();
    return (
      <div className="pc-cal">
        <div className="mon">{new Date(y, m, 1).toLocaleString('en', { month: 'long', year: 'numeric' })}</div>
        <div className="grid">{'SMTWTFS'.split('').map((c, i) => <b key={i}>{c}</b>)}{Array.from({ length: first }, (_, i) => <span key={'e' + i} />)}{Array.from({ length: n }, (_, i) => <span key={i} className={i + 1 === day ? 'hit' : ''}>{i + 1}</span>)}</div>
        <div className="cap">{p.caption}</div>
      </div>
    );
  },
};

const Distance: PieceDef = {
  type: 'distance', label: 'Distance', icon: '✈️', cat: 'story', desc: 'How far apart you are, and how close',
  fields: [F.t('from', 'Your city'), F.t('to', 'Their city'), F.t('km', 'Distance'), F.t('unit', 'Unit'), F.t('line', 'Line under it')],
  defaults: () => ({ from: 'Chennai', to: 'Delhi', km: '1760', unit: 'kilometres apart', line: 'but never far from my heart' }),
  Render: ({ p }) => { const [ref, seen] = useInView<HTMLDivElement>(0.4); const v = useCountUp(parseInt(p.km) || 0, seen); return (
    <div ref={ref} className="pc-distance"><div className="route"><span className="dot" /><span className="path"><i className={seen ? 'fly' : ''}>✈</i></span><span className="dot heart">♥</span></div>
      <div className="cities"><span>{p.from}</span><span>{p.to}</span></div><b className="km">{v.toLocaleString()}</b><div>{p.unit}</div><div className="line">{p.line}</div></div>); },
};

const Passport: PieceDef = {
  type: 'passport', label: 'Passport stamps', icon: '🛂', cat: 'story', desc: 'Stamps from every place you went',
  fields: [F.t('title', 'Title'), F.it('items', 'Places', [F.t('place', 'Place'), F.t('date', 'When')], 9)],
  defaults: () => ({ title: 'Places with you', items: [{ place: 'Goa', date: 'Dec 2023' }, { place: 'Jaipur', date: 'Feb 2024' }, { place: 'Manali', date: 'Jun 2024' }, { place: 'Home', date: 'Every day' }] }),
  Render: ({ p }) => { const [ref, seen] = useInView<HTMLDivElement>(0.3); return <div ref={ref} className="pc-passport"><H>{p.title}</H><div className="grid">{(p.items || []).map((s: any, i: number) => <div key={i} className={`stamp s${i % 4} ${seen ? 'in' : ''}`} style={{ animationDelay: `${i * 0.25}s`, transform: `rotate(${(i * 37) % 24 - 12}deg)` }}><b>{s.place}</b><small>{s.date}</small></div>)}</div></div>; },
};

const Newspaper: PieceDef = {
  type: 'newspaper', label: 'Newspaper', icon: '📰', cat: 'story', desc: 'A front page all about them', bare: true,
  fields: [F.t('paper', 'Paper name'), F.t('headline', 'Headline'), F.t('sub', 'Sub-headline'), F.ph('photo', 'Photo'), F.ta('body', 'Story')],
  defaults: () => ({ paper: 'The Daily Us', headline: 'LOCAL HERO MAKES EVERYONE SMILE, AGAIN', sub: 'Experts agree. Nobody is surprised.', photo: DEMO(1).src, body: 'In a shocking turn of events that surprised exactly no one, {name} was once again named the best person in the world. Sources close to {sender} confirm it.' }),
  Render: ({ p }) => (
    <div className="pc-news"><div className="mast">{p.paper}</div><div className="meta"><span>Vol. ♥</span><span>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span><span>Price: one hug</span></div>
      <h4>{p.headline}</h4><div className="sub">{p.sub}</div><Img src={p.photo} /><Para text={p.body} /></div>
  ),
};

const Poster: PieceDef = {
  type: 'poster', label: 'Movie poster', icon: '🎬', cat: 'story', desc: 'A film poster starring the two of you', bare: true,
  fields: [F.ph('photo', 'Photo'), F.t('studio', 'Presented by'), F.t('title', 'Film title'), F.t('tagline', 'Tagline'), F.t('starring', 'Starring'), F.t('foot', 'Bottom line')],
  defaults: () => ({ photo: DEMO(1).src, studio: '{sender} Films presents', title: 'US', tagline: 'A love story, still running', starring: 'Starring {name} & {sender}', foot: 'Now showing · forever' }),
  Render: ({ p }) => <div className="pc-poster"><Img src={p.photo} /><div className="ov"><small>{p.studio}</small><h4>{p.title}</h4><div className="tag">{p.tagline}</div><div className="stars">★★★★★</div><div className="star">{p.starring}</div><small>{p.foot}</small></div></div>,
};

const Magazine: PieceDef = {
  type: 'magazine', label: 'Magazine cover', icon: '📔', cat: 'story', desc: 'A glossy cover with them on it', bare: true,
  fields: [F.ph('photo', 'Photo'), F.t('mag', 'Magazine name'), F.t('line1', 'Cover line'), F.t('line2', 'Second line'), F.t('line3', 'Small line'), F.t('name', 'Name on cover')],
  defaults: () => ({ photo: DEMO(4).src, mag: 'ICON', line1: 'Person of the year (again)', line2: 'The smile that broke the internet', line3: 'Inside: 100 reasons we love them', name: '{name}' }),
  Render: ({ p }) => <div className="pc-mag"><Img src={p.photo} /><div className="ov"><h4>{p.mag}</h4><div className="l1">{p.line1}</div><div className="l2">{p.line2}</div><div className="l3">{p.line3}</div><div className="nm">{p.name}</div></div></div>,
};

const Credits: PieceDef = {
  type: 'credits', label: 'Credits roll', icon: '🎞️', cat: 'story', desc: 'End credits that roll up on the two of you', bare: true,
  fields: [F.t('title', 'Title'), F.it('items', 'Credits', [F.t('role', 'Role'), F.t('name', 'Name')], 15), F.t('end', 'Last line')],
  defaults: () => ({ title: 'Starring', items: [{ role: 'The funny one', name: '{name}' }, { role: 'The one who laughs', name: '{sender}' }, { role: 'Best supporting chai', name: 'Cutting chai' }, { role: 'Special thanks', name: 'Every late night call' }], end: 'The End… or just the beginning?' }),
  Render: ({ p }) => <div className="pc-credits"><div className="roll"><h4>{p.title}</h4>{(p.items || []).map((c: any, i: number) => <div key={i} className="c"><small>{c.role}</small><b>{c.name}</b></div>)}<div className="end">{p.end}</div></div></div>,
};

const Wrapped: PieceDef = {
  type: 'wrapped', label: 'Year wrapped', icon: '🎧', cat: 'story', desc: 'Your year together, as story slides', bare: true,
  fields: [F.t('year', 'Year'), F.it('slides', 'Slides', [F.t('label', 'Label'), F.t('value', 'Value')], 8)],
  defaults: () => ({ year: String(new Date().getFullYear()), slides: [{ label: 'Top song', value: 'Our song on repeat' }, { label: 'Hours on call', value: '312' }, { label: 'Most used emoji', value: '🥺' }, { label: 'Favourite person', value: '{name}' }] }),
  Render: ({ p }) => {
    const sl = p.slides || []; const [i, setI] = useState(-1);
    const colors = ['#1db954', '#ff4f9a', '#7c4dff', '#ff9800', '#00bcd4', '#e91e63', '#8bc34a', '#3f51b5'];
    return (
      <div className="pc-wrapped" style={{ background: i < 0 ? '#121212' : colors[i % colors.length] }} onClick={() => { sfx('page'); setI((i + 1) > sl.length - 1 ? -1 : i + 1); }}>
        <div className="bars">{sl.map((_: any, k: number) => <i key={k} className={k <= i ? 'on' : ''} />)}</div>
        {i < 0 ? <div className="intro"><small>Your</small><b>{p.year}</b><small>Wrapped ♡</small><Hint>tap through {sl.length} slides</Hint></div>
          : <div className="sl" key={i}><small>{sl[i].label}</small><b>{sl[i].value}</b></div>}
      </div>
    );
  },
};

const Lockscreen: PieceDef = {
  type: 'lockscreen', label: 'Lockscreen', icon: '📱', cat: 'story', desc: 'A phone lockscreen full of you', bare: true,
  fields: [F.ph('photo', 'Wallpaper'), F.it('notifs', 'Notifications', [F.t('app', 'App'), F.t('text', 'Text'), F.t('ago', 'When')], 6)],
  defaults: () => ({ photo: DEMO(1).src, notifs: [{ app: 'Messages', text: 'Good morning ☀️ did you eat?', ago: 'now' }, { app: 'Reminder', text: 'Tell {name} they are amazing', ago: '3m ago' }, { app: 'Photos', text: 'On this day: our first selfie', ago: '6m ago' }] }),
  Render: ({ p }) => {
    const [t, setT] = useState(new Date()); useEffect(() => { const x = setInterval(() => setT(new Date()), 10000); return () => clearInterval(x); }, []);
    return <div className="pc-lock"><Img src={p.photo} /><div className="ov"><div className="date">{t.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</div><div className="time">{t.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
      {(p.notifs || []).map((n: any, i: number) => <div key={i} className="nt" style={{ animationDelay: `${0.4 + i * 0.5}s` }}><b>{n.app}</b><span>{n.ago}</span><div>{n.text}</div></div>)}</div></div>;
  },
};

const Postcard: PieceDef = {
  type: 'postcard', label: 'Postcard', icon: '🏞️', cat: 'story', desc: 'A postcard: your photo, flip for the note', bare: true,
  fields: [F.ph('photo', 'Photo'), F.t('greeting', 'Greeting on front'), F.ta('note', 'Note on the back'), F.t('to', 'To')],
  defaults: () => ({ photo: DEMO(4).src, greeting: 'Greetings from us', note: 'Wish you were here. Actually, wish I was there. Same thing.\nSee you soon ♡', to: 'To: {name}' }),
  Render: ({ p }) => { const [f, setF] = useState(false); return (
    <div className={`pc-flip pc-postcard ${f ? 'flipped' : ''}`} onClick={() => { sfx('page'); setF(!f); }}>
      <div className="in"><div className="front"><Img src={p.photo} /><div className="greet">{p.greeting}</div></div>
        <div className="back"><div className="note"><Para text={p.note} /></div><div className="addr"><div className="stampbox">♥</div><div className="to">{p.to}</div></div></div></div>
      <Hint>tap to flip</Hint></div>); },
};

function moonPhase(d: Date) {
  const lp = 2551443; const nm = new Date(1970, 0, 7, 20, 35, 0).getTime() / 1000;
  const phase = ((d.getTime() / 1000 - nm) % lp) / lp; const p = (phase + 1) % 1;
  const names = ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'];
  return { p, name: names[Math.round(p * 8) % 8] };
}
const Moon: PieceDef = {
  type: 'moon', label: 'Moon phase', icon: '🌙', cat: 'story', desc: 'The moon exactly as it was that night',
  fields: [F.d('date', 'The night'), F.t('caption', 'Caption')],
  defaults: () => ({ date: '2023-02-14', caption: 'The moon on the night we met' }),
  Render: ({ p }) => {
    const d = new Date(p.date + 'T21:00'); const { p: ph, name } = moonPhase(isNaN(d.getTime()) ? new Date() : d);
    const lit = ph <= 0.5 ? ph * 2 : (1 - ph) * 2; // 0..1
    const x = ph <= 0.5 ? (1 - lit) * 100 : -(1 - lit) * 100;
    return <div className="pc-moon"><div className="sky"><div className="moon"><div className="shadow" style={{ transform: `translateX(${ph <= 0.5 ? -x : -x}%)`, opacity: lit > 0.97 ? 0 : 1 }} /></div></div><b>{name}</b><small>{isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</small><div className="cap">{p.caption}</div></div>;
  },
};

const TimeCapsule: PieceDef = {
  type: 'timecapsule', label: 'Time capsule', icon: '🔐', cat: 'story', desc: 'A message sealed until a date you pick',
  fields: [F.t('label', 'Label on the lock'), F.dt('openOn', 'Opens on'), F.ta('message', 'Sealed message')],
  defaults: () => ({ label: 'Open on our next anniversary', openOn: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 16), message: 'Hi future us. I hope we still laugh at the same dumb things. I love you more than last year.' }),
  Render: ({ p, ctx }) => {
    const [now, setNow] = useState(Date.now()); useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
    const left = new Date(p.openOn).getTime() - now; const open = left <= 0 || isNaN(left);
    const s = Math.max(0, Math.floor(left / 1000));
    return <div className="pc-capsule"><div className="ic">{open ? '🔓' : '🔒'}</div><b>{p.label}</b>
      {open ? <div className="pc-reveal"><Para text={p.message} /></div> : <><div className="cd">{Math.floor(s / 86400)}d {Math.floor(s / 3600) % 24}h {Math.floor(s / 60) % 60}m {s % 60}s</div><small>sealed until {new Date(p.openOn).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' })}</small>{ctx.editing && <Hint>(editor preview) message: {p.message}</Hint>}</>}</div>;
  },
};

const Timeline: PieceDef = {
  type: 'timeline', label: 'Timeline', icon: '🗓️', cat: 'story', desc: 'Your story, moment by moment',
  fields: [F.t('title', 'Title'), F.it('items', 'Moments', [F.t('date', 'When'), F.t('title', 'What happened'), F.ta('text', 'A line about it'), F.ph('photo', 'Photo (optional)')], 15)],
  defaults: () => ({ title: 'Our story so far', items: [{ date: 'Day 1', title: 'The first hello', text: 'You said hi. I forgot how words work.', photo: '' }, { date: 'Month 3', title: 'First trip', text: 'Lost, rained on, happiest ever.', photo: DEMO(4).src }, { date: 'Today', title: 'Still us', text: 'And still my favourite chapter.', photo: '' }] }),
  Render: ({ p }) => { const [ref, seen] = useInView<HTMLDivElement>(0.15); return (
    <div ref={ref} className="pc-timeline"><H>{p.title}</H>{(p.items || []).map((m: any, i: number) => <div key={i} className={`m ${seen ? 'in' : ''}`} style={{ animationDelay: `${i * 0.3}s` }}><div className="dot">♥</div><div className="c"><small>{m.date}</small><b>{m.title}</b>{m.photo && <Img src={m.photo} />}<Para text={m.text} /></div></div>)}</div>); },
};

const DayTimeline: PieceDef = {
  type: 'daytimeline', label: 'One day, sunrise to midnight', icon: '🌅', cat: 'story', desc: 'An ordinary day, the sky changing as they scroll', bare: true,
  fields: [F.t('title', 'Title'), F.it('items', 'Moments of the day', [F.t('time', 'Time'), F.ta('text', 'What you thought / almost sent')], 10), F.t('end', 'Last line')],
  defaults: () => ({ title: 'You were supposed to be here', end: 'Same time tomorrow? I will be thinking of you anyway.', items: [
    { time: '6:40 am', text: 'Woke up and reached for my phone. Typed “good morning” and deleted the “I miss you” after it.' },
    { time: '9:15 am', text: 'Coffee for one. Made two out of habit.' }, { time: '1:30 pm', text: 'Saw a dog that looked exactly like the one you wanted. Took a photo for you.' },
    { time: '6:50 pm', text: 'The sunset was ridiculous. You would have made me stop the car.' }, { time: '11:58 pm', text: 'Our song came on. I let it play three times.' }] }),
  Render: ({ p }) => {
    const items = p.items || [];
    const skies = ['linear-gradient(#ffd8a8,#ffb3c1)', 'linear-gradient(#a8e0ff,#e0f4ff)', 'linear-gradient(#7cc6fe,#bde4ff)', 'linear-gradient(#ff9a6c,#7b4b94)', 'linear-gradient(#1b1b3a,#3d2c6b)'];
    return (
      <div className="pc-day"><h3 className="pc-h">{p.title}</h3>
        {items.map((m: any, i: number) => { const k = Math.round((i / Math.max(1, items.length - 1)) * (skies.length - 1)); return (
          <div key={i} className={`slot ${k >= 3 ? 'dark' : ''}`} style={{ background: skies[k] }}>
            <div className="sun">{['🌅', '☀️', '🌤️', '🌇', '🌙'][k]}</div><b>{m.time}</b><Para text={m.text} /></div>); })}
        <div className="slot dark" style={{ background: '#0f0f24' }}><div className="sun">✨</div><Para text={p.end} /></div>
      </div>
    );
  },
};

export const STORY: PieceDef[] = [Checklist, Stats, Progress, Ticket, Calendar, Distance, Passport, Newspaper, Poster, Magazine, Credits, Wrapped, Lockscreen, Postcard, Moon, TimeCapsule, Timeline, DayTimeline];
