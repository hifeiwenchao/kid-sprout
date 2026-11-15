import test from 'node:test';
import assert from 'node:assert/strict';
import { PINYIN_ITEMS, PINYIN_LESSONS } from '../src/courses/pinyin-data.js';
import { getPinyinMemory, getToneMemory } from '../src/courses/pinyin-memory.js';

test('every taught initial and final has a visual memory scene without changing the curriculum', () => {
  const lessonOrder = PINYIN_LESSONS.map(lesson => lesson.title);
  for (const symbol of Object.keys(PINYIN_ITEMS)) {
    const scene = getPinyinMemory(symbol);
    assert.equal(scene.symbol, symbol);
    assert.ok(scene.title && scene.description, symbol);
    assert.match(scene.art, /<svg viewBox="0 0 320 180"/);
    assert.match(scene.art, /memory-art-shape/);
    assert.doesNotMatch(scene.art, /https?:|<script|<animate/);
  }
  assert.deepEqual(PINYIN_LESSONS.map(lesson => lesson.title), lessonOrder);
  assert.equal(getPinyinMemory('unknown'), null);
  assert.equal(getPinyinMemory('__proto__'), null);
});

test('similar shapes keep their direction, dot count and gate count distinctions', () => {
  assert.match(getPinyinMemory('b').title, /右下/);
  assert.match(getPinyinMemory('p').title, /右上/);
  assert.match(getPinyinMemory('d').title, /左下/);
  assert.match(getPinyinMemory('q').title, /左上/);
  assert.match(getPinyinMemory('m').title, /两扇/);
  assert.match(getPinyinMemory('n').title, /一扇/);
  assert.match(getPinyinMemory('i').description, /一个点/);
  assert.match(getPinyinMemory('ü').description, /两点/);
});

test('glides and nasal endings preserve pronunciation distinctions and abbreviated spellings', () => {
  assert.match(getPinyinMemory('ui').description, /uei.*简写/);
  assert.match(getPinyinMemory('iu').description, /iou.*简写/);
  assert.match(getPinyinMemory('un').description, /uen.*简写/);
  for (const symbol of ['an', 'en', 'in', 'un', 'ün']) assert.match(getPinyinMemory(symbol).description, /舌尖/);
  for (const symbol of ['ang', 'eng', 'ing', 'ong']) assert.match(getPinyinMemory(symbol).description, /舌根/);
  for (const symbol of ['zh', 'ch', 'sh']) assert.match(getPinyinMemory(symbol).description, /舌尖翘起/);
  assert.match(getPinyinMemory('z').description, /平伸/);
});

test('the four tone scenes use their actual direction paths for the traveling car', () => {
  const expected = ['M12 25H88', 'M12 66L88 22', 'M12 35L45 72L88 20', 'M12 22L88 72'];
  for (let number = 1; number <= 4; number++) {
    const scene = getToneMemory(number);
    assert.ok(scene.title && scene.description);
    assert.ok(scene.art.includes(`offset-path:path('${expected[number - 1]}')`));
  }
  assert.equal(getToneMemory(0), null);
  assert.equal(getToneMemory(5), null);
});
