export const uid = (n = 8) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('');

export type Ctx = { name: string; sender: string; age?: string };

export function fill(s: any, ctx: Ctx): any {
  if (typeof s !== 'string') return s;
  return s
    .replace(/\{\{?\s*name\s*\}?\}/gi, ctx.name || 'you')
    .replace(/\{\{?\s*sender\s*\}?\}/gi, ctx.sender || 'me')
    .replace(/\{\{?\s*age\s*\}?\}/gi, ctx.age || '');
}

export function fillDeep<T>(v: T, ctx: Ctx): T {
  if (typeof v === 'string') return fill(v, ctx) as any;
  if (Array.isArray(v)) return v.map((x) => fillDeep(x, ctx)) as any;
  if (v && typeof v === 'object') {
    const o: any = {};
    for (const k in v as any) o[k] = k === 'src' || k === 'audio' || k === 'image' ? (v as any)[k] : fillDeep((v as any)[k], ctx);
    return o;
  }
  return v;
}

export const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export function vibrate(ms: number | number[] = 15) {
  try { navigator.vibrate?.(ms as any); } catch {}
}

export function daysBetween(a: string | Date, b: string | Date = new Date()) {
  const d1 = new Date(a).getTime(), d2 = new Date(b).getTime();
  if (isNaN(d1) || isNaN(d2)) return 0;
  return Math.floor(Math.abs(d2 - d1) / 86400000);
}

export const lines = (s: string) => (s || '').split('\n').map((x) => x.trim()).filter(Boolean);

/** Split a string into user-perceived characters (keeps ❤️, 👩‍❤️‍👨, flags intact). */
const seg: any = typeof Intl !== 'undefined' && (Intl as any).Segmenter ? new (Intl as any).Segmenter() : null;
export function graphemes(s: string): string[] {
  if (!s) return [];
  if (seg) return Array.from(seg.segment(s), (x: any) => x.segment).filter((x: string) => x.trim());
  return (s.match(/(\p{RI}\p{RI}|\p{Extended_Pictographic}(\uFE0F|\u200D\p{Extended_Pictographic}\uFE0F?|[\u{1F3FB}-\u{1F3FF}])*|\S)/gu) || []);
}
