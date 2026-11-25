import { graphemes } from './util';
// 300+ stickers: emoji packs, word stickers and hand-drawn doodles (original SVGs).
export const STICKER_PACKS: { id: string; name: string; kind: 'emoji' | 'word' | 'doodle'; items: string[] }[] = [
  { id: 'love', name: 'Love', kind: 'emoji', items: graphemes('💖💗💓💞💕💘💝❤️🧡💛💚💙💜🤍🤎🖤❣️💌💋😍🥰😘💑💏👩‍❤️‍👨🫶🤟🌹💐🔐🗝️💍') },
  { id: 'sky', name: 'Sky & flowers', kind: 'emoji', items: graphemes('🌸🌺🌷🌻🌼💮🏵️🌹🥀🍀🌿🍃🌈☁️⛅🌙🌛⭐🌟✨💫☀️🌞🌊🦋🐝🌱🌵🍁🍂') },
  { id: 'party', name: 'Party', kind: 'emoji', items: graphemes('🎉🎊🎈🎂🍰🧁🎁🎀🪅🥳🎆🎇🪩🍾🥂🎶🎵🎤👑🎟️🪄🕯️') },
  { id: 'cute', name: 'Cute', kind: 'emoji', items: graphemes('🧸🐻🐼🐨🐰🐱🐶🦊🐹🐥🐣🐧🦄🐸🐙🐳🦢🦩🐾🥺😊🤗😇🙈🙊🫠😋🤭') },
  { id: 'food', name: 'Food', kind: 'emoji', items: graphemes('☕🍵🧋🍕🍔🍟🌮🍜🍝🍣🍩🍪🍫🍬🍭🍦🍨🍓🍒🍑🥭🍉🥟🍛🫖') },
  { id: 'festive', name: 'Festive', kind: 'emoji', items: graphemes('🪔🎆🎇🧨🏮🪁🌙🕌🛕⛪🎄🎅🤶❄️☃️🎃🕉️☪️✡️🪷🌾🥁') },
  { id: 'things', name: 'Things', kind: 'emoji', items: graphemes('📷📸🎞️📼💿📻📱💻⏰⌛📚📖✏️🖍️✂️📌📎🧷🎨🧵🪡🕶️👓💄👗👠🎒⚽🏏🎮🚲🚗✈️🏠⛺') },
  { id: 'words', name: 'Word stickers', kind: 'word', items: ['I love you', 'Happy Birthday!', 'yay!', 'xoxo', 'BFF', 'cutie', 'miss you', 'sorry!', 'thank you', 'forever', 'my person', 'wow', 'omg', 'hehe', 'best day ever', 'you + me', 'mine ♡', 'so proud', 'hug?', 'bestie', 'Shubh Deepavali', 'Happy Anniversary', 'Congrats!', 'Get well soon', 'Pyaar', 'Jaan', 'Dil se', 'LOL', 'Queen', 'King'] },
  { id: 'doodles', name: 'Doodles', kind: 'doodle', items: ['heart', 'star', 'swirl', 'arrow', 'flower', 'sparkle', 'crown', 'cloud', 'squiggle', 'smile', 'tape', 'burst'] },
];

const D: Record<string, string> = {
  heart: '<path d="M50 85 C10 60 5 30 25 20 C40 12 50 25 50 32 C50 25 60 12 75 20 C95 30 90 60 50 85Z" fill="none" stroke="C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
  star: '<path d="M50 10 L61 38 L91 40 L67 59 L75 88 L50 71 L25 88 L33 59 L9 40 L39 38Z" fill="none" stroke="C" stroke-width="5" stroke-linejoin="round"/>',
  swirl: '<path d="M50 50 m0 0 c5 0 8 -4 6 -8 c-3 -7 -15 -6 -18 2 c-4 11 8 20 19 17 c15 -4 18 -24 6 -33 c-14 -11 -38 -4 -42 15" fill="none" stroke="C" stroke-width="5" stroke-linecap="round"/>',
  arrow: '<path d="M12 70 C30 40 55 30 82 32 M70 20 L84 32 L70 46" fill="none" stroke="C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
  flower: '<g fill="none" stroke="C" stroke-width="4"><circle cx="50" cy="50" r="9"/><ellipse cx="50" cy="26" rx="10" ry="15"/><ellipse cx="50" cy="74" rx="10" ry="15"/><ellipse cx="26" cy="50" rx="15" ry="10"/><ellipse cx="74" cy="50" rx="15" ry="10"/></g>',
  sparkle: '<path d="M50 8 C53 38 62 47 92 50 C62 53 53 62 50 92 C47 62 38 53 8 50 C38 47 47 38 50 8Z" fill="C"/>',
  crown: '<path d="M15 72 L10 30 L32 50 L50 20 L68 50 L90 30 L85 72Z M15 82 L85 82" fill="none" stroke="C" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>',
  cloud: '<path d="M25 72 C8 72 8 50 24 48 C24 30 48 26 54 40 C62 28 84 34 80 52 C94 54 92 72 78 72Z" fill="none" stroke="C" stroke-width="5" stroke-linejoin="round"/>',
  squiggle: '<path d="M8 55 Q20 30 32 55 T56 55 T80 55 T96 50" fill="none" stroke="C" stroke-width="5" stroke-linecap="round"/>',
  smile: '<g fill="none" stroke="C" stroke-width="5" stroke-linecap="round"><circle cx="50" cy="50" r="38"/><path d="M33 58 Q50 75 67 58"/><path d="M37 40 L37 42 M63 40 L63 42"/></g>',
  tape: '<rect x="10" y="38" width="80" height="24" rx="2" fill="C" opacity=".45" transform="rotate(-8 50 50)"/>',
  burst: '<g stroke="C" stroke-width="5" stroke-linecap="round"><path d="M50 10 L50 28 M50 72 L50 90 M10 50 L28 50 M72 50 L90 50 M22 22 L34 34 M66 66 L78 78 M78 22 L66 34 M22 78 L34 66"/></g>',
};

export function doodleSvg(name: string, color = '#e0567a') {
  const body = (D[name] || D.heart).replace(/C/g, color);
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${body}</svg>`)}`;
}

export const STICKER_COUNT = STICKER_PACKS.reduce((a, p) => a + p.items.length, 0);
