import React, { useEffect, useRef, useState } from 'react';
import { PieceDef, F, H, Hint, Para, Img, DEMO } from './core';
import { sfx, setVolume } from '../lib/audio';

function useAudio(src?: string) {
  const el = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  useEffect(() => () => { el.current?.pause(); }, []);
  const toggle = () => {
    if (!src) { setPlaying((v) => !v); return; }
    if (!el.current) { el.current = new Audio(src); el.current.onended = () => { setPlaying(false); setVolume(0.6); }; el.current.ontimeupdate = () => setT(el.current!.currentTime / (el.current!.duration || 1)); }
    if (playing) { el.current.pause(); setPlaying(false); setVolume(0.6); } else { setVolume(0.08); el.current.play(); setPlaying(true); }
  };
  return { playing, toggle, t };
}

const Vinyl: PieceDef = {
  type: 'vinyl', label: 'Vinyl player', icon: '💿', cat: 'music', desc: 'A record that spins with your song name', bare: true,
  fields: [F.t('song', 'Song name'), F.t('artist', 'Line under it'), F.ph('photo', 'Label photo (optional)'), F.au('audio', 'Audio clip (optional)')],
  defaults: () => ({ song: 'Our song', artist: '{name} & {sender}', photo: '', audio: '' }),
  Render: ({ p }) => { const a = useAudio(p.audio); return (
    <div className="pc-vinyl" onClick={() => { sfx('tap'); a.toggle(); }}>
      <div className={`rec ${a.playing ? 'spin' : ''}`}><div className="lbl">{p.photo ? <Img src={p.photo} /> : '♥'}</div></div>
      <div className={`arm ${a.playing ? 'on' : ''}`} />
      <div className="meta"><b>{p.song}</b><small>{p.artist}</small><Hint>{a.playing ? 'tap to pause' : 'tap to play'}</Hint></div>
    </div>); },
};

const Cassette: PieceDef = {
  type: 'cassette', label: 'Cassette mixtape', icon: '📼', cat: 'music', desc: 'A mixtape with your tracklist', bare: true,
  fields: [F.t('title', 'Tape title'), F.t('side', 'Side'), F.s('tracks', 'Tracklist', 12), F.au('audio', 'Audio clip (optional)')],
  defaults: () => ({ title: 'Mixtape for {name}', side: 'Side A', tracks: ['The song from our first drive', 'The one you sing badly', 'Rainy-day chai song', 'Slow dance in the kitchen'], audio: '' }),
  Render: ({ p }) => { const a = useAudio(p.audio); const [cur, setCur] = useState(0); return (
    <div className="pc-cassette">
      <div className="tape" onClick={() => { a.toggle(); sfx('tap'); }}><div className="label"><b>{p.title}</b><small>{p.side}</small></div><div className="reels"><i className={a.playing ? 'spin' : ''} /><i className={a.playing ? 'spin' : ''} /></div></div>
      <ol>{(p.tracks || []).map((t: string, i: number) => <li key={i} className={cur === i ? 'on' : ''} onClick={() => { setCur(i); sfx('tap'); }}>{cur === i && a.playing ? '♫ ' : ''}{t}</li>)}</ol>
    </div>); },
};

const Playlist: PieceDef = {
  type: 'playlist', label: 'Playlist', icon: '🎶', cat: 'music', desc: 'Songs that mean something, with why',
  fields: [F.t('title', 'Title'), F.it('items', 'Songs', [F.t('song', 'Song'), F.t('why', 'Why it reminds you')], 12)],
  defaults: () => ({ title: 'Songs that remind me of you', items: [{ song: 'Song one', why: 'reminds me of our drives' }, { song: 'Song two', why: 'our first dance (in the kitchen)' }, { song: 'Song three', why: 'that trip to the hills' }] }),
  Render: ({ p }) => { const [on, setOn] = useState(-1); return (
    <div className="pc-playlist"><div className="hd"><span className="ic">♫</span><div><small>Playlist</small><b>{p.title}</b></div></div>
      {(p.items || []).map((s: any, i: number) => <div key={i} className={`row ${on === i ? 'on' : ''}`} onClick={() => { setOn(i); sfx('tap'); }}><span className="n">{on === i ? <span className="eq"><i /><i /><i /></span> : i + 1}</span><div><b>{s.song}</b><small>{s.why}</small></div></div>)}</div>); },
};

const NowPlaying: PieceDef = {
  type: 'nowplaying', label: 'Now playing', icon: '▶️', cat: 'music', desc: 'A now-playing card for your song', bare: true,
  fields: [F.ph('photo', 'Cover photo'), F.t('song', 'Song'), F.t('artist', 'Artist'), F.au('audio', 'Audio clip (optional)')],
  defaults: () => ({ photo: DEMO(1).src, song: 'Our song', artist: 'by the two of us', audio: '' }),
  Render: ({ p }) => { const a = useAudio(p.audio); const [liked, setLiked] = useState(true); return (
    <div className="pc-np"><Img src={p.photo} className={a.playing ? 'pl' : ''} /><div className="row"><div><b>{p.song}</b><small>{p.artist}</small></div><button onClick={() => setLiked(!liked)} className="lk">{liked ? '♥' : '♡'}</button></div>
      <div className="bar"><i style={{ width: (p.audio ? a.t * 100 : a.playing ? 60 : 38) + '%' }} /></div><div className="tm"><span>1:43</span><span>∞</span></div>
      <div className="ctl"><span>⏮</span><button onClick={() => { sfx('tap'); a.toggle(); }}>{a.playing ? '❚❚' : '▶'}</button><span>⏭</span></div></div>); },
};

const MapPins: PieceDef = {
  type: 'mappins', label: 'Map pins', icon: '🗺️', cat: 'music', desc: 'Your places on a little map',
  fields: [F.t('title', 'Title'), F.it('items', 'Places', [F.t('place', 'Place'), F.ta('note', 'Memory'), F.n('x', 'Across (%)', 0, 100), F.n('y', 'Down (%)', 0, 100)], 8)],
  defaults: () => ({ title: 'Our places', items: [{ place: 'First date', note: 'That tiny cafe where you spilled the coffee.', x: 22, y: 30 }, { place: 'The beach', note: 'You ran into the waves in jeans.', x: 70, y: 55 }, { place: 'Home', note: 'Wherever you are.', x: 45, y: 75 }] }),
  Render: ({ p }) => { const [o, setO] = useState(0); const it = p.items || []; return (
    <div className="pc-map"><H>{p.title}</H><div className="mapbox">{it.map((m: any, i: number) => <button key={i} className={`pin ${o === i ? 'on' : ''}`} style={{ left: m.x + '%', top: m.y + '%' }} onClick={() => { setO(i); sfx('pop'); }}>📍<span>{m.place}</span></button>)}</div>
      {it[o] && <div className="note"><b>{it[o].place}</b> — {it[o].note}</div>}</div>); },
};

const VoiceNote: PieceDef = {
  type: 'voicenote', label: 'Voice note', icon: '🎙️', cat: 'music', desc: 'Your own voice — record it right in the editor',
  fields: [F.t('label', 'Label'), F.au('audio', 'Voice note (record or upload)')],
  defaults: () => ({ label: 'Play this when you miss my voice', audio: '' }),
  Render: ({ p }) => { const a = useAudio(p.audio); const bars = Array.from({ length: 28 }, (_, i) => 20 + Math.abs(Math.sin(i * 1.7)) * 70); return (
    <div className="pc-voice"><button className="play" onClick={() => { sfx('tap'); a.toggle(); }}>{a.playing ? '❚❚' : '▶'}</button>
      <div className="wave">{bars.map((h, i) => <i key={i} style={{ height: h + '%', opacity: p.audio && i / bars.length < a.t ? 1 : 0.4 }} className={a.playing ? 'live' : ''} />)}</div>
      <div className="lab">{p.label}{!p.audio && <small> (add a recording in the editor)</small>}</div></div>); },
};

function ytId(u: string) { const m = (u || '').match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/); return m ? m[1] : null; }
const Video: PieceDef = {
  type: 'video', label: 'Video', icon: '📺', cat: 'music', desc: 'A YouTube video or a video link', bare: true,
  fields: [F.t('url', 'YouTube or video link'), F.t('caption', 'Caption')],
  defaults: () => ({ url: '', caption: 'watch this one ♡' }),
  Render: ({ p }) => { const id = ytId(p.url); return (
    <div className="pc-video">{id ? <iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title="video" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : p.url ? <video src={p.url} controls playsInline /> : <div className="empty">▶ add a YouTube link in the editor</div>}{p.caption && <div className="cap">{p.caption}</div>}</div>); },
};

export const MUSIC: PieceDef[] = [Vinyl, Cassette, Playlist, NowPlaying, MapPins, VoiceNote, Video];
