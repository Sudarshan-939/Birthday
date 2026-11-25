import type { Gift, Page, Piece } from '../lib/types';
import { PIECES } from '../pieces';
import { uid, clone } from '../lib/util';
import { DEMO, demoPhotos } from '../pieces/core';

export type Template = {
  id: string; name: string; cat: string; group: string; tagline: string; desc: string; art: string;
  badge?: string; theme: string; font?: string; music?: string; effect?: Gift['effect']; opener?: Partial<Gift['opener']>; transition?: Gift['transition'];
  steps: string[]; build: () => Page[]; special?: 'book' | 'letter'; loved: number; added: number;
  /** sample names used for previews when the maker has not typed any */
  demo?: { to?: string; from?: string; age?: string };
};

export const FEELINGS = [
  { id: 'all', label: 'All', icon: '✿' }, { id: 'premium', label: 'Premium', icon: '👑' }, { id: 'miss', label: 'I Miss You', icon: '♡' }, { id: 'birthday', label: 'Birthday', icon: '🎂' },
  { id: 'love', label: 'Love', icon: '❥' }, { id: 'anniversary', label: 'Anniversary', icon: '✦' }, { id: 'thanks', label: 'Thank You', icon: '🌷' },
  { id: 'sorry', label: "I'm Sorry", icon: '🥺' }, { id: 'celebrate', label: 'Celebrate', icon: '🎉' }, { id: 'family', label: 'Family', icon: '🏠' },
  { id: 'festivals', label: 'Festivals', icon: '🪔' }, { id: 'friends', label: 'Friends', icon: '👯' }, { id: 'diy', label: 'Make Your Own', icon: '✎' }, { id: 'mini', label: 'Mini Gifts', icon: '🎈' },
];

export const pc = (type: string, props: Record<string, any> = {}): Piece => ({ id: uid(6), type, props: { ...(PIECES[type]?.defaults() || {}), ...props } });
export const page = (title: string, ...pieces: Piece[]): Page => ({ id: uid(6), title, pieces, stickers: [] });
const st = (value: string, x: number, y: number, scale = 1, rot = 0, kind: any = 'emoji', anim: any = 'float') => ({ id: uid(6), kind, value, x, y, scale, rot, anim });
const withStickers = (p: Page, ...s: any[]) => ({ ...p, stickers: s });
const H = (title: string, subtitle = '', size = 'l') => pc('heading', { title, subtitle, size });
const T = (text: string, style = 'normal') => pc('text', { text, style, align: 'center' });

let order = 0;
const t = (o: Omit<Template, 'loved' | 'added'> & { loved?: number }): Template => ({ loved: 500, ...o, added: order++ });

export const TEMPLATES: Template[] = [
  // ---------------------------------------------------------------- Premium (free showcase)
  t({ id: 'birthday-cinema', name: 'Happy Birthday Sweety', cat: 'premium', group: 'Premium · Birthday', badge: 'Premium', art: '🎈👑', theme: 'rose', font: 'classic', music: 'birthday', loved: 9900,
    demo: { to: 'Sweety', from: 'Your love', age: '23' },
    opener: { enabled: true, style: 'curtain', line: 'Happy Birthday {name} 🎀' },
    tagline: 'A whole birthday website: curtains, a Vogue magazine, a lanyard badge and an iPhone chat', desc: 'The viral birthday website, made in Keepsake. Red velvet curtains open, the years count up to their age, balloons float over your photo with a music player, a photo ribbon winds past their name, polaroids get pinned, they flip through a Vogue magazine all about them, a photo paints itself in, a lanyard badge swings down and your messages type themselves out on an iPhone. Change every word and photo.',
    steps: ['Red velvet curtains open', 'The years count up to their age', 'Balloons, their photo and a music player', 'Their name and a winding photo ribbon', 'Polaroids pinned to a board', 'A Vogue magazine they flip through', 'A photo wall and wishes that paint in', 'A swinging lanyard badge', 'Your messages typing out on an iPhone'],
    build: () => [page('Birthday Cinema', pc('pm-count'), pc('pm-hero'), pc('pm-ribbon'), pc('pm-board'), pc('pm-mag'), pc('pm-bleed'), pc('pm-masonry'), pc('pm-wish'), pc('pm-badge'), pc('pm-chat'))] }),

  // ---------------------------------------------------------------- Experiences
  t({ id: 'love-story-book', name: 'Love Story Book', cat: 'love', group: 'Love', badge: 'Most made', art: '📖💞', theme: 'rose', font: 'classic', music: 'thread', loved: 9800, special: 'book',
    tagline: 'Your story, written as a whole designed book', desc: 'Answer a few questions about how it happened and get a designed book of 10 to 140 pages with your photos, in English or Hinglish. Read it as a flip book or save it as a PDF.',
    steps: ['A cover with your photo', 'Chapters written from your answers', 'Your photos on the pages', 'Reasons I love you', 'A closing letter, and a PDF to keep'],
    build: () => [page('The book', pc('storybook'))] }),
  t({ id: '3d-museum', name: '3D Museum', cat: 'love', group: 'Love', badge: '3D', art: '🏛️🖼️', theme: 'noir', font: 'royal', music: 'candle', loved: 7200,
    tagline: 'Walk a real 3D museum full of your photos', desc: 'A real 3D museum with your photos framed on the walls. They walk through it, tap any exhibit to look closer and find your letter waiting at the end.',
    steps: ['A sealed invitation', 'Walk the halls in 3D', 'Every photo framed with a plaque', 'A letter on a pedestal at the end'],
    build: () => [page('Museum', H('Welcome to the Museum of Us', 'tickets: free for {name}, forever'), pc('museum3d'))] }),
  t({ id: '3d-photo-album', name: '3D Photo Album', cat: 'love', group: 'Love', badge: '3D', art: '📚✨', theme: 'kraft', font: 'classic', music: 'boats', loved: 6100,
    tagline: 'A real album: turn pages, photos pop up', desc: 'A leather photo album in 3D. They turn the pages by hand, the photos lift off the paper, and your letter is on the last page.',
    steps: ['A cover with your names', 'Turn every page by hand', 'Photos that pop up in 3D', 'Your letter on the last page'],
    build: () => [page('Album', pc('album3d'))] }),
  t({ id: 'love-letter', name: 'Love Letter', cat: 'love', group: 'Love', art: '💌🪶', theme: 'kraft', font: 'hand', music: 'thread', loved: 5400, special: 'letter',
    tagline: 'A guided writer helps you say it right', desc: 'Chat with a little writing helper. It asks the things only you know, writes a letter from your answers, then you style the paper and send it as a letter they can hold.',
    steps: ['Answer a few gentle questions', 'Get a letter in your words', 'Pick paper, ink and seal', 'They open a sealed envelope'],
    build: () => [page('Letter', pc('envelope', { front: 'For {name}', letter: 'Open the next page, slowly.' })), page('The letter', pc('letter', { paper: 'parchment' }))] }),
  t({ id: 'little-world', name: 'Little Desktop World', cat: 'love', group: 'Love', art: '🖥️💗', theme: 'lavender', font: 'modern', music: 'boats', loved: 3900,
    tagline: 'An interactive desktop made just for them', desc: 'A whole little computer: a memories folder, letter.txt, your song, a quiz and a gift.zip to unzip.',
    steps: ['Log in to their own desktop', 'Open the memories folder', 'Read letter.txt', 'Play the quiz, unzip the gift'],
    build: () => [page('Desktop', H('{name}\'s little world', 'click around ♡', 'm'), pc('desktop'))] }),
  t({ id: 'our-little-world', name: 'Our Little World', cat: 'love', group: 'Love', art: '🌍📼', theme: 'midnight', font: 'hand', music: 'stars', loved: 3600, effect: { type: 'stars' },
    tagline: 'Photos, a chat, a cassette and after-hours notes', desc: 'A private world of you two: photos, a chat that sounds like you, a mixtape, secrets in envelopes and notes for after midnight.',
    steps: ['A chat that sounds like you', 'Your mixtape', 'Secrets in envelopes', 'After-hours notes in the sky'],
    build: () => [page('Chat', H('Our little world', 'population: 2'), pc('chat')), page('Mixtape', pc('cassette'), pc('stories')), page('Secrets', pc('openwhen', { title: 'Secrets I never said out loud' })), page('After hours', pc('stars', { title: 'Notes for after midnight' }), pc('letter', { paper: 'night' }))] }),

  // ---------------------------------------------------------------- Birthday
  t({ id: 'b-candles', name: 'Candles & Wishes', cat: 'birthday', group: 'Birthday', art: '🎂🕯️', theme: 'rose', music: 'birthday', effect: { type: 'confetti' }, loved: 8900,
    tagline: 'Cake, a puzzle, wishes & an official agreement', desc: 'The birthday they play: blow out the candles, solve a little heart puzzle, read your wishes and sign a very official birthday agreement.',
    steps: ['Blow out the candles', 'A photo puzzle', 'Wishes that type themselves', 'The birthday agreement', 'A polaroid to keep'],
    build: () => [withStickers(page('Cake', H('Happy Birthday, {name}!', 'make a wish first'), pc('candles')), st('🎈', 10, 60, 1.6), st('🎉', 88, 90, 1.4, 12)), page('Puzzle', pc('puzzle', { after: 'Solved! Just like you solve my bad days.' })), page('Wishes', pc('wishes')), page('Agreement', pc('agreement')), page('Keep this', pc('photo', { caption: 'happy birthday, my favourite ♡' }), pc('letter'))] }),
  t({ id: 'b-handmade', name: 'Handmade Birthday', cat: 'birthday', group: 'Birthday', art: '✂️🎨', theme: 'kraft', font: 'hand', music: 'sunshine', loved: 4200,
    tagline: 'A scrapbook story, a tap game & a letter', desc: 'Feels made with scissors and glue: a scrapbook story of their year, a heart to tap, and a handwritten letter.',
    steps: ['A scrapbook cover', 'Your story in photos', 'Tap the heart', 'A handwritten letter'],
    build: () => [withStickers(page('Cover', H('A handmade birthday for {name}', 'cut, glued & coloured by {sender}'), pc('photo', { frame: 'tape', caption: 'the birthday star' })), st('heart|#a5552f', 15, 40, 1.2, -10, 'doodle'), st('star|#a5552f', 85, 300, 1, 10, 'doodle')), page('Story', pc('collage', { title: 'This year, in pictures', layout: 'scatter' })), page('Tap', pc('tapcounter', { label: 'Tap the cake 10 times', emoji: '🎂', message: 'Ten taps = ten more years of me annoying you. Deal.' })), page('Letter', pc('letter', { paper: 'kraft' }))] }),
  t({ id: 'b-box', name: 'Birthday Box', cat: 'birthday', group: 'Birthday', art: '🎁⭐', theme: 'lavender', music: 'birthday', loved: 3800, opener: { style: 'giftbox' },
    tagline: 'Open the box, catch the stars, three wishes', desc: 'A gift box to open, falling stars to catch, three wish cards to flip, your letter, then a cake to blow out.',
    steps: ['Open the gift box', 'Catch falling stars', 'Flip three wish cards', 'Your letter', 'Blow out the candles'],
    build: () => [page('Box', pc('giftbox', { label: 'Happy birthday! Tap to open', message: 'Inside: one whole day that is all about you.' })), page('Stars', pc('catchstars')), page('Wishes', pc('oracle', { items: [{ title: 'Wish 1', text: 'Laughter so loud it embarrasses us' }, { title: 'Wish 2', text: 'A year kinder to you than the last' }, { title: 'Wish 3', text: 'Me. Obviously. Forever.' }] })), page('Letter', pc('letter')), page('Cake', pc('candles', { flavor: 'choc' }))] }),
  t({ id: 'b-party', name: 'Kawaii Birthday Party', cat: 'birthday', group: 'Birthday', art: '🧁🎈', theme: 'blush', font: 'playful', music: 'sunshine', effect: { type: 'confetti' }, loved: 4100,
    tagline: 'Cake, presents & a birthday reel', desc: 'A cute party: cut the cake, pop the presents, watch their very own birthday reel, read the card and finish with fireworks.',
    steps: ['Cut the cake', 'Pop the presents', 'Their birthday reel', 'A card that types itself', 'Fireworks'],
    build: () => [withStickers(page('Cake', H('It\'s your party, {name}!', 'and I will cry if I want to'), pc('candles', { flavor: 'vanilla', count: 3 })), st('🐰', 12, 80, 1.8, -8), st('🧁', 86, 40, 1.6, 10)), page('Presents', pc('balloons', { items: ['You', 'are', 'so', 'loved', 'today'], after: 'And every day after ♡' })), page('Reel', pc('stories')), page('Card', pc('letter', { paper: 'grid' })), page('Fireworks', pc('fireworks', { text: 'Happy Birthday!', sub: 'tap the sky ✨' }))] }),
  t({ id: 'b-surprise', name: 'Little Birthday Surprise', cat: 'birthday', group: 'Birthday', art: '🕯️📸', theme: 'peach', music: 'candle', loved: 3500,
    tagline: 'Light the candles, a memory wall & a letter', desc: 'They light every candle themselves, walk past a wall of your memories and land on your letter.',
    steps: ['Light every candle', 'Blow them out', 'A wall of memories', 'Your letter'],
    build: () => [page('Candles', H('Light them up, {name}', 'one candle for every reason'), pc('candles', { mode: 'light' })), page('Memories', pc('polaroidwall')), page('Letter', pc('letter'))] }),
  t({ id: 'b-teddy', name: 'Teddy Birthday Surprise', cat: 'birthday', group: 'Birthday', art: '🧸🎀', theme: 'blush', font: 'playful', music: 'sunshine', loved: 3300,
    tagline: 'A sleepy teddy, a secret room, a wish', desc: 'A sleepy teddy wakes up for their birthday, opens the door to a secret room, asks them to make a wish and hands over your letter.',
    steps: ['Wake up the teddy', 'Open the secret room', 'Make a wish', 'Teddy brings a letter'],
    build: () => [page('Teddy', pc('bigsticker', { emoji: '🧸', size: 140, anim: 'wiggle' }), pc('tapcounter', { label: 'Teddy is sleeping… tap to wake him up', emoji: '😴', target: 5, message: 'Teddy is awake! He says: HAPPY BIRTHDAY {name}!!' })), page('Secret room', pc('gatefold', { label: 'Secret room', inside: 'Teddy decorated this whole room for you. He worked very hard (he napped twice).' })), page('Wish', pc('candles', { count: 1, title: 'Teddy says: make a wish' })), page('Letter', pc('hug', { label: 'Hold for a teddy hug' }), pc('letter'))] }),
  t({ id: 'b-wonderland', name: 'Birthday Wonderland', cat: 'birthday', group: 'Birthday', badge: 'New', art: '🫙✉️', theme: 'mint', music: 'birthday', loved: 2900, effect: { type: 'stars' },
    tagline: 'A wishes jar, envelopes, cake & a letter', desc: 'A little wonderland: pull wishes out of a jar, open envelopes for every mood, cut the cake and read your letter.',
    steps: ['A jar of birthday wishes', 'Envelopes to open', 'A cake', 'Your letter'],
    build: () => [page('Jar', H('Welcome to your wonderland', 'everything here is for you'), pc('jar', { title: 'A jar of birthday wishes', notes: ['May your coffee always be hot', 'May your playlists never skip', 'May every mirror tell you the truth: you are gorgeous', 'May we grow old and silly together'] })), page('Envelopes', pc('openwhen', { title: 'Open on your birthday when…', items: [{ label: 'you wake up', text: 'Good morning, birthday human. Today the universe is legally required to be nice to you.' }, { label: 'you eat cake', text: 'Save me a piece. Or don\'t. I love you either way (I\'m lying, save me a piece).' }, { label: 'the day ends', text: 'Another year of you in the world. Lucky world. Luckier me.' }] })), page('Cake', pc('candles', { flavor: 'blue' })), page('Letter', pc('letter'))] }),
  t({ id: 'b-kingdom', name: 'Little Birthday Kingdom', cat: 'birthday', group: 'Birthday', art: '🏰👑', theme: 'sunshine', font: 'royal', music: 'festive', loved: 2600,
    tagline: 'A castle, a cake, mystery gifts & a carnival', desc: 'Their own kingdom: a royal proclamation, the royal cake, five mystery gifts and a carnival wheel to spin.',
    steps: ['The royal proclamation', 'The royal cake', 'Five mystery gifts', 'A carnival wheel', 'A letter from the court'],
    build: () => [withStickers(page('Castle', pc('bigsticker', { emoji: '🏰', size: 150 }), H('Hear ye, hear ye!', 'Today {name} is crowned ruler of the kingdom')), st('👑', 50, 30, 2, 0, 'emoji', 'pulse')), page('Cake', pc('candles', { title: 'The royal cake', flavor: 'vanilla' })), page('Mystery gifts', pc('swipedeck', { items: ['Gift 1: a royal nap, uninterrupted', 'Gift 2: a feast of your favourite food', 'Gift 3: unlimited compliments', 'Gift 4: one wish, granted by me', 'Gift 5: my whole heart (already yours)'], end: 'The treasury is empty. You got everything ♡' })), page('Carnival', pc('wheel')), page('Letter', pc('letter', { paper: 'parchment', greeting: 'Your Majesty {name},' }))] }),
  t({ id: 'b-levelup', name: 'Level Up Birthday', cat: 'birthday', group: 'Birthday', badge: 'New', art: '🎮⬆️', theme: 'midnight', font: 'modern', music: 'sunshine', loved: 2100,
    tagline: 'A gamer birthday: new level unlocked', desc: 'Their birthday as a game: loading screen, level-up stats, achievements unlocked, a year wrapped and a boss-level letter.',
    steps: ['Loading the new level', 'Your stats', 'Achievements unlocked', 'Your year, wrapped', 'The final boss: a letter'],
    build: () => [page('Level up', H('LEVEL {age} UNLOCKED', 'player: {name}'), pc('progress', { label: 'Loading new level…', percent: 100, after: 'New level unlocked! +100 wisdom, +∞ cuteness' })), page('Stats', pc('stats', { title: 'Player stats', items: [{ value: '365', label: 'days survived' }, { value: '9999', label: 'smiles caused' }, { value: '∞', label: 'love points' }] }), pc('checklist', { title: 'Achievements', items: ['Survived another year', 'Stayed awesome', 'Made someone very happy (me)'] })), page('Wrapped', pc('wrapped')), page('Boss level', pc('letter', { paper: 'night' }))] }),

  // ---------------------------------------------------------------- Love
  t({ id: 'ols-boyfriend', name: "Boyfriend's Day", cat: 'love', group: 'Our Little Story', art: '🎮💙', theme: 'ocean', font: 'playful', music: 'sunshine', loved: 4700,
    tagline: 'His profile, a game & stickers', desc: 'His own social profile, a quiz about the two of you, coupons he can actually redeem and a letter covered in stickers.',
    steps: ['His very own profile', 'How well does he know you?', 'Coupons to redeem', 'A letter covered in stickers'],
    build: () => [page('Profile', pc('profile')), page('Quiz', pc('quiz')), page('Coupons', pc('coupons', { items: [{ title: 'One game night, no complaints', sub: 'Valid for 3 hours of pure focus' }, { title: 'Breakfast made by me', sub: 'Eggs may be burnt' }, { title: 'You pick the movie', sub: 'Even the boring one' }] })), withStickers(page('Letter', pc('letter', { greeting: 'Hey you,' })), st('💙', 10, 40, 1.5), st('cutie', 82, 30, 1, 12, 'word'), st('🎮', 88, 380, 1.4, -10))] }),
  t({ id: 'ols-boyfriend-2', name: 'A World For Him', cat: 'love', group: 'Our Little Story', art: '🗺️🎧', theme: 'sage', font: 'modern', music: 'boats', loved: 2400,
    tagline: 'Your places, your songs, a photo cube', desc: 'A little world made just for him: your places on a map, songs that mean something, a photo cube he can spin and a letter.',
    steps: ['Your places on a map', 'Songs that mean something', 'A photo cube to spin', 'A letter'],
    build: () => [page('Map', H('A little world, made for {name}'), pc('mappins')), page('Songs', pc('playlist')), page('Cube', pc('cube')), page('Letter', pc('letter'))] }),
  t({ id: 'ols-scrapbook', name: 'Love Scrapbook', cat: 'love', group: 'Our Little Story', art: '📒💕', theme: 'blush', font: 'hand', music: 'thread', loved: 3700,
    tagline: 'Photos, a letter & a jar of notes', desc: 'A scrapbook: polaroids on a table to move around, a letter on lined paper and a jar of tiny notes.',
    steps: ['Polaroids on a table', 'A letter', 'A jar of notes'],
    build: () => [withStickers(page('Scrapbook', H('Our scrapbook', 'handle with love'), pc('polaroidwall')), st('tape|#e05c8a', 30, 20, 1.2, -10, 'doodle'), st('xoxo', 80, 60, 1, 8, 'word')), page('Letter', pc('letter')), page('Jar', pc('jar'))] }),
  t({ id: 'proposal-classic', name: 'Classic Proposal', cat: 'love', group: 'The Proposal', art: '💍🏃', theme: 'rose', music: 'thread', loved: 5100, effect: { type: 'hearts' },
    tagline: 'Cards, a gallery & a "No" that runs away', desc: 'Cards they swipe through, a gallery of you two, and the big question, where the No button refuses to be clicked.',
    steps: ['Cards to swipe', 'A gallery of you two', 'The question', 'A No that runs away'],
    build: () => [page('Cards', H('I have something to ask you…'), pc('swipedeck')), page('Gallery', pc('collage', { layout: 'grid' })), page('The question', pc('runawayno', { question: 'Will you marry me, {name}?', photo: DEMO(1).src, after: 'SHE SAID YES! (or he did) 💍 I love you forever.' }))] }),
  t({ id: 'proposal-story', name: 'Proposal Story', cat: 'love', group: 'The Proposal', art: '✉️📜', theme: 'kraft', font: 'classic', music: 'thread', loved: 3200,
    tagline: 'An envelope, chapters & the question', desc: 'A sealed envelope, your story told in chapters, a letter and the question at the very end.',
    steps: ['A sealed envelope', 'Your story in chapters', 'A letter', 'The question'],
    build: () => [page('Envelope', pc('envelope')), page('Chapters', pc('timeline')), page('Letter', pc('letter', { paper: 'parchment' })), page('Question', pc('runawayno', { question: 'So… will you be mine?' }))] }),
  t({ id: 'proposal-universe', name: 'A Universe With You', cat: 'love', group: 'The Proposal', art: '🪐🌙', theme: 'midnight', font: 'classic', music: 'stars', loved: 2800, effect: { type: 'stars' },
    tagline: 'Stars, a tiny planet, a letter & the question', desc: 'A night sky full of memories, the moon from the night you met, a letter and the question under the stars.',
    steps: ['A sky of memories', 'The moon from that night', 'A letter', 'The question'],
    build: () => [page('Sky', pc('stars')), page('Moon', pc('moon'), pc('bigsticker', { emoji: '🪐', size: 90, anim: 'spin' })), page('Letter', pc('letter', { paper: 'night' })), page('Question', pc('runawayno', { question: 'Will you share the universe with me?' }))] }),
  t({ id: 'love-reasons', name: '100 Reasons', cat: 'love', group: 'Love', art: '💯❤️', theme: 'rose', music: 'thread', loved: 4400,
    tagline: 'Reasons why, a heart of photos & a jar', desc: 'Every reason you love them, a heart made of your photos, and a jar of notes they can keep pulling from.',
    steps: ['The reasons, one by one', 'A heart made of photos', 'A jar of notes'],
    build: () => [page('Reasons', pc('reasons', { items: Array.from({ length: 20 }, (_, i) => ['Your laugh', 'Your kindness', 'Your terrible puns', 'The way you say my name', 'How you make chai', 'Your sleepy face', 'Your patience with me', 'How you dance badly', 'You remember everything', 'Your hugs'][i % 10] + (i >= 10 ? ' (yes, again)' : '')) })), page('Heart', pc('heartmosaic')), page('Jar', pc('jar'))] }),
  t({ id: 'love-movie', name: 'Our Movie', cat: 'love', group: 'Love', badge: 'New', art: '🎬🍿', theme: 'noir', font: 'royal', music: 'candle', loved: 2300,
    tagline: 'A poster, a film reel, the credits', desc: 'Your love story as a movie: the poster, a reel of scenes, the soundtrack and the end credits.',
    steps: ['The film poster', 'A reel of scenes', 'The soundtrack', 'The end credits'],
    build: () => [page('Poster', pc('poster')), page('Scenes', pc('filmroll'), pc('kenburns')), page('Soundtrack', pc('nowplaying')), page('Credits', pc('credits'))] }),
  t({ id: 'love-news', name: 'Front Page News', cat: 'love', group: 'Love', art: '📰📱', theme: 'kraft', font: 'classic', music: 'boats', loved: 1900,
    tagline: 'A newspaper, a magazine & a lockscreen', desc: 'They make the front page, the cover of a magazine and your lockscreen, with a year wrapped at the end.',
    steps: ['Front page news', 'A magazine cover', 'Your lockscreen', 'Your year wrapped'],
    build: () => [page('News', pc('newspaper')), page('Magazine', pc('magazine')), page('Lockscreen', pc('lockscreen')), page('Wrapped', pc('wrapped'))] }),

  // ---------------------------------------------------------------- Anniversary
  t({ id: 'anni-book', name: 'Another Year of Us', cat: 'anniversary', group: 'Anniversary', art: '📖💍', theme: 'rose', font: 'classic', music: 'thread', loved: 3400,
    tagline: 'A page-turning book of your year', desc: 'A little book of your photos and lines, a live counter of your time together, and a letter.',
    steps: ['A book to page through', 'Time together, ticking live', 'A letter'],
    build: () => [page('Book', H('Happy anniversary, {name}'), pc('flipbook')), page('Counter', pc('counter')), page('Letter', pc('letter'))] }),
  t({ id: 'anni-dial', name: 'Anniversary Dial', cat: 'anniversary', group: 'Anniversary', art: '⏱️📅', theme: 'sage', music: 'candle', loved: 2500,
    tagline: 'The years, the photos & the maths', desc: 'The maths of you two: a live counter, your stats, the day it began circled on a calendar and a collage.',
    steps: ['A live counter', 'Your numbers', 'The day it began', 'A collage'],
    build: () => [page('Counter', H('Us, by the numbers'), pc('counter'), pc('stats')), page('Calendar', pc('calendar'), pc('moon')), page('Collage', pc('collage'), pc('promises'))] }),
  t({ id: 'anni-wrapped', name: 'Our Year Wrapped', cat: 'anniversary', group: 'Anniversary', badge: 'New', art: '🎧✈️', theme: 'midnight', font: 'modern', music: 'boats', loved: 1700,
    tagline: 'Your year as story slides, places & promises', desc: 'Your year together as story slides, your playlist, passport stamps from every trip and new promises.',
    steps: ['Your year, wrapped', 'Your playlist', 'Passport stamps', 'Promises for next year'],
    build: () => [page('Wrapped', pc('wrapped')), page('Playlist', pc('playlist')), page('Places', pc('passport'), pc('distance')), page('Promises', pc('promises'))] }),

  // ---------------------------------------------------------------- Thank you
  t({ id: 'thanks-being-you', name: 'Thanks For Being You', cat: 'thanks', group: 'Thank You', art: '🌷🙏', theme: 'sunshine', font: 'playful', music: 'sunshine', loved: 2200,
    tagline: 'Ten little screens to play', desc: 'Ten tiny screens, each a little game or surprise, all saying thank you in a different way.',
    steps: ['Ten little screens', 'Each one a tiny game', 'All saying thank you'],
    build: () => [page('1', H('Ten little thank-yous', 'for {name}')), page('2', pc('tapcounter', { label: 'Tap 5 times', target: 5, emoji: '🌷', message: 'Thank you for always showing up.' })), page('3', pc('fortune', { message: 'Your future: being thanked a lot. Starting now.' })), page('4', pc('bubbles', { words: ['kind', 'patient', 'generous', 'funny', 'there'], after: 'Thank you for being all of these.' })), page('5', pc('scratch', { message: 'Thank you for the advice I ignored, then followed.' })), page('6', pc('holdreveal', { message: 'Thank you for the long calls.' })), page('7', pc('flipcard')), page('8', pc('shake', { message: 'Thank you for shaking me out of bad moods.' })), page('9', pc('giftbox', { message: 'Thank you for every little thing.' })), page('10', pc('letter', { greeting: 'Dear {name},', body: 'I do not say it enough, so here it is ten times over: thank you.' }))] }),
  t({ id: 'thanks-classic', name: 'Classic Thank You', cat: 'thanks', group: 'Thank You', art: '💐✉️', theme: 'sage', font: 'classic', music: 'candle', loved: 1800,
    tagline: 'One small thing & a note', desc: 'A small gift to open and a thank-you note in your words.',
    steps: ['A small gift to open', 'A thank-you note'],
    build: () => [page('Gift', H('Thank you, {name}'), pc('giftbox', { inside: '💐', message: 'A bouquet that never wilts, for someone who never stops giving.' })), page('Note', pc('letter', { paper: 'plain', greeting: 'Dear {name},', body: 'Thank you for everything you did, especially the things you think nobody noticed. I noticed.' }))] }),

  // ---------------------------------------------------------------- Sorry
  t({ id: 'sorry-cute', name: 'Cute Apology', cat: 'sorry', group: 'The Apology', art: '🥺🌸', theme: 'blush', font: 'playful', music: 'sorry', loved: 4600,
    tagline: 'Soft, sweet & a "No" that cannot be clicked', desc: 'A big sad face, a soft sorry, and a question where forgiving is the only option.',
    steps: ['A very sad face', 'A soft sorry', 'Forgive me? (No runs away)'],
    build: () => [page('Sad', pc('bigsticker', { emoji: '🥺', size: 150, anim: 'pulse' }), H('I am sorry, {name}', 'like, really really sorry')), page('Sorry', T('I was wrong. You were right. Please write that down, it will never happen again.\n\nI miss your face. I miss your texts. I even miss you being annoyed at me.')), page('Forgive', pc('runawayno', { question: 'Will you forgive me?', yes: 'Okay, fine 🙄', no: 'Never', after: 'YAY! I promise to be better. Hug incoming 🤗' }))] }),
  t({ id: 'sorry-talk', name: 'Can We Talk?', cat: 'sorry', group: 'The Apology', art: '💬🤍', theme: 'sage', music: 'sorry', loved: 2700,
    tagline: 'Memories, a promise & one question', desc: 'A reminder of the good times, a promise to do better and one honest question.',
    steps: ['Our good times', 'A promise', 'One question'],
    build: () => [page('Memories', H('Can we talk?'), pc('collage')), page('Promise', pc('promises', { title: 'What I promise from now on', items: ['I will listen before I react', 'I will say sorry sooner', 'I will never let us go to bed angry'] })), page('Question', pc('runawayno', { question: 'Can we start again?', yes: 'Yes', no: 'No', after: 'Thank you. I will not waste it.' }))] }),
  t({ id: 'sorry-classic', name: 'Four Folds Apology', cat: 'sorry', group: 'The Apology', art: '📄🕊️', theme: 'kraft', font: 'hand', music: 'sorry', loved: 2300,
    tagline: 'An apology folded four times', desc: 'An apology in four folds: a pop-up card, doors that open, an envelope and a letter.',
    steps: ['Fold one: a pop-up card', 'Fold two: doors that open', 'Fold three: an envelope', 'Fold four: the letter'],
    build: () => [page('Fold 1', pc('popup', { front: 'I am sorry', inside: 'This is fold one. There are three more. I have a lot to be sorry for.', pop: '🕊️' })), page('Fold 2', pc('gatefold', { label: 'Fold two', inside: 'I hurt you, and that is the last thing I ever wanted.' })), page('Fold 3', pc('envelope', { front: 'Fold three', letter: 'You matter more to me than being right.' })), page('Fold 4', pc('letter', { paper: 'kraft', greeting: '{name},', body: 'I am sorry. No excuses, no buts. I will do better, and I will show you rather than just say it.' }))] }),
  t({ id: 'sorry-teddy', name: 'Teddy Hug Apology', cat: 'sorry', group: 'The Apology', art: '🐰🧸', theme: 'peach', font: 'playful', music: 'sorry', loved: 2600,
    tagline: 'A bunny\'s sorry, a letter, promises & a hug', desc: 'A little bunny says sorry for you, then a letter, some promises and the hug you can hold down for.',
    steps: ['A bunny says sorry', 'A letter', 'Promises', 'A hug'],
    build: () => [page('Bunny', pc('bigsticker', { emoji: '🐰', size: 140, anim: 'wiggle' }), T('Hi. I am the sorry bunny. {sender} sent me because they messed up and are too shy to say it.', 'big')), page('Letter', pc('letter')), page('Promises', pc('promises')), page('Hug', pc('hug'))] }),
  t({ id: 'sorry-mission', name: 'Mission Manana Apology', cat: 'sorry', group: 'The Apology', badge: 'Hinglish', art: '🙏😅', theme: 'sunshine', font: 'playful', music: 'sunshine', loved: 3100,
    tagline: 'Knock, clouds, coupons, sit-ups & a maafi patra', desc: 'A desi apology mission: knock on the door, clear the angry clouds, a coupon, sit-ups as punishment and an official maafi patra.',
    steps: ['Knock knock', 'Clear the angry clouds', 'A sorry coupon', 'Uthak-baithak punishment', 'The maafi patra'],
    build: () => [page('Knock', pc('tapcounter', { label: 'Knock on the door (3 times)', emoji: '🚪', target: 3, message: 'Darwaza khulo na… main hoon. Sorry bolne aaya/aayi hoon 🥺' })), page('Clouds', pc('bubbles', { words: ['gussa', 'naraazgi', 'mood off', 'ignore'], after: 'Baadal hat gaye! Ab thoda smile karo na ☀️' })), page('Coupon', pc('coupons', { title: 'Sorry coupons', items: [{ title: 'Ek plate momos', sub: 'Meri taraf se' }, { title: 'Full day, your choice', sub: 'Koi complaint nahi' }] })), page('Uthak-baithak', pc('tapcounter', { label: 'Count my uthak-baithak (10)', emoji: '🧎', target: 10, message: 'Das ho gaye! Ab to maaf kar do 🙏' })), page('Maafi patra', pc('agreement', { title: 'Official Maafi Patra', clauses: ['Main, {sender}, apni galti maanta/maanti hoon.', 'Aage se aisa nahi hoga (pakka promise).', '{name} ka mood theek karna meri zimmedari hai.'], signLabel: 'Sign karke maaf karo, {name}', after: 'Maafi granted! Party meri taraf se 🎉' }))] }),
  t({ id: 'sorry-coupons', name: 'Sorry Coupons', cat: 'sorry', group: 'The Apology', badge: 'New', art: '🎫🙇', theme: 'mint', font: 'modern', music: 'sorry', loved: 1300,
    tagline: 'A book of make-it-up-to-you coupons', desc: 'Coupons to redeem, a scratch card and a hold-to-reveal sorry.',
    steps: ['Make-it-up coupons', 'A scratch card', 'Hold for the real sorry'],
    build: () => [page('Coupons', H('A small book of sorry'), pc('coupons', { items: [{ title: 'I do the dishes', sub: 'For a whole week' }, { title: 'Unlimited "you were right"', sub: 'Redeem anytime' }, { title: 'Ice cream run', sub: 'Any time, any weather' }] })), page('Scratch', pc('scratch', { message: 'I am sorry. You deserve better and I will be better.' })), page('Hold', pc('holdreveal', { message: 'I love you, even when I mess up. Especially then.' }))] }),

  // ---------------------------------------------------------------- Celebrate
  t({ id: 'congrats', name: 'Big Congratulations', cat: 'celebrate', group: 'Celebrate', art: '🏆🎆', theme: 'sunshine', font: 'modern', music: 'sunshine', effect: { type: 'confetti' }, loved: 1900,
    tagline: 'Fireworks, front page news & a toast', desc: 'For a new job, a win, a big moment: fireworks, front-page news, their stats and a toast.',
    steps: ['Fireworks', 'Front page news', 'Proud stats', 'A toast'],
    build: () => [page('Fireworks', pc('fireworks', { text: 'Congratulations, {name}!', sub: 'tap the sky ✨' })), page('News', pc('newspaper', { headline: '{name} DOES IT AGAIN', sub: 'The world is not surprised. We always knew.' })), page('Stats', pc('stats', { title: 'By the numbers', items: [{ value: '1000', label: 'hours of hard work' }, { value: '1', label: 'huge win' }, { value: '∞', label: 'proud people' }] })), page('Toast', pc('letter', { greeting: 'To {name},', body: 'You earned every bit of this. I am so proud of you. Now go celebrate!' }))] }),
  t({ id: 'graduation', name: 'Graduation Day', cat: 'celebrate', group: 'Celebrate', art: '🎓🎈', theme: 'ocean', font: 'classic', music: 'sunshine', loved: 1500,
    tagline: 'A magazine cover, the journey & balloons', desc: 'For the graduate: a magazine cover, the journey so far, wishes for what comes next and balloons to pop.',
    steps: ['The cover star', 'The journey', 'Wishes for what is next', 'Balloons'],
    build: () => [page('Cover', pc('magazine', { mag: 'GRAD', line1: 'Graduate of the year', line2: 'Sleepless nights: finally over', line3: 'Inside: what comes next' })), page('Journey', pc('timeline', { title: 'The journey', items: [{ date: 'Year 1', title: 'Lost and confused', text: 'Found the canteen first.' }, { date: 'Year 2', title: 'Getting it', text: 'Mostly.' }, { date: 'Today', title: 'Graduate!', text: 'Look at you go.' }] })), page('Wishes', pc('wishes', { title: 'For what comes next…' })), page('Balloons', pc('balloons', { items: ['Con', 'gra', 'tu', 'la', 'tions!'], after: 'The world is lucky to have you ✨' }))] }),

  // ---------------------------------------------------------------- Family
  t({ id: 'maa', name: 'For Maa', cat: 'family', group: 'Family', art: '👩‍👧💐', theme: 'peach', font: 'classic', music: 'candle', loved: 3300,
    tagline: 'Things she always says, and the thank-you', desc: 'Things she always says, the times you actually listened, and the thank-you you never said out loud.',
    steps: ['Things Maa always says', 'What I actually heard', 'The thank-you'],
    build: () => [page('Things she says', H('For Maa', 'with all my heart'), pc('swipedeck', { items: ['"Khana kha liya?"', '"Jacket le ke ja"', '"Main sab samajhti hoon"', '"Phone rakh do ab"', '"Mere liye tum hamesha bacche rahoge"'], end: 'I pretended not to listen. I heard every word.' })), page('Chat', pc('chat', { contact: 'Maa ❤️', messages: [{ from: 'them', text: 'Beta khana khaya?' }, { from: 'me', text: 'haan maa' }, { from: 'them', text: 'Kya khaya?' }, { from: 'me', text: '…maggi' }, { from: 'them', text: '😑' }, { from: 'me', text: 'love you maa' }, { from: 'them', text: 'Love you too. Ab ghar aa.' }] })), page('Thank you', pc('letter', { greeting: 'Dear Maa,', body: 'Thank you for every tiffin, every prayer, every time you stayed up waiting for me.\n\nI do not say it enough. I love you more than I know how to say.' }))] }),
  t({ id: 'papa', name: 'For Papa', cat: 'family', group: 'Family', badge: 'New', art: '👨‍👦🏆', theme: 'ocean', font: 'modern', music: 'candle', loved: 1600,
    tagline: 'A hero card, his stats & a letter', desc: 'Papa\'s hero card, the stats nobody keeps but you, coupons and a letter.',
    steps: ['His hero card', 'Papa stats', 'Coupons for him', 'A letter'],
    build: () => [page('Hero', pc('profile', { name: 'Papa', handle: '@the.original.hero', bio: 'Fixes everything. Bad jokes champion. Secretly the softest person in the house.', stats: [{ value: '∞', label: 'sacrifices' }, { value: '1', label: 'hero' }, { value: '100%', label: 'dad jokes' }], tags: ['hero', 'chef (on Sundays)', 'best dad'] })), page('Stats', pc('stats', { title: 'Papa, by the numbers', items: [{ value: '9000', label: 'rides to school' }, { value: '365', label: 'days of worrying' }, { value: '∞', label: 'love' }] })), page('Coupons', pc('coupons')), page('Letter', pc('letter', { greeting: 'Dear Papa,' }))] }),

  // ---------------------------------------------------------------- Festivals
  t({ id: 'raksha', name: 'Raksha Bandhan', cat: 'festivals', group: 'Festivals', art: '🧵🌼', theme: 'maroon', font: 'royal', music: 'festive', loved: 4300,
    tagline: 'Braid the rakhi, the charges, the shagun', desc: 'They braid and tie the rakhi themselves, accept the sibling charges, settle the shagun, swipe through your photos, then read the bit you actually mean.',
    steps: ['Braid & tie the rakhi', 'The sibling charges', 'Settle the shagun', 'Your photos', 'The bit you mean'],
    build: () => [page('Rakhi', pc('rakhi')), page('Charges', pc('agreement', { title: 'Official charges against my sibling', clauses: ['Stealing my snacks (since birth)', 'Complaining to Maa about everything', 'Being the favourite (unfair)'], signLabel: 'Accept the charges', after: 'Charges accepted. Punishment: lifetime of being loved.' })), page('Shagun', pc('recharge', { title: 'Shagun payment pending', plans: [{ name: 'Basic shagun', price: '₹101', perks: 'One rakhi worth of love' }, { name: 'Premium shagun', price: '₹501', perks: 'Plus chocolates' }, { name: 'Lifetime protection', price: 'Priceless', perks: 'Always got your back' }], final: 'Shagun received! Relationship renewed for another year 🎁' })), page('Photos', pc('swipestack')), page('Letter', pc('letter', { greeting: 'Dear {name},', body: 'We fight like cats and dogs, but you are my first friend and my forever protector. Happy Raksha Bandhan.' }))] }),
  t({ id: 'diwali', name: 'Diwali Lights', cat: 'festivals', group: 'Festivals', art: '🪔✨', theme: 'maroon', font: 'royal', music: 'festive', loved: 3900, effect: { type: 'stars' },
    tagline: 'Light the diyas, a rangoli & fireworks', desc: 'Light a row of diyas one by one, watch a rangoli draw itself, burst some fireworks and read your wishes.',
    steps: ['Light the diyas', 'A rangoli', 'Fireworks', 'Diwali wishes'],
    build: () => [page('Diyas', H('Happy Diwali, {name}'), pc('diyas')), page('Rangoli', pc('rangoli')), page('Fireworks', pc('fireworks', { text: 'Shubh Deepavali!', sub: 'tap the sky (no pollution) ✨' })), page('Wishes', pc('letter', { paper: 'parchment', greeting: 'Dear {name},', body: 'May this Diwali bring light to every corner of your life, and may every sweet you eat be calorie-free.' }))] }),
  t({ id: 'holi', name: 'Holi Colours', cat: 'festivals', group: 'Festivals', art: '🎨💦', theme: 'sunshine', font: 'playful', music: 'festive', loved: 2000, effect: { type: 'confetti' },
    tagline: 'Pop the colours, memories & gujiya', desc: 'Pop colour balloons, scroll through your colourful memories and a sweet Holi note.',
    steps: ['Pop the colour balloons', 'Colourful memories', 'A Holi note'],
    build: () => [page('Colours', H('Happy Holi, {name}!', 'bura na mano'), pc('balloons', { items: ['gulaal', 'pichkari', 'gujiya', 'thandai', 'masti'], after: 'You are officially coloured with love 💗💛💚' })), page('Memories', pc('collage')), page('Note', T('May your life be as colourful as your face after Holi. Happy Holi!', 'big'))] }),
  t({ id: 'newyear', name: 'New Year Countdown', cat: 'festivals', group: 'Festivals', art: '🎆🥂', theme: 'noir', font: 'modern', music: 'stars', loved: 1800,
    tagline: 'A live countdown, fireworks & lanterns', desc: 'A live countdown to midnight, fireworks, wishes for the new year and lanterns to release.',
    steps: ['A live countdown', 'Fireworks', 'Wishes', 'Sky lanterns'],
    build: () => [page('Countdown', H('New Year, new us'), pc('counter', { mode: 'until', date: `${new Date().getFullYear() + 1}-01-01T00:00`, label: 'until the new year', after: 'and I want to spend every second of it with you' })), page('Fireworks', pc('fireworks')), page('Wishes', pc('wishes', { title: 'For the new year, I wish you…' })), page('Lanterns', pc('lanterns'))] }),
  t({ id: 'eid', name: 'Eid Mubarak', cat: 'festivals', group: 'Festivals', art: '🌙🏮', theme: 'midnight', font: 'royal', music: 'stars', loved: 1700, effect: { type: 'stars' },
    tagline: 'The crescent moon, lanterns & duas', desc: 'The crescent moon, lanterns carrying your duas and a warm Eid letter.',
    steps: ['The crescent moon', 'Lanterns of duas', 'An Eid letter'],
    build: () => [page('Moon', H('Eid Mubarak, {name}'), pc('moon', { caption: 'the moon that brought Eid' })), page('Lanterns', pc('lanterns', { wishes: ['peace', 'barakah', 'health', 'joy'], after: 'May all of these find you this Eid ✨' })), page('Letter', pc('letter', { paper: 'night', greeting: 'Dear {name},', body: 'Eid Mubarak! May your home be full of sheer khurma, laughter and the people you love.' }))] }),
  t({ id: 'christmas', name: 'Christmas Wishes', cat: 'festivals', group: 'Festivals', art: '🎄🎅', theme: 'sage', font: 'playful', music: 'birthday', loved: 1600, effect: { type: 'snow' },
    tagline: 'A present, a jar of wishes & snow', desc: 'A present under the tree, a jar of wishes and a cosy Christmas letter, with snow falling all the way.',
    steps: ['A present under the tree', 'A jar of wishes', 'A cosy letter'],
    build: () => [page('Present', H('Merry Christmas, {name}'), pc('giftbox', { inside: '🎄', message: 'Ho ho ho! You have been very good this year (mostly).' })), page('Jar', pc('jar', { title: 'A jar of Christmas wishes' })), page('Letter', pc('letter'))] }),

  // ---------------------------------------------------------------- Friends
  t({ id: 'friend-museum', name: 'Museum of Us · Friendship', cat: 'friends', group: 'Friendship', art: '🖼️👯', theme: 'mint', font: 'classic', music: 'sunshine', loved: 2900,
    tagline: 'Exhibits, polaroids, a letter & an agreement', desc: 'Your friendship as a museum: framed exhibits with notes, polaroids, a letter and a lifelong friendship agreement.',
    steps: ['Framed exhibits', 'Polaroids', 'A letter', 'The friendship agreement'],
    build: () => [page('Exhibits', H('The Museum of Us', 'a friendship exhibit'), pc('frame', { caption: 'Exhibit A: our first meme' }), pc('hotspots')), page('Polaroids', pc('polaroidwall')), page('Letter', pc('letter', { greeting: 'Dear bestie,' })), page('Agreement', pc('agreement', { title: 'Friendship Agreement', clauses: ['We will always share food (except fries).', 'We will hype each other up, no matter what.', 'Ugly photos will be kept for blackmail only.', 'Friends forever, no returns.'], signLabel: 'Sign, bestie', after: 'Friends for life. Legally.' }))] }),
  t({ id: 'bestie-world', name: 'Bestie World', cat: 'friends', group: 'Friendship', art: '👭🫙', theme: 'lavender', font: 'playful', music: 'sunshine', loved: 2400,
    tagline: 'Memories, a quiz, a jar of thank-yous & a hug', desc: 'Your memories, a quiz to test the friendship, a jar of thank-yous and a hug.',
    steps: ['Memories', 'The bestie quiz', 'A jar of thank-yous', 'A hug'],
    build: () => [page('Memories', H('Welcome to Bestie World'), pc('collage')), page('Quiz', pc('quiz', { title: 'The ultimate bestie quiz' })), page('Jar', pc('jar', { title: 'Thank you for…', notes: ['Being my 3am call', 'Lying that my outfit was fine', 'Every inside joke', 'Being my person'] })), page('Hug', pc('hug'))] }),

  // ---------------------------------------------------------------- Miss you
  t({ id: 'miss-universe', name: 'Miss You Universe', cat: 'miss', group: 'Miss You', art: '🌌💫', theme: 'midnight', font: 'hand', music: 'stars', loved: 3400, effect: { type: 'stars' },
    tagline: 'A letter, a memory sky & open-when notes', desc: 'A letter, a sky full of memories to tap and open-when notes for the days in between.',
    steps: ['A letter', 'A sky of memories', 'Open-when notes'],
    build: () => [page('Letter', pc('letter', { paper: 'night', body: 'I miss you in the obvious ways and the silly ones. I miss your voice, your face, the way you steal the blanket.' })), page('Sky', pc('stars')), page('Open when', pc('openwhen'))] }),
  t({ id: 'miss-same-sky', name: 'Under the Same Sky', cat: 'miss', group: 'Miss You', art: '☁️📱', theme: 'ocean', font: 'modern', music: 'stars', loved: 2800,
    tagline: 'Chats, polaroids, a letter & a hug', desc: 'Your chats, polaroids, a letter and a hug to hold down for until you are together again.',
    steps: ['Our chats', 'Polaroids', 'A letter', 'A hug'],
    build: () => [page('Chat', H('Under the same sky'), pc('chat')), page('Polaroids', pc('polaroidwall')), page('Letter', pc('letter')), page('Hug', pc('hug'))] }),
  t({ id: 'miss-miles', name: 'Miles Apart', cat: 'miss', group: 'Miss You', art: '✈️🗺️', theme: 'sage', music: 'stars', loved: 2600,
    tagline: 'The distance, a chat, promises & a hug', desc: 'How far apart you are (and how close), a chat, promises for when you meet and a hug.',
    steps: ['The distance', 'A chat', 'Promises for when we meet', 'A hug'],
    build: () => [page('Distance', pc('distance'), pc('counter', { mode: 'until', date: new Date(Date.now() + 86400000 * 20).toISOString().slice(0, 16), label: 'until I see you', after: '' })), page('Chat', pc('chat')), page('Promises', pc('promises', { title: 'When I see you, I promise…', items: ['The longest hug in history', 'Your favourite food, my treat', 'No phones for a whole day'] })), page('Hug', pc('hug'))] }),
  t({ id: 'miss-supposed', name: 'You Were Supposed To Be Here', cat: 'miss', group: 'Miss You', art: '🌅🌙', theme: 'peach', font: 'classic', music: 'stars', loved: 2500,
    tagline: 'One ordinary day, sunrise to midnight', desc: 'One ordinary day from sunrise to midnight: the messages you almost sent, a song on loop and a little box at the end.',
    steps: ['Sunrise to midnight', 'The messages you almost sent', 'A song on loop', 'A little box at the end'],
    build: () => [page('The day', pc('daytimeline')), page('Song', pc('nowplaying', { song: 'The song I played three times' })), page('Box', pc('giftbox', { label: 'One more thing', message: 'Come back soon. The day is too long without you.' }))] }),
  t({ id: 'miss-voice', name: 'Hear My Voice', cat: 'miss', group: 'Miss You', badge: 'New', art: '🎙️💗', theme: 'blush', music: 'none', loved: 1400,
    tagline: 'A voice note, a countdown & a letter', desc: 'Record a voice note right in the editor, add a countdown to when you meet and a letter.',
    steps: ['Your voice', 'Countdown to the next hug', 'A letter'],
    build: () => [page('Voice', H('Press play, {name}', 'it is me'), pc('voicenote')), page('Countdown', pc('counter', { mode: 'until', date: new Date(Date.now() + 86400000 * 12).toISOString().slice(0, 16), label: 'until our next hug', after: '' })), page('Letter', pc('letter'))] }),

  // ---------------------------------------------------------------- Photo puzzle
  t({ id: 'photo-puzzle', name: 'Memory Photo Puzzle', cat: 'love', group: 'Photo Puzzle', art: '🧩📷', theme: 'lavender', music: 'boats', loved: 2200,
    tagline: 'A memory to piece back together, then the words', desc: 'They slide your photo back together, find the matching pairs, then read your words.',
    steps: ['Solve the photo puzzle', 'Match the memory pairs', 'Your words'],
    build: () => [page('Puzzle', H('Put us back together'), pc('puzzle')), page('Pairs', pc('memory')), page('Words', pc('letter'))] }),

  // ---------------------------------------------------------------- Make your own
  t({ id: 'make-your-own', name: 'Make Your Own', cat: 'diy', group: 'Make Your Own', badge: 'Everything', art: '✎🧩', theme: 'rose', music: 'bloom', loved: 3000,
    tagline: 'A blank page and every piece there is', desc: 'Start from a blank page or a sample and build it page by page: words and letters, photos, stickers, your own drawing and 115+ pieces including games, 3D cards and desi specials.',
    steps: ['A sealed opening', 'Your pages, your order', 'Photos & 300+ stickers', 'Something you drew', 'Little games'],
    build: () => [page('Cover', H('For {name}', 'made with love by {sender}'), pc('photo')), page('Photos', pc('swipestack')), page('Game', pc('scratch')), page('Quiz', pc('quiz')), page('Letter', pc('letter')), page('Question', pc('runawayno'))] }),
];

// ---------------------------------------------------------------- Mini gifts (one piece each)
const MINI: [string, string, string, string, string][] = [
  ['recharge', 'Dil Ka Recharge', 'Recharge their heart with a lifetime love pack', '📶💗', 'ocean'],
  ['chai', 'Chai Pe Charcha', 'Add four things to the chai; each stirs in a line', '☕🫖', 'kraft'],
  ['golgappa', 'Golgappa Challenge', 'Sweet puris and one teekha roast', '🥟🌶️', 'sunshine'],
  ['tiffin', 'Teen Dabba Tiffin', 'Open a steel tiffin, one tier at a time', '🍱🥄', 'sage'],
  ['cooker', 'Teen Seeti Surprise', 'A cooker whistles three lines, then the lid pops', '♨️🍲', 'peach'],
  ['cricket', 'Player of the Match', 'Six balls, six shots and a trophy with their name', '🏏🏆', 'sage'],
  ['kite', 'Chhat Pe Patang', 'Cut the kites named after bad days', '🪁☀️', 'ocean'],
  ['filmy', 'Picture Abhi Baaki Hai', 'A filmy trailer starring them', '🎥🍿', 'noir'],
  ['carrom', 'Sunday Carrom Club', 'Sink the coins; the queen opens your note', '🎯👑', 'kraft'],
  ['meter', 'Pyaar ka Meter Ride', 'The meter ticks at every place you two love', '🛺📍', 'sunshine'],
  ['radio', 'Dil Se FM Dedication', 'Turn the dial; every station is a dedication', '📻🎶', 'peach'],
  ['tota', 'Tota Bole Fortune', 'A parrot picks three cards about their future', '🦜🔮', 'mint'],
  ['dahihandi', 'Dahi Handi Todo', 'Build the pyramid, break the handi', '🏺🧈', 'maroon'],
  ['luckyticket', 'Kismat Ka Ticket', 'Scratch squares that each hide a prize', '🎰🎟️', 'lavender'],
  ['torch', 'Light Gayi!', 'Power cut: a torch finds your notes', '🔦✉️', 'midnight'],
  ['chuski', 'Ice Chuski', 'Three syrups, a sweet line with each', '🍧🌈', 'blush'],
];
MINI.forEach(([type, name, tagline, art, theme], k) => TEMPLATES.push(t({
  id: 'mini-' + type, name, cat: 'mini', group: 'Mini Gifts', tagline, desc: tagline + '. A tiny, playful gift that takes a minute to make and a minute to open.', art, theme, font: 'playful', music: type === 'filmy' ? 'candle' : 'festive', loved: 2400 - k * 90, badge: k < 3 ? 'New' : undefined,
  steps: ['Tap to play', 'A line with every move', 'A little finale'], opener: { enabled: false } as any,
  build: () => [page(name, pc(type))],
})));

export const findTemplate = (id: string) => TEMPLATES.find((x) => x.id === id);

export function makeGift(tpl: Template, names: { to?: string; from?: string; age?: string } = {}): Gift {
  return {
    v: 1, id: uid(10), templateId: tpl.id, title: tpl.name, to: names.to || tpl.demo?.to || 'Aanya', from: names.from || tpl.demo?.from || 'Kabir', age: names.age || tpl.demo?.age || '25',
    theme: tpl.theme, font: tpl.font || 'classic', transition: tpl.transition || 'slide',
    opener: { enabled: true, style: 'envelope', line: 'For {name} ♡', ...(tpl.opener || {}) },
    music: { track: tpl.music || 'bloom', volume: 0.6 }, sfx: 'chimes', effect: tpl.effect || { type: 'none' },
    pages: clone(tpl.build()), createdAt: Date.now(), updatedAt: Date.now(),
  };
}

export const blankGift = (): Gift => {
  const g = makeGift(findTemplate('make-your-own')!);
  g.pages = [page('Page 1', H('For {name}', 'made with love by {sender}'))];
  g.title = 'My own gift';
  return g;
};
