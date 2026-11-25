import React, { useEffect, useRef, useState } from 'react';
import type { Field, Photo } from '../lib/types';
import { compressImage, readFile } from '../lib/image';

type P = { f: Field; v: any; set: (v: any) => void };

const EMOJI_QUICK = ['💖', '🎂', '🌹', '✨', '🧸', '🎁', '🌸', '⭐', '🥺', '🎉', '☕', '🪔', '🌙', '🦋', '💌', '🍫'];

export function FieldInput({ f, v, set }: P) {
  switch (f.type) {
    case 'text': return <Lbl f={f}><input value={v ?? ''} placeholder={f.placeholder} onChange={(e) => set(e.target.value)} /></Lbl>;
    case 'textarea': return <Lbl f={f}><textarea rows={Math.min(10, Math.max(3, String(v || '').split('\n').length + 1))} value={v ?? ''} onChange={(e) => set(e.target.value)} /></Lbl>;
    case 'number': return <Lbl f={f}><input type="number" min={f.min} max={f.max} value={v ?? ''} onChange={(e) => set(e.target.value === '' ? '' : Number(e.target.value))} /></Lbl>;
    case 'date': return <Lbl f={f}><input type="date" value={v ?? ''} onChange={(e) => set(e.target.value)} /></Lbl>;
    case 'datetime': return <Lbl f={f}><input type="datetime-local" value={v ?? ''} onChange={(e) => set(e.target.value)} /></Lbl>;
    case 'color': return <Lbl f={f}><div className="color-row"><input type="color" value={v || '#e0567a'} onChange={(e) => set(e.target.value)} /><input value={v ?? ''} onChange={(e) => set(e.target.value)} placeholder="#e0567a" /></div></Lbl>;
    case 'range': return <Lbl f={f}><div className="color-row"><input type="range" min={f.min} max={f.max} step={f.step || 1} value={v ?? f.min ?? 0} onChange={(e) => set(Number(e.target.value))} /><b>{v}</b></div></Lbl>;
    case 'select': return <Lbl f={f}><div className="seg wrap">{f.options!.map((o) => <button key={o.value} className={String(v) === o.value ? 'on' : ''} onClick={() => set(o.value)}>{o.label}</button>)}</div></Lbl>;
    case 'toggle': return <label className="toggle"><input type="checkbox" checked={!!v} onChange={(e) => set(e.target.checked)} /><span />{f.label}</label>;
    case 'emoji': return <Lbl f={f}><input className="emoji-in" value={v ?? ''} onChange={(e) => set(e.target.value)} /><div className="emoji-quick">{EMOJI_QUICK.map((e) => <button key={e} onClick={() => set(e)}>{e}</button>)}</div></Lbl>;
    case 'photo': return <Lbl f={f}><PhotoInput v={v} set={set} /></Lbl>;
    case 'photos': return <Lbl f={f}><PhotosInput v={v || []} set={set} max={f.max || 12} /></Lbl>;
    case 'strings': return <Lbl f={f}><StringsInput v={v || []} set={set} max={f.max || 20} /></Lbl>;
    case 'items': return <Lbl f={f}><ItemsInput f={f} v={v || []} set={set} /></Lbl>;
    case 'audio': return <Lbl f={f}><AudioInput v={v} set={set} /></Lbl>;
    case 'drawing': return <Lbl f={f}><DrawingInput v={v} set={set} /></Lbl>;
    default: return null;
  }
}

function Lbl({ f, children }: { f: Field; children: React.ReactNode }) {
  return <div className="fld"><span className="fl">{f.label}</span>{children}{f.help && <small className="help">{f.help}</small>}</div>;
}

const move = <T,>(a: T[], i: number, d: number) => { const b = [...a]; const j = i + d; if (j < 0 || j >= b.length) return b; [b[i], b[j]] = [b[j], b[i]]; return b; };

export function PhotoInput({ v, set, compact }: { v?: string; set: (v: string) => void; compact?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = async (file?: File) => { if (!file) return; setBusy(true); try { set(await compressImage(file)); } finally { setBusy(false); } };
  return (
    <div className={`photo-in ${compact ? 'compact' : ''}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}>
      {v ? <img src={v} alt="" onClick={() => ref.current?.click()} /> : <button className="ph-empty" onClick={() => ref.current?.click()}>{busy ? '…' : '＋ photo'}</button>}
      <div className="ph-acts">
        <button onClick={() => ref.current?.click()}>{busy ? 'Loading…' : v ? 'Change' : 'Upload'}</button>
        {v && <button onClick={() => set('')}>Remove</button>}
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
}

export function PhotosInput({ v, set, max }: { v: Photo[]; set: (v: Photo[]) => void; max: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const add = async (files: FileList | null) => {
    if (!files) return; setBusy(true);
    const out: Photo[] = [];
    for (const f of Array.from(files).slice(0, max - v.length)) out.push({ src: await compressImage(f), caption: '' });
    set([...v, ...out]); setBusy(false);
  };
  return (
    <div className="photos-in">
      {v.map((p, i) => (
        <div key={i} className="pi-row">
          <PhotoInput compact v={p.src} set={(src) => set(v.map((x, k) => (k === i ? { ...x, src } : x)))} />
          <input placeholder="caption" value={p.caption || ''} onChange={(e) => set(v.map((x, k) => (k === i ? { ...x, caption: e.target.value } : x)))} />
          <div className="mini-acts"><button onClick={() => set(move(v, i, -1))}>↑</button><button onClick={() => set(move(v, i, 1))}>↓</button><button onClick={() => set(v.filter((_, k) => k !== i))}>✕</button></div>
        </div>
      ))}
      {v.length < max && <button className="add-row" onClick={() => ref.current?.click()}>{busy ? 'Adding…' : `＋ Add photos (${v.length}/${max})`}</button>}
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
    </div>
  );
}

export function StringsInput({ v, set, max }: { v: string[]; set: (v: string[]) => void; max: number }) {
  return (
    <div className="strings-in">
      {v.map((s, i) => (
        <div key={i} className="si-row">
          <span className="n">{i + 1}</span>
          <input value={s} onChange={(e) => set(v.map((x, k) => (k === i ? e.target.value : x)))} />
          <div className="mini-acts"><button onClick={() => set(move(v, i, -1))}>↑</button><button onClick={() => set(v.filter((_, k) => k !== i))}>✕</button></div>
        </div>
      ))}
      {v.length < max && <button className="add-row" onClick={() => set([...v, ''])}>＋ Add ({v.length}/{max})</button>}
    </div>
  );
}

function blankItem(of: Field[]) {
  const o: any = {};
  of.forEach((f) => { o[f.key] = f.type === 'photos' || f.type === 'strings' || f.type === 'items' ? [] : f.type === 'toggle' ? false : f.type === 'number' ? 0 : f.type === 'select' ? f.options?.[0]?.value : ''; });
  return o;
}

export function ItemsInput({ f, v, set }: { f: Field; v: any[]; set: (v: any[]) => void }) {
  const [open, setOpen] = useState<number | null>(v.length <= 3 ? -1 : null);
  const of = f.of || [];
  const titleOf = (it: any) => { const k = of.find((x) => x.type === 'text' || x.type === 'textarea'); const s = k ? String(it[k.key] || '') : ''; return s.slice(0, 40) || '(empty)'; };
  return (
    <div className="items-in">
      {v.map((it, i) => {
        const isOpen = open === -1 || open === i;
        return (
          <div key={i} className={`it-card ${isOpen ? 'open' : ''}`}>
            <div className="it-head" onClick={() => setOpen(open === i ? null : i)}>
              <span className="n">{i + 1}</span><b>{titleOf(it)}</b>
              <div className="mini-acts" onClick={(e) => e.stopPropagation()}><button onClick={() => set(move(v, i, -1))}>↑</button><button onClick={() => set(move(v, i, 1))}>↓</button><button onClick={() => set([...v.slice(0, i + 1), JSON.parse(JSON.stringify(it)), ...v.slice(i + 1)])}>⧉</button><button onClick={() => set(v.filter((_, k) => k !== i))}>✕</button></div>
            </div>
            {isOpen && <div className="it-body">{of.map((sf) => <FieldInput key={sf.key} f={sf} v={it[sf.key]} set={(nv) => set(v.map((x, k) => (k === i ? { ...x, [sf.key]: nv } : x)))} />)}</div>}
          </div>
        );
      })}
      {v.length < (f.max || 20) && <button className="add-row" onClick={() => { set([...v, blankItem(of)]); setOpen(v.length); }}>＋ Add ({v.length}/{f.max || 20})</button>}
    </div>
  );
}

export function AudioInput({ v, set, maxMB = 25 }: { v?: string; set: (v: string) => void; maxMB?: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [rec, setRec] = useState<MediaRecorder | null>(null);
  const [secs, setSecs] = useState(0);
  const [err, setErr] = useState('');
  useEffect(() => { if (!rec) return; const t = setInterval(() => setSecs((s) => s + 1), 1000); return () => clearInterval(t); }, [rec]);
  const start = async () => {
    setErr('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => { stream.getTracks().forEach((t) => t.stop()); const b = new Blob(chunks, { type: mr.mimeType || 'audio/webm' }); const fr = new FileReader(); fr.onload = () => set(fr.result as string); fr.readAsDataURL(b); setRec(null); };
      mr.start(); setSecs(0); setRec(mr);
      setTimeout(() => mr.state === 'recording' && mr.stop(), 180000);
    } catch { setErr('Microphone not available. You can upload a file instead.'); }
  };
  const upload = async (f?: File) => { if (!f) return; if (f.size > maxMB * 1048576) return setErr(`That file is over ${maxMB} MB.`); set(await readFile(f)); };
  return (
    <div className="audio-in">
      {v && !rec && <audio controls src={v} />}
      <div className="ph-acts">
        {rec ? <button className="rec on" onClick={() => rec.stop()}>■ Stop ({secs}s)</button> : <button className="rec" onClick={start}>● Record</button>}
        <button onClick={() => ref.current?.click()}>Upload</button>
        {v && <button onClick={() => set('')}>Remove</button>}
      </div>
      {err && <small className="err">{err}</small>}
      <input ref={ref} type="file" accept="audio/*,video/mp4" hidden onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
}

export function DrawingInput({ v, set }: { v?: string; set: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="draw-in">
      {v ? <img src={v} alt="" className="draw-prev" onClick={() => setOpen(true)} /> : null}
      <div className="ph-acts"><button onClick={() => setOpen(true)}>✎ {v ? 'Edit drawing' : 'Draw something'}</button>{v && <button onClick={() => set('')}>Clear</button>}</div>
      {open && <DrawPad initial={v} onDone={(d) => { if (d !== null) set(d); setOpen(false); }} />}
    </div>
  );
}

const INKS = ['#2b2b2b', '#e0567a', '#ff9f43', '#f9ca24', '#2ecc71', '#3498db', '#9b59b6', '#ffffff'];

function DrawPad({ initial, onDone }: { initial?: string; onDone: (d: string | null) => void }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [ink, setInk] = useState(INKS[1]);
  const [size, setSize] = useState(6);
  const [eraser, setEraser] = useState(false);
  const hist = useRef<ImageData[]>([]);
  useEffect(() => {
    const c = cv.current!; const g = c.getContext('2d')!;
    g.lineCap = 'round'; g.lineJoin = 'round';
    if (initial) { const im = new Image(); im.onload = () => g.drawImage(im, 0, 0, c.width, c.height); im.src = initial; }
  }, []);
  const down = (e: React.PointerEvent) => {
    const c = cv.current!; const g = c.getContext('2d')!; const r = c.getBoundingClientRect();
    hist.current.push(g.getImageData(0, 0, c.width, c.height)); if (hist.current.length > 30) hist.current.shift();
    const pt = (ev: { clientX: number; clientY: number }) => [((ev.clientX - r.left) / r.width) * c.width, ((ev.clientY - r.top) / r.height) * c.height];
    let [lx, ly] = pt(e);
    g.globalCompositeOperation = eraser ? 'destination-out' : 'source-over';
    g.strokeStyle = ink; g.lineWidth = size * (c.width / r.width);
    g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx + 0.1, ly); g.stroke();
    (e.target as Element).setPointerCapture(e.pointerId);
    const mv = (ev: PointerEvent) => { const [x, y] = pt(ev); g.beginPath(); g.moveTo(lx, ly); g.lineTo(x, y); g.stroke(); lx = x; ly = y; };
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  };
  const undo = () => { const d = hist.current.pop(); if (d) cv.current!.getContext('2d')!.putImageData(d, 0, 0); };
  const clear = () => { const c = cv.current!; const g = c.getContext('2d')!; hist.current.push(g.getImageData(0, 0, c.width, c.height)); g.clearRect(0, 0, c.width, c.height); };
  return (
    <div className="modal-back" onPointerDown={(e) => e.target === e.currentTarget && onDone(null)}>
      <div className="modal draw-modal">
        <h3>Draw something</h3>
        <canvas ref={cv} width={800} height={600} onPointerDown={down} style={{ touchAction: 'none' }} />
        <div className="draw-tools">
          {INKS.map((c) => <button key={c} className={`sw ${ink === c && !eraser ? 'on' : ''}`} style={{ background: c }} onClick={() => { setInk(c); setEraser(false); }} />)}
          <input type="range" min={2} max={30} value={size} onChange={(e) => setSize(+e.target.value)} />
          <button className={eraser ? 'on' : ''} onClick={() => setEraser(!eraser)}>Eraser</button>
          <button onClick={undo}>Undo</button><button onClick={clear}>Clear</button>
        </div>
        <div className="row end"><button className="btn ghost small" onClick={() => onDone(null)}>Cancel</button><button className="btn small" onClick={() => onDone(cv.current!.toDataURL('image/png'))}>Use drawing</button></div>
      </div>
    </div>
  );
}
