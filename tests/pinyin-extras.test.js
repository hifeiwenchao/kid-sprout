import test from 'node:test';
import assert from 'node:assert/strict';
import { PINYIN_EXTRA_GAMES, buildPinyinExtraRounds } from '../src/courses/pinyin-extras.js';
import { PINYIN_LESSONS } from '../src/courses/pinyin-data.js';

const allRounds = type => [0, .23, .71, 1].flatMap(value => buildPinyinExtraRounds(type, () => value));
const selectedValues = (round, valid) => round.choices.map(choice => choice.value).filter(value => valid.has(value)).sort();

test('17种新拼音挑战能用公共播放器生成完整题目，极端随机值也保持答案可选且不重复', () => {
  assert.equal(PINYIN_EXTRA_GAMES.length, 17);
  assert.equal(new Set(PINYIN_EXTRA_GAMES.map(game => game.type)).size, 17);
  const modes = new Set();
  const snapshot = JSON.stringify(PINYIN_LESSONS);
  for (const game of PINYIN_EXTRA_GAMES) {
    assert.equal(game.subject, 'pinyin');
    assert.ok(['recognize', 'listen', 'think', 'build'].includes(game.category));
    for (const key of ['title', 'description', 'symbol', 'skill']) assert.ok(game[key], `${game.type}: ${key}`);
    for (const value of [0, .23, .71, 1]) {
      const rounds = buildPinyinExtraRounds(game.type, () => value);
      assert.equal(rounds.length, 5, game.type);
      assert.equal(new Set(rounds.map(round => round.id)).size, 5, game.type);
      assert.deepEqual(rounds, buildPinyinExtraRounds(game.type, () => value));
      for (const round of rounds) {
        modes.add(round.mode || 'choice');
        for (const key of ['id', 'prompt', 'display', 'hint', 'explanation']) assert.ok(round[key], `${game.type}: ${key}`);
        assert.ok(round.choices.length >= 2);
        const values = round.choices.map(choice => choice.value);
        assert.equal(new Set(values).size, values.length, round.id);
        assert.ok(round.choices.every(choice => typeof choice.value === 'string' && choice.label));
        const answers = Array.isArray(round.answer) ? round.answer : [round.answer];
        assert.ok(answers.length > 0);
        assert.equal(new Set(answers).size, answers.length, round.id);
        for (const answer of answers) assert.equal(values.filter(value => value === answer).length, 1, round.id);
        if (round.speech) {
          assert.match(round.speech, /[\u4e00-\u9fff]/u);
          assert.doesNotMatch(round.speech, /喔|标准拼音|标准录音/);
        }
      }
    }
  }
  assert.ok(['choice', 'select', 'sequence', 'build'].every(mode => modes.has(mode)));
  assert.equal(JSON.stringify(PINYIN_LESSONS), snapshot);
  assert.throws(() => buildPinyinExtraRounds('missing'), /Unknown/);
});

test('单韵母、复韵母和整体认读的多选答案严格对应各自集合，er不混入复韵母', () => {
  const categories = {
    'single-finals': new Set(['a', 'o', 'e', 'i', 'u', 'ü']),
    'compound-finals': new Set(['ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe']),
    'whole-syllables': new Set(['zi', 'ci', 'si', 'zhi', 'chi', 'shi', 'ri', 'yi', 'wu', 'yu', 'ye', 'yue', 'yuan', 'yin', 'yun', 'ying']),
  };
  for (const [type, valid] of Object.entries(categories)) {
    for (const round of allRounds(type)) {
      assert.equal(round.mode, 'select');
      assert.deepEqual([...round.answer].sort(), selectedValues(round, valid), round.id);
      assert.ok(round.answer.length < round.choices.length, round.id);
    }
  }
});

test('平翘舌及前后鼻音分类使用正确边界，ng作为后鼻音整体保留', () => {
  const initials = {
    flat: new Set(['z', 'c', 's']),
    retroflex: new Set(['zh', 'ch', 'sh', 'r']),
  };
  for (const round of allRounds('flat-retroflex')) {
    const valid = initials[round.targetKind];
    assert.ok(valid);
    assert.deepEqual([...round.answer].sort(), selectedValues(round, valid), round.id);
  }
  const finals = { an: 'front', en: 'front', in: 'front', un: 'front', ün: 'front', ang: 'back', eng: 'back', ing: 'back', ong: 'back' };
  for (const round of allRounds('nasal-finals')) assert.equal(round.answer, finals[round.display], round.id);
});

test('例字声母听辨与n/l区分依据完整中文例字，避免把原始拼音交给中文合成器', () => {
  const initials = { 波: 'b', 坡: 'p', 马: 'm', 风: 'f', 大: 'd', 土: 't', 哥: 'g', 口: 'k', 河: 'h', 鸡: 'j', 气: 'q', 西: 'x' };
  for (const round of allRounds('initial-listen')) assert.equal(round.answer, initials[round.display], round.id);
  const nasalLateral = { 牛: 'n', 鹿: 'l', 鸟: 'n', 梨: 'l', 奶: 'n', 路: 'l' };
  for (const round of allRounds('nasal-lateral')) {
    assert.equal(round.answer, nasalLateral[round.display], round.id);
    assert.ok(round.speech.includes(round.display));
  }
});

test('形近声母按半圆左右上下与门的数量辨认，b d p q不会镜像混淆', () => {
  const shapes = { 右下半圆: 'b', 左下半圆: 'd', 右上半圆: 'p', 左上半圆: 'q', 一扇小门: 'n', 两扇小门: 'm' };
  for (const round of allRounds('initial-shapes')) assert.equal(round.answer, shapes[round.display], round.id);
});

test('声调数字与声调符号一致，标调覆盖a优先、oe及iu/ui后标规则', () => {
  const tones = ['āēīōūǖ', 'áéíóúǘ', 'ǎěǐǒǔǚ', 'àèìòùǜ'];
  for (const round of allRounds('tone-numbers')) {
    const tone = tones.findIndex(group => [...round.display].some(letter => group.includes(letter))) + 1;
    assert.equal(round.answer, String(tone), round.id);
  }
  const correct = {
    'tone-placement-bai': 'bái', 'tone-placement-kou': 'kǒu', 'tone-placement-shui': 'shuǐ',
    'tone-placement-liu': 'liù', 'tone-placement-xie': 'xié', 'tone-placement-jiao': 'jiǎo',
    'tone-placement-fei': 'fēi',
  };
  const seen = new Set();
  for (const round of allRounds('tone-placement')) {
    assert.equal(round.answer, correct[round.id], round.id);
    seen.add(round.id);
  }
  assert.ok(seen.has('tone-placement-shui') && seen.has('tone-placement-liu'));
});

test('j q x相拼省去ü两点，而n l相拼保留两点，不能把ü读成u', () => {
  const hidden = { 'j + ü': 'ju', 'q + ü': 'qu', 'x + ü': 'xu', 'j + üe': 'jue', 'q + üe': 'que', 'x + üe': 'xue' };
  for (const round of allRounds('umlaut-hidden')) assert.equal(round.answer, hidden[round.display], round.id);
  const retained = { 'n + ǚ': 'nǚ', 'l + ǜ': 'lǜ', 'l + ǚ': 'lǚ', 'n + üè': 'nüè', 'l + üè': 'lüè' };
  for (const round of allRounds('umlaut-keep')) assert.equal(round.answer, retained[round.display], round.id);
});

test('两拼合成与三拼排列保留韵母边界，三拼不误用ui iu un的书写缩略形式', () => {
  const blends = { 'd + à': 'dà', 'm + ǎ': 'mǎ', 'b + ái': 'bái', 'g + ǒu': 'gǒu', 'h + é': 'hé', 'n + iú': 'niú', 'sh + uǐ': 'shuǐ' };
  for (const round of allRounds('syllable-blend')) assert.equal(round.answer, blends[round.display], round.id);
  const triples = { 瓜: ['g', 'u', 'ā'], 花: ['h', 'u', 'ā'], 朵: ['d', 'u', 'ǒ'], 虾: ['x', 'i', 'ā'], 假: ['j', 'i', 'ǎ'] };
  for (const round of allRounds('triple-spelling')) {
    assert.equal(round.mode, 'sequence');
    assert.deepEqual(round.answer, triples[round.display], round.id);
  }
});

test('课次排序沿用2024教材14课的真实顺序，y w紧随翘舌声母', () => {
  for (const round of allRounds('lesson-trail')) {
    assert.equal(round.mode, 'sequence');
    const numbers = round.answer.map(title => PINYIN_LESSONS.find(lesson => lesson.title === title)?.number);
    assert.ok(numbers.every(Number.isInteger));
    assert.deepEqual(numbers, [...numbers].sort((a, b) => a - b), round.id);
  }
});

test('音节小鼓手按实际音节数量搭鼓，轻声音节也单独计数', () => {
  const syllables = { 鱼: 1, 小兔: 2, 妈妈: 2, 胡萝卜: 3, 大西瓜: 3, 我爱读书: 4, 幼儿园里: 4 };
  for (const round of allRounds('syllable-beats')) {
    assert.equal(round.mode, 'build');
    assert.equal(round.answer, String(syllables[round.display]), round.id);
    assert.ok(Number(round.answer) <= round.max);
    assert.equal(round.item, '🥁');
  }
});

test('同韵母音节分组正确识别ui iu un，保留书写缩略形式作为完整韵母', () => {
  const families = {
    ai: new Set(['bái', 'hǎi', 'cài']),
    ao: new Set(['māo', 'bǎo', 'hǎo']),
    ui: new Set(['shuǐ', 'duì', 'huī']),
    iu: new Set(['niú', 'liù', 'qiū']),
    un: new Set(['lún', 'cūn', 'sūn']),
  };
  for (const round of allRounds('final-family')) {
    assert.equal(round.mode, 'select');
    assert.deepEqual([...round.answer].sort(), selectedValues(round, families[round.display]), round.id);
    assert.equal(round.answer.length, 3);
  }
});

test('播放器修改已生成的多选答案与选项时不会污染下一次开局', () => {
  const rounds = buildPinyinExtraRounds('final-family', () => 0);
  const expected = structuredClone(rounds);
  rounds[0].answer.pop();
  rounds[0].choices[0].value = 'changed';
  rounds[0].choices.pop();
  assert.deepEqual(buildPinyinExtraRounds('final-family', () => 0), expected);
});
