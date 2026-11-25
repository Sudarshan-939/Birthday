import React, { useState } from 'react';
import { Header, Footer, PhoneDemo, TemplateCard } from './common';
import { findTemplate, TEMPLATES } from '../templates';
import { PIECES } from '../pieces';
import { THEMES } from '../lib/themes';
import { TRACKS } from '../lib/audio';
import { nav } from '../lib/router';

export default function TemplatePage({ id }: { id: string }) {
  const tpl = findTemplate(id);
  const [to, setTo] = useState('');
  const [from, setFrom] = useState('');
  const [age, setAge] = useState('');
  if (!tpl) return <div className="site"><Header /><div className="center-msg">That template doesn't exist. <a href="#/gifts">See all templates</a></div><Footer /></div>;
  const pages = tpl.build();
  const types = Array.from(new Set(pages.flatMap((p) => p.pieces.map((x) => x.type))));
  const related = TEMPLATES.filter((t) => t.id !== tpl.id && (t.cat === tpl.cat || t.group === tpl.group)).slice(0, 4);
  const start = () => {
    if (tpl.special === 'book') return nav(`/book?to=${encodeURIComponent(to)}&from=${encodeURIComponent(from)}`);
    if (tpl.special === 'letter') return nav(`/letter?to=${encodeURIComponent(to)}&from=${encodeURIComponent(from)}`);
    const q = new URLSearchParams({ to, from, age }).toString();
    nav(`/new/${tpl.id}?${q}`);
  };
  return (
    <div className="site">
      <Header />
      <section className="tpl-hero">
        <div className="tpl-info">
          <a href={`#/gifts?f=${tpl.cat}`} className="crumb">← {tpl.group}</a>
          {tpl.badge && <span className="pill">{tpl.badge}</span>}
          <h1>{tpl.name}</h1>
          <p className="lead">{tpl.tagline}</p>
          <p>{tpl.desc}</p>
          <ol className="tpl-steps">{tpl.steps.map((s, i) => <li key={i}><b>{i + 1}</b>{s}</li>)}</ol>
          <div className="start-box">
            <div className="names">
              <label>Their name<input value={to} onChange={(e) => setTo(e.target.value)} placeholder="e.g. Aanya" /></label>
              <label>Your name<input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="e.g. Kabir" /></label>
              {tpl.cat === 'birthday' && <label>Age (optional)<input value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" inputMode="numeric" /></label>}
            </div>
            <button className="btn big" onClick={start}>Start making it — free</button>
            <small>No account needed. It saves in this browser as you go, and you can change it later.</small>
          </div>
          <div className="tpl-meta">
            <span>📄 {pages.length} page{pages.length > 1 ? 's' : ''}</span>
            <span>🎨 {THEMES.find((t) => t.id === tpl.theme)?.name} theme (change it)</span>
            <span>🎵 {TRACKS.find((t) => t.id === tpl.music)?.name || 'Slow Bloom'}</span>
            <span>♡ {tpl.loved.toLocaleString()} made</span>
          </div>
          <div className="inside"><b>Inside:</b> {types.map((t) => <span key={t} className="chip">{PIECES[t]?.icon} {PIECES[t]?.label || t}</span>)}</div>
        </div>
        <div className="tpl-demo">
          <PhoneDemo tplId={tpl.id} key={tpl.id} />
          <a className="btn ghost small" href={`#/demo/${tpl.id}`}>Open full-screen preview ↗</a>
        </div>
      </section>
      {related.length > 0 && <section className="block"><div className="block-head"><h2>Try another <em>moment</em></h2></div><div className="grid">{related.map((t) => <TemplateCard key={t.id} tpl={t} />)}</div></section>}
      <Footer />
    </div>
  );
}
