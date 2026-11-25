export type Photo = { src: string; caption?: string };

export type Piece = { id: string; type: string; props: Record<string, any> };

export type Sticker = {
  id: string;
  kind: 'emoji' | 'word' | 'img' | 'doodle';
  value: string;
  x: number; // % of page width
  y: number; // px from top of page content
  scale: number;
  rot: number;
  anim?: 'none' | 'float' | 'spin' | 'pulse' | 'wiggle';
};

export type Page = { id: string; title?: string; bg?: string; pieces: Piece[]; stickers: Sticker[] };

export type ThemeColors = { page: string; card: string; text: string; accent: string; accent2: string };

export type Gift = {
  v: 1;
  id: string;
  templateId: string;
  title: string;
  to: string;
  from: string;
  age?: string;
  theme: string; // preset id
  colors?: Partial<ThemeColors>; // custom overrides
  font: string;
  transition: 'slide' | 'fade' | 'flip' | 'zoom' | 'curtain';
  opener: { enabled: boolean; style: 'envelope' | 'giftbox' | 'curtain' | 'tap'; line: string; curtain?: string; name?: string };
  music: { track: string; custom?: string; customName?: string; volume?: number };
  sfx: string;
  effect: { type: 'none' | 'hearts' | 'confetti' | 'stars' | 'petals' | 'snow' | 'bubbles' | 'emoji'; emoji?: string };
  lock?: { until?: string; message?: string; password?: string; hint?: string };
  pages: Page[];
  createdAt?: number;
  updatedAt?: number;
  /** Short-link id + private edit key. Stays on the maker's device; never uploaded. */
  share?: { id: string; key: string };
};

export type FieldType =
  | 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'color' | 'select' | 'toggle'
  | 'photo' | 'photos' | 'strings' | 'items' | 'audio' | 'emoji' | 'drawing' | 'range';

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  of?: Field[]; // for items
  max?: number;
  min?: number;
  step?: number;
  help?: string;
  placeholder?: string;
};
