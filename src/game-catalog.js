import { NUMBER_EXTRA_GAMES } from './games/number-extras.js';
import { PINYIN_EXTRA_GAMES } from './courses/pinyin-extras.js';
import { ALPHABET_EXTRA_GAMES } from './courses/alphabet-extras.js';

const originalCategories = { count: 'recognize', find: 'recognize', trace: 'build', train: 'think', compare: 'think', memory: 'recognize', balloons: 'think', picnic: 'build', drum: 'listen', listen: 'listen', sort: 'recognize', tones: 'recognize', match: 'recognize', order: 'think' };
const ORIGINAL_GAMES = [
  ['numbers', 'count', '数一数水果', '数数篮子里有几个水果', '🍎', '观察与数数'],
  ['numbers', 'find', '数字捉迷藏', '找出藏起来的数字朋友', '🔎', '认知与记忆'],
  ['numbers', 'trace', '小手描数字', '沿着数字的模样描一描', '✏️', '动手与探索'],
  ['numbers', 'train', '数字小火车', '补上空车厢，让火车出发', '🚂', '顺序与逻辑'],
  ['numbers', 'compare', '小兔分胡萝卜', '找出胡萝卜更多的一篮', '🥕', '数量与比较'],
  ['numbers', 'memory', '记忆翻翻乐', '数字与相同数量的星星配对', '⭐', '记忆与配对'],
  ['numbers', 'balloons', '数字气球派对', '按数字顺序点亮小气球', '🎈', '顺序与专注'],
  ['numbers', 'picnic', '小熊点心铺', '按小熊的订单装好小饼干', '🍪', '动手与数量'],
  ['numbers', 'drum', '小耳朵听听', '仔细听，小鼓敲了几下', '🥁', '聆听与数数'],
  ['pinyin', 'listen', '拼音找朋友', '听例字，寻找韵母朋友', '🎧', '听音与识别'],
  ['pinyin', 'sort', '拼音小房子', '声母、韵母找小家', '🧺', '分类与认知'],
  ['pinyin', 'tones', '声调小滑梯', '看一看，认出四声的模样', '🛝', '声调与观察'],
  ['alphabet', 'match', '大小写找朋友', '让大写和小写牵起手', '🧩', '大小写配对'],
  ['alphabet', 'listen', '小耳朵找字母', '听一听，字母朋友在哪里', '🔤', '听音与识别'],
  ['alphabet', 'order', '字母排排队', '给字母列车补上空位', '🚃', '顺序与逻辑'],
].map(([subject, type, title, description, symbol, skill]) => ({ subject, type, title, description, symbol, skill, category: originalCategories[type] }));

export const GAME_CATALOG = [
  ...ORIGINAL_GAMES.filter(game => game.subject === 'numbers'), ...NUMBER_EXTRA_GAMES,
  ...ORIGINAL_GAMES.filter(game => game.subject === 'pinyin'), ...PINYIN_EXTRA_GAMES,
  ...ORIGINAL_GAMES.filter(game => game.subject === 'alphabet'), ...ALPHABET_EXTRA_GAMES,
];
export const GAME_CATEGORIES = { recognize: '观察与认知', listen: '听音与辨认', think: '顺序与思考', build: '动手与组合' };
export const SUBJECT_NAMES = { numbers: '数字乐园', pinyin: '拼音天地', alphabet: '字母森林' };
export function filterGames({ subject = 'all', category = 'all', query = '' } = {}) {
  const search = query.trim().toLocaleLowerCase();
  return GAME_CATALOG.filter(game => (subject === 'all' || game.subject === subject)
    && (category === 'all' || game.category === category)
    && (!search || [game.title, game.description, game.skill].join(' ').toLocaleLowerCase().includes(search)));
}
