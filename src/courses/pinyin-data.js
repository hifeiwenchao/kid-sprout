// Lesson order follows the 2024 revised, six-year primary-school edition.
// Explanations, examples and games below are independently written.
export const PINYIN_SOURCES = [
  { title: '统编版（2024）一年级上册目录 · 师梦圆', url: 'https://www.shimengyuan.com/jiaocais/1n2589.html', note: '核对第二至第四单元的14课课次，y w独立为第9课。' },
  { title: '2024年统编教材修订说明 · 人民教育出版社', url: 'https://www.pep.com.cn/rjdt/rjdt/202408/t20240827_1994406.shtml', note: '2024年秋季一年级使用修订教材，拼音教学减缓起始坡度。' },
];

const lessonSymbols = ['a o e', 'i u ü', 'b p m f', 'd t n l', 'g k h', 'j q x', 'z c s', 'zh ch sh r', 'y w', 'ai ei ui', 'ao ou iu', 'ie üe er', 'an en in un ün', 'ang eng ing ong'];
const lessonDetails = [
  { spellings: ['ā á ǎ à', 'ō ó ǒ ò', 'ē é ě è'], rule: '四声小帽子标在韵母上：一声平，二声扬，三声拐弯，四声降。' },
  { spellings: ['ī í ǐ ì', 'ū ú ǔ ù', 'ǖ ǘ ǚ ǜ'], rule: 'i戴上声调帽子时去掉小点；ü的两点要保留。' },
  { spellings: ['b + ā → bā（八）', 'p + á → pá（爬）', 'm + ǎ → mǎ（马）', 'f + à → fà（发）'], rule: '前面的声母轻而短，后面的韵母响而长，紧紧连起来。' },
  { spellings: ['d + à → dà（大）', 't + ǔ → tǔ（土）', 'n + ǚ → nǚ（女）', 'l + ǜ → lǜ（绿）'], rule: 'n、l和ü相拼时，ü的两点保留下来。' },
  { spellings: ['g + ē → gē（哥）', 'k + ǒu → kǒu（口）', 'h + é → hé（河）', 'g + u + ā → guā（瓜）'], rule: '三拼音节中，声母、介母、韵母连续拼出来：g—u—ā，guā。' },
  { spellings: ['j + ī → jī（鸡）', 'q + ì → qì（气）', 'x + ī → xī（西）', 'j + ǘ → jú（菊）'], rule: 'ü和j、q、x相拼，两点省去，读音不变；不要读成u。' },
  { readSyllables: ['zi', 'ci', 'si'], spellings: ['z + ǔ → zǔ（祖）', 'c + ā → cā（擦）', 's + è → sè（色）'], rule: 'zi、ci、si是整体认读音节，要整个记住、直接读。它们后面的i与衣服的i读音不同。' },
  { readSyllables: ['zhi', 'chi', 'shi', 'ri'], spellings: ['zh + ú → zhú（竹）', 'ch + á → chá（茶）', 'sh + ā → shā（沙）', 'r + è → rè（热）'], rule: 'zhi、chi、shi、ri整体认读，舌尖翘起；后面的i与衣服的i读音不同。' },
  { readSyllables: ['yi', 'wu', 'yu'], spellings: ['yā（鸭）· wā（蛙）', 'yī（衣）· wū（乌）· yú（鱼）'], rule: 'i、u、ü单独成音节时，分别写成yi、wu、yu，整个认读。yu中的ü省去两点。' },
  { spellings: ['b + ái → bái（白）', 'b + ēi → bēi（杯）', 'sh + uǐ → shuǐ（水）'], rule: '复韵母要从前一个音滑向后一个音。ui是uei的简写，声调标在i上。' },
  { spellings: ['m + āo → māo（猫）', 'g + ǒu → gǒu（狗）', 'n + iú → niú（牛）'], rule: 'iu是iou的简写。i和u并排时，声调标在后一个字母上：niú、shuǐ。' },
  { readSyllables: ['ye', 'yue'], spellings: ['x + ié → xié（鞋）', 'yé（爷）· yuè（月）', 'ěr（耳），独立成音节'], rule: 'ye、yue整体认读。üe和y、j、q、x相拼时省去ü的两点；er不能与声母相拼。' },
  { readSyllables: ['yuan', 'yin', 'yun'], spellings: ['sh + ān → shān（山）', 'm + én → mén（门）', 'yīn（音）· yún（云）· yuán（圆）'], rule: '前鼻韵母用舌尖收尾。yuan、yin、yun整体认读；un是uen的简写，yun里的ü省去两点。' },
  { readSyllables: ['ying'], spellings: ['t + áng → táng（糖）', 'd + ēng → dēng（灯）', 'x + īng → xīng（星）', 'zh + ōng → zhōng（钟）', 'yīng（鹰），整体认读'], rule: '后鼻韵母用舌根收尾，不能把ng读成两个音。ying是整体认读音节。' },
];
export const PINYIN_LESSONS = lessonSymbols.map((symbols, index) => ({
  id: `lesson-${index + 1}`, number: index + 1, unit: index < 4 ? 2 : index < 9 ? 3 : 4,
  symbols: symbols.split(' '), title: symbols, readSyllables: [], ...lessonDetails[index],
}));
export const PINYIN_PROGRESS_IDS = PINYIN_LESSONS.map(lesson => lesson.id);

const rows = [
  ['a', 'final', '嘴巴张大，舌头放低，声音自然出来。', '阿姨的阿', 'ā', '阿姨的阿'],
  ['o', 'final', '嘴唇拢圆，舌头往后缩一些。', '喔喔叫的喔', 'ō', '公鸡喔喔叫'],
  ['e', 'final', '嘴巴半开，嘴角向两边展开。', '白鹅的鹅', 'é', '白鹅的鹅'],
  ['i', 'final', '牙齿靠近，嘴角向两边展开。', '衣服的衣', 'yī', '衣服的衣'],
  ['u', 'final', '嘴唇向前拢成一个小圆洞。', '乌鸦的乌', 'wū', '乌鸦的乌'],
  ['ü', 'final', '先摆好i的口型，再把嘴唇拢圆。', '小鱼的鱼', 'yú', '小鱼的鱼'],
  ['b', 'initial', '双唇闭住再打开，气流轻轻出来。', '波浪的波', 'bō', '波浪的波'],
  ['p', 'initial', '双唇闭住再打开，让一口气冲出来。', '山坡的坡', 'pō', '山坡的坡'],
  ['m', 'initial', '双唇闭住，声音从鼻子里出来。', '摸一摸的摸', 'mō', '摸一摸的摸'],
  ['f', 'initial', '上牙轻碰下唇，让气流从缝里出来。', '佛像的佛', 'fó', '佛像的佛'],
  ['d', 'initial', '舌尖抵住上牙床，再轻轻放开。', '得到的得', 'dé', '得到的得'],
  ['t', 'initial', '舌尖抵住上牙床，再送出一口气。', '特别的特', 'tè', '特别的特'],
  ['n', 'initial', '舌尖抵住上牙床，让声音从鼻子出来。', '小牛的牛', 'niú', '小牛的牛'],
  ['l', 'initial', '舌尖抵住上牙床，气从舌头两边走。', '快乐的乐', 'lè', '快乐的乐'],
  ['g', 'initial', '舌根抬起碰软腭，轻轻放开。', '哥哥的哥', 'gē', '哥哥的哥'],
  ['k', 'initial', '舌根抬起再放开，同时送出一口气。', '蝌蚪的蝌', 'kē', '蝌蚪的蝌'],
  ['h', 'initial', '舌根抬高，让气从喉部轻轻擦过。', '喝水的喝', 'hē', '喝水的喝'],
  ['j', 'initial', '舌面抬高靠近硬腭，轻轻放开。', '小鸡的鸡', 'jī', '小鸡的鸡'],
  ['q', 'initial', '舌面抬高靠近硬腭，再送出一口气。', '气球的气', 'qì', '气球的气'],
  ['x', 'initial', '舌面靠近硬腭，让气从窄缝擦过。', '西瓜的西', 'xī', '西瓜的西'],
  ['z', 'initial', '舌尖平伸，抵住上门牙背再放开。', '紫色的紫', 'zǐ', '紫色的紫'],
  ['c', 'initial', '舌尖平伸，抵住上门牙背后送气。', '刺猬的刺', 'cì', '刺猬的刺'],
  ['s', 'initial', '舌尖靠近上门牙背，让气从缝里出来。', '丝线的丝', 'sī', '丝线的丝'],
  ['zh', 'initial', '舌尖翘起靠近硬腭前部，轻轻放开。', '蜘蛛的蜘', 'zhī', '蜘蛛的蜘'],
  ['ch', 'initial', '舌尖翘起靠近硬腭前部，送出一口气。', '吃饭的吃', 'chī', '吃饭的吃'],
  ['sh', 'initial', '舌尖翘起靠近硬腭前部，让气流擦过。', '狮子的狮', 'shī', '狮子的狮'],
  ['r', 'initial', '舌尖翘起，轻轻振动声带发音。', '太阳的日', 'rì', '太阳的日'],
  ['y', 'initial', '口型像i，拼读时轻轻带过。', '大树的叶', 'yè', '大树的叶'],
  ['w', 'initial', '嘴唇拢圆，拼读时轻轻滑向后面的韵母。', '青蛙的蛙', 'wā', '青蛙的蛙'],
  ['ai', 'final', '先张嘴发a，再慢慢滑向i，连成一个音。', '矮小的矮', 'ǎi', '矮小的矮'],
  ['ei', 'final', '从e的口型开始，慢慢滑向i。', '杯子的杯', 'bēi', '杯子的杯'],
  ['ui', 'final', '先拢圆嘴唇，再滑向ei的口型。', '喝水的水', 'shuǐ', '喝水的水'],
  ['ao', 'final', '先张大嘴巴，再慢慢拢圆嘴唇。', '棉袄的袄', 'ǎo', '棉袄的袄'],
  ['ou', 'final', '从圆圆的o开始，再把嘴唇收小。', '海鸥的鸥', 'ōu', '海鸥的鸥'],
  ['iu', 'final', '先展开嘴角发i，再滑向ou的口型。', '小牛的牛', 'niú', '小牛的牛'],
  ['ie', 'final', '先展开嘴角发i，再把嘴巴打开一些。', '大树的叶', 'yè', '大树的叶'],
  ['üe', 'final', '从ü的圆嘴口型开始，再把嘴巴打开。', '月亮的月', 'yuè', '月亮的月'],
  ['er', 'final', '嘴巴半开，舌尖轻轻向上卷起。', '耳朵的耳', 'ěr', '耳朵的耳'],
  ['an', 'final', '先张嘴发a，再用舌尖抵住上牙床收尾。', '安全的安', 'ān', '安全的安'],
  ['en', 'final', '从e开始，舌尖抵住上牙床，用鼻音收尾。', '大门的门', 'mén', '大门的门'],
  ['in', 'final', '先展开嘴角发i，再把舌尖抵住上牙床。', '音乐的音', 'yīn', '音乐的音'],
  ['un', 'final', '先拢圆嘴唇，再滑向en，用舌尖收尾。', '车轮的轮', 'lún', '车轮的轮'],
  ['ün', 'final', '先用ü的圆嘴口型，再把舌尖抵住上牙床。', '白云的云', 'yún', '白云的云'],
  ['ang', 'final', '先张大嘴，再抬起舌根，用后鼻音收尾。', '糖果的糖', 'táng', '糖果的糖'],
  ['eng', 'final', '从e开始，抬起舌根，用后鼻音收尾。', '台灯的灯', 'dēng', '台灯的灯'],
  ['ing', 'final', '先展开嘴角发i，再抬起舌根用鼻音收尾。', '星星的星', 'xīng', '星星的星'],
  ['ong', 'final', '嘴唇拢圆，舌根抬起，用后鼻音收尾。', '时钟的钟', 'zhōng', '时钟的钟'],
];
export const PINYIN_ITEMS = Object.fromEntries(rows.map(([symbol, kind, hint, example, examplePinyin, speech]) => [symbol, { symbol, kind, hint, example, examplePinyin, speech }]));
PINYIN_ITEMS.o.referenceNote = '喔是多音字，合成语音可能读成别的音。这里请看口型，由大人示范ō。';

export const PINYIN_TONES = [
  { number: 1, mark: 'ˉ', name: '一声', hint: '高高平平，声音走平路。', path: 'M12 25H88' },
  { number: 2, mark: 'ˊ', name: '二声', hint: '从低往高，声音上小坡。', path: 'M12 66L88 22' },
  { number: 3, mark: 'ˇ', name: '三声', hint: '先降再升，声音拐个弯。', path: 'M12 35L45 72L88 20' },
  { number: 4, mark: 'ˋ', name: '四声', hint: '从高往低，声音下小坡。', path: 'M12 22L88 72' },
];

const toneExamples = [
  { id: 'ma-1', variants: ['mā', 'má', 'mǎ', 'mà'], tone: 1, example: '妈妈的妈', speech: '妈妈的妈，一声。' },
  { id: 'ma-2', variants: ['mā', 'má', 'mǎ', 'mà'], tone: 2, example: '麻花的麻', speech: '麻花的麻，二声。' },
  { id: 'ma-3', variants: ['mā', 'má', 'mǎ', 'mà'], tone: 3, example: '小马的马', speech: '小马的马，三声。' },
  { id: 'shu-1', variants: ['shū', 'shú', 'shǔ', 'shù'], tone: 1, example: '图书的书', speech: '图书的书，一声。' },
  { id: 'shu-3', variants: ['shū', 'shú', 'shǔ', 'shù'], tone: 3, example: '老鼠的鼠', speech: '老鼠的鼠，三声。' },
  { id: 'shu-4', variants: ['shū', 'shú', 'shǔ', 'shù'], tone: 4, example: '大树的树', speech: '大树的树，四声。' },
  { id: 'yi-1', variants: ['yī', 'yí', 'yǐ', 'yì'], tone: 1, example: '衣服的衣', speech: '衣服的衣，一声。' },
  { id: 'yi-3', variants: ['yī', 'yí', 'yǐ', 'yì'], tone: 3, example: '椅子的椅', speech: '椅子的椅，三声。' },
  { id: 'tu-4', variants: ['tū', 'tú', 'tǔ', 'tù'], tone: 4, example: '小兔的兔', speech: '小兔的兔，四声。' },
  { id: 'ni-2', variants: ['nī', 'ní', 'nǐ', 'nì'], tone: 2, example: '泥土的泥', speech: '泥土的泥，二声。' },
];

const shuffle = (values, random) => {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export function buildPinyinRounds(type, random = Math.random) {
  if (type === 'listen') {
    // These examples have straightforward written finals; spelling changes
    // such as yu/ü and ye/ie are introduced in lessons before being practised.
    const pool = ['a', 'e', 'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'er', 'an', 'en', 'un', 'ang', 'eng', 'ing', 'ong'];
    return shuffle(pool, random).slice(0, 5).map(symbol => ({
      id: `listen-${symbol}`, answer: symbol, symbol,
      prompt: '听听例字，找韵母', display: '♪',
      hint: `${PINYIN_ITEMS[symbol].example}（${PINYIN_ITEMS[symbol].examplePinyin}），找它的韵母。${PINYIN_ITEMS[symbol].hint}`,
      speech: `${PINYIN_ITEMS[symbol].speech}。找找这个字的韵母。`,
      explanation: `${PINYIN_ITEMS[symbol].example}（${PINYIN_ITEMS[symbol].examplePinyin}）的韵母是 ${symbol}。`,
      choices: shuffle([symbol, ...shuffle(pool.filter(item => item !== symbol), random).slice(0, 2)], random).map(value => ({ value, label: value })),
    }));
  }
  if (type === 'sort') {
    return shuffle(Object.values(PINYIN_ITEMS), random).slice(0, 5).map(item => ({
      id: `sort-${item.symbol}`, answer: item.kind, symbol: item.symbol, display: item.symbol,
      prompt: '送拼音朋友回家', speech: '这个拼音朋友住在声母家，还是韵母家？',
      hint: `${item.symbol}是${item.kind === 'initial' ? '声母，发音轻而短' : '韵母，发音响而长'}。${item.hint}`,
      explanation: `${item.symbol}住在${item.kind === 'initial' ? '声母' : '韵母'}家。`,
      choices: [{ value: 'initial', label: '声母家', small: '轻轻短短' }, { value: 'final', label: '韵母家', small: '响亮一些' }],
    }));
  }
  if (type === 'tones') {
    return shuffle(toneExamples, random).slice(0, 5).map(item => ({
      id: `tones-${item.id}`, answer: item.variants[item.tone - 1], tone: item.tone,
      display: item.example.slice(-1), prompt: `给「${item.example.slice(-1)}」戴上声调小帽子`, speech: item.speech,
      hint: `${item.example}，${PINYIN_TONES[item.tone - 1].name}。${PINYIN_TONES[item.tone - 1].hint}`,
      explanation: `${item.example}读${PINYIN_TONES[item.tone - 1].name}：${item.variants[item.tone - 1]}。`,
      choices: item.variants.map(value => ({ value, label: value })),
    }));
  }
  throw new Error(`Unknown pinyin game: ${type}`);
}
