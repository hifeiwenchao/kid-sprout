import { GAME_CATALOG } from '../src/game-catalog.js';
import { NUMBER_VALUES, numberName } from '../src/courses/number-data.js';
import { buildNumberExtraRounds, NUMBER_EXTRA_GAMES } from '../src/games/number-extras.js';
import { buildPinyinRounds } from '../src/courses/pinyin-data.js';
import { buildPinyinExtraRounds, PINYIN_EXTRA_GAMES } from '../src/courses/pinyin-extras.js';
import { createAlphabetRounds } from '../src/courses/alphabet-data.js';
import { buildAlphabetExtraRounds, ALPHABET_EXTRA_GAMES } from '../src/courses/alphabet-extras.js';

// Every set is reproducible. The client only chooses a set; it runs no website code.
export function seededRandom(seed) {
  let state = 2166136261;
  for (const character of seed) state = Math.imul(state ^ character.codePointAt(0), 16777619) >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}
const shuffled = (values, random) => {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const next = Math.floor(random() * (index + 1));
    [result[index], result[next]] = [result[next], result[index]];
  }
  return result;
};
const cards = values => values.map(value => ({ value: String(value), label: String(value) }));
const choices = (answer, pool, count, random) => cards(shuffled([answer, ...shuffled(pool.filter(value => value !== answer), random).slice(0, count - 1)], random));

// Collection boundaries and table rows carry educational meaning. Keep them as
// line breaks rather than collapsing the HTML into one ambiguous emoji string.
export function visualText(html) {
  return String(html)
    .replace(/<[^>]+aria-label="([^"]+)"[^>]*>/g, '$1\n')
    .replace(/<\/(?:div|tr)>/g, '\n')
    .replace(/<\/(?:td|span)>/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&(?:amp|lt|gt|quot|#39);/g, entity => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" })[entity])
    .split('\n').map(line => line.replace(/[\t ]+/g, ' ').trim()).filter(Boolean).join('\n');
}

function originalNumberRounds(type, random) {
  if (type === 'trace') return [{ mode: 'trace', scene: 'trace', prompt: '小手描数字：选一位数字朋友，自由描一描。', hint: '临摹不自动判断字形，也不累计游戏奖励，请家长一起看看。', answer: [], choices: cards(NUMBER_VALUES), values: NUMBER_VALUES }];
  if (type === 'memory') return [[1, 2, 3], [4, 5, 6], shuffled([7, 8, 9, 10], random).slice(0, 3)].map(values => ({
    mode: 'memory', scene: 'memory', prompt: '翻开两张卡片，让数字和一样多的星星牵手。', answer: [], values,
    choices: shuffled(values.flatMap(value => [
      { value: `${value}-number`, label: String(value), small: '数字朋友', match: String(value) },
      { value: `${value}-quantity`, label: '⭐'.repeat(value), small: '数数有几颗星星', match: String(value) },
    ]), random), hint: '慢慢翻，记住朋友躲在哪里。', explanation: '三对朋友都找到啦，你的记性真棒！',
  }));
  if (type === 'balloons') return [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]].map(values => ({
    mode: 'balloons', scene: 'balloons', prompt: '按从小到大的顺序，点一点气球朋友。', answer: values.map(String), values,
    choices: cards(shuffled(values, random)), hint: `先找到数字 ${values[0]}，我们就出发！`, explanation: '气球朋友排好队啦，真棒！',
  }));
  if (type === 'compare') return shuffled(Array.from({ length: 5 }, (_, left) => Array.from({ length: 5 }, (_, right) => [left + 1, right + 1])).flat().filter(([left, right]) => left !== right), random).slice(0, 5).map(counts => ({
    mode: 'choice', scene: 'compare', prompt: '哪一篮胡萝卜更多？数一数，选一篮更多的送给小兔。', counts,
    item: 'number_motif_7', answer: String(counts[0] > counts[1] ? 0 : 1),
    choices: [{ value: '0', label: '左边这一篮' }, { value: '1', label: '右边那一篮' }],
    hint: '不用着急，左右两篮都数一数。', explanation: `${Math.max(...counts)} 根比 ${Math.min(...counts)} 根多，小兔谢谢你！`,
  }));
  const targets = shuffled(type === 'drum' ? [1, 2, 3, 4, 5] : type === 'picnic' || type === 'train' ? NUMBER_VALUES.slice(1) : NUMBER_VALUES, random).slice(0, 5);
  return targets.map(target => {
    const base = { mode: 'choice', answer: String(target), choices: choices(target, NUMBER_VALUES, type === 'find' ? 6 : 3, random) };
    if (type === 'count') {
      const fruit = Math.floor(random() * 3);
      return { ...base, scene: 'fruit', count: target, item: `number_motif_${fruit}`, prompt: '一共有几个水果呢？', speech: target ? '一共有几个水果呢？一起数一数吧。' : '篮子里一个水果也没有，一共有几个水果呢？', hint: target ? '伸出小手，一个一个慢慢数。' : '一个也没有，可以用 0 表示。', explanation: `一共有 ${target} 个水果。` };
    }
    if (type === 'find') return { ...base, scene: 'find', prompt: `请找到数字「${numberName(target)}」`, speech: `请找到数字${numberName(target)}`, hint: '仔细看一看，点一点它的小卡片。', explanation: `找到啦，是数字 ${target}！` };
    if (type === 'drum') return { ...base, scene: 'drum', count: target, prompt: '小鼓敲了几下？', choices: choices(target, [1, 2, 3, 4, 5], 3, random), hint: '想听几遍都可以，也可以展开鼓点提示。', explanation: `小鼓敲了 ${target} 下。` };
    if (type === 'picnic') return { ...base, mode: 'build', scene: 'picnic', count: target, max: 10, item: '🍪', choices: [], prompt: `小熊想要 ${target} 块小饼干，请装好以后送给小熊。`, hint: '放一块，数一下；装多了，也可以拿回来。', explanation: `不多不少，正好 ${target} 块小饼干！` };
    if (type === 'train') {
      const start = Math.max(1, Math.min(7, target - Math.floor(random() * 4)));
      const values = Array.from({ length: 4 }, (_, index) => start + index === target ? -1 : start + index);
      return { ...base, scene: 'train', values, prompt: '谁来坐这个空车厢？按数字顺序，帮小火车找到朋友。', display: values.map(value => value < 0 ? '?' : value).join(' → '), speech: `小火车按数字顺序出发啦！${values.map(value => value < 0 ? '空位' : numberName(value)).join('，')}。空车厢里应该是几呢？`, choices: choices(target, NUMBER_VALUES.slice(1), 3, random), hint: '从前往后念一念，再选一个数字吧。', explanation: `数字 ${target} 上车啦，小火车可以出发了！` };
    }
    throw new Error(`Unknown original number game: ${type}`);
  });
}

function originalAlphabetRounds(type, random) {
  return createAlphabetRounds(type, random).map(round => ({
    mode: 'choice', answer: round.answer, choices: cards(round.choices), speechLang: 'en-US',
    prompt: type === 'match' ? '让大写和小写牵起手，找到它的小写伙伴。' : type === 'listen' ? '听一听，字母朋友在哪里？' : '给字母列车补上空位。',
    display: type === 'match' ? round.target : type === 'order' ? round.sequence.map(value => value ?? '?').join(' → ') : '♪',
    ...(type === 'listen' ? { speech: round.target, hint: `无声提示：这一关要找的字母是 ${round.target}。` } : {}),
    ...(type === 'order' ? { scene: 'alphabet-train' } : {}),
    explanation: `找到啦，是 ${round.answer}！`,
  }));
}

const extraBuilders = [
  [NUMBER_EXTRA_GAMES, buildNumberExtraRounds], [PINYIN_EXTRA_GAMES, buildPinyinExtraRounds], [ALPHABET_EXTRA_GAMES, buildAlphabetExtraRounds],
];
function roundsFor(game, random) {
  const extra = extraBuilders.find(([catalog]) => catalog.some(item => item.subject === game.subject && item.type === game.type));
  if (extra) return extra[1](game.type, random);
  if (game.subject === 'numbers') return originalNumberRounds(game.type, random);
  if (game.subject === 'pinyin') return buildPinyinRounds(game.type, random);
  return originalAlphabetRounds(game.type, random);
}

export function buildActivities() {
  return { schemaVersion: 1, games: GAME_CATALOG.map(game => {
    const id = `${game.subject}-${game.type}`;
    return { id, ...game, sets: Array.from({ length: 8 }, (_, setIndex) => roundsFor(game, seededRandom(`${id}:${setIndex}`)).map((source, roundIndex) => {
      const result = { id: `${id}:${setIndex}:${roundIndex}`, mode: source.mode || 'choice', prompt: source.prompt, answer: (Array.isArray(source.answer) ? source.answer : [source.answer]).map(String), choices: source.choices.map(choice => ({ ...choice, value: String(choice.value), label: String(choice.label) })) };
      for (const key of ['display', 'speech', 'speechLang', 'hint', 'explanation', 'item', 'max', 'scene', 'count', 'counts', 'values']) if (source[key] !== undefined) result[key] = source[key];
      if (source.visual) result.visualText = visualText(source.visual);
      return result;
    })) };
  }) };
}
