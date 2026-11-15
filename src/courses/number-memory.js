import { getTracingTemplate } from '../drawing-tracing.js';

const egg = '<path d="M50 20C12 20 12 100 50 100C88 100 88 20 50 20Z" fill="#f8e6ad" stroke="#dfc788" stroke-width="2"/><path d="M35 35C30 41 28 50 28 59" fill="none" stroke="#fff8df" stroke-width="5" stroke-linecap="round"/>';
const pencil = '<path d="M47 25h10v68l-5 10-5-10Z" fill="#efc86c" stroke="#d1a854" stroke-width="1.5"/><path d="M47 25h10v7H47Z" fill="#e6aaa7"/><path d="m47 93 5 10 5-10Z" fill="#e3c69a"/><path d="m50 100 2 3 2-3Z" fill="#71806c"/><path d="m32 38 20-18" stroke="#efc86c" stroke-width="9" stroke-linecap="round"/>';

const stories = [
  { title: '0 像圆圆的鸡蛋', description: '沿着鸡蛋的轮廓，找一找圆圆的 0。一个也没有，可以用 0 表示。', object: egg, accent: '<path d="m16 94-8 5m75-69 8-5" stroke="#ddc27c" stroke-width="2" stroke-linecap="round"/>' },
  { title: '1 像细长的铅笔', description: '小铅笔细又长，看看它怎样变成数字 1。', object: pencil, accent: '<path d="m70 84 11 4m-9 5 8 4" stroke="#d8be88" stroke-width="2" stroke-linecap="round"/>' },
  { title: '2 像水上的小鸭', description: '圆圆的头，弯弯的脖子，小鸭的模样里藏着 2。', object: '<path d="M22 38C22 12 78 12 78 40C78 58 44 76 22 100L80 100" fill="none" stroke="#f0ca70" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/><path d="m22 31-15 7 16 4Z" fill="#df9b68"/><circle cx="39" cy="28" r="2.4" fill="#697c65"/><path d="M43 88q13-7 26 0" fill="none" stroke="#d8a852" stroke-width="2.5" stroke-linecap="round"/>', accent: '<path d="M12 111q10-4 20 0t20 0t20 0t20 0" fill="none" stroke="#b2d0d1" stroke-width="2.5" stroke-linecap="round"/>' },
  { title: '3 像弯弯的小耳朵', description: '上面弯一弯，下面再弯一弯，耳朵帮我们记住 3。', object: '<path d="M23 27C51 8 90 28 68 51L50 58C92 53 88 104 49 100C36 100 26 94 21 87" fill="none" stroke="#efb5a7" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/><path d="M43 39q15-9 16 4l-16 20q25 1 13 19" fill="none" stroke="#d69189" stroke-width="2.5" stroke-linecap="round"/>', accent: '<path d="m9 48-5-3m5 22H2m9 18-6 3" stroke="#e4b9a6" stroke-width="2" stroke-linecap="round"/>' },
  { title: '4 像迎风的小旗', description: '三角小旗，直直旗杆，看看 4 藏在哪里。', object: '<path d="M65 20 23 73h42Z" fill="#e8aaa4" stroke="#d6948f" stroke-width="2"/><path d="M65 20v80" stroke="#b2bca0" stroke-width="10" stroke-linecap="round"/><path d="M23 73h58" stroke="#e8aaa4" stroke-width="8" stroke-linecap="round"/>', accent: '<path d="M81 36q10-5 18 0M83 47q7-4 13 0" fill="none" stroke="#c5cfaf" stroke-width="2" stroke-linecap="round"/>' },
  { title: '5 像弯弯的小钩子', description: '先看平平的顶，再看弯弯的钩，记住数字 5 的模样。', object: '<path d="M77 20 28 20 24 58C83 35 99 101 48 100C35 100 25 94 21 87" fill="none" stroke="#b5c6d8" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 12h43" stroke="#d9c4a0" stroke-width="5" stroke-linecap="round"/>', accent: '<path d="m84 66 8-3m-7 19 8 2" stroke="#c1cfdb" stroke-width="2" stroke-linecap="round"/>' },
  { title: '6 像卷卷的小口哨', description: '上面弯下来，下面围个圈，小口哨像数字 6。', object: '<path d="M73 23C31 4 10 91 45 99C83 110 91 48 50 55C33 58 24 70 25 80" fill="none" stroke="#eac07b" stroke-width="14" stroke-linecap="round"/><ellipse cx="53" cy="77" rx="24" ry="23" fill="#f4d9a0"/><ellipse cx="53" cy="77" rx="11" ry="10" fill="#dbb984"/>', accent: '<path d="m85 16 8-7m-4 17 12-1m-17 9 10 5" stroke="#ddc78c" stroke-width="2" stroke-linecap="round"/>' },
  { title: '7 像弯弯的小镰刀', description: '割麦子的镰刀，弯弯的刀头，斜斜的长柄，模样像数字 7。', object: '<path d="M78 24 39 100" fill="none" stroke="#c6a174" stroke-width="10" stroke-linecap="round"/><path d="M80 20C63 7 34 10 17 31C39 22 58 25 73 32Z" fill="#c4d3c3" stroke="#92ac96" stroke-width="2" stroke-linejoin="round"/><path d="m76 30-4 8" stroke="#8fa58b" stroke-width="10"/><path d="m43 87-4 8" stroke="#a5825d" stroke-width="3" stroke-linecap="round"/>', accent: '<path d="M85 108 95 79m-9 24-4-7m7 0 7-3m-5-4-3-6m5 0 6-3" fill="none" stroke="#d6be80" stroke-width="2" stroke-linecap="round"/>' },
  { title: '8 像圆圆的小葫芦', description: '上面一个圆肚子，下面一个圆肚子，连起来像数字 8。', object: '<ellipse cx="50" cy="38" rx="25" ry="19" fill="#d8d6a4" stroke="#b9bb86" stroke-width="2"/><ellipse cx="50" cy="79" rx="31" ry="22" fill="#d8d6a4" stroke="#b9bb86" stroke-width="2"/><path d="M50 20q-1-12 10-10" fill="none" stroke="#96af7d" stroke-width="4" stroke-linecap="round"/><path d="M59 10q13-9 17 1-11 8-17-1Z" fill="#b4c59c"/>', accent: '<path d="m15 33-6-4m78 56 7 1" stroke="#c4cb9b" stroke-width="2" stroke-linecap="round"/>' },
  { title: '9 像带线的小气球', description: '上面圆圆，下面拖着小尾巴，气球的模样像数字 9。', object: '<ellipse cx="49" cy="43" rx="26" ry="24" fill="#c5b1d6" stroke="#b09bc5" stroke-width="2"/><path d="m69 59 7 2-1 10Z" fill="#b6a1ca"/><path d="M75 45v27C75 97 46 109 27 92" fill="none" stroke="#b7a6c8" stroke-width="4" stroke-linecap="round"/><path d="M35 32q5-6 13-6" fill="none" stroke="#ede2f5" stroke-width="4" stroke-linecap="round"/>', accent: '<path d="m14 24-6-6m84 11 7-5" stroke="#cfbede" stroke-width="2" stroke-linecap="round"/>' },
  { title: '1 和 0 手拉手，就是 10', description: '左边是 1，右边是 0，两位朋友排在一起写成 10。10 表示十个。', object: `${pencil}<g transform="translate(108 0)">${egg}</g>`, accent: '<path d="M76 65q15-12 31 0" fill="none" stroke="#d7bd8c" stroke-width="2.5" stroke-linecap="round"/>' },
];

function memoryArt(number, story) {
  const template = getTracingTemplate('numbers', String(number));
  const transform = number === 10 ? 'translate(40 16) scale(1.15)' : 'translate(85 4) scale(1.5)';
  const paths = template.glyphs.flatMap(glyph => glyph.paths.map(path => `<path class="memory-art-shape" pathLength="1" transform="translate(${glyph.x} 0)" d="${path}" fill="none" stroke="#638366" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`)).join('');
  return `<svg viewBox="0 0 320 180" role="img" aria-label="${story.title}"><ellipse cx="160" cy="158" rx="82" ry="8" fill="#e9ecdb"/><g transform="${transform}"><g class="memory-art-object">${story.object}</g><g class="memory-art-accent">${story.accent}</g>${paths}</g></svg>`;
}

export const NUMBER_MEMORY_SCENES = Object.freeze(stories.map((story, number) => Object.freeze({
  symbol: String(number),
  title: story.title,
  description: story.description,
  art: memoryArt(number, story),
})));

export function getNumberMemoryScene(number) {
  return Number.isInteger(number) && number >= 0 && number <= 10 ? NUMBER_MEMORY_SCENES[number] : null;
}
