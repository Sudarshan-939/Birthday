import { useEffect, useState } from 'react';

export function parseHash() {
  const h = location.hash.replace(/^#/, '') || '/';
  const [path, q = ''] = h.split('?');
  return { path, parts: path.split('/').filter(Boolean), query: Object.fromEntries(new URLSearchParams(q)) as Record<string, string> };
}
export function useRoute() {
  const [r, setR] = useState(parseHash());
  useEffect(() => { const f = () => { setR(parseHash()); }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  return r;
}
export const nav = (to: string, replace = false) => { if (replace) history.replaceState(null, '', '#' + to); else location.hash = to; if (replace) dispatchEvent(new HashChangeEvent('hashchange')); };
