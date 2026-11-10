import { PINYIN_LESSONS } from './pinyin-data.js';

// These exercises are independently written. Chinese speech, when supplied,
// reads a complete reference word; it is never presented as a phoneme recording.
export const PINYIN_EXTRA_GAMES = [
  { subject: 'pinyin', type: 'initial-listen', title: '声母小耳朵', description: '听中文例字，找开头的声母', symbol: 'b ♪', skill: '例字声母听辨', category: 'listen' },
  { subject: 'pinyin', type: 'initial-shapes', title: '声母照镜子', description: '观察半圆和小门，认清形近声母', symbol: 'b d', skill: '形近声母辨认', category: 'recognize' },
  { subject: 'pinyin', type: 'flat-retroflex', title: '舌尖小分队', description: '把平舌、翘舌声母分别找出来', symbol: 'z zh', skill: '平翘舌归类', category: 'recognize' },
  { subject: 'pinyin', type: 'nasal-lateral', title: '小牛和小鹿', description: '听例字，分清 n 和 l', symbol: 'n l', skill: '鼻音与边音辨认', category: 'listen' },
  { subject: 'pinyin', type: 'single-finals', title: '单韵母花篮', description: '采下六位单韵母朋友', symbol: 'a ü', skill: '单韵母识别', category: 'recognize' },
  { subject: 'pinyin', type: 'compound-finals', title: '复韵母彩虹', description: '找出连成一个音的复韵母', symbol: 'ai ei', skill: '复韵母识别', category: 'recognize' },
  { subject: 'pinyin', type: 'nasal-finals', title: '鼻音小山洞', description: '看看结尾，分清前鼻音和后鼻音', symbol: 'an ang', skill: '前后鼻韵母分类', category: 'think' },
  { subject: 'pinyin', type: 'whole-syllables', title: '整体认读小屋', description: '找出整个记住、直接读的音节', symbol: 'zhi yu', skill: '整体认读识别', category: 'recognize' },
  { subject: 'pinyin', type: 'tone-numbers', title: '声调号码牌', description: '看声调帽子，送上正确号码', symbol: 'á ②', skill: '声调符号转数字', category: 'think' },
  { subject: 'pinyin', type: 'tone-placement', title: '声调帽子铺', description: '给音节找到正确的标调位置', symbol: 'shuǐ', skill: '韵母标调规则', category: 'think' },
  { subject: 'pinyin', type: 'umlaut-hidden', title: '两点捉迷藏', description: '认识 ü 遇到 j、q、x 的写法', symbol: 'j ü', skill: 'ü省点拼写', category: 'build' },
  { subject: 'pinyin', type: 'umlaut-keep', title: '两点要留下', description: 'ü 和 n、l 相拼，两点要保留', symbol: 'nǚ lǜ', skill: 'ü保点拼写', category: 'build' },
  { subject: 'pinyin', type: 'syllable-blend', title: '拼读小桥', description: '把声母和韵母连成一个音节', symbol: 'b + ai', skill: '两拼音节合成', category: 'build' },
  { subject: 'pinyin', type: 'triple-spelling', title: '三拼小火车', description: '按声母、介母、韵母顺序排车厢', symbol: 'g u ā', skill: '三拼音节顺序', category: 'build' },
  { subject: 'pinyin', type: 'lesson-trail', title: '课次小脚印', description: '沿着十四课的小路排一排', symbol: '1 → 14', skill: '教材学习顺序', category: 'think' },
  { subject: 'pinyin', type: 'syllable-beats', title: '音节小鼓手', description: '一个音节一面鼓，数数词语有几拍', symbol: '🥁', skill: '词语音节分辨', category: 'build' },
  { subject: 'pinyin', type: 'final-family', title: '韵母同伴圈', description: '声母不同，找到韵母相同的音节', symbol: 'bái hǎi', skill: '跨音节韵母辨认', category: 'think' },
];

const singleFinals = new Set(['a', 'o', 'e', 'i', 'u', 'ü']);
const compoundFinals = new Set(['ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe']);
const wholeSyllables = new Set(PINYIN_LESSONS.flatMap(lesson => lesson.readSyllables));

const shuffle = (values, random) => {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const value = Number(random());
    const j = Number.isFinite(value) ? Math.min(i, Math.max(0, Math.floor(value * (i + 1)))) : 0;
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const options = values => values.map(value => ({ value, label: value }));
const categoryOptions = [
  { value: 'front', label: '前鼻韵母', small: '用舌尖收尾' },
  { value: 'back', label: '后鼻韵母', small: '用舌根收尾' },
];

const initialWords = [
  ['波', '波浪的波', 'bō', 'b', ['b', 'p', 'd']],
  ['坡', '山坡的坡', 'pō', 'p', ['p', 'b', 'q']],
  ['马', '小马的马', 'mǎ', 'm', ['m', 'n', 'f']],
  ['风', '大风的风', 'fēng', 'f', ['f', 'h', 'm']],
  ['大', '大小的大', 'dà', 'd', ['d', 't', 'b']],
  ['土', '泥土的土', 'tǔ', 't', ['t', 'd', 'l']],
  ['哥', '哥哥的哥', 'gē', 'g', ['g', 'k', 'h']],
  ['口', '门口的口', 'kǒu', 'k', ['k', 'g', 'h']],
  ['河', '小河的河', 'hé', 'h', ['h', 'k', 'f']],
  ['鸡', '小鸡的鸡', 'jī', 'j', ['j', 'q', 'x']],
  ['气', '空气的气', 'qì', 'q', ['q', 'j', 'x']],
  ['西', '西瓜的西', 'xī', 'x', ['x', 'j', 'q']],
];

const shapeRows = [
  ['b', '右下半圆', '竖线高高，右边下方一个半圆。', ['b', 'd', 'p', 'q']],
  ['d', '左下半圆', '竖线高高，左边下方一个半圆。', ['b', 'd', 'p', 'q']],
  ['p', '右上半圆', '竖线向下延伸，右边上方一个半圆。', ['b', 'd', 'p', 'q']],
  ['q', '左上半圆', '竖线向下延伸，左边上方一个半圆。', ['b', 'd', 'p', 'q']],
  ['n', '一扇小门', '一扇小门，弯弯搭在上面。', ['n', 'm', 'h']],
  ['m', '两扇小门', '两扇小门，两个弯弯连在一起。', ['n', 'm', 'h']],
];

const tongueRows = [
  ['flat', ['z', 'c', 's', 'zh', 'ch', 'sh']],
  ['retroflex', ['z', 'c', 's', 'zh', 'ch', 'sh']],
  ['flat', ['z', 's', 'r', 'zh', 'ch', 'm']],
  ['retroflex', ['c', 's', 'r', 'zh', 'sh', 'n']],
  ['flat', ['c', 'z', 'ch', 'sh', 'r', 'l']],
  ['retroflex', ['z', 's', 'ch', 'sh', 'r', 'b']],
];

const nasalLateralWords = [
  ['牛', '小牛的牛', 'niú', 'n'], ['鹿', '小鹿的鹿', 'lù', 'l'],
  ['鸟', '小鸟的鸟', 'niǎo', 'n'], ['梨', '梨子的梨', 'lí', 'l'],
  ['奶', '牛奶的奶', 'nǎi', 'n'], ['路', '马路的路', 'lù', 'l'],
];

const singleRows = [
  ['a', 'i', 'ü', 'ai', 'an', 'er'], ['o', 'e', 'u', 'ei', 'en', 'ong'],
  ['a', 'e', 'ü', 'ao', 'in', 'ie'], ['i', 'u', 'o', 'iu', 'un', 'üe'],
  ['e', 'i', 'a', 'er', 'eng', 'ui'],
];

const compoundRows = [
  ['ai', 'ei', 'ui', 'a', 'an', 'er'], ['ao', 'ou', 'iu', 'o', 'ong', 'er'],
  ['ie', 'üe', 'ai', 'i', 'in', 'ün'], ['ui', 'iu', 'ou', 'u', 'un', 'eng'],
  ['ei', 'ie', 'ao', 'e', 'en', 'er'],
];

const nasalRows = [
  ['an', 'front'], ['en', 'front'], ['in', 'front'], ['un', 'front'], ['ün', 'front'],
  ['ang', 'back'], ['eng', 'back'], ['ing', 'back'], ['ong', 'back'],
];

const wholeRows = [
  ['zi', 'ci', 'si', 'ba', 'ma', 'da'], ['zhi', 'chi', 'shi', 'ri', 'zhā', 'chá'],
  ['yi', 'wu', 'yu', 'ya', 'wa', 'wo'], ['ye', 'yue', 'yuan', 'jie', 'xue', 'juan'],
  ['yin', 'yun', 'ying', 'jin', 'qing', 'xun'],
];

const numberedTones = [
  ['mā', 1], ['má', 2], ['mǎ', 3], ['mà', 4], ['shū', 1],
  ['niú', 2], ['shuǐ', 3], ['lù', 4],
];

const placementRows = [
  ['bai', '二声', 'bái', ['bái', 'baí'], '有a先找a，bai的声调标在a上。'],
  ['kou', '三声', 'kǒu', ['kǒu', 'koǔ'], '没有a，找o或e；kou的声调标在o上。'],
  ['shui', '三声', 'shuǐ', ['shuǐ', 'shǔi'], 'i和u并排时，标在后一个字母上；ui标在i上。'],
  ['liu', '四声', 'liù', ['liù', 'lìu'], 'i和u并排时，标在后一个字母上；iu标在u上。'],
  ['xie', '二声', 'xié', ['xié', 'xíe'], '没有a，找o或e；ie的声调标在e上。'],
  ['jiao', '三声', 'jiǎo', ['jiǎo', 'jǐao', 'jiaǒ'], '有a先找a，jiao的声调标在a上。'],
  ['fei', '一声', 'fēi', ['fēi', 'feī'], '没有a，找o或e；ei的声调标在e上。'],
];

const hiddenDotRows = [
  ['j', 'ü', 'ju', ['ju', 'jü', 'ji']], ['q', 'ü', 'qu', ['qu', 'qü', 'qi']],
  ['x', 'ü', 'xu', ['xu', 'xü', 'xi']], ['j', 'üe', 'jue', ['jue', 'jüe', 'jie']],
  ['q', 'üe', 'que', ['que', 'qüe', 'qie']], ['x', 'üe', 'xue', ['xue', 'xüe', 'xie']],
];

const keptDotRows = [
  ['n + ǚ', 'nǚ', ['nǚ', 'nǔ']], ['l + ǜ', 'lǜ', ['lǜ', 'lù']],
  ['l + ǚ', 'lǚ', ['lǚ', 'lǔ']], ['n + üè', 'nüè', ['nüè', 'nuè']],
  ['l + üè', 'lüè', ['lüè', 'luè']],
];

const blendRows = [
  ['d + à', 'dà', '大', ['dà', 'tà', 'dè']],
  ['m + ǎ', 'mǎ', '马', ['mǎ', 'nǎ', 'mǔ']],
  ['b + ái', 'bái', '白', ['bái', 'pái', 'béi']],
  ['g + ǒu', 'gǒu', '狗', ['gǒu', 'kǒu', 'gǎo']],
  ['h + é', 'hé', '河', ['hé', 'ké', 'hú']],
  ['n + iú', 'niú', '牛', ['niú', 'liú', 'nǔ']],
  ['sh + uǐ', 'shuǐ', '水', ['shuǐ', 'suǐ', 'shǔ']],
];

const tripleRows = [
  ['瓜', '西瓜的瓜', 'guā', ['g', 'u', 'ā'], 'k'],
  ['花', '花朵的花', 'huā', ['h', 'u', 'ā'], 'f'],
  ['朵', '花朵的朵', 'duǒ', ['d', 'u', 'ǒ'], 't'],
  ['虾', '小虾的虾', 'xiā', ['x', 'i', 'ā'], 'q'],
  ['假', '假装的假', 'jiǎ', ['j', 'i', 'ǎ'], 'q'],
];

const lessonRows = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12], [12, 13, 14]];

const beatRows = [
  ['鱼', 'yú', 1], ['小兔', 'xiǎo tù', 2], ['妈妈', 'mā ma', 2],
  ['胡萝卜', 'hú luó bo', 3], ['大西瓜', 'dà xī guā', 3],
  ['我爱读书', 'wǒ ài dú shū', 4], ['幼儿园里', 'yòu ér yuán lǐ', 4],
];

const familyRows = [
  ['ai', ['bái', 'hǎi', 'cài'], ['bēi', 'gāo']],
  ['ao', ['māo', 'bǎo', 'hǎo'], ['mǎ', 'gǒu']],
  ['ui', ['shuǐ', 'duì', 'huī'], ['shū', 'hǎi']],
  ['iu', ['niú', 'liù', 'qiū'], ['nǔ', 'lǐ']],
  ['un', ['lún', 'cūn', 'sūn'], ['lǔ', 'sān']],
];

function makePool(type) {
  switch (type) {
    case 'initial-listen':
      return initialWords.map(([word, example, pinyin, initial, values]) => ({
        id: `${type}-${initial}`, prompt: '听听例字，找开头的声母', display: word,
        speech: `${example}。找找开头的声母。`, speechLang: 'zh-CN', answer: initial,
        hint: `${example}（${pinyin}），开头的声母是${initial}。声母要轻而短，由大人陪读。`,
        explanation: `${word}（${pinyin}）的声母是${initial}。`, choices: options(values),
      }));
    case 'initial-shapes':
      return shapeRows.map(([answer, display, shape, values]) => ({
        id: `${type}-${answer}`, prompt: '照着形状，找到声母', display, answer,
        hint: `${shape}看看它像哪个声母？`,
        explanation: `${answer}的样子是：${shape}`, choices: options(values),
      }));
    case 'flat-retroflex':
      return tongueRows.map(([targetKind, values], index) => {
        const flat = targetKind === 'flat';
        const valid = flat ? ['z', 'c', 's'] : ['zh', 'ch', 'sh', 'r'];
        return {
          id: `${type}-${index}`, mode: 'select', targetKind,
          prompt: `把所有${flat ? '平舌' : '翘舌'}声母找出来`, display: flat ? '舌尖平平' : '舌尖翘起',
          answer: values.filter(value => valid.includes(value)), choices: options(values),
          hint: `平舌声母是z、c、s；翘舌声母是zh、ch、sh、r。点选所有符合的朋友。`,
          explanation: `${flat ? 'z、c、s' : 'zh、ch、sh、r'}是${flat ? '平舌' : '翘舌'}声母。`,
        };
      });
    case 'nasal-lateral':
      return nasalLateralWords.map(([word, example, pinyin, answer]) => ({
        id: `${type}-${word}`, prompt: '听例字，分清 n 和 l', display: word, answer,
        speech: example, speechLang: 'zh-CN', choices: options(['n', 'l']),
        hint: `${example}（${pinyin}）以${answer}开头。n的声音从鼻腔出来，l的气流从舌头两边走，请大人示范。`,
        explanation: `${example}（${pinyin}）的声母是${answer}。`,
      }));
    case 'single-finals':
      return singleRows.map((values, index) => ({
        id: `${type}-${index}`, mode: 'select', prompt: '采下所有单韵母', display: '单韵母花篮',
        answer: values.filter(value => singleFinals.has(value)), choices: options(values),
        hint: '六位单韵母是a、o、e、i、u、ü。点选花篮里所有的单韵母。',
        explanation: 'a、o、e、i、u、ü是六个单韵母。',
      }));
    case 'compound-finals':
      return compoundRows.map((values, index) => ({
        id: `${type}-${index}`, mode: 'select', prompt: '找出所有复韵母', display: '复韵母彩虹',
        answer: values.filter(value => compoundFinals.has(value)), choices: options(values),
        hint: '复韵母有ai、ei、ui、ao、ou、iu、ie、üe。er是特殊韵母，鼻韵母也有自己的家。',
        explanation: '复韵母滑着连成一个音；er单独记，不放进这个篮子。',
      }));
    case 'nasal-finals':
      return nasalRows.map(([display, answer]) => ({
        id: `${type}-${display}`, prompt: '这个鼻韵母怎样收尾？', display, answer, choices: categoryOptions,
        hint: 'an、en、in、un、ün是前鼻韵母，用舌尖收尾；ang、eng、ing、ong是后鼻韵母，用舌根收尾。ng不要拆成两个音。',
        explanation: `${display}是${answer === 'front' ? '前' : '后'}鼻韵母。`,
      }));
    case 'whole-syllables':
      return wholeRows.map((values, index) => ({
        id: `${type}-${index}`, mode: 'select', prompt: '找出所有整体认读音节', display: '整个记住，直接读',
        answer: values.filter(value => wholeSyllables.has(value)), choices: options(values),
        hint: '整体认读共16个：zi、ci、si、zhi、chi、shi、ri、yi、wu、yu、ye、yue、yuan、yin、yun、ying。',
        explanation: '这些整体认读音节要整个记住，直接读；声母短音要另外体会。',
      }));
    case 'tone-numbers':
      return numberedTones.map(([display, tone]) => ({
        id: `${type}-${display}`, prompt: '这顶声调帽子是几声？', display, answer: String(tone),
        choices: [1, 2, 3, 4].map(number => ({ value: String(number), label: `${number}声`, small: ['平平', '上扬', '拐弯', '下降'][number - 1] })),
        hint: '一声平，二声扬，三声拐弯，四声降。看看帽子的形状。',
        explanation: `${display}标的是${tone}声。`,
      }));
    case 'tone-placement':
      return placementRows.map(([base, tone, answer, values, rule]) => ({
        id: `${type}-${base}`, prompt: `给 ${base} 标上${tone}`, display: base, answer,
        choices: options(values), hint: rule, explanation: `正确写法是${answer}。${rule}`,
      }));
    case 'umlaut-hidden':
      return hiddenDotRows.map(([initial, final, answer, values]) => ({
        id: `${type}-${initial}-${final}`, prompt: 'ü 遇到 j、q、x，怎样写？', display: `${initial} + ${final}`, answer,
        choices: options(values), hint: 'ü或üe和j、q、x相拼，ü的两点省去，读音不变；不能读成u。',
        explanation: `${initial}和${final}相拼写成${answer}，ü的两点藏起来，读音仍保留。`,
      }));
    case 'umlaut-keep':
      return keptDotRows.map(([display, answer, values], index) => ({
        id: `${type}-${index}`, prompt: 'ü 遇到 n、l，两点要留下', display, answer, choices: options(values),
        hint: 'ü和n、l相拼时，两点要保留。去掉两点就会变成不同的韵母。',
        explanation: `正确写法是${answer}，ü的两点留下来了。`,
      }));
    case 'syllable-blend':
      return blendRows.map(([display, answer, word, values]) => ({
        id: `${type}-${word}`, prompt: '把声母和韵母拼起来', display, answer, choices: options(values),
        hint: `前面的声母轻而短，后面的韵母响而长，紧紧连起来。${word}写作${answer}。`,
        explanation: `${display}拼成${answer}（${word}）。`,
      }));
    case 'triple-spelling':
      return tripleRows.map(([word, example, pinyin, answer, extra]) => ({
        id: `${type}-${word}`, mode: 'sequence', prompt: '按三拼顺序排好小火车', display: word, answer,
        choices: options([...answer, extra]), speech: example, speechLang: 'zh-CN',
        hint: `${example}（${pinyin}），按声母、介母、韵母顺序排列：${answer.join('—')}。只选需要的三个车厢。`,
        explanation: `${answer.join('—')}连起来就是${pinyin}（${word}）。`,
      }));
    case 'lesson-trail':
      return lessonRows.map((numbers, index) => {
        const lessons = numbers.map(number => PINYIN_LESSONS[number - 1]);
        return {
          id: `${type}-${index}`, mode: 'sequence', prompt: '按学习先后排一排', display: '沿着课次小路走',
          answer: lessons.map(lesson => lesson.title), choices: lessons.map(lesson => ({ value: lesson.title, label: lesson.title })),
          hint: `2024新版教材顺序：${lessons.map(lesson => `第${lesson.number}课 ${lesson.title}`).join(' → ')}。`,
          explanation: `这几课依次是第${numbers.join('、')}课。第9课是y w。`,
        };
      });
    case 'syllable-beats':
      return beatRows.map(([display, pinyin, count]) => ({
        id: `${type}-${display}`, mode: 'build', prompt: '一个音节放一面小鼓', display,
        answer: String(count), item: '🥁', max: 5, choices: options(['1', '2', '3', '4', '5']),
        speech: display, speechLang: 'zh-CN',
        hint: `${display}读作${pinyin}。跟大人慢慢读，一个音节放一面鼓；轻声也算一个音节。`,
        explanation: `${pinyin}一共有${count}个音节，放${count}面鼓。`,
      }));
    case 'final-family':
      return familyRows.map(([display, answer, other]) => ({
        id: `${type}-${display}`, mode: 'select', prompt: `找出韵母都是 ${display} 的音节`, display,
        answer, choices: options([...answer, ...other]),
        hint: `看看声母后面的韵母。${answer.join('、')}的韵母都是${display}。ui、iu、un各是一个完整韵母的书写简式。`,
        explanation: `${answer.join('、')}虽然声母不同，韵母都是${display}。`,
      }));
    default:
      throw new Error(`Unknown pinyin extra game: ${type}`);
  }
}

export function buildPinyinExtraRounds(type, random = Math.random) {
  return shuffle(makePool(type), random).slice(0, 5).map(round => ({
    ...round,
    // Copy arrays as well as choices so a player cannot mutate future games.
    answer: Array.isArray(round.answer) ? [...round.answer] : round.answer,
    choices: shuffle(round.choices, random).map(choice => ({ ...choice })),
  }));
}
