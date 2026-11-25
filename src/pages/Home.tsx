import React, { useState } from 'react';
import { Header, Footer, TemplateBrowser, PhoneDemo, Art } from './common';
import { TEMPLATES, findTemplate } from '../templates';
import { ALL_PIECES } from '../pieces';
import { STICKER_COUNT } from '../lib/stickers';
import { THEMES } from '../lib/themes';
import { TRACKS } from '../lib/audio';

const DEMOS = ['b-candles', 'birthday-cinema', 'proposal-classic', 'sorry-cute', 'mini-golgappa'];

export default function Home() {
  const [demo, setDemo] = useState(0);
  return (
    <div className="site">
      <Header />
      <section className="hero">
        <div className="hero-txt">
          <span className="pill">✨ Every template & feature free — no sign-up, no ads</span>
          <h1>Tiny pages,<br />huge <em>hearts</em>.</h1>
          <p>Make an interactive gift page for a birthday, an anniversary, an apology or just because. Cakes they blow out, puzzles, letters, 3D museums, a Vogue magazine and 120+ more pieces. Fill it in, then send a link.</p>
          <div className="row"><a className="btn" href="#/gifts">Create a gift</a><button className="btn ghost" onClick={() => document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' })}>Explore templates</button></div>
          <div className="stats"><div><b>{TEMPLATES.length}</b> templates</div><div><b>{ALL_PIECES.length}</b> pieces</div><div><b>{STICKER_COUNT}+</b> stickers</div><div><b>₹0</b> forever</div></div>
        </div>
        <div className="hero-demo">
          <PhoneDemo tplId={DEMOS[demo]} key={demo} />
          <div className="demo-tabs">{DEMOS.map((d, i) => <button key={d} className={i === demo ? 'on' : ''} onClick={() => setDemo(i)}>{findTemplate(d)!.name}</button>)}</div>
          <small>↑ a real gift. Tap it.</small>
        </div>
      </section>

      <section className="block premium-block" id="premium">
        <div className="block-head"><span className="pill gold">👑 Premium · still free</span><h2>Premium gifts, <em>no price tag</em></h2><p>Our most elaborate templates: whole birthday websites with cinematic sections, a magazine, a swinging ID badge and a chat that types itself. Elsewhere this is the paid tier. Here it is free, with no sign-up and no ads.</p></div>
        {TEMPLATES.filter((t) => t.cat === 'premium').map((t) => (
          <div key={t.id} className="premium-feature">
            <a href={`#/demo/${t.id}`} className="pf-art"><Art tpl={t} big /></a>
            <div className="pf-txt">
              <span className="badge gold">👑 {t.badge}</span>
              <h3>{t.name}</h3>
              <p>{t.desc}</p>
              <ol className="pf-steps">{t.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
              <div className="row"><a className="btn gold" href={`#/new/${t.id}`}>Create it free</a><a className="btn ghost" href={`#/demo/${t.id}`}>▶ Watch the demo</a><a className="btn ghost" href="#/gifts?f=premium">All premium</a></div>
            </div>
          </div>
        ))}
      </section>

      <section className="feature book-feature">
        <div className="ft-txt">
          <span className="pill">New · Love Story Book</span>
          <h2>Your love story, <em>as a book.</em></h2>
          <p>Answer a few questions about how it happened. Keepsake writes chapters from your answers, puts your photos on the pages and designs a book of 10 to 140 pages, in English or Hinglish.</p>
          <ul className="ticks"><li>4 cover designs</li><li>Up to 24 photos</li><li>Flip-book link + PDF</li><li>Change any word later</li></ul>
          <div className="row"><a className="btn" href="#/book">Write your book — free</a><a className="btn ghost" href="#/demo/love-story-book">📖 Read a sample</a></div>
        </div>
        <div className="book-stack">{['classic', 'blush', 'midnight', 'vintage'].map((d, i) => <div key={d} className={`mini-book design-${d}`} style={{ transform: `rotate(${(i - 1.5) * 7}deg) translateY(${Math.abs(i - 1.5) * 10}px)` }}><b>Our Story</b><small>{d}</small></div>)}</div>
      </section>

      <section id="templates" className="block">
        <TemplateBrowser limit={12} title={<div className="block-head"><span className="pill">Start here</span><h2>What are you trying <em>to say?</em></h2><p>Pick a feeling and the templates change with it. Every one opens differently. Preview any of them, all of them are free.</p></div>} />
      </section>

      <section className="block threed">
        <div className="block-head"><span className="pill">3D</span><h2>Gifts you can <em>walk through</em></h2></div>
        <div className="two">{['3d-museum', '3d-photo-album'].map((id) => { const t = findTemplate(id)!; return <a key={id} href={`#/t/${id}`} className="big-card"><Art tpl={t} big /><div><h3>{t.name}</h3><p>{t.desc}</p><span className="btn small">Open →</span></div></a>; })}</div>
      </section>

      <section className="block how">
        <div className="block-head"><span className="pill">How it works</span><h2>Three steps, about <em>five minutes</em></h2></div>
        <div className="steps">
          <div><b>1</b><h3>Make it here</h3><p>Pick a template, write your words, add photos, stickers, a song. The preview updates as you type.</p></div>
          <div><b>2</b><h3>Add the extras</h3><p>Seal it until midnight, add a secret word, your own song or voice note, a QR code. All free.</p></div>
          <div><b>3</b><h3>Send the link</h3><p>Share on WhatsApp or Instagram, print the QR on a card, or download the gift as one file that opens anywhere.</p></div>
        </div>
      </section>

      <section className="block everything">
        <div className="block-head"><span className="pill">Nothing locked</span><h2>Everything the paid sites charge for, <em>free</em></h2></div>
        <div className="feat-grid">
          {[['🧩', `${ALL_PIECES.length} pieces`, 'Letters, chats, cakes, puzzles, quizzes, scratch cards, 3D cards, desi games…'], ['🎨', `${THEMES.length} colour themes + your own`, 'Pick a theme, then change any colour. 5 fonts, 5 page turns.'], ['😍', `${STICKER_COUNT}+ stickers`, 'Emoji packs, word stickers, doodles or your own image. Drag, pinch, spin.'], ['🎵', `${TRACKS.length} original tracks`, 'Generated in your browser. Or upload your own song or record your voice.'], ['🔒', 'Seal & secret word', 'Lock it until a date and time, or behind a word only they know.'], ['🔳', 'QR code & file download', 'Print a QR, or download a single HTML file that works offline.'], ['✏️', 'Edit any time', 'Gifts save in your browser. Change a word, re-share the link.'], ['🙅', 'No sign-up, no ads', 'No account, no popups, no tracking, no watermark.']].map(([i, h, p]) => <div key={h} className="feat"><span>{i}</span><h3>{h}</h3><p>{p}</p></div>)}
        </div>
      </section>

      <section className="block cta">
        <h2>Make someone's day, <em>by hand.</em></h2>
        <div className="row center"><a className="btn" href="#/gifts">Browse all {TEMPLATES.length} templates</a><a className="btn ghost" href="#/new/blank">Start from a blank page</a></div>
      </section>
      <Footer />
    </div>
  );
}
