// Lightweight canvas particle bursts (confetti, hearts, sparkles) — no libraries.
type P = { x: number; y: number; vx: number; vy: number; r: number; rot: number; vr: number; color: string; ch?: string; life: number };
let canvas: HTMLCanvasElement | null = null;
let parts: P[] = [];
let raf = 0;
const COLORS = ['#ff6b8b', '#ffd166', '#06d6a0', '#4cc9f0', '#b388ff', '#ff9f68'];

function ensure() {
  if (canvas) return canvas;
  canvas = document.createElement('canvas');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '9999' });
  document.body.appendChild(canvas);
  return canvas;
}
function loop() {
  const c = ensure();
  const dpr = devicePixelRatio || 1;
  if (c.width !== innerWidth * dpr) { c.width = innerWidth * dpr; c.height = innerHeight * dpr; }
  const g = c.getContext('2d')!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter((p) => p.life > 0 && p.y < innerHeight + 40);
  for (const p of parts) {
    p.vy += 0.18; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 1;
    g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.globalAlpha = Math.min(1, p.life / 40);
    if (p.ch) { g.font = `${p.r * 2.4}px serif`; g.textAlign = 'center'; g.fillText(p.ch, 0, 0); }
    else { g.fillStyle = p.color; g.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); }
    g.restore();
  }
  if (parts.length) raf = requestAnimationFrame(loop);
  else { raf = 0; g.clearRect(0, 0, innerWidth, innerHeight); }
}

export function burst(opts: { x?: number; y?: number; count?: number; emoji?: string[]; spread?: number; power?: number } = {}) {
  const x = opts.x ?? innerWidth / 2, y = opts.y ?? innerHeight / 2;
  const n = opts.count ?? 90, spread = opts.spread ?? Math.PI * 2, power = opts.power ?? 9;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * spread;
    const v = power * (0.4 + Math.random() * 0.8);
    parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 4 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, color: COLORS[i % COLORS.length], ch: opts.emoji ? opts.emoji[i % opts.emoji.length] : undefined, life: 140 + Math.random() * 60 });
  }
  if (!raf) raf = requestAnimationFrame(loop);
}

export const confetti = (el?: Element | null, emoji?: string[]) => {
  if (el) { const r = el.getBoundingClientRect(); burst({ x: r.left + r.width / 2, y: r.top + r.height / 2, emoji }); }
  else burst({ emoji });
};
export const hearts = (el?: Element | null) => confetti(el, ['💖', '💗', '💕', '❤️']);
