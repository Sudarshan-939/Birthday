# 💝 Keepsake: little pages, big feelings

A free, open gift-page maker inspired by dilsecraft.com. Pick a template or start blank, make every part your own, and send one private link or QR code. When they open it, an envelope unseals, music starts and the pages play.

**No ads, no popups, no sign-up. Every "premium" feature is free.**

## What's inside

| | |
|---|---|
| **71 templates** | 👑 Premium 1 · Birthday 9 · Love 16 · I Miss You 5 · I'm Sorry 6 · Anniversary 3 · Festivals 6 · Family 2 · Friends 2 · Thank You 2 · Celebrate 2 · 16 desi Mini Gifts · Make Your Own |
| **126 building blocks** | Letters, typewriter wishes, chat, envelopes, reasons, promises, contracts, quizzes, scratch cards, cakes with blow-out candles, balloons, fireworks, polaroid walls, film rolls, Ken Burns, stories, a vinyl/cassette player, Spotify-style Wrapped, a 3D museum, a 3D photo album, a retro desktop, a storybook and more |
| **👑 Premium section** | A gold-badged showcase on Home and in the gallery — still free, no login. First template: **Happy Birthday Sweety** (Birthday Cinema), a long birthday website with red-velvet curtains, a year counter, a balloons hero with music pill, a winding photo ribbon, a polaroid board, a flip-through Vogue magazine, a full-bleed photo and masonry wall, brush-reveal wishes, a swinging lanyard ID badge and an iPhone chat that types itself. Every word, photo, age and message is editable. |
| **236 stickers** | 9 packs (Love, Sky & flowers, Party, Cute, Food, Festive, Things, Doodles, Words). Drag, pinch, rotate, animate |
| **Look** | 12 themes plus custom page, card, text and accent colours; 5 fonts; Slide, Fade, Flip, Zoom or Curtain page turns; falling hearts, confetti, petals, snow or any emoji |
| **Sound** | 9 built-in tracks, or upload your own song; 6 tap-sound sets |
| **Free extras** | Seal until a date and time · password lock with hint · custom envelope line · edit later (the same short link updates) · QR code · download as one offline HTML file · Love Story Book with PDF print |
| **Editor** | Live preview on Phone, Tablet, Desktop or All · undo/redo · autosave · reorder, duplicate or move pieces between pages · up to 15+ pages |

Gifts are saved in the maker's browser (IndexedDB). **My gifts** lists them, with backup and restore.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ (site) + dist/offline.html (single-file copy used for downloads)
npm start          # production server on :3000, short links stored in data/gifts/
npm run smoke      # headless walk-through of every route, demo, piece and editor panel
```

## Sharing

- **Short links** `/#/g/<id>`: stored by `/api/gift`. Locally `server.mjs` writes to `data/gifts/`. On Vercel, `api/gift.js` uses Vercel Blob; connect a Blob store so `BLOB_READ_WRITE_TOKEN` is set. Each link has a private edit key kept on the maker's device, so pressing Share again after editing updates the same link.
- **No server needed**: if `/api/gift` isn't available, the whole gift is compressed into the link itself (`/#/d/…`). A "smaller link" option shrinks photos.
- **Offline file**: the gift is baked into a single HTML file that opens anywhere.

## Deploy on Vercel

Import the repo (framework: Vite; build and output are already set in `vercel.json`). Optionally add a Blob store for short links.

## Tech

Vite + React + TypeScript, hash router, WebAudio music synth, lz-string links, `qrcode`, three.js (lazy-loaded, with a 2D fallback when WebGL is missing), self-hosted @fontsource fonts.
