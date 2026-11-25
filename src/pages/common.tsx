import React, { useMemo, useState } from 'react';
import { TEMPLATES, FEELINGS, Template, findTemplate, makeGift } from '../templates';
import { THEMES } from '../lib/themes';
import Player from '../player/Player';
import { graphemes } from '../lib/util';

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-head">
      <a href="#/" className="logo"><span>💝</span> Keepsake</a>
      <nav className={open ? 'open' : ''} onClick={() => setOpen(false)}>
        <a href="#/gifts">Templates</a>
        <a href="#/t/love-story-book">Love Story Book</a>
        <a href="#/gifts?f=mini">Mini gifts</a>
        <a href="#/t/make-your-own">Make your own</a>
        <a href="#/my">My gifts</a>
        <a href="#/help">Help</a>
      </nav>
      <a href="#/gifts" className="btn small">Create a gift</a>
      <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-foot">
      <div className="cols">
        <div><a href="#/" className="logo"><span>💝</span> Keepsake</a><p>Little interactive gift pages for birthdays, love, sorry, thank-you and everything in between. Every template and every feature is free. No sign-up, no ads, no watermarks.</p></div>
        <div><b>Make</b><a href="#/gifts?f=birthday">Birthday</a><a href="#/gifts?f=love">Love</a><a href="#/gifts?f=sorry">Apology</a><a href="#/gifts?f=festivals">Festivals</a><a href="#/gifts?f=mini">Mini gifts</a></div>
        <div><b>Special</b><a href="#/book">Love Story Book</a><a href="#/t/3d-museum">3D Museum</a><a href="#/t/3d-photo-album">3D Photo Album</a><a href="#/letter">Love Letter writer</a><a href="#/new/blank">Blank page</a></div>
        <div><b>Yours</b><a href="#/my">My gifts (saved on this device)</a><a href="#/help">How sharing works</a><a href="#/help">Privacy</a></div>
      </div>
      <small>Made with ♡. Your gifts stay in your browser until you choose to share them.</small>
    </footer>
  );
}

export function Art({ tpl, big }: { tpl: Template; big?: boolean }) {
  const th = THEMES.find((x) => x.id === tpl.theme) || THEMES[0];
  const c = th.colors;
  const em = graphemes(tpl.art);
  return (
    <div className={`art ${big ? 'big' : ''}`} style={{ background: `radial-gradient(circle at 30% 20%, ${c.accent2} 0, transparent 55%), radial-gradient(circle at 80% 90%, ${c.accent}55 0, transparent 50%), ${c.page}`, color: c.text }}>
      <div className="phone-mini" style={{ background: c.card, borderColor: c.text + '22' }}>
        <span className="e1">{em[0]}</span>{em[1] && <span className="e2">{em.slice(1).join('')}</span>}
        <b style={{ color: c.text }}>{tpl.name}</b>
        <i style={{ background: c.accent }} />
      </div>
    </div>
  );
}

export function TemplateCard({ tpl }: { tpl: Template }) {
  return (
    <article className="tcard">
      <a href={`#/t/${tpl.id}`} className="tcard-art"><Art tpl={tpl} />{tpl.badge && <span className="badge">{tpl.badge}</span>}</a>
      <div className="tcard-body">
        <small>{tpl.group}</small>
        <h3><a href={`#/t/${tpl.id}`}>{tpl.name}</a></h3>
        <p>{tpl.tagline}</p>
        <div className="price"><b>Free</b> <span>no sign-up · no watermark</span></div>
        <div className="row">
          <a className="btn ghost small" href={`#/demo/${tpl.id}`}>Preview</a>
          <a className="btn small" href={tpl.special === 'book' ? '#/book' : tpl.special === 'letter' ? '#/letter' : `#/new/${tpl.id}`}>Create gift</a>
        </div>
      </div>
    </article>
  );
}

export function TemplateBrowser({ initial = 'all', limit, title }: { initial?: string; limit?: number; title?: React.ReactNode }) {
  const [f, setF] = useState(initial);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('loved');
  const [more, setMore] = useState(false);
  const list = useMemo(() => {
    let l = TEMPLATES.filter((t) => f === 'all' || t.cat === f || (f === 'love' && t.group === 'The Proposal'));
    if (q.trim()) { const s = q.toLowerCase(); l = l.filter((t) => (t.name + t.tagline + t.group + t.desc).toLowerCase().includes(s)); }
    const by: Record<string, (a: Template, b: Template) => number> = { loved: (a, b) => b.loved - a.loved, newest: (a, b) => b.added - a.added, az: (a, b) => a.name.localeCompare(b.name), steps: (a, b) => b.steps.length - a.steps.length };
    return [...l].sort(by[sort]);
  }, [f, q, sort]);
  const count = (id: string) => TEMPLATES.filter((t) => id === 'all' || t.cat === id).length;
  const shown = limit && !more ? list.slice(0, limit) : list;
  return (
    <div className="browser">
      {title}
      <div className="feelings">{FEELINGS.map((x) => <button key={x.id} className={f === x.id ? 'on' : ''} onClick={() => setF(x.id)}><span>{x.icon}</span>{x.label}<small>{count(x.id)}</small></button>)}</div>
      <div className="tools">
        <input type="search" placeholder="Search templates…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="loved">Most loved</option><option value="newest">Newest first</option><option value="steps">Most to open</option><option value="az">A – Z</option></select>
      </div>
      <p className="showing">Showing {shown.length} of {list.length} gifts — all free</p>
      <div className="grid">{shown.map((t) => <TemplateCard key={t.id} tpl={t} />)}</div>
      {limit && list.length > limit && !more && <div className="center"><button className="btn ghost" onClick={() => setMore(true)}>Show all {list.length} templates</button></div>}
      {list.length === 0 && <p className="center">Nothing matches. Try another word, or <a href="#/new/blank">start from a blank page</a>.</p>}
    </div>
  );
}

export function PhoneDemo({ tplId, names }: { tplId: string; names?: { to?: string; from?: string } }) {
  const gift = useMemo(() => makeGift(findTemplate(tplId)!, names), [tplId]);
  return <div className="phone"><div className="notch" /><div className="screen"><Player gift={gift} embedded key={tplId} /></div></div>;
}
