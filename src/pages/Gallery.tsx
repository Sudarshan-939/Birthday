import React from 'react';
import { Header, Footer, TemplateBrowser } from './common';

export default function Gallery({ query }: { query: Record<string, string> }) {
  return (
    <div className="site">
      <Header />
      <section className="block">
        <TemplateBrowser key={query.f || 'all'} initial={query.f || 'all'} title={<div className="block-head"><span className="pill">All templates · all free</span><h1>Find the right <em>gift</em></h1><p>Pick a feeling. Preview anything. Every template, sticker, song and extra is free to use. No sign-up.</p></div>} />
      </section>
      <section className="block cta"><h2>Can't find it?</h2><p>Build your own gift from {''}any of the pieces, on as many pages as you like.</p><div className="row center"><a className="btn" href="#/new/blank">Start from a blank page</a><a className="btn ghost" href="#/new/make-your-own">Start from the 6-page sample</a></div></section>
      <Footer />
    </div>
  );
}
