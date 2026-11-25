import React, { useEffect, useState } from 'react';
import { useRoute, nav } from './lib/router';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import TemplatePage from './pages/TemplatePage';
import EditorPage from './editor/Editor';
import MyGifts from './pages/MyGifts';
import ViewGift, { ViewLocalGift } from './pages/ViewGift';
import DemoPage from './pages/Demo';
import LoveBook from './pages/LoveBook';
import LoveLetter from './pages/LoveLetter';
import Help from './pages/Help';
import Player from './player/Player';
import { findTemplate, makeGift, blankGift } from './templates';
import { saveGift } from './lib/storage';
import type { Gift } from './lib/types';

declare global { interface Window { __KEEPSAKE_GIFT__?: Gift } }

function NewGift({ tplId, query }: { tplId: string; query: Record<string, string> }) {
  useEffect(() => {
    const tpl = findTemplate(tplId);
    const g = tplId === 'blank' || !tpl ? blankGift() : makeGift(tpl, { to: query.to, from: query.from, age: query.age });
    saveGift(g).then(() => nav('/edit/' + g.id, true));
  }, [tplId]);
  return <div className="center-msg">Setting up your gift…</div>;
}

export default function App() {
  // A downloaded gift file: open straight into the gift, nothing else.
  if (window.__KEEPSAKE_GIFT__) return <Player gift={window.__KEEPSAKE_GIFT__} />;
  return <Routes />;
}

function Routes() {
  const r = useRoute();
  useEffect(() => { window.scrollTo(0, 0); }, [r.path]);
  const [a, b] = r.parts;
  switch (a) {
    case undefined: return <Home />;
    case 'gifts': return <Gallery query={r.query} />;
    case 't': return <TemplatePage id={b} />;
    case 'new': return <NewGift tplId={b} query={r.query} />;
    case 'edit': return <EditorPage id={b} />;
    case 'play': return <ViewLocalGift id={b} />;
    case 'demo': return <DemoPage id={b} />;
    case 'g': return <ViewGift serverId={b} />;
    case 'd': return <ViewGift data={r.path.slice(3)} />;
    case 'my': return <MyGifts />;
    case 'book': return <LoveBook />;
    case 'letter': return <LoveLetter />;
    case 'help': return <Help />;
    default: return <Home />;
  }
}
