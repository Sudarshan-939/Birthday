import type { ThemeColors } from './types';

export type ThemePreset = { id: string; name: string; colors: ThemeColors; dark?: boolean };

export const THEMES: ThemePreset[] = [
  { id: 'rose', name: 'Cream & rose', colors: { page: '#fbf4ee', card: '#ffffff', text: '#3b2a2a', accent: '#d9506b', accent2: '#f2b5a7' } },
  { id: 'blush', name: 'Blush', colors: { page: '#fde8ec', card: '#fff7f9', text: '#4a2533', accent: '#e05c8a', accent2: '#ffc2d4' } },
  { id: 'sage', name: 'Sage', colors: { page: '#eef3ea', card: '#fbfdf8', text: '#2f3b2c', accent: '#5f8a5a', accent2: '#c8dcb9' } },
  { id: 'lavender', name: 'Lavender', colors: { page: '#f1ecfb', card: '#fdfbff', text: '#352a4d', accent: '#8a63d2', accent2: '#d6c6f5' } },
  { id: 'sunshine', name: 'Sunshine', colors: { page: '#fff6d9', card: '#fffdf4', text: '#4a3a12', accent: '#f0a020', accent2: '#ffd86b' } },
  { id: 'ocean', name: 'Ocean', colors: { page: '#e6f3f8', card: '#fbfeff', text: '#173847', accent: '#2a8ab3', accent2: '#a5d8ea' } },
  { id: 'kraft', name: 'Kraft paper', colors: { page: '#e9dcc6', card: '#f7efe1', text: '#3f2f1d', accent: '#a5552f', accent2: '#d9b98d' } },
  { id: 'peach', name: 'Peach', colors: { page: '#ffeee3', card: '#fffaf6', text: '#4d2c1d', accent: '#f07a4f', accent2: '#ffc6a6' } },
  { id: 'midnight', name: 'Midnight', dark: true, colors: { page: '#14142b', card: '#1f1f3d', text: '#f2eefe', accent: '#ff7eb6', accent2: '#7c83ff' } },
  { id: 'maroon', name: 'Festive maroon', dark: true, colors: { page: '#4a0f1c', card: '#5e1626', text: '#fff1dc', accent: '#f5b942', accent2: '#e86f51' } },
  { id: 'mint', name: 'Mint candy', colors: { page: '#e5faf3', card: '#ffffff', text: '#1f3d36', accent: '#13a37f', accent2: '#ffb3c7' } },
  { id: 'noir', name: 'Noir & gold', dark: true, colors: { page: '#111111', card: '#1c1c1c', text: '#f6eedd', accent: '#d6b25e', accent2: '#8a7240' } },
];

export const FONTS = [
  { id: 'classic', name: 'Classic', display: "'Fraunces', Georgia, serif", body: "'DM Sans', system-ui, sans-serif" },
  { id: 'modern', name: 'Modern', display: "'DM Sans', system-ui, sans-serif", body: "'DM Sans', system-ui, sans-serif" },
  { id: 'hand', name: 'Handwritten', display: "'Caveat', 'Comic Sans MS', cursive", body: "'DM Sans', system-ui, sans-serif" },
  { id: 'playful', name: 'Playful', display: "'Baloo 2', 'Trebuchet MS', sans-serif", body: "'Baloo 2', 'Trebuchet MS', sans-serif" },
  { id: 'royal', name: 'Royal', display: "'Cinzel', 'Times New Roman', serif", body: "'Fraunces', Georgia, serif" },
];

export function themeVars(themeId: string, overrides?: Partial<ThemeColors>, fontId?: string): Record<string, string> {
  const t = THEMES.find((x) => x.id === themeId) || THEMES[0];
  const c = { ...t.colors, ...(overrides || {}) };
  const f = FONTS.find((x) => x.id === fontId) || FONTS[0];
  return {
    '--page': c.page,
    '--card': c.card,
    '--text': c.text,
    '--accent': c.accent,
    '--accent2': c.accent2,
    '--muted': c.text + 'aa',
    '--line': c.text + '22',
    '--font-display': f.display,
    '--font-body': f.body,
  } as any;
}

export const isDark = (themeId: string) => !!THEMES.find((x) => x.id === themeId)?.dark;
