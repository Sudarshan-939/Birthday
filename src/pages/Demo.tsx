import React, { useMemo } from 'react';
import Player from '../player/Player';
import { findTemplate, makeGift } from '../templates';
import { nav } from '../lib/router';

export default function DemoPage({ id }: { id: string }) {
  const tpl = findTemplate(id);
  const gift = useMemo(() => tpl && makeGift(tpl), [id]);
  if (!tpl || !gift) return <div className="center-msg">No such template. <a href="#/gifts">Back</a></div>;
  return (
    <div className="full-player">
      <div className="demo-bar"><button onClick={() => history.length > 1 ? history.back() : nav('/t/' + id)}>← Back</button><span>Preview · {tpl.name}</span><a className="btn small" href={tpl.special === 'book' ? '#/book' : tpl.special === 'letter' ? '#/letter' : `#/new/${id}`}>Make this</a></div>
      <Player gift={gift} />
    </div>
  );
}
