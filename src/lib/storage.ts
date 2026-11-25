// Drafts live only in this browser (IndexedDB) — no account needed.
import type { Gift } from './types';

const DB = 'keepsake', STORE = 'gifts';
let dbp: Promise<IDBDatabase> | null = null;
function db() {
  if (!dbp) dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id' });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}
async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const d = await db();
  return new Promise((res, rej) => {
    const r = fn(d.transaction(STORE, mode).objectStore(STORE));
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
export const saveGift = (g: Gift) => tx('readwrite', (s) => s.put({ ...g, updatedAt: Date.now() }));
export const getGift = (id: string) => tx<Gift | undefined>('readonly', (s) => s.get(id));
export const deleteGift = (id: string) => tx('readwrite', (s) => s.delete(id));
export const listGifts = async () => ((await tx<Gift[]>('readonly', (s) => s.getAll())) || []).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
