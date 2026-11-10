export const NUMBER_EXTRA_GAMES = [
  ['zero-shelves', '空空小书架', '找出没有玩具的书架，认识数字零', '🧺', '零与空集合', 'recognize'],
  ['animal-line', '动物排队点名', '从左往右数一数，找到第几位的小动物', '🐾', '序数与听辨', 'listen'],
  ['magic-more', '魔法添一点', '添上一颗星星，做出多一个的数量', '🪄', '添一与变化', 'build'],
  ['leaf-less', '落叶少一片', '一片叶子飘走了，还剩多少片', '🍃', '减一与变化', 'build'],
  ['block-combine', '积木合合乐', '把两堆积木合起来，搭出总数量', '🧱', '合并与加法', 'think'],
  ['bead-split', '彩珠分两边', '知道全部和一部分，找出另一部分', '📿', '部分与整体', 'think'],
  ['bird-takeaway', '小鸟飞走啦', '看清飞走几只，找出树上剩下的小鸟', '🐦', '拿走与减法', 'think'],
  ['hop-pattern', '青蛙跳格子', '发现每次跳两格的规律，接好两个数字', '🐸', '规律与推理', 'think'],
  ['ten-frame', '十格小花园', '十个花格还差几朵？一起把花园种满', '🌼', '十格与凑十', 'recognize'],
  ['equal-share', '小猫平分鱼', '两只小猫一样多，每只应该分几条鱼', '🐱', '平均分与对应', 'build'],
  ['number-between', '数字小区间', '找齐藏在两个数字中间的数字朋友', '🚪', '范围与分类', 'think'],
].map(([type, title, description, symbol, skill, category]) => ({
  subject: 'numbers', type, title, description, symbol, skill, category,
}));

const DIGITS = Array.from({ length: 11 }, (_, index) => index);
const ANIMALS = [
  { value: 'rabbit', label: '🐰', small: '小兔' },
  { value: 'bear', label: '🐻', small: '小熊' },
  { value: 'fox', label: '🦊', small: '小狐狸' },
  { value: 'panda', label: '🐼', small: '熊猫' },
  { value: 'cat', label: '🐱', small: '小猫' },
];

const roll = (size, random) => Math.min(size - 1, Math.max(0, Math.floor(random() * size)));

function shuffled(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const next = roll(index + 1, random);
    [result[index], result[next]] = [result[next], result[index]];
  }
  return result;
}

const numberCards = (values, random) => shuffled(values, random).map(value => ({ value: String(value), label: String(value) }));
const numberChoices = (answer, random) => numberCards([
  answer,
  ...shuffled(DIGITS.filter(value => value !== answer), random).slice(0, 3),
], random);

function collection(item, count, unit) {
  return `<div class="extra-collection" role="img" aria-label="${count} ${unit}"><span aria-hidden="true">${count ? Array(count).fill(item).join(' ') : '（空空的）'}</span></div>`;
}

function tenFrame(filled) {
  const rows = [0, 5].map(start => `<tr>${Array.from({ length: 5 }, (_, offset) => `<td>${start + offset < filled ? '🌼' : '○'}</td>`).join('')}</tr>`).join('');
  return `<div role="img" aria-label="十个花格，前 ${filled} 个种了花，其余空着"><table class="extra-ten-frame" aria-hidden="true"><tbody>${rows}</tbody></table></div>`;
}

const round = values => ({ mode: 'choice', choices: [], speech: values.prompt, ...values });
const buildRound = values => round({ mode: 'build', max: 10, ...values, answer: String(values.answer) });

const generators = {
  'zero-shelves'(index, random) {
    const empty = shuffled([0, 1, 2, 3], random).slice(0, 1 + index % 2);
    const choices = shuffled(Array.from({ length: 4 }, (_, shelf) => ({
      value: String(shelf),
      label: empty.includes(shelf) ? '空空的' : Array(1 + roll(5, random)).fill('🧸').join(' '),
      small: `第 ${shelf + 1} 层书架`,
    })), random);
    return round({
      mode: 'select',
      prompt: '把没有玩具的书架都找出来。可以选择不止一层哦！',
      display: '一个玩具也没有，可以用数字 0 表示。',
      hint: '仔细看看每层书架，有没有小熊玩具？',
      explanation: '没有就是 0。所有空空的书架都找到啦！',
      choices,
      answer: empty.map(String),
    });
  },

  'animal-line'(index, random) {
    const animals = shuffled(ANIMALS, random);
    const position = (roll(5, random) + index) % 5;
    const prompt = `从左往右，第 ${position + 1} 位是哪只小动物？`;
    return round({
      prompt,
      display: animals.map(animal => animal.label).join(' → '),
      speech: `从左往右排着${animals.map(animal => animal.small).join('、')}。${prompt}`,
      hint: '最左边是第一位，往右一个一个数。',
      explanation: `从左往右数，第 ${position + 1} 位是${animals[position].small}。`,
      choices: shuffled(animals, random).map(animal => ({ ...animal })),
      answer: animals[position].value,
    });
  },

  'magic-more'(index, random) {
    const start = (roll(10, random) + index) % 10;
    return buildRound({
      prompt: `原来有 ${start} 颗星星，魔法又添了 1 颗。请做出现在的数量！`,
      display: `${start} + 1 = ?`,
      visual: collection('⭐', start, '颗原来的星星'),
      hint: '先放好原来的星星，再多放一颗。',
      explanation: `${start} 添上 1 是 ${start + 1}，比原来多一个。`,
      item: '⭐',
      answer: start + 1,
    });
  },

  'leaf-less'(index, random) {
    const start = 1 + (roll(10, random) + index) % 10;
    return buildRound({
      prompt: `原来有 ${start} 片叶子，风吹走了 1 片。请做出剩下的数量！`,
      display: `${start} - 1 = ?`,
      visual: collection('🍃', start, '片原来的叶子'),
      hint: '先放好原来的叶子，再取走一片。没有剩下就是零。',
      explanation: `${start} 减去 1 是 ${start - 1}，比原来少一个。`,
      item: '🍃',
      answer: start - 1,
    });
  },

  'block-combine'(index, random) {
    const total = 2 + (roll(9, random) + index) % 9;
    const left = 1 + roll(total - 1, random);
    const right = total - left;
    return buildRound({
      prompt: `左边 ${left} 块积木，右边 ${right} 块积木，合起来是多少？请搭出来！`,
      display: `${left} + ${right} = ?`,
      visual: `<div class="extra-groups">${collection('🧱', left, '块左边的积木')}<span aria-hidden="true">＋</span>${collection('🧱', right, '块右边的积木')}</div>`,
      hint: '两堆合成一堆，接着数，不要漏掉任何一块。',
      explanation: `${left} 块加上 ${right} 块，一共 ${total} 块。`,
      item: '🧱',
      answer: total,
    });
  },

  'bead-split'(index, random) {
    const total = 1 + (roll(10, random) + index) % 10;
    const known = roll(total + 1, random);
    const answer = total - known;
    return round({
      prompt: `共有 ${total} 颗彩珠，左边放了 ${known} 颗，右边应该放几颗？`,
      display: `${total} = ${known} + ?`,
      visual: collection('🟣', total, '颗全部的彩珠'),
      hint: '从全部彩珠里分出左边的，看看另一边还剩多少。',
      explanation: `${total} 可以分成 ${known} 和 ${answer}，两部分合起来还是 ${total}。`,
      choices: numberChoices(answer, random),
      answer: String(answer),
    });
  },

  'bird-takeaway'(index, random) {
    const start = 1 + (roll(10, random) + index) % 10;
    const gone = roll(start + 1, random);
    const answer = start - gone;
    return round({
      prompt: `树上原来有 ${start} 只小鸟，飞走了 ${gone} 只，还剩几只？`,
      display: `${start} - ${gone} = ?`,
      visual: collection('🐦', start, '只原来的小鸟'),
      hint: '用手指遮住飞走的小鸟，再数一数留下的。',
      explanation: `${start} 只飞走 ${gone} 只，还剩 ${answer} 只。`,
      choices: numberChoices(answer, random),
      answer: String(answer),
    });
  },

  'hop-pattern'(index, random) {
    const start = (roll(5, random) + index) % 5;
    return round({
      mode: 'sequence',
      prompt: '青蛙每次跳 2 格，请按先后顺序填好后面两个空位。',
      display: `${start} → ${start + 2} → ? → ?`,
      hint: '每次多 2，可以用手指向前跳两格。',
      explanation: `每次加 2，依次是 ${start}、${start + 2}、${start + 4}、${start + 6}。`,
      choices: numberCards([start + 3, start + 4, start + 5, start + 6], random),
      answer: [String(start + 4), String(start + 6)],
    });
  },

  'ten-frame'(index, random) {
    const filled = (roll(11, random) + index) % 11;
    const answer = 10 - filled;
    return round({
      prompt: '花园一共有 10 个花格，还要种几朵花才能种满？',
      display: `已种 ${filled} 朵花，一共 10 个花格。`,
      visual: tenFrame(filled),
      hint: '每个空圆圈再种一朵花，数数有几个空圆圈。',
      explanation: `${filled} 和 ${answer} 合起来是 10，花园刚好种满。`,
      choices: numberChoices(answer, random),
      answer: String(answer),
    });
  },

  'equal-share'(index, random) {
    const portion = 1 + (roll(5, random) + index) % 5;
    const total = portion * 2;
    return buildRound({
      prompt: '把小鱼平均分给两只小猫。请放出一只小猫应该分到的小鱼！',
      display: `一共有 ${total} 条小鱼，平均分给 2 只小猫。`,
      visual: collection('🐟', total, '条要平分的小鱼'),
      hint: '你一条，我一条，两只小猫分到的一样多。',
      explanation: `${total} 条分成一样多的两份，每只小猫分到 ${portion} 条。`,
      item: '🐟',
      answer: portion,
    });
  },

  'number-between'(index, random) {
    const low = (roll(7, random) + index) % 7;
    const high = low + 4;
    return round({
      mode: 'select',
      prompt: `把比 ${low} 大、比 ${high} 小的数字都选出来。`,
      display: `${low} 和 ${high} 是门口，中间的数字来做客！`,
      hint: '从小往大念一念，两边门口的数字不用选。',
      explanation: `${low + 1}、${low + 2}、${low + 3} 都比 ${low} 大，也都比 ${high} 小。`,
      choices: numberCards(Array.from({ length: 5 }, (_, offset) => low + offset), random),
      answer: [String(low + 1), String(low + 2), String(low + 3)],
    });
  },
};

export function buildNumberExtraRounds(type, random = Math.random) {
  const generate = Object.hasOwn(generators, type) ? generators[type] : null;
  if (!generate) throw new Error(`Unknown number game: ${type}`);
  return Array.from({ length: 5 }, (_, index) => generate(index, random));
}
