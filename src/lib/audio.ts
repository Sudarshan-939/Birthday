// Original, generated-in-the-browser background music and sound effects (Web Audio API).
// Nothing is streamed or licensed: every track is synthesised from simple chord patterns.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let reverb: ConvolverNode | null = null;
let timer: any = null;
let customEl: HTMLAudioElement | null = null;
let currentTrack = '';
let volume = 0.6;

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function ac() {
  if (!ctx) {
    const C = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    master = ctx!.createGain();
    master.gain.value = volume * 0.5;
    reverb = ctx!.createConvolver();
    const len = ctx!.sampleRate * 2.5;
    const buf = ctx!.createBuffer(2, len, ctx!.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    reverb.buffer = buf;
    const wet = ctx!.createGain();
    wet.gain.value = 0.35;
    reverb.connect(wet).connect(ctx!.destination);
    master.connect(ctx!.destination);
    master.connect(reverb);
  }
  if (ctx!.state === 'suspended') ctx!.resume();
  return ctx;
}

type Inst = 'pad' | 'pluck' | 'bell' | 'piano' | 'bass' | 'box' | 'sitar';

function note(inst: Inst, midi: number, t: number, dur: number, vel = 0.5) {
  const c = ctx!, out = master!;
  const g = c.createGain();
  g.connect(out);
  const f = mtof(midi);
  const o = c.createOscillator();
  const add = (type: OscillatorType, freq: number, gain: number) => {
    const oo = c.createOscillator();
    const gg = c.createGain();
    oo.type = type; oo.frequency.value = freq; gg.gain.value = gain;
    oo.connect(gg).connect(g); oo.start(t); oo.stop(t + dur + 1.5);
  };
  if (inst === 'pad') {
    o.type = 'sine'; o.frequency.value = f;
    add('triangle', f * 1.003, 0.4);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel * 0.25, t + dur * 0.4); g.gain.linearRampToValueAtTime(0, t + dur + 0.6);
  } else if (inst === 'pluck' || inst === 'sitar') {
    o.type = inst === 'sitar' ? 'sawtooth' : 'triangle'; o.frequency.value = f;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(inst === 'sitar' ? 3200 : 2400, t); lp.frequency.exponentialRampToValueAtTime(400, t + 0.5);
    o.disconnect(); o.connect(lp).connect(g);
    g.gain.setValueAtTime(vel * (inst === 'sitar' ? 0.18 : 0.35), t); g.gain.exponentialRampToValueAtTime(0.001, t + Math.max(0.6, dur));
    o.start(t); o.stop(t + dur + 1);
    return;
  } else if (inst === 'bell' || inst === 'box') {
    o.type = 'sine'; o.frequency.value = f;
    add('sine', f * (inst === 'bell' ? 2.76 : 4), 0.25);
    g.gain.setValueAtTime(vel * 0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + (inst === 'bell' ? 2.2 : 1.2));
  } else if (inst === 'piano') {
    o.type = 'triangle'; o.frequency.value = f;
    add('sine', f * 2, 0.2);
    g.gain.setValueAtTime(vel * 0.35, t); g.gain.exponentialRampToValueAtTime(vel * 0.12, t + 0.3); g.gain.exponentialRampToValueAtTime(0.001, t + dur + 1.2);
  } else if (inst === 'bass') {
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(vel * 0.4, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur + 0.2);
  }
  o.connect(g); o.start(t); o.stop(t + dur + 2.5);
}

type Track = { id: string; name: string; mood: string; bpm: number; div?: number; chords: number[][]; play: (step: number, chord: number[], t: number, beat: number) => void };

const C = (root: number, q: 'M' | 'm' | 'M7' | 'm7' | 'sus') => {
  const iv = { M: [0, 4, 7], m: [0, 3, 7], M7: [0, 4, 7, 11], m7: [0, 3, 7, 10], sus: [0, 5, 7] }[q];
  return iv.map((i) => root + i);
};

// Happy Birthday melody (public domain): [midi, beats]
const HB: [number, number][] = [
  [67, 0.75], [67, 0.25], [69, 1], [67, 1], [72, 1], [71, 2],
  [67, 0.75], [67, 0.25], [69, 1], [67, 1], [74, 1], [72, 2],
  [67, 0.75], [67, 0.25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2],
  [77, 0.75], [77, 0.25], [76, 1], [72, 1], [74, 1], [72, 3], [0, 3],
];
const HBstarts: number[] = []; { let acc = 0; for (const [, b] of HB) { HBstarts.push(acc); acc += b; } }
const HBlen = HB.reduce((a, b) => a + b[1], 0);

export const TRACKS: Track[] = [
  { id: 'bloom', name: 'Slow Bloom', mood: 'dreamy', bpm: 64, chords: [C(60, 'M7'), C(57, 'm7'), C(53, 'M7'), C(55, 'sus')],
    play: (s, ch, t, b) => { if (s % 8 === 0) ch.forEach((n) => note('pad', n, t, b * 8, 0.6)); if (s % 2 === 0) note('bell', ch[(s / 2) % ch.length] + 12, t, b, 0.25); } },
  { id: 'candle', name: 'Candlelight', mood: 'warm', bpm: 76, chords: [C(57, 'm'), C(53, 'M'), C(60, 'M'), C(55, 'M')],
    play: (s, ch, t, b) => { if (s % 8 === 0) note('bass', ch[0] - 12, t, b * 4, 0.5); note('piano', ch[[0, 1, 2, 1, 0, 2, 1, 2][s % 8]] + 12, t, b, 0.4); } },
  { id: 'boats', name: 'Paper Boats', mood: 'lofi', bpm: 82, chords: [C(62, 'm7'), C(55, 'M7'), C(60, 'M7'), C(57, 'm7')],
    play: (s, ch, t, b) => { if (s % 8 === 0) ch.forEach((n) => note('pad', n, t, b * 8, 0.35)); if (s % 4 === 0) note('bass', ch[0] - 12, t, b * 2, 0.6); if ([0, 3, 5, 6].includes(s % 8)) note('pluck', ch[(s * 3) % ch.length] + 12, t, b, 0.45); } },
  { id: 'sunshine', name: 'Little Sunshine', mood: 'happy', bpm: 112, chords: [C(60, 'M'), C(55, 'M'), C(57, 'm'), C(53, 'M')],
    play: (s, ch, t, b) => { if (s % 4 === 0) note('bass', ch[0] - 12, t, b, 0.6); note('pluck', ch[s % 3] + 12 + (s % 8 > 5 ? 12 : 0), t, b * 0.5, 0.5); } },
  { id: 'thread', name: 'Thread of Us', mood: 'romantic', bpm: 70, chords: [C(53, 'M7'), C(55, 'M'), C(52, 'm7'), C(57, 'm')],
    play: (s, ch, t, b) => { if (s % 8 === 0) { note('bass', ch[0] - 12, t, b * 8, 0.5); note('pad', ch[1], t, b * 8, 0.3); } note('piano', ch[[0, 2, 1, 3, 2, 1, 3, 2][s % 8] % ch.length] + 12, t, b * 1.5, 0.35); } },
  { id: 'sorry', name: 'Quiet Sorry', mood: 'tender', bpm: 60, chords: [C(57, 'm'), C(53, 'M7'), C(48, 'M'), C(55, 'sus')],
    play: (s, ch, t, b) => { if (s % 8 === 0) ch.forEach((n) => note('pad', n, t, b * 8, 0.45)); if (s % 4 === 2) note('piano', ch[2] + 12, t, b * 2, 0.3); } },
  { id: 'birthday', name: 'Music-box Birthday', mood: 'birthday', bpm: 100, div: 4, chords: [C(60, 'M')],
    play: (s, _ch, t, b) => {
      const pos = s % (HBlen * 4);
      HB.forEach(([m, d], i) => { if (m && Math.round(HBstarts[i] * 4) === pos) note('box', m + 12, t, d * b, 0.6); });
      if (pos % 12 === 0) note('bass', [48, 43, 48, 53][Math.floor(pos / 12) % 4], t, b * 2, 0.35);
    } },
  { id: 'festive', name: 'Festive Lights', mood: 'festive', bpm: 92, chords: [C(50, 'M'), C(50, 'sus'), C(48, 'M'), C(50, 'M')],
    play: (s, ch, t, b) => { if (s % 16 === 0) { note('pad', 38, t, b * 16, 0.5); note('pad', 45, t, b * 16, 0.35); } const scale = [62, 64, 66, 69, 71, 74]; if ([0, 2, 3, 5, 6].includes(s % 8)) note('sitar', scale[(s * 5 + Math.floor(s / 8)) % scale.length], t, b, 0.5); if (s % 8 === 4) note('bell', 86, t, b, 0.2); } },
  { id: 'stars', name: 'Under the Same Sky', mood: 'longing', bpm: 66, chords: [C(52, 'm'), C(48, 'M7'), C(55, 'M'), C(50, 'M')],
    play: (s, ch, t, b) => { if (s % 8 === 0) ch.forEach((n) => note('pad', n + 12, t, b * 8, 0.35)); if (s % 3 === 0) note('bell', ch[s % ch.length] + 24, t, b, 0.18); } },
];

const STEP_DIV = 2; // steps per beat

export function playMusic(trackId: string, custom?: string, vol?: number) {
  if (vol != null) setVolume(vol);
  if (currentTrack === trackId + (custom || '')) return;
  stopMusic();
  currentTrack = trackId + (custom || '');
  if (custom) {
    customEl = new Audio(custom);
    customEl.loop = true;
    customEl.volume = volume;
    customEl.play().catch(() => {});
    return;
  }
  const tr = TRACKS.find((t) => t.id === trackId);
  if (!tr || !ac()) return;
  const beat = 60 / tr.bpm;
  const stepDur = beat / (tr.div || STEP_DIV);
  let step = 0;
  let next = ctx!.currentTime + 0.1;
  const tick = () => {
    while (next < ctx!.currentTime + 0.4) {
      const chord = tr.chords[Math.floor(step / 8) % tr.chords.length];
      try { tr.play(step, chord, next, beat); } catch {}
      step++; next += stepDur;
    }
  };
  tick();
  timer = setInterval(tick, 100);
}

export function stopMusic() {
  currentTrack = '';
  if (timer) clearInterval(timer);
  timer = null;
  if (customEl) { customEl.pause(); customEl = null; }
  if (master && ctx) {
    const old = master;
    old.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
    setTimeout(() => old.disconnect(), 800);
    master = ctx.createGain();
    master.gain.value = volume * 0.5;
    master.connect(ctx.destination);
    if (reverb) master.connect(reverb);
  }
}

export function setVolume(v: number) {
  volume = v;
  if (master) master.gain.value = v * 0.5;
  if (customEl) customEl.volume = v;
}

export const isPlaying = () => !!currentTrack;

export function previewTrack(trackId: string) {
  playMusic(trackId);
  setTimeout(() => { if (currentTrack === trackId) stopMusic(); }, 6000);
}

// ---------- sound effects ----------
export const SFX_SETS = [
  { id: 'none', name: 'No sounds' },
  { id: 'chimes', name: 'Soft chimes' },
  { id: 'pops', name: 'Pops' },
  { id: 'bubbles', name: 'Bubbles' },
  { id: 'kawaii', name: 'Kawaii' },
  { id: 'bells', name: 'Temple bells' },
];
let sfxSet = 'chimes';
export const setSfxSet = (s: string) => { sfxSet = s; };

export function sfx(kind: 'tap' | 'page' | 'win' | 'pop' | 'open' = 'tap') {
  if (sfxSet === 'none') return;
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  const out = c.createGain(); out.gain.value = 0.25 * (volume + 0.4); out.connect(c.destination);
  const tone = (type: OscillatorType, f1: number, f2: number, d: number, g = 0.5, delay = 0) => {
    const o = c.createOscillator(); const gg = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f1, t + delay); o.frequency.exponentialRampToValueAtTime(f2, t + delay + d);
    gg.gain.setValueAtTime(g, t + delay); gg.gain.exponentialRampToValueAtTime(0.001, t + delay + d);
    o.connect(gg).connect(out); o.start(t + delay); o.stop(t + delay + d + 0.05);
  };
  const win = kind === 'win' || kind === 'open';
  switch (sfxSet) {
    case 'chimes': if (win) [0, 0.08, 0.16].forEach((d, i) => tone('sine', [1047, 1319, 1568][i], [1047, 1319, 1568][i], 0.9, 0.4, d)); else tone('sine', kind === 'page' ? 880 : 1320, kind === 'page' ? 880 : 1320, 0.5, 0.35); break;
    case 'pops': tone('sine', 600, 120, 0.12, 0.7); if (win) tone('sine', 900, 200, 0.15, 0.6, 0.1); break;
    case 'bubbles': tone('sine', 300, 1200, 0.15, 0.5); if (win) tone('sine', 400, 1600, 0.18, 0.5, 0.12); break;
    case 'kawaii': tone('square', 1200, 1800, 0.08, 0.15); tone('square', 1600, 2400, 0.08, 0.12, 0.07); if (win) tone('triangle', 1000, 2000, 0.3, 0.3, 0.15); break;
    case 'bells': tone('sine', 523, 523, 1.6, 0.4); tone('sine', 523 * 2.76, 523 * 2.76, 1.2, 0.15); if (win) tone('sine', 784, 784, 1.6, 0.3, 0.2); break;
  }
}
