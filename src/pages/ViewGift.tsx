import React, { useEffect, useState } from 'react';
import Player from '../player/Player';
import { decodeGift, fetchSharedGift } from '../lib/share';
import { getGift } from '../lib/storage';
import type { Gift } from '../lib/types';

export default function ViewGift({ serverId, data }: { serverId?: string; data?: string }) {
  const [g, setG] = useState<Gift | null | undefined>(undefined);
  useEffect(() => {
    if (data) setG(decodeGift(data));
    else if (serverId) fetchSharedGift(serverId).then(setG).catch(() => setG(null));
  }, [serverId, data]);
  if (g === undefined) return <div className="center-msg"><div className="spinner" />Opening your gift…</div>;
  if (!g) return <div className="center-msg">This gift link seems broken or has expired. Ask the sender for a new one.<br /><a href="#/">Make your own gift →</a></div>;
  return <div className="full-player"><Player gift={g} /></div>;
}

export function ViewLocalGift({ id }: { id: string }) {
  const [g, setG] = useState<Gift | null | undefined>(undefined);
  useEffect(() => { getGift(id).then((x) => setG(x || null)); }, [id]);
  if (g === undefined) return <div className="center-msg"><div className="spinner" /></div>;
  if (!g) return <div className="center-msg">Not found on this device. <a href="#/my">My gifts</a></div>;
  return <div className="full-player"><div className="demo-bar"><a href={`#/edit/${id}`}>← Back to editing</a><span>{g.title}</span><span /></div><Player gift={g} /></div>;
}
