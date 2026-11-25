import type { PieceDef } from './core';
import { WORDS } from './words';
import { STORY } from './story';
import { PHOTOS } from './photos';
import { MUSIC } from './music';
import { REVEAL } from './reveal';
import { GAMES } from './games';
import { FESTIVE, CARDS, DECOR } from './festive';
import { DESI } from './desi';
import { XP } from './xp';
import { PREMIUM } from './premium';

export const ALL_PIECES: PieceDef[] = [...WORDS, ...STORY, ...PHOTOS, ...MUSIC, ...REVEAL, ...GAMES, ...FESTIVE, ...CARDS, ...DESI, ...XP, ...DECOR, ...PREMIUM];
export const PIECES: Record<string, PieceDef> = Object.fromEntries(ALL_PIECES.map((p) => [p.type, p]));
export { CATS } from './core';
export type { PieceDef, RCtx } from './core';
