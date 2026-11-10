import test from 'node:test';
import assert from 'node:assert/strict';
import { PINYIN_LESSONS, PINYIN_PROGRESS_IDS, PINYIN_ITEMS, PINYIN_SOURCES, buildPinyinRounds } from '../src/courses/pinyin-data.js';
import { renderPinyinPage, createPinyinCourse } from '../src/courses/pinyin.js';

test('2024教材的14课顺序及三个单元完整保留，y w独立为第9课', () => {
  assert.deepEqual(PINYIN_LESSONS.map(lesson => lesson.symbols.join(' ')), [
    'a o e', 'i u ü', 'b p m f', 'd t n l', 'g k h', 'j q x', 'z c s', 'zh ch sh r', 'y w',
    'ai ei ui', 'ao ou iu', 'ie üe er', 'an en in un ün', 'ang eng ing ong',
  ]);
  assert.deepEqual(PINYIN_LESSONS.map(lesson => lesson.unit), [2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4]);
  assert.deepEqual(PINYIN_PROGRESS_IDS, Array.from({ length: 14 }, (_, i) => `lesson-${i + 1}`));
  assert.equal(new Set(PINYIN_PROGRESS_IDS).size, 14);
  assert.ok(PINYIN_SOURCES.some(source => source.url.includes('shimengyuan.com/jiaocais/1n2589.html')));
});

test('23个声母和24个韵母各出现一次，每项有口型提示与例字音节', () => {
  const symbols = PINYIN_LESSONS.flatMap(lesson => lesson.symbols);
  assert.equal(new Set(symbols).size, 47);
  assert.equal(symbols.filter(symbol => PINYIN_ITEMS[symbol].kind === 'initial').length, 23);
  assert.equal(symbols.filter(symbol => PINYIN_ITEMS[symbol].kind === 'final').length, 24);
  for (const symbol of symbols) {
    const item = PINYIN_ITEMS[symbol];
    assert.ok(item.hint.length >= 6, symbol);
    assert.ok(item.example.length > 0, symbol);
    assert.ok(item.examplePinyin.length > 0, symbol);
    assert.ok(/[\u4e00-\u9fff]/u.test(item.speech), symbol);
  }
});

test('16个整体认读音节在相应课次教学，每课都有自主编写的拼读示例', () => {
  const whole = PINYIN_LESSONS.flatMap(lesson => lesson.readSyllables || []);
  assert.deepEqual(whole, ['zi', 'ci', 'si', 'zhi', 'chi', 'shi', 'ri', 'yi', 'wu', 'yu', 'ye', 'yue', 'yuan', 'yin', 'yun', 'ying']);
  assert.deepEqual(PINYIN_LESSONS[8].readSyllables, ['yi', 'wu', 'yu']);
  assert.ok(PINYIN_LESSONS.every(lesson => lesson.spellings.length > 0));
  assert.ok(PINYIN_LESSONS[5].rule.includes('ü'));
  assert.ok(PINYIN_LESSONS[11].readSyllables.includes('yue'));
  assert.equal(PINYIN_ITEMS.o.examplePinyin, 'ō');
  assert.ok(PINYIN_ITEMS.o.referenceNote.includes('口型'));
  for (const value of [0, .2, .7, .999]) {
    assert.ok(buildPinyinRounds('listen', () => value).every(round => round.symbol !== 'o'));
  }
});

test('三个游戏都生成5关唯一正确选项，固定随机源可重复且不会改课程', () => {
  const snapshot = JSON.stringify(PINYIN_LESSONS);
  for (const type of ['listen', 'sort', 'tones']) {
    for (const value of [0, .2, .7, .999]) {
      const rounds = buildPinyinRounds(type, () => value);
      assert.equal(rounds.length, 5);
      assert.equal(new Set(rounds.map(round => round.id)).size, 5);
      assert.deepEqual(rounds, buildPinyinRounds(type, () => value));
      for (const round of rounds) {
        assert.equal(round.choices.filter(choice => choice.value === round.answer).length, 1);
        assert.equal(new Set(round.choices.map(choice => choice.value)).size, round.choices.length);
        assert.ok(round.hint);
        assert.ok(round.speech);
      }
    }
  }
  assert.equal(JSON.stringify(PINYIN_LESSONS), snapshot);
  assert.throws(() => buildPinyinRounds('unknown'), /Unknown/);
});

test('学习页渲染14个可操作课次和20种游戏，并公开约定接口', () => {
  const html = renderPinyinPage();
  assert.equal((html.match(/data-pinyin-lesson="lesson-/g) || []).length, 14);
  assert.equal((html.match(/data-play="pinyin:/g) || []).length, 20);
  assert.match(html, /2024/);
  assert.match(html, /例字读音参考/);
  const course = createPinyinCourse({ learned: new Set() });
  for (const method of ['bind', 'openLesson', 'startGame', 'refreshProgress']) assert.equal(typeof course[method], 'function');
});
