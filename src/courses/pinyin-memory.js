import { getTracingTemplate } from '../drawing-tracing.js';
import { PINYIN_ITEMS, PINYIN_TONES } from './pinyin-data.js';

const stroke = '#71946c';
const gold = '#d4ae66';
const outline = (path, color = stroke, width = 5) => `<path d="${path}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const dot = (x, y, color = gold) => `<circle class="memory-art-accent" cx="${x}" cy="${y}" r="5" fill="${color}"/>`;

// These are shape and mouth-movement reminders, not pronunciation recordings
// or anatomical diagrams. The original lesson mouth hints remain alongside.
const pictures = {
  open: `<circle cx="62" cy="73" r="43" fill="#fae9d3"/>${dot(44, 57, stroke)}${dot(80, 57, stroke)}<ellipse cx="62" cy="86" rx="19" ry="25" fill="#c9827d"/><ellipse cx="62" cy="100" rx="13" ry="6" fill="#e4a7a0"/>`,
  round: `<circle cx="62" cy="73" r="43" fill="#fae9d3"/>${dot(44, 57, stroke)}${dot(80, 57, stroke)}<ellipse cx="62" cy="87" rx="16" ry="21" fill="#c9827d"/><ellipse cx="62" cy="87" rx="9" ry="13" fill="#fff5e8"/>`,
  smile: `<circle cx="62" cy="73" r="43" fill="#fae9d3"/>${dot(44, 57, stroke)}${dot(80, 57, stroke)}${outline('M34 86 Q62 107 90 86', '#c9827d', 7)}`,
  fish: `<ellipse cx="59" cy="83" rx="33" ry="24" fill="#a7c5bb"/><path d="M27 83 10 65V101Z" fill="#c8dcd0"/><circle cx="73" cy="77" r="4" fill="${stroke}"/>${outline('M82 87 Q88 91 91 87', stroke, 3)}${dot(88, 42)}${dot(102, 28)}`,
  drum: `<path d="M39 33V121" stroke="${stroke}" stroke-width="7"/><ellipse cx="65" cy="94" rx="27" ry="25" fill="#f0d4a4" stroke="${stroke}" stroke-width="5"/>${outline('M44 76 86 112M44 112 86 76', gold, 2)}${outline('M89 47 104 66', gold, 5)}`,
  flag: `<path d="M36 35V133" stroke="${stroke}" stroke-width="7"/><path d="M37 36C102 22 106 91 37 83" fill="#e6bf8a" stroke="${stroke}" stroke-width="5"/>${outline('M21 136H54', gold, 4)}`,
  gates2: `<path d="M18 118V65Q18 28 48 65V118M48 65Q48 28 78 65V118" fill="#e5ebd9" stroke="${stroke}" stroke-width="6"/>${dot(33, 77)}${dot(63, 77)}`,
  gates1: `<path d="M24 118V66Q24 27 78 66V118" fill="#e5ebd9" stroke="${stroke}" stroke-width="6"/>${dot(51, 77)}`,
  cane: `${outline('M79 40C58 12 38 38 42 64V124', stroke, 7)}${outline('M23 78H71', gold, 7)}`,
  leftDrum: `<path d="M85 33V121" stroke="${stroke}" stroke-width="7"/><ellipse cx="59" cy="95" rx="27" ry="25" fill="#f0d4a4" stroke="${stroke}" stroke-width="5"/>${outline('M38 77 79 113M38 113 79 77', gold, 2)}`,
  umbrella: `<path d="M17 69Q62 13 107 69Z" fill="#e7bb9e" stroke="${stroke}" stroke-width="4"/>${outline('M62 36V113Q62 137 82 121', stroke, 6)}${outline('M38 69Q62 38 86 69', '#fff7e8', 3)}`,
  stick: `<path d="M58 34V124" stroke="${stroke}" stroke-width="8" stroke-linecap="round"/>${outline('M44 132H73', gold, 4)}`,
  tail: `<ellipse cx="60" cy="70" rx="28" ry="25" fill="#e5ebd9" stroke="${stroke}" stroke-width="5"/>${outline('M87 58V113Q86 142 45 126', stroke, 6)}${dot(43, 125)}`,
  branch: `${outline('M44 34V124M44 91 94 48M63 75 98 122', stroke, 7)}<path d="M91 40Q111 37 103 58Q87 61 91 40" fill="#b8caa5"/>`,
  chair: `<path d="M33 34V123M33 83H88V123M88 83V67" fill="none" stroke="${stroke}" stroke-width="7" stroke-linecap="round"/>${outline('M27 87H96', gold, 7)}`,
  hook: `${outline('M75 57V111Q75 140 39 125', stroke, 7)}${dot(75, 32)}`,
  balloon: `<ellipse cx="58" cy="61" rx="30" ry="28" fill="#ddadb6" stroke="${stroke}" stroke-width="4"/>${outline('M87 43V131', stroke, 7)}${outline('M58 90Q42 111 62 127', gold, 3)}`,
  cross: `${outline('M28 42 93 116M93 42 28 116', stroke, 8)}${dot(60, 79)}`,
  slide: `${outline('M23 44H94L24 118H95', stroke, 7)}${dot(73, 68)}${outline('M20 134H102', gold, 3)}`,
  crescent: `<path d="M96 42C35 5 8 112 88 118" fill="#f4d6a1" stroke="${stroke}" stroke-width="6"/>${dot(78, 47)}`,
  snake: `${outline('M94 42C57 17 17 57 63 77C110 96 76 137 30 115', stroke, 8)}${dot(91, 40)}${outline('M100 39 112 34', '#c9827d', 3)}`,
  tongueFlat: `<path d="M22 56H84Q112 77 83 113H22" fill="#fae9d3" stroke="#d8bd98" stroke-width="3"/>${outline('M31 93H89', '#cd8d8b', 7)}${outline('M43 37H88', gold, 3)}${dot(91, 93, '#cd8d8b')}`,
  tongueUp: `<path d="M22 56H84Q112 77 83 113H22" fill="#fae9d3" stroke="#d8bd98" stroke-width="3"/>${outline('M31 99H64Q84 99 82 73', '#cd8d8b', 7)}${outline('M43 37H88', gold, 3)}${dot(82, 72, '#cd8d8b')}`,
  sprout: `${outline('M47 47 70 83 91 43M70 83 43 133', stroke, 7)}<path d="M47 47Q22 29 26 56Q42 66 47 47M91 43Q111 28 111 52Q94 66 91 43" fill="#bfd0ac"/>`,
  waves: `${outline('M13 51 35 118 61 64 83 118 106 51', stroke, 7)}${outline('M11 138Q35 128 58 138T107 138', '#9fc2c9', 4)}`,
  glide: `<circle cx="30" cy="79" r="17" fill="#efd6b1"/><circle cx="94" cy="79" r="17" fill="#bad0b5"/>${outline('M44 79H78M68 70 79 79 68 88', gold, 5)}${dot(60, 52)}`,
  ear: `${outline('M38 113C15 60 49 21 80 41C117 64 68 105 63 126', stroke, 7)}${outline('M43 75C53 42 86 62 64 81Q51 90 55 106', gold, 4)}`,
  noseFront: `<path d="M21 51Q46 19 78 51L99 80 81 91V117H24" fill="#fae9d3" stroke="#d8bd98" stroke-width="3"/>${outline('M40 105H72Q86 105 85 94', '#cd8d8b', 6)}${outline('M81 75Q106 65 104 47', stroke, 3)}${dot(104, 44)}`,
  noseBack: `<path d="M21 51Q46 19 78 51L99 80 81 91V117H24" fill="#fae9d3" stroke="#d8bd98" stroke-width="3"/>${outline('M40 106Q43 88 57 90H76', '#cd8d8b', 6)}${outline('M81 75Q106 65 104 47', stroke, 3)}${dot(104, 44)}`,
};

const reminders = {
  a: ['张大嘴巴 a a a', '嘴巴张大像小圆门，记住 a 的圆肚子和右边小竖。', 'open'],
  o: ['圆圆嘴巴像个 o', '看看圆圆的 o，嘴唇也拢成圆形，再请大人示范。', 'round'],
  e: ['半开嘴巴，记住 e', '嘴巴半开、嘴角展开；字形里面有一条小横线。', 'smile'],
  i: ['一根小竖戴圆点', 'i 上面只有一个点；读的时候牙齿靠近，嘴角向两边。', 'stick'],
  u: ['小杯子，圆嘴巴', 'u 像一个小杯子，读的时候嘴唇向前拢成小圆洞。', 'round'],
  ü: ['小鱼吐出两颗泡泡', 'u 上面多两点就是 ü；先摆 i 的口型，再拢圆嘴唇。', 'fish'],
  b: ['右下圆肚子是 b', '高高的竖像鼓架，圆鼓在右下；别和 p、d、q 混淆。', 'drum'],
  p: ['右上圆肚子是 p', '小旗的圆肚子在右上，长竖伸到下面；读时送出一口气。', 'flag'],
  m: ['两扇小门 m m m', 'm 有两扇小拱门；双唇闭住，让声音从鼻子里出来。', 'gates2'],
  f: ['弯头拐杖加一横', 'f 上面弯弯，腰间有一横；上牙轻碰下唇。', 'cane'],
  d: ['左下圆肚子是 d', '圆鼓在左下，长竖站右边；和 b 的肚子方向相反。', 'leftDrum'],
  t: ['小伞弯柄加一横', 't 的竖有弯脚，腰间穿过一横；舌尖放开时送一口气。', 'umbrella'],
  n: ['一扇小门 n n n', 'n 只有一扇门，m 有两扇；舌尖抵上牙床，声音从鼻子走。', 'gates1'],
  l: ['一根小棍站得直', 'l 是高高的一竖；舌尖抵上牙床，气从舌头两边走。', 'stick'],
  g: ['圆肚子拖条小尾巴', 'g 的圆肚子下面有弯尾巴；发音时舌根抬起再放开。', 'tail'],
  k: ['树干伸出两条斜枝', 'k 一边直直，一边分成两条斜线；舌根放开时送气。', 'branch'],
  h: ['高背椅子 h h h', '高高的竖旁边接一扇小门，像一把高背椅。', 'chair'],
  j: ['小钩头上一个点', 'j 的脚往左弯，头上有一个点；舌面抬高后轻轻放开。', 'hook'],
  q: ['左上气球拖长线', 'q 的圆肚子在左上，长竖在右边往下伸，和 p 方向不同。', 'balloon'],
  x: ['两条斜线来交叉', 'x 像两只小手交叉；舌面靠近硬腭，让气从缝里擦过。', 'cross'],
  z: ['小滑梯，舌尖放平', 'z 上横、斜滑、下横；读时舌尖平伸，不翘起来。', 'tongueFlat'],
  c: ['半个圆圈张开嘴', 'c 像张开的小嘴，右边留空；舌尖平伸后送气。', 'crescent'],
  s: ['弯弯丝线像小蛇', 's 上下弯一弯；舌尖平伸，让气从窄缝出来。', 'snake'],
  zh: ['z 带上 h，舌尖翘起', '看清后面多了 h。zh 读时舌尖翘起，和 z 的平舌不同。', 'tongueUp'],
  ch: ['c 带上 h，翘舌送气', 'ch 后面跟着 h，舌尖翘起后送出一口气。', 'tongueUp'],
  sh: ['s 带上 h，翘舌擦气', 'sh 后面跟着 h，舌尖翘起，让气流轻轻擦过。', 'tongueUp'],
  r: ['小芽弯头，舌尖翘起', 'r 像小芽弯弯头；舌尖翘起，轻轻振动声带。', 'tongueUp'],
  y: ['小树杈伸长脚', 'y 的两条斜线相遇，一条腿伸到下面；口型像 i。', 'sprout'],
  w: ['两座小山谷手拉手', 'w 像两座相连的山谷；嘴唇拢圆，轻轻滑向后面的韵母。', 'waves'],
  ai: ['a 慢慢滑向 i', 'a、i 排好队，口型从张大滑向展开，连成一个音。', 'glide'],
  ei: ['e 慢慢滑向 i', '从 e 开始，再滑向 i；两个字母记成一位韵母朋友。', 'glide'],
  ui: ['u、i 并排，口型会滑动', 'ui 是 uei 的简写，先拢圆嘴唇，再滑向 ei，声调标在 i 上。', 'glide'],
  ao: ['张大嘴，再慢慢拢圆', '先发 a，再滑向 o；看看 a、o 一前一后排整齐。', 'glide'],
  ou: ['从圆嘴 o 滑向 u', '先圆圆的 o，再把嘴唇收小，连起来读成 ou。', 'glide'],
  iu: ['i 开头，滑向 ou', 'iu 是 iou 的简写；从 i 滑向 ou，声调标在后面的 u 上。', 'glide'],
  ie: ['i 的小嘴慢慢打开', '先展开嘴角发 i，再张开一点滑向 e，连成 ie。', 'glide'],
  üe: ['两点 ü 带着 e', '看清 ü 的两点；从圆嘴口型开始，再慢慢打开嘴巴。', 'fish'],
  er: ['卷起舌尖，记住 er', 'e 后面跟着 r；嘴巴半开，舌尖轻轻卷起，er 可独立成音节。', 'ear'],
  an: ['a 开头，舌尖收尾', 'an 最后是 n。先张嘴发 a，再用舌尖抵住上牙床收尾。', 'noseFront'],
  en: ['e 开头，舌尖收尾', 'en 最后是 n。从 e 开始，舌尖抵住上牙床，用鼻音收尾。', 'noseFront'],
  in: ['i 开头，舌尖收尾', 'in 最后是 n。先展开嘴角，再把舌尖抵住上牙床。', 'noseFront'],
  un: ['圆嘴开头，舌尖收尾', 'un 是 uen 的简写。先拢圆嘴唇，滑向 en，用舌尖收尾。', 'noseFront'],
  ün: ['两点 ü，舌尖 n', '看清 ü 的两点；先用 ü 的圆嘴口型，再把舌尖抵住上牙床。', 'fish'],
  ang: ['a 开头，舌根收尾', 'ang 最后是 ng。张大嘴后抬起舌根，用一个后鼻音收尾。', 'noseBack'],
  eng: ['e 开头，舌根收尾', 'eng 最后是 ng。从 e 开始抬起舌根，ng 不分成两个音。', 'noseBack'],
  ing: ['i 开头，舌根收尾', 'ing 最后是 ng。先展开嘴角，再抬起舌根，用后鼻音收尾。', 'noseBack'],
  ong: ['圆圆嘴，舌根收尾', 'ong 最后是 ng。嘴唇拢圆，抬起舌根，用一个后鼻音收尾。', 'noseBack'],
};

function lettersArt(symbol) {
  const letters = [...symbol];
  const scale = Math.min(1, 144 / (letters.length * 84));
  const width = letters.length * 84 * scale;
  const left = 172 + (144 - width) / 2;
  return `<g transform="translate(${left} ${88 - 80 * scale}) scale(${scale})">${letters.map((letter, index) => {
    const glyph = getTracingTemplate('alphabet', `${letter === 'ü' ? 'U' : letter.toUpperCase()}${letter === 'ü' ? 'u' : letter}`).glyphs[1];
    const end = symbol.endsWith('ng') && index >= letters.length - 2 || symbol.endsWith('n') && index === letters.length - 1;
    return `<g transform="translate(${index * 84 - 6} 0)" stroke="${end ? '#c59857' : stroke}">${glyph.paths.map(path => `<path class="memory-art-shape" pathLength="1" d="${path}" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}${letter === 'ü' ? `<circle class="memory-art-accent" cx="36" cy="38" r="5" fill="${gold}"/><circle class="memory-art-accent" cx="64" cy="38" r="5" fill="${gold}"/>` : ''}</g>`;
  }).join('')}</g>`;
}

function sceneArt(symbol, picture) {
  return `<svg viewBox="0 0 320 180" aria-hidden="true"><g class="memory-art-object" transform="translate(8 7)">${pictures[picture]}</g>${outline('M140 89H158M151 82 159 89 151 96', '#d7c49f', 3)}${lettersArt(symbol)}<path d="M17 158H304" stroke="#e5e9dc" stroke-width="2"/></svg>`;
}

export function getPinyinMemory(symbol) {
  const reminder = Object.hasOwn(reminders, symbol) ? reminders[symbol] : null;
  if (!reminder || !Object.hasOwn(PINYIN_ITEMS, symbol)) return null;
  const [title, description, picture] = reminder;
  return { symbol, title, description, art: sceneArt(symbol, picture) };
}

export function getToneMemory(number) {
  const tone = PINYIN_TONES[number - 1];
  if (!tone) return null;
  const captions = ['小车开上平平路', '小车慢慢上山坡', '小车下坡再上坡', '小车沿着山坡下'];
  return {
    symbol: ['ā', 'á', 'ǎ', 'à'][number - 1],
    title: captions[number - 1],
    description: `${tone.name}：${tone.hint}跟着线条从左往右比划一下。`,
    art: `<svg viewBox="0 0 320 180" aria-hidden="true"><g transform="translate(33 10) scale(2.7 1.75)"><path d="${tone.path}" fill="none" stroke="#ece5d0" stroke-width="12" stroke-linecap="round"/><path class="memory-art-shape" pathLength="1" d="${tone.path}" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><g class="memory-art-traveler" style="offset-path:path('${tone.path}');offset-rotate:0deg"><rect x="-8" y="-12" width="17" height="10" rx="3" fill="${gold}"/><circle cx="-4" cy="0" r="3" fill="${stroke}"/><circle cx="5" cy="0" r="3" fill="${stroke}"/></g></g><text x="160" y="171" text-anchor="middle" fill="${stroke}" font-family="Georgia,serif" font-size="29">${['ā', 'á', 'ǎ', 'à'][number - 1]}</text></svg>`,
  };
}
