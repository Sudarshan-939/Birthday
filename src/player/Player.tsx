import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Gift, Page, Sticker } from '../lib/types';
import { themeVars, isDark } from '../lib/themes';
import { fillDeep, fill, graphemes } from '../lib/util';
import { PIECES } from '../pieces';
import { playMusic, stopMusic, sfx, setSfxSet, isPlaying, isPaused } from '../lib/audio';
import { hearts, burst } from '../lib/fx';
import { doodleSvg } from '../lib/stickers';

export function StickerView({ s, selected, onSelect, onChange, onDelete, editable }: { s: Sticker; selected?: boolean; editable?: boolean; onSelect?: () => void; onChange?: (s: Sticker) => void; onDelete?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const start = (e: React.PointerEvent, mode: 'move' | 'rs') => {
    if (!editable) return;
    e.stopPropagation(); e.preventDefault(); onSelect?.();
    const parent = ref.current!.parentElement!.getBoundingClientRect();
    const el = ref.current!.getBoundingClientRect();
    const cx = el.left + el.width / 2, cy = el.top + el.height / 2;
    const sx = e.clientX, sy = e.clientY, o = { ...s };
    const d0 = Math.hypot(sx - cx, sy - cy), a0 = Math.atan2(sy - cy, sx - cx);
    const mv = (ev: PointerEvent) => {
      if (mode === 'move') onChange?.({ ...o, x: Math.max(-5, Math.min(100, o.x + ((ev.clientX - sx) / parent.width) * 100)), y: Math.max(-20, o.y + (ev.clientY - sy)) });
      else { const d = Math.hypot(ev.clientX - cx, ev.clientY - cy), a = Math.atan2(ev.clientY - cy, ev.clientX - cx); onChange?.({ ...o, scale: Math.max(0.3, Math.min(6, (o.scale * d) / Math.max(1, d0))), rot: o.rot + ((a - a0) * 180) / Math.PI }); }
    };
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  };
  const [doodle, color] = s.kind === 'doodle' ? s.value.split('|') : ['', ''];
  return (
    <div ref={ref} className={`stk ${selected ? 'sel' : ''} ${editable ? 'ed' : ''} anim-${s.anim || 'none'}`} style={{ left: s.x + '%', top: s.y, transform: `translate(-50%,-50%) rotate(${s.rot}deg) scale(${s.scale})` }} onPointerDown={(e) => start(e, 'move')}>
      {s.kind === 'emoji' && <span className="e">{s.value}</span>}
      {s.kind === 'word' && <span className="w">{s.value}</span>}
      {s.kind === 'img' && <img src={s.value} alt="" draggable={false} />}
      {s.kind === 'doodle' && <img src={doodleSvg(doodle, color || '#e0567a')} alt="" draggable={false} />}
      {selected && editable && <><button className="h rs" onPointerDown={(e) => start(e, 'rs')} title="drag to resize & turn">⤡</button><button className="h del" onPointerDown={(e) => { e.stopPropagation(); onDelete?.(); }} title="remove">✕</button></>}
    </div>
  );
}

function Effects({ effect }: { effect: Gift['effect'] }) {
  const t = effect?.type || 'none';
  if (t === 'none') return null;
  const ch: Record<string, string[]> = { hearts: ['💗', '💕', '❤️', '💖'], confetti: ['🎊', '🎉', '✨'], stars: ['✦', '✧', '⭐', '✨'], petals: ['🌸', '🌷', '🏵️'], snow: ['❄', '❅', '❆'], bubbles: ['🫧'], emoji: graphemes(effect.emoji || '💖') };
  const list = ch[t] || ['✨'];
  return <div className={`fx fx-${t}`} aria-hidden>{Array.from({ length: 16 }, (_, i) => <span key={i} style={{ left: `${(i * 61) % 100}%`, animationDelay: `${(i * 0.73) % 9}s`, animationDuration: `${8 + (i % 5) * 2}s`, fontSize: `${14 + (i % 4) * 6}px` }}>{list[i % list.length]}</span>)}</div>;
}

export function PageView({ page, gift, editing, next, selectedSticker, onSticker, onSelectSticker, onDeleteSticker }: { page: Page; gift: Gift; editing?: boolean; next?: () => void; selectedSticker?: string | null; onSticker?: (s: Sticker) => void; onSelectSticker?: (id: string | null) => void; onDeleteSticker?: (id: string) => void }) {
  const ctx = { name: gift.to, sender: gift.from, age: gift.age, editing, next };
  return (
    <div className="gift-page-inner" style={page.bg ? { background: page.bg } : undefined} onPointerDown={() => onSelectSticker?.(null)}>
      {page.pieces.map((pc) => {
        const def = PIECES[pc.type];
        if (!def) return null;
        const props = fillDeep(pc.props, ctx);
        const R = def.Render;
        return <section key={pc.id} className={def.bare ? 'piece bare' : 'piece pc-card'} data-type={pc.type}><ErrorBoundary><R p={props} ctx={ctx} /></ErrorBoundary></section>;
      })}
      {page.pieces.length === 0 && <div className="empty-page">{editing ? 'This page is empty — add something from the left ←' : ''}</div>}
      <div className="stk-layer">{page.stickers.map((s) => <StickerView key={s.id} s={s} editable={editing && !!onSticker} selected={selectedSticker === s.id} onSelect={() => onSelectSticker?.(s.id)} onChange={(n) => onSticker?.(n)} onDelete={() => onDeleteSticker?.(s.id)} />)}</div>
    </div>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { err: any }> {
  state = { err: null };
  static getDerivedStateFromError(err: any) { return { err }; }
  render() { return this.state.err ? <div className="pc-hint">This piece could not load.</div> : this.props.children; }
}

function LockScreen({ gift, onOpen }: { gift: Gift; onOpen: () => void }) {
  const [now, setNow] = useState(Date.now());
  const [pw, setPw] = useState(''); const [bad, setBad] = useState(false);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const until = gift.lock?.until ? new Date(gift.lock.until).getTime() : 0;
  const left = until - now;
  const timeOk = !until || left <= 0;
  useEffect(() => { if (timeOk && !gift.lock?.password) onOpen(); }, [timeOk]);
  const s = Math.max(0, Math.floor(left / 1000));
  return (
    <div className="lock-screen">
      <div className="lk-ic">{timeOk ? '🔑' : '🔒'}</div>
      <h2>{fill(gift.lock?.message || 'Something special is waiting for {name}', { name: gift.to, sender: gift.from })}</h2>
      {!timeOk ? <>
        <div className="lk-cd">{[['days', Math.floor(s / 86400)], ['hrs', Math.floor(s / 3600) % 24], ['min', Math.floor(s / 60) % 60], ['sec', s % 60]].map(([l, v]) => <div key={l as string}><b>{String(v).padStart(2, '0')}</b><small>{l}</small></div>)}</div>
        <p>It unlocks on {new Date(until).toLocaleString('en', { dateStyle: 'full', timeStyle: 'short' })}</p>
      </> : <>
        {gift.lock?.hint && <p className="lk-hint">Hint: {gift.lock.hint}</p>}
        <div className={`lk-pw ${bad ? 'bad' : ''}`}><input type="password" placeholder="secret word" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()} /><button onClick={go}>Open</button></div>
      </>}
    </div>
  );
  function go() { if (pw.trim().toLowerCase() === String(gift.lock?.password || '').trim().toLowerCase()) onOpen(); else { setBad(true); setTimeout(() => setBad(false), 500); } }
}

function Opener({ gift, onOpen }: { gift: Gift; onOpen: () => void }) {
  const [opening, setOpening] = useState(false);
  const style = gift.opener.style || 'envelope';
  const go = (e: React.MouseEvent) => { if (opening) return; setOpening(true); sfx('open'); hearts(e.currentTarget as any); setTimeout(onOpen, style === 'tap' ? 300 : 1100); };
  const line = fill(gift.opener.line || 'For {name} ♡', { name: gift.to, sender: gift.from });
  return (
    <div className={`opener op-${style} ${opening ? 'opening' : ''}`} onClick={go}>
      {style === 'envelope' && <div className="op-env"><div className="b" /><div className="paper">♡</div><div className="f"><span>{line}</span></div><div className="flap" /><div className="seal">💌</div></div>}
      {style === 'giftbox' && <div className="op-box"><div className="lid" /><div className="body"><span>{line}</span></div></div>}
      {style === 'curtain' && <><div className="cur l" /><div className="cur r" /><div className="op-cur-txt">{line}</div></>}
      {style === 'tap' && <div className="op-tap"><div className="heart">💗</div><b>{line}</b></div>}
      <div className="op-hint">{style === 'curtain' ? 'tap to raise the curtain' : 'tap to open'}</div>
    </div>
  );
}

export default function Player({ gift, onExit, embedded }: { gift: Gift; onExit?: () => void; embedded?: boolean }) {
  const [phase, setPhase] = useState<'lock' | 'opener' | 'pages'>(() => (gift.lock?.until && new Date(gift.lock.until).getTime() > Date.now()) || gift.lock?.password ? 'lock' : gift.opener?.enabled ? 'opener' : 'pages');
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [muted, setMuted] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const vars = useMemo(() => themeVars(gift.theme, gift.colors, gift.font), [gift.theme, gift.colors, gift.font]);
  const pages = gift.pages;

  useEffect(() => { setSfxSet(gift.sfx || 'chimes'); }, [gift.sfx]);
  useEffect(() => () => stopMusic(), []);
  useEffect(() => { if (phase === 'pages' && !gift.opener?.enabled && !embedded) { /* music needs a gesture; started from first tap */ } }, [phase]);

  const startMusic = () => { if (!muted && gift.music?.track !== 'none') playMusic(gift.music.track, gift.music.custom, gift.music.volume); };
  const afterLock = () => setPhase(gift.opener?.enabled ? 'opener' : 'pages');
  const open = () => { setPhase('pages'); startMusic(); };
  const go = (n: number) => {
    if (n < 0 || n >= pages.length) return;
    setDir(n > i ? 1 : -1); setI(n); sfx('page');
    scroller.current?.scrollTo({ top: 0 });
    if (n === pages.length - 1) setTimeout(() => burst({ count: 60, emoji: ['✨', '💖'] }), 400);
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return; if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  });
  const toggleMute = () => { if (muted || !isPlaying()) { setMuted(false); playMusic(gift.music.track, gift.music.custom, gift.music.volume); } else { setMuted(true); stopMusic(); } };

  return (
    <div className={`player ${isDark(gift.theme) ? 'dark' : ''} ${embedded ? 'embedded' : ''}`} style={vars as any} onPointerDown={() => { if (phase === 'pages' && !muted && !isPlaying() && !isPaused() && gift.music?.track !== 'none') startMusic(); }}>
      <Effects effect={gift.effect} />
      {phase === 'lock' && <LockScreen gift={gift} onOpen={afterLock} />}
      {phase === 'opener' && <Opener gift={gift} onOpen={open} />}
      {phase === 'pages' && (
        <>
          <div className="pl-top">
            {onExit && <button className="pl-ic" onClick={() => { stopMusic(); onExit(); }} title="Close">✕</button>}
            <div className="pl-prog">{pages.map((_, k) => <i key={k} className={k <= i ? 'on' : ''} onClick={() => go(k)} />)}</div>
            {gift.music?.track !== 'none' && <button className="pl-ic" onClick={toggleMute} title="Music">{muted ? '🔇' : '🎵'}</button>}
          </div>
          <div className="pl-scroll" ref={scroller}>
            <div key={i} className={`gift-page tr-${gift.transition || 'slide'} ${dir > 0 ? 'fwd' : 'back'}`}>
              <PageView page={pages[i]} gift={gift} next={() => go(i + 1)} />
              {i === pages.length - 1 && <div className="pl-end"><button className="pc-btn ghost" onClick={() => { go(0); }}>↺ Watch again</button>{!embedded && <a className="pl-made" href={location.pathname + '#/'}>♡ Make a gift back</a>}</div>}
            </div>
          </div>
          {pages.length > 1 && <div className="pl-nav">
            <button onClick={() => go(i - 1)} disabled={i === 0}>‹</button>
            <span>{i + 1} / {pages.length}</span>
            <button className="nx" onClick={() => go(i + 1)} disabled={i >= pages.length - 1}>{i >= pages.length - 1 ? '♡' : 'Next ›'}</button>
          </div>}
        </>
      )}
    </div>
  );
}
