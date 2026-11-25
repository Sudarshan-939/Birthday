export function readFile(file: File): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file); });
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

export async function shrink(src: string, maxDim = 1000, quality = 0.75): Promise<string> {
  const img = await loadImg(src);
  const s = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  let out = c.toDataURL('image/webp', quality);
  if (!out.startsWith('data:image/webp')) out = c.toDataURL('image/jpeg', quality);
  return out;
}

export async function compressImage(file: File, maxDim = 1000, quality = 0.75): Promise<string> {
  const raw = await readFile(file);
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return raw;
  try { return await shrink(raw, maxDim, quality); } catch { return raw; }
}

export async function toDataUrl(url: string): Promise<string> {
  const r = await fetch(url);
  const b = await r.blob();
  return new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result as string); fr.readAsDataURL(b); });
}
