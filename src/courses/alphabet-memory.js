import { ALPHABET } from './alphabet-data.js';
import { getTracingTemplate } from '../drawing-tracing.js';

const TITLES = {
  A: 'A 像小山，a 有圆肚子', B: 'B 两个肚子，b 一个肚子',
  C: 'C 和 c，张开小嘴巴', D: 'D 像圆门，d 肚子朝左',
  E: 'E 三条横，e 圆圈里一小横', F: 'F 两条横，f 弯弯头',
  G: 'G 加一小横，g 尾巴向下弯', H: 'H 像梯子，h 像高背椅',
  I: 'I 站得直，i 戴小圆点', J: 'J 和 j，小脚向左弯',
  K: 'K 和 k，伸出斜斜的小手', L: 'L 小拐角，l 高直线',
  M: 'M 两座山，m 两扇小拱门', N: 'N 斜斜桥，n 一扇小拱门',
  O: 'O 大圆圈，o 小圆圈', P: 'P 肚子在右上，p 长脚向下',
  Q: 'Q 圆圈带短尾，q 长脚在右边', R: 'R 伸斜腿，r 冒一枝小芽',
  S: 'S 和 s，弯弯小蛇扭一扭', T: 'T 像雨伞，t 横线在腰上',
  U: 'U 和 u，像两个小杯子', V: 'V 和 v，走进尖尖小山谷',
  W: 'W 和 w，两个山谷手拉手', X: 'X 和 x，斜斜小手碰一碰',
  Y: 'Y 像树杈，y 小腿往下伸', Z: 'Z 和 z，坐上小滑梯',
};

// Each object occupies the same local coordinates as the handwriting paths.
// The shared player fades these familiar objects to reveal the letter shapes.
const OBJECTS = {
  A: ['<path d="M12 103 50 15 88 103Z" fill="#dce8ce"/><path d="m37 45 13-30 13 30-13-9Z" fill="#fff9e9"/><path d="M28 70h44" stroke="#d4b782"/>', '<ellipse cx="50" cy="80" rx="28" ry="24" fill="#efdbc0"/><path d="M77 58v46" stroke="#d4b782" stroke-width="8"/>'],
  B: ['<path d="M24 101V20h27c40 0 37 39 0 39 43 0 43 42 0 42Z" fill="#efdbc0"/><path d="M24 59h28" stroke="#d4b782"/>', '<path d="M24 19v84" stroke="#d4b782" stroke-width="8"/><ellipse cx="51" cy="80" rx="28" ry="24" fill="#efdbc0"/>'],
  C: ['<path d="M82 30C57 4 13 17 15 60s43 56 67 30L50 60Z" fill="#efd3b7"/><circle cx="52" cy="33" r="3" fill="#82927c"/>', '<path d="M79 66C54 45 18 56 20 80s37 35 59 14L53 80Z" fill="#efd3b7"/><circle cx="54" cy="67" r="2.4" fill="#82927c"/>'],
  D: ['<path d="M23 102V18h24c52 0 52 84 0 84Z" fill="#e8d9b8"/><path d="M24 20v80" stroke="#c6ad7d" stroke-width="8"/><circle cx="65" cy="64" r="4" fill="#c6ad7d"/>', '<ellipse cx="50" cy="80" rx="29" ry="24" fill="#e8d9b8"/><path d="M77 18v85" stroke="#c6ad7d" stroke-width="8"/>'],
  E: ['<path d="M23 20v80M23 20h57M23 59h47M23 100h57" stroke="#c8b185" stroke-width="10"/><path d="M31 30h42M31 69h32" stroke="#e9dcc1" stroke-width="4"/>', '<ellipse cx="51" cy="80" rx="29" ry="23" fill="#f0dfb9"/><path d="M24 80h55" stroke="#c8b185" stroke-width="7"/>'],
  F: ['<path d="M24 102V20h57M24 59h47" stroke="#c8b185" stroke-width="10"/><path d="M33 29h39M33 68h29" stroke="#e9dcc1" stroke-width="4"/>', '<path d="M70 24c-16-18-33-1-31 20v58M23 60h47" stroke="#d9c49d" stroke-width="10" fill="none"/>'],
  G: ['<path d="M81 31C57 5 14 18 16 60s43 54 64 29V63H54" fill="none" stroke="#e6cfad" stroke-width="13"/><path d="M54 63h26" stroke="#cbb184" stroke-width="7"/>', '<ellipse cx="50" cy="80" rx="28" ry="24" fill="#e6cfad"/><path d="M77 60v60c0 23-32 29-50 13" stroke="#cbb184" stroke-width="8" fill="none"/>'],
  H: ['<path d="M22 17v87M78 17v87M22 60h56" stroke="#c9ae7e" stroke-width="10"/><path d="M22 35h56M22 85h56" stroke="#e6d5b5" stroke-width="5"/>', '<path d="M24 19v84M24 80h54v23" stroke="#c9ae7e" stroke-width="8"/><path d="M24 80c0-31 53-31 53 0" stroke="#e6d5b5" stroke-width="8" fill="none"/>'],
  I: ['<path d="M26 21h48M50 21v79M26 100h48" stroke="#cbb58c" stroke-width="12"/><path d="M39 27h22v66H39Z" fill="#eadcc3"/>', '<path d="M50 60v42" stroke="#cbb58c" stroke-width="10"/><circle cx="50" cy="37" r="7" fill="#efcd8e"/>'],
  J: ['<path d="M29 20h48v58c0 34-55 31-55 0" stroke="#d5bf97" stroke-width="12" fill="none"/><path d="M76 24v48" stroke="#f0dfbe" stroke-width="5"/>', '<path d="M62 60v61c0 26-27 27-36 12" stroke="#d5bf97" stroke-width="10" fill="none"/><circle cx="62" cy="37" r="7" fill="#efcd8e"/>'],
  K: ['<path d="M24 20v81M78 20 24 68l57 33" stroke="#e3c6ad" stroke-width="11"/><circle cx="78" cy="20" r="6" fill="#f1dcca"/><circle cx="81" cy="101" r="6" fill="#f1dcca"/>', '<path d="M25 20v81M77 59 25 89l54 12" stroke="#e3c6ad" stroke-width="10"/><circle cx="77" cy="59" r="5" fill="#f1dcca"/>'],
  L: ['<path d="M24 18v83h58" stroke="#d0b88e" stroke-width="14"/><path d="M35 25v63h40" stroke="#ebddc2" stroke-width="3"/>', '<path d="M50 18v85" stroke="#d0b88e" stroke-width="11"/><path d="M48 27v63" stroke="#ebddc2" stroke-width="3"/>'],
  M: ['<path d="M12 103V17l38 50 38-50v86Z" fill="#d9e5ce"/><path d="m16 19 20 29-20-8m68-21L64 48l20-8" fill="#fff8e9"/>', '<path d="M15 103V77c0-27 35-27 35 0 0-27 35-27 35 0v26" fill="#e8dbbd"/><path d="M15 61v41M50 77v25M85 77v25" stroke="#cbb58c" stroke-width="8"/>'],
  N: ['<path d="M22 101V19M78 19v82M22 20l56 80" stroke="#d0b68b" stroke-width="10"/><path d="m31 23 39 57M30 49l39 54" stroke="#eddec2" stroke-width="4"/>', '<path d="M24 103V78c0-30 53-30 53 0v25" fill="#e8dbbd"/><path d="M24 60v43M77 78v25" stroke="#cbb58c" stroke-width="8"/>'],
  O: ['<ellipse cx="50" cy="60" rx="36" ry="43" fill="#f0dbb5"/><ellipse cx="50" cy="60" rx="24" ry="31" fill="#fffdf6"/>', '<ellipse cx="50" cy="80" rx="30" ry="24" fill="#f0dbb5"/><ellipse cx="50" cy="80" rx="18" ry="13" fill="#fffdf6"/>'],
  P: ['<path d="M25 101V20h28c44 0 44 44 0 44H25" fill="#e5d8b8"/><path d="M25 20v81" stroke="#ccb68b" stroke-width="9"/>', '<ellipse cx="51" cy="80" rx="29" ry="24" fill="#e5d8b8"/><path d="M24 60v81" stroke="#ccb68b" stroke-width="9"/>'],
  Q: ['<ellipse cx="50" cy="60" rx="36" ry="43" fill="#e5dfc5"/><ellipse cx="50" cy="60" rx="24" ry="31" fill="#fffdf6"/><path d="m58 78 28 31" stroke="#c4b785" stroke-width="10"/>', '<ellipse cx="50" cy="80" rx="28" ry="24" fill="#e5dfc5"/><path d="M77 60v81" stroke="#c4b785" stroke-width="9"/>'],
  R: ['<path d="M25 101V20h28c43 0 43 44 0 44H25" fill="#e4d2bc"/><path d="M25 20v82M50 63l34 39" stroke="#c8ab86" stroke-width="9"/>', '<path d="M28 102V79c0-21 24-26 45-15" stroke="#c2d5a7" stroke-width="10" fill="none"/><path d="M65 64c4-18 19-17 23-14-4 13-12 17-23 14" fill="#d4e2bf"/>'],
  S: ['<path d="M79 30C63 9 21 17 22 41s57 12 57 39-42 27-59 9" stroke="#d2dfbc" stroke-width="15" fill="none"/><circle cx="76" cy="28" r="3" fill="#8a9a78"/>', '<path d="M73 66C60 54 28 57 28 70s45 6 45 20-31 16-48 5" stroke="#d2dfbc" stroke-width="11" fill="none"/><circle cx="71" cy="65" r="2" fill="#8a9a78"/>'],
  T: ['<path d="M12 24c13-25 63-25 76 0Z" fill="#ead4b4"/><path d="M50 21v82" stroke="#c9b38c" stroke-width="10"/>', '<path d="M45 28v57c0 19 17 20 31 9M22 60h52" stroke="#d8c49d" stroke-width="10" fill="none"/>'],
  U: ['<path d="M20 19v55c0 42 60 42 60 0V19" fill="#dbe3cc"/><path d="M22 22h56" stroke="#b8c7a0" stroke-width="5"/>', '<path d="M23 60v24c0 27 53 27 53-4V60Z" fill="#dbe3cc"/><path d="M77 60v42" stroke="#b8c7a0" stroke-width="8"/>'],
  V: ['<path d="M12 15 50 102 88 15l-8 45H20Z" fill="#e8dfbe"/><path d="m16 20 34 80 34-80" stroke="#cfbb87" stroke-width="9" fill="none"/>', '<path d="m18 57 32 46 32-46-10 28H28Z" fill="#e8dfbe"/><path d="m21 60 29 40 29-40" stroke="#cfbb87" stroke-width="8" fill="none"/>'],
  W: ['<path d="m8 18 20 86 22-51 22 51 20-86-6 51H14Z" fill="#e3dfbf"/><path d="m10 20 18 80 22-52 22 52 18-80" stroke="#c5bd8a" stroke-width="8" fill="none"/>', '<path d="m8 58 21 45 21-33 21 33 21-45-11 27H19Z" fill="#e3dfbf"/><path d="m10 60 19 40 21-35 21 35 19-40" stroke="#c5bd8a" stroke-width="8" fill="none"/>'],
  X: ['<path d="m20 20 60 80M80 20l-60 80" stroke="#e5c9b3" stroke-width="12"/><circle cx="20" cy="20" r="7" fill="#efddcb"/><circle cx="80" cy="20" r="7" fill="#efddcb"/>', '<path d="m24 60 52 40M76 60l-52 40" stroke="#e5c9b3" stroke-width="10"/><circle cx="24" cy="60" r="5" fill="#efddcb"/><circle cx="76" cy="60" r="5" fill="#efddcb"/>'],
  Y: ['<path d="M50 103V60L18 20M50 60l32-40" stroke="#ccb18b" stroke-width="12"/><ellipse cx="20" cy="24" rx="13" ry="7" transform="rotate(38 20 24)" fill="#d7e2bf"/><ellipse cx="79" cy="24" rx="13" ry="7" transform="rotate(-38 79 24)" fill="#d7e2bf"/>', '<path d="m21 60 29 40M79 60l-44 80" stroke="#ccb18b" stroke-width="10"/><ellipse cx="21" cy="62" rx="11" ry="6" transform="rotate(35 21 62)" fill="#d7e2bf"/>'],
  Z: ['<path d="M20 20h61l-61 80h61" stroke="#d2b98e" stroke-width="12" fill="none"/><path d="M18 28v69M18 40h13M18 57h8M18 74h3" stroke="#e8d9bb" stroke-width="4"/>', '<path d="M24 60h53l-53 40h53" stroke="#d2b98e" stroke-width="10" fill="none"/><path d="M22 66v33M22 79h9M22 92h3" stroke="#e8d9bb" stroke-width="3"/>'],
};

function makeArt(letter) {
  const pair = letter.uppercase + letter.lowercase;
  const glyphs = getTracingTemplate('alphabet', pair).glyphs;
  const positions = [30, 190];
  const objects = OBJECTS[letter.id].map((art, index) => `<g transform="translate(${positions[index]} 8)">${art}</g>`).join('');
  const shapes = glyphs.map((glyph, index) => `<g transform="translate(${positions[index]} 8)">${glyph.paths.map(path => `<path d="${path}" pathLength="1"/>`).join('')}</g>`).join('');
  return `<svg viewBox="0 0 320 180" fill="none" aria-hidden="true"><path d="M17 152h286" stroke="#e7eadf" stroke-width="2"/><g class="memory-art-object" stroke-linecap="round" stroke-linejoin="round">${objects}</g><g class="memory-art-shape" stroke="#6c8b63" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${shapes}</g><g class="memory-art-accent"><circle cx="160" cy="51" r="3" fill="#e3c78b"/><path d="m155 78 5 5-5 5" stroke="#d5c198" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g><g fill="#9aa38d" font-size="10" text-anchor="middle"><text x="80" y="172">大写</text><text x="240" y="172">小写</text></g></svg>`;
}

export const ALPHABET_MEMORY_SCENES = Object.freeze(ALPHABET.map(letter => Object.freeze({
  symbol: letter.uppercase + letter.lowercase,
  title: TITLES[letter.id],
  description: letter.hint,
  art: makeArt(letter),
})));

export function getAlphabetMemoryScene(id) {
  if (typeof id !== 'string') return null;
  return ALPHABET_MEMORY_SCENES.find(scene => scene.symbol[0] === id.toUpperCase()) || null;
}
