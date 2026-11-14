// Handwriting guides use paths rather than installed fonts, so the same
// single-storey a / g and writing-line positions appear on every device.
const NUMBER_PATHS = {
  '0': ['M50 20 C12 20 12 100 50 100 C88 100 88 20 50 20'],
  '1': ['M32 38 L52 20 L52 100'],
  '2': ['M22 38 C22 12 78 12 78 40 C78 58 44 76 22 100 L80 100'],
  '3': ['M23 27 C51 8 90 28 68 51 L50 58 C92 53 88 104 49 100 C36 100 26 94 21 87'],
  '4': ['M65 20 L23 73 L81 73', 'M65 20 L65 100'],
  '5': ['M77 20 L28 20 L24 58 C83 35 99 101 48 100 C35 100 25 94 21 87'],
  '6': ['M73 23 C31 4 10 91 45 99 C83 110 91 48 50 55 C33 58 24 70 25 80'],
  '7': ['M21 20 L80 20 L39 100'],
  '8': ['M50 20 C14 20 17 51 50 58 C92 68 85 100 50 100 C15 100 8 68 50 58 C83 51 86 20 50 20'],
  '9': ['M75 45 C75 13 23 13 23 44 C23 74 75 74 75 44 L75 72 C75 97 46 109 27 92'],
};

const UPPERCASE_PATHS = {
  A: ['M15 100 L50 20 L85 100', 'M30 68 L70 68'],
  B: ['M24 100 L24 20 L51 20 C87 20 85 59 51 59 L24 59', 'M51 59 C92 59 92 100 51 100 L24 100'],
  C: ['M80 32 C66 12 20 13 20 60 C20 107 66 108 80 88'],
  D: ['M24 100 L24 20 L46 20 C94 20 94 100 46 100 L24 100'],
  E: ['M79 20 L24 20 L24 100 L79 100', 'M24 59 L69 59'],
  F: ['M79 20 L24 20 L24 100', 'M24 59 L69 59'],
  G: ['M80 32 C66 12 20 13 20 60 C20 107 69 108 80 88 L80 63 L54 63'],
  H: ['M23 20 L23 100', 'M77 20 L77 100', 'M23 60 L77 60'],
  I: ['M26 20 L74 20', 'M50 20 L50 100', 'M26 100 L74 100'],
  J: ['M29 20 L76 20 L76 77 C76 110 23 107 23 79'],
  K: ['M24 20 L24 100', 'M78 20 L24 67', 'M46 48 L81 100'],
  L: ['M24 20 L24 100 L80 100'],
  M: ['M16 100 L16 20 L50 70 L84 20 L84 100'],
  N: ['M22 100 L22 20 L78 100 L78 20'],
  O: ['M50 20 C8 20 8 100 50 100 C92 100 92 20 50 20'],
  P: ['M25 100 L25 20 L52 20 C92 20 92 62 52 62 L25 62'],
  Q: ['M50 20 C8 20 8 100 50 100 C92 100 92 20 50 20', 'M58 78 L84 108'],
  R: ['M25 100 L25 20 L52 20 C92 20 92 62 52 62 L25 62', 'M50 62 L82 100'],
  S: ['M79 30 C63 9 21 17 22 41 C23 66 79 53 79 80 C79 106 37 107 20 89'],
  T: ['M15 20 L85 20', 'M50 20 L50 100'],
  U: ['M22 20 L22 72 C22 110 78 110 78 72 L78 20'],
  V: ['M17 20 L50 100 L83 20'],
  W: ['M10 20 L28 100 L50 48 L72 100 L90 20'],
  X: ['M20 20 L80 100', 'M80 20 L20 100'],
  Y: ['M18 20 L50 60 L82 20', 'M50 60 L50 100'],
  Z: ['M21 20 L80 20 L20 100 L81 100'],
};

const LOWERCASE_PATHS = {
  a: ['M76 79 C76 51 24 51 24 80 C24 107 76 107 76 79', 'M76 60 L76 100'],
  b: ['M24 20 L24 100', 'M24 80 C24 51 78 51 78 80 C78 108 24 108 24 80'],
  c: ['M77 67 C60 51 24 57 24 80 C24 104 60 109 77 94'],
  d: ['M76 79 C76 51 24 51 24 80 C24 107 76 107 76 79', 'M76 20 L76 100'],
  e: ['M24 80 L78 80 C78 50 24 51 24 80 C24 106 61 108 77 94'],
  f: ['M70 24 C57 10 39 22 39 43 L39 100', 'M23 60 L68 60'],
  g: ['M76 79 C76 51 24 51 24 80 C24 107 76 107 76 79', 'M76 60 L76 118 C76 144 43 146 28 132'],
  h: ['M24 20 L24 100', 'M24 79 C24 54 77 52 77 78 L77 100'],
  i: ['M50 60 L50 100', 'M50 37 L50 38'],
  j: ['M62 60 L62 121 C62 144 38 145 28 134', 'M62 37 L62 38'],
  k: ['M25 20 L25 100', 'M76 60 L25 89', 'M48 76 L79 100'],
  l: ['M50 20 L50 100'],
  m: ['M15 60 L15 100', 'M15 77 C15 54 50 54 50 77 L50 100', 'M50 77 C50 54 85 54 85 77 L85 100'],
  n: ['M24 60 L24 100', 'M24 79 C24 54 77 52 77 78 L77 100'],
  o: ['M50 60 C15 60 15 100 50 100 C85 100 85 60 50 60'],
  p: ['M24 60 L24 140', 'M24 80 C24 51 78 51 78 80 C78 108 24 108 24 80'],
  q: ['M76 79 C76 51 24 51 24 80 C24 107 76 107 76 79', 'M76 60 L76 140'],
  r: ['M28 60 L28 100', 'M28 80 C28 59 52 54 73 64'],
  s: ['M73 66 C60 54 28 57 28 70 C28 84 73 76 73 90 C73 104 42 106 25 95'],
  t: ['M45 30 L45 84 C45 102 60 105 75 94', 'M24 60 L72 60'],
  u: ['M24 60 L24 83 C24 107 76 107 76 80 L76 60 L76 100'],
  v: ['M21 60 L50 100 L79 60'],
  w: ['M10 60 L29 100 L50 65 L71 100 L90 60'],
  x: ['M24 60 L76 100', 'M76 60 L24 100'],
  y: ['M21 60 L50 100', 'M79 60 L35 140'],
  z: ['M24 60 L76 60 L24 100 L76 100'],
};

export const TRACING_GROUPS = Object.freeze([
  Object.freeze({ id: 'numbers', label: '数字 0–10', characters: Object.freeze(Array.from({ length: 11 }, (_, index) => String(index))) }),
  Object.freeze({ id: 'alphabet', label: '字母 Aa–Zz', characters: Object.freeze(Object.keys(UPPERCASE_PATHS).map(letter => letter + letter.toLowerCase())) }),
]);

const PATHS = { numbers: NUMBER_PATHS, alphabet: { ...UPPERCASE_PATHS, ...LOWERCASE_PATHS } };
const LABELS = { numbers: '数字', alphabet: '字母' };
const templates = new Map();

for (const group of TRACING_GROUPS) {
  for (const character of group.characters) {
    const glyphs = [...character].map((letter, index) => Object.freeze({
      character: letter,
      x: index * 108,
      paths: Object.freeze([...PATHS[group.id][letter]]),
    }));
    templates.set(`${group.id}:${character}`, Object.freeze({
      groupId: group.id,
      character,
      label: `${LABELS[group.id]} ${character}`,
      width: 100 + (glyphs.length - 1) * 108,
      glyphs: Object.freeze(glyphs),
    }));
  }
}

export function getTracingTemplate(groupId, character) {
  if (typeof groupId !== 'string' || typeof character !== 'string') return null;
  return templates.get(`${groupId}:${character}`) || null;
}

export function drawTracingGuide(context, template, width = 1200, height = 900, { guides = true } = {}) {
  if (!context) return;
  context.clearRect(0, 0, width, height);
  if (!template) return;
  // Use the complete four-line range for every character. In particular, a
  // descender never changes the relative size or baseline of lowercase letters.
  const scale = Math.min(width * .8 / template.width, height * .63 / 120);
  const left = (width - template.width * scale) / 2;
  const top = (height - 120 * scale) / 2 - 20 * scale;
  context.save();
  context.globalCompositeOperation = 'source-over';
  context.globalAlpha = 1;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  if (guides) {
    const inset = width * .1;
    for (const y of [20, 60, 100, 140]) {
      context.beginPath();
      context.strokeStyle = y === 100 ? '#c6d4c0' : '#e0e6da';
      context.lineWidth = y === 100 ? 2 : 1.5;
      context.setLineDash(y === 60 ? [10, 10] : []);
      context.moveTo(inset, top + y * scale);
      context.lineTo(width - inset, top + y * scale);
      context.stroke();
    }
  }
  context.translate(left, top);
  context.scale(scale, scale);
  for (const glyph of template.glyphs) {
    context.save();
    context.translate(glyph.x, 0);
    for (const pathData of glyph.paths) {
      const path = new Path2D(pathData);
      context.setLineDash([]);
      context.strokeStyle = '#e9eee4';
      context.lineWidth = 6;
      context.stroke(path);
      context.setLineDash([1.6, 2.2]);
      context.strokeStyle = '#b6c5a8';
      context.lineWidth = .75;
      context.stroke(path);
    }
    context.restore();
  }
  context.restore();
}
