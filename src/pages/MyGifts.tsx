import React, { useEffect, useRef, useState } from 'react';
import { Header, Footer } from './common';
import { listGifts, deleteGift, saveGift } from '../lib/storage';
import type { Gift } from '../lib/types';
import { themeVars } from '../lib/themes';
import { uid, clone } from '../lib/util';
import { findTemplate } from '../templates';

export default function MyGifts() {
  const [list, setList] = useState<Gift[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const load = () => listGifts().then(setList);
  useEffect(() => { load(); }, []);
  const dup = async (g: Gift) => { const n = { ...clone(g), id: uid(10), title: g.title + ' (copy)', createdAt: Date.now() }; await saveGift(n); load(); };
  const del = async (g: Gift) => { if (confirm(`Delete "${g.title}" for ${g.to}? This can't be undone.`)) { await deleteGift(g.id); load(); } };
  const backup = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(list)], { type: 'application/json' }));
    a.download = 'keepsake-gifts-backup.json'; a.click();
  };
  const restore = async (f?: File) => {
    if (!f) return;
    try { const arr = JSON.parse(await f.text()); for (const g of [].concat(arr)) if ((g as Gift).pages) await saveGift(g); load(); } catch { alert('That file is not a Keepsake backup.'); }
  };
  return (
    <div className="site">
      <Header />
      <section className="block">
        <div className="block-head"><span className="pill">Saved on this device</span><h1>My <em>gifts</em></h1><p>No account means your gifts live in this browser. Open one to edit it, then share the link again. Keep a backup file if you change phones.</p></div>
        <div className="row center"><a className="btn" href="#/gifts">+ New gift</a><button className="btn ghost" onClick={backup} disabled={!list?.length}>⬇ Backup all</button><button className="btn ghost" onClick={() => fileRef.current?.click()}>⬆ Restore backup</button><input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => restore(e.target.files?.[0])} /></div>
        {list === null ? <div className="center-msg"><div className="spinner" /></div> : list.length === 0 ? (
          <div className="empty-mine"><span>🎁</span><p>Nothing here yet. Gifts you make show up here automatically.</p><a className="btn" href="#/gifts">Make your first gift</a></div>
        ) : (
          <div className="mine-grid">{list.map((g) => {
            const v = themeVars(g.theme, g.colors, g.font) as any;
            return (
              <div key={g.id} className="mine-card">
                <a href={`#/edit/${g.id}`} className="mc-art" style={{ background: v['--page'], color: v['--text'] }}><b style={{ fontFamily: v['--font-display'] }}>For {g.to}</b><small>from {g.from}</small><i style={{ background: v['--accent'] }} /></a>
                <div className="mc-body">
                  <b>{g.title}</b>
                  <small>{findTemplate(g.templateId)?.name || 'Custom'} · {g.pages.length} pages · edited {new Date(g.updatedAt || 0).toLocaleDateString()}</small>
                  <div className="row"><a className="btn small" href={`#/edit/${g.id}`}>Edit</a><a className="btn ghost small" href={`#/play/${g.id}`}>Play</a><a className="btn ghost small" href={`#/edit/${g.id}?share=1`}>Share</a><button className="btn ghost small" onClick={() => dup(g)}>Copy</button><button className="btn ghost small danger" onClick={() => del(g)}>Delete</button></div>
                </div>
              </div>
            );
          })}</div>
        )}
      </section>
      <Footer />
    </div>
  );
}
