import React, { useEffect, useRef, useState } from 'react';
import type { Field, Photo } from '../lib/types';
import { sfx } from '../lib/audio';

export type RCtx = { name: string; sender: string; age?: string; editing?: boolean; next?: () => void };

export type PieceDef = {
  type: string;
  label: string;
  icon: string;
  cat: string;
  desc: string;
  fields: Field[];
  defaults: () => Record<string, any>;
  Render: React.FC<{ p: any; ctx: RCtx }>;
  bare?: boolean; // render without the card wrapper
};

export const CATS = [
  { id: 'words', label: 'Words & letters' },
  { id: 'story', label: 'Story pieces' },
  { id: 'photos', label: 'Photos' },
  { id: 'music', label: 'Music & places' },
  { id: 'reveal', label: 'Tap & reveal' },
  { id: 'games', label: 'Little games' },
  { id: 'festive', label: 'Festive' },
  { id: 'cards', label: '3D & cards' },
  { id: 'desi', label: 'Desi specials' },
  { id: 'xp', label: 'Big experiences' },
  { id: 'decor', label: 'Decor & drawing' },
];

// ---- field shorthands ----
export const F = {
  t: (key: string, label: string, placeholder?: string): Field => ({ key, label, type: 'text', placeholder }),
  ta: (key: string, label: string, help?: string): Field => ({ key, label, type: 'textarea', help }),
  n: (key: string, label: string, min?: number, max?: number): Field => ({ key, label, type: 'number', min, max }),
  d: (key: string, label: string): Field => ({ key, label, type: 'date' }),
  dt: (key: string, label: string): Field => ({ key, label, type: 'datetime' }),
  c: (key: string, label: string): Field => ({ key, label, type: 'color' }),
  b: (key: string, label: string): Field => ({ key, label, type: 'toggle' }),
  e: (key: string, label: string): Field => ({ key, label, type: 'emoji' }),
  ph: (key: string, label: string): Field => ({ key, label, type: 'photo' }),
  phs: (key: string, label: string, max = 12): Field => ({ key, label, type: 'photos', max }),
  s: (key: string, label: string, max = 20, help?: string): Field => ({ key, label, type: 'strings', max, help }),
  it: (key: string, label: string, of: Field[], max = 20): Field => ({ key, label, type: 'items', of, max }),
  sel: (key: string, label: string, opts: [string, string][]): Field => ({ key, label, type: 'select', options: opts.map(([value, label]) => ({ value, label })) }),
  au: (key: string, label: string): Field => ({ key, label, type: 'audio' }),
  dr: (key: string, label: string): Field => ({ key, label, type: 'drawing' }),
  r: (key: string, label: string, min: number, max: number, step = 1): Field => ({ key, label, type: 'range', min, max, step }),
};

export const DEMO = (n: number): Photo => ({ src: `/demo/photo-${((n - 1) % 4) + 1}.webp` });
export const demoPhotos = (k: number, caps: string[] = []): Photo[] => Array.from({ length: k }, (_, i) => ({ ...DEMO(i + 1), caption: caps[i] || '' }));

// ---- shared UI ----
export function Img({ src, alt = '', className, style, onClick }: { src?: string; alt?: string; className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  if (!src) return <div className={'pc-img-empty ' + (className || '')} style={style} onClick={onClick}>♡</div>;
  return <img src={src} alt={alt} className={className} style={style} onClick={onClick} draggable={false} loading="lazy" />;
}

export function Hidden({ open, children, className = '' }: { open: boolean; children: React.ReactNode; className?: string }) {
  return <div className={`pc-hidden ${open ? 'open' : ''} ${className}`}>{open ? children : null}</div>;
}

export function H({ children, small }: { children: React.ReactNode; small?: boolean }) {
  if (!children) return null;
  return <h3 className={small ? 'pc-h pc-h-sm' : 'pc-h'}>{children}</h3>;
}

export function Hint({ children }: { children: React.ReactNode }) {
  return <div className="pc-hint">{children}</div>;
}

export function Btn({ children, onClick, ghost, style, className = '' }: { children: React.ReactNode; onClick?: (e: React.MouseEvent) => void; ghost?: boolean; style?: React.CSSProperties; className?: string }) {
  return <button className={`pc-btn ${ghost ? 'ghost' : ''} ${className}`} style={style} onClick={(e) => { sfx('tap'); onClick?.(e); }}>{children}</button>;
}

export function Para({ text, className = 'pc-p' }: { text?: string; className?: string }) {
  if (!text) return null;
  return <>{text.split(/\n\s*\n/).map((t, i) => <p key={i} className={className}>{t.split('\n').map((l, j) => <React.Fragment key={j}>{j > 0 && <br />}{l}</React.Fragment>)}</p>)}</>;
}

export function useTypewriter(text: string, speed = 28, start = true) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    setN(0);
    let i = 0;
    const id = setInterval(() => { i += 1; setN(i); if (i >= text.length) clearInterval(id); }, speed);
    return () => clearInterval(id);
  }, [text, start, speed]);
  return text.slice(0, n);
}

export function useInView<T extends HTMLElement>(threshold = 0.3): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el || seen) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen];
}

export function useCountUp(target: number, run: boolean, dur = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    const t0 = performance.now(); let raf = 0;
    const step = (t: number) => { const k = Math.min(1, (t - t0) / dur); setV(Math.round(target * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, run, dur]);
  return v;
}

/** Generic "tap things one at a time, each reveals a line, then a finale" helper. */
export function useSequence(count: number) {
  const [done, setDone] = useState<number[]>([]);
  const hit = (i: number) => {
    if (done.includes(i)) return false;
    setDone((d) => [...d, i]);
    return true;
  };
  return { done, hit, all: done.length >= count && count > 0, reset: () => setDone([]), last: done[done.length - 1] };
}
