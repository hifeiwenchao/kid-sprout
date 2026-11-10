import { ALPHABET } from './alphabet-data.js';

const game = (type, title, description, symbol, skill, category) => ({ subject: 'alphabet', type, title, description, symbol, skill, category });

export const ALPHABET_EXTRA_GAMES = [
  game('alphabet-next', '字母接力棒', '找到紧跟在后面的字母朋友', '→', '顺序 · 接续', 'think'),
  game('alphabet-previous', '回头找朋友', '想一想，前一位字母是谁', '←', '顺序 · 回想', 'think'),
  game('alphabet-between', '字母小桥', '帮两位朋友补好中间的小桥', '🌉', '顺序 · 推理', 'think'),
  game('alphabet-upper', '小写找大写', '让小字母找到自己的大写伙伴', 'aA', '大小写 · 辨认', 'recognize'),
  game('alphabet-word-initial', '单词小队长', '看看英文单词由哪个字母开头', '🚩', '观察 · 首字母', 'recognize'),
  game('alphabet-word-picture', '单词找图片', '读一读熟悉的英文，找到图片', '🖼️', '词汇 · 对应', 'recognize'),
  game('alphabet-picture-word', '图片找单词', '为图片挑一张英文名字卡', '🏷️', '词汇 · 辨认', 'recognize'),
  game('alphabet-listen-word', '听词小画册', '听英文单词，选出它的图片', '🎧', '倾听 · 词义', 'listen'),
  game('alphabet-listen-pair', '双音小火车', '听两个字母名，记住先后顺序', '🚂', '倾听 · 顺序记忆', 'listen'),
  game('alphabet-vowels', '元音字母花篮', '从卡片中选出 A E I O U 家族', '🌷', '分类 · 元音字母', 'recognize'),
  game('alphabet-consonants', '辅音字母树屋', '找出五个元音字母以外的朋友', '🌳', '分类 · 辅音字母', 'think'),
  game('alphabet-same-letter', '字母一家亲', '把同一个字母的大小写都选出来', '🤝', '观察 · 多选配对', 'recognize'),
  game('alphabet-forward', '字母阶梯', '按字母表顺序搭起小阶梯', '🪜', '顺序 · 排列', 'build'),
  game('alphabet-backward', '倒着走的小熊', '从指定字母开始，倒着排一排', '🐻', '逆序 · 排列', 'think'),
  game('alphabet-word-build', '单词积木屋', '用小写字母拼出熟悉的短单词', '🧱', '拼写 · 组合', 'build'),
  game('alphabet-missing-word', '单词补补衣', '给单词补上一枚丢失的小字母', '🪡', '拼写 · 补全', 'think'),
  game('alphabet-word-count', '字母积木数数', '一个字母放一块，数数单词有多长', '🧩', '观察 · 字母计数', 'build'),
];

const LETTERS = ALPHABET.map(letter => letter.id);
const LOWERCASE = LETTERS.map(letter => letter.toLowerCase());
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
const CLASSIFY_ROWS = [
  ['A', 'B', 'E', 'F', 'I', 'K'],
  ['C', 'O', 'D', 'U', 'G', 'E'],
  ['J', 'E', 'L', 'O', 'M', 'A'],
  ['Q', 'I', 'R', 'A', 'S', 'U'],
  ['U', 'V', 'W', 'E', 'X', 'O'],
  ['I', 'A', 'B', 'O', 'C', 'D'],
];

function shuffle(values, random) {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
}

function fiveFrom(values, random) {
  const remaining = [...values];
  return Array.from({ length: 5 }, () => remaining.splice(Math.floor(random() * remaining.length), 1)[0]);
}

const card = value => ({ value, label: value });
const picture = letter => `${letter.emoji} ${letter.translation}`;
const english = letter => ({ speech: letter.word, speechLang: 'en-US' });

function choicesFor(answer, pool, random, format = card) {
  const others = shuffle(pool.filter(value => value !== answer), random).slice(0, 3);
  return shuffle([answer, ...others], random).map(format);
}

function letterRound(prompt, display, answer, hint, explanation, random) {
  return { mode: 'choice', prompt, display, hint, explanation, answer, choices: choicesFor(answer, LETTERS, random) };
}

export function buildAlphabetExtraRounds(type, random = Math.random) {
  if (!ALPHABET_EXTRA_GAMES.some(item => item.type === type)) throw new RangeError(`Unknown alphabet game: ${type}`);

  if (['alphabet-next', 'alphabet-previous', 'alphabet-between'].includes(type)) {
    const pool = type === 'alphabet-next' ? LETTERS.slice(0, -1) : type === 'alphabet-previous' ? LETTERS.slice(1) : LETTERS.slice(1, -1);
    return fiveFrom(pool, random).map(target => {
      const index = LETTERS.indexOf(target);
      if (type === 'alphabet-next') {
        return letterRound('接力棒应该交给紧接着的哪位字母？', target, LETTERS[index + 1], '按 A 到 Z 的顺序想一想，只向后走一位。', `${target} 后面紧接着 ${LETTERS[index + 1]}。`, random);
      }
      if (type === 'alphabet-previous') {
        return letterRound('回头看，紧挨着的前一位字母是谁？', target, LETTERS[index - 1], '按字母表的顺序想一想，再向前找一位。', `${target} 前面紧挨着 ${LETTERS[index - 1]}。`, random);
      }
      return letterRound('哪位字母站在这两位朋友中间？', `${LETTERS[index - 1]} ? ${LETTERS[index + 1]}`, target, '从左边的字母开始，按字母表顺序念三位。', `${LETTERS[index - 1]}、${target}、${LETTERS[index + 1]}，小桥接好啦。`, random);
    });
  }

  if (type === 'alphabet-upper') {
    return fiveFrom(ALPHABET, random).map(letter => letterRound('小写字母的大写伙伴是哪一位？', letter.lowercase, letter.uppercase, '大小写可能长得不一样，但它们是同一个字母。', `${letter.lowercase} 的大写伙伴是 ${letter.uppercase}。`, random));
  }

  if (type === 'alphabet-word-initial') {
    return fiveFrom(ALPHABET, random).map(letter => ({
      ...letterRound('看看单词最左边，它由哪个大写字母开头？', letter.word, letter.id, '只看从左边数的第一个字母，不需要猜单词的发音。', `${letter.word} 的首字母是 ${letter.id}。`, random),
      ...english(letter),
    }));
  }

  if (['alphabet-word-picture', 'alphabet-picture-word', 'alphabet-listen-word'].includes(type)) {
    return fiveFrom(ALPHABET, random).map(letter => {
      if (type === 'alphabet-picture-word') {
        return {
          mode: 'choice', prompt: '这张图片的英文名字是哪一个？', display: picture(letter),
          hint: '想想字母卡片里的单词朋友，也可以和家长一起读选项。',
          explanation: `${letter.word} 是${letter.translation}。`, answer: letter.word.toLowerCase(),
          choices: choicesFor(letter, ALPHABET, random, item => ({ value: item.word.toLowerCase(), label: item.word })),
        };
      }
      const listening = type === 'alphabet-listen-word';
      return {
        mode: 'choice', prompt: listening ? '听英文单词，找出它的图片。' : '这个英文单词是哪张图片的名字？',
        display: listening ? '🎧 听一听，找图片' : letter.word,
        hint: listening ? `无声提示：这一关的英文单词写作 ${letter.word}。可以对照字母卡片想一想。` : '想想字母卡片中，这个单词旁边是哪张图片。',
        explanation: `${letter.word} 是${letter.translation}。`, answer: letter.id,
        choices: choicesFor(letter, ALPHABET, random, item => ({ value: item.id, label: item.emoji, small: item.translation })),
        ...english(letter),
      };
    });
  }

  if (type === 'alphabet-listen-pair') {
    return fiveFrom(LETTERS, random).map(first => {
      const [second, third] = shuffle(LETTERS.filter(letter => letter !== first), random);
      const pairs = [[first, second], [second, first], [first, third], [third, first]];
      return {
        mode: 'choice', prompt: '听两个字母的英文名字，找到先后顺序相同的一张卡。', display: '♫ → ♫',
        hint: `无声提示：先是 ${first}，再是 ${second}。这里听的是字母名。`,
        explanation: `先听到 ${first}，再听到 ${second}，所以选 ${first} → ${second}。`,
        speech: `${first}. ${second}.`, speechLang: 'en-US', answer: `${first}-${second}`,
        choices: shuffle(pairs, random).map(pair => ({ value: pair.join('-'), label: pair.join(' → ') })),
      };
    });
  }

  if (['alphabet-vowels', 'alphabet-consonants'].includes(type)) {
    const findVowels = type === 'alphabet-vowels';
    return fiveFrom(CLASSIFY_ROWS, random).map(row => {
      const answer = row.filter(letter => findVowels ? VOWELS.has(letter) : !VOWELS.has(letter));
      return {
        mode: 'select', prompt: findVowels ? '把所有元音字母都选进花篮。' : '把所有辅音字母都选进树屋。',
        display: findVowels ? '🌷 找出元音字母' : '🌳 找出辅音字母',
        hint: '元音字母有 A、E、I、O、U 五位；其他英文字母是辅音字母。这一关按字母分类，不判断单词里的发音。',
        explanation: `${answer.join('、')} ${findVowels ? '是元音字母' : '都是辅音字母'}。选齐啦！`,
        answer, choices: shuffle(row, random).map(card),
      };
    });
  }

  if (type === 'alphabet-same-letter') {
    return fiveFrom(ALPHABET, random).map(letter => {
      const other = shuffle(ALPHABET.filter(item => item.id !== letter.id), random)[0];
      return {
        mode: 'select', prompt: '把这位字母朋友的大小写卡片都选出来。', display: letter.id,
        hint: '要找的是同一个字母的两种写法，一张大写、一张小写。',
        explanation: `${letter.uppercase} 和 ${letter.lowercase} 是同一位字母朋友。`,
        answer: [letter.uppercase, letter.lowercase],
        choices: shuffle([letter.uppercase, letter.lowercase, other.uppercase, other.lowercase], random).map(card),
      };
    });
  }

  if (['alphabet-forward', 'alphabet-backward'].includes(type)) {
    const forward = type === 'alphabet-forward';
    const pool = forward ? LETTERS.slice(0, -3) : LETTERS.slice(3);
    return fiveFrom(pool, random).map((first, index) => {
      const length = index < 3 ? 3 : 4;
      const start = LETTERS.indexOf(first);
      const answer = Array.from({ length }, (_, offset) => LETTERS[start + (forward ? offset : -offset)]);
      return {
        mode: 'sequence', prompt: `从 ${first} 开始，${forward ? '按字母表顺序' : '按字母表倒序'}点好 ${length} 块积木。`,
        display: `${first}${' → ?'.repeat(length - 1)}`,
        hint: forward ? '从指定字母开始，按照 A 到 Z 的方向排，每个字母用一次。' : '从指定字母开始，朝 A 的方向倒着走，每次退一位。',
        explanation: `${answer.join(' → ')}，${forward ? '字母阶梯搭好啦' : '倒着也排对啦'}！`,
        answer, choices: shuffle(answer, random).map(card),
      };
    });
  }

  if (type === 'alphabet-word-build') {
    const shortWords = ALPHABET.filter(letter => letter.word.length <= 5 && new Set(letter.word.toLowerCase()).size === letter.word.length);
    return fiveFrom(shortWords, random).map(letter => {
      const answer = [...letter.word.toLowerCase()];
      return {
        mode: 'sequence', prompt: '用小写字母积木，拼出图片的英文单词。', display: picture(letter),
        hint: `先想想字母卡片里的单词朋友。这个单词从 ${answer[0]} 开始；还不熟悉时，可以请家长一起拼。`,
        explanation: `${answer.join(' → ')}，拼成 ${letter.word}，意思是${letter.translation}。`,
        answer, choices: shuffle(answer, random).map(card), ...english(letter),
      };
    });
  }

  if (type === 'alphabet-missing-word') {
    return fiveFrom(ALPHABET, random).map(letter => {
      const spelling = [...letter.word.toLowerCase()];
      const missing = 1 + Math.floor(random() * (spelling.length - 1));
      const answer = spelling[missing];
      return {
        mode: 'choice', prompt: '单词里少了一枚小写字母，帮它补完整。',
        display: `${picture(letter)}\n${spelling.map((value, index) => index === missing ? '_' : value).join(' ')}`,
        hint: '看图片，想想字母卡片上的英文名字，再看看空位前后的字母。可以请家长一起回想拼写。',
        explanation: `补上 ${answer}，就是 ${letter.word}（${letter.translation}）。`,
        answer, choices: choicesFor(answer, LOWERCASE, random), ...english(letter),
      };
    });
  }

  return fiveFrom(ALPHABET, random).map(letter => ({
    mode: 'build', prompt: '单词有几个字母？一个字母放一块积木。', display: letter.word,
    hint: '从左往右一个一个指着字母数；两个相同的字母也要各数一次。',
    explanation: `${letter.word} 有 ${letter.word.length} 个字母，要放 ${letter.word.length} 块积木。`,
    answer: String(letter.word.length), item: '🧩', max: 10, choices: [], ...english(letter),
  }));
}
