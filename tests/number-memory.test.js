import test from 'node:test';
import assert from 'node:assert/strict';
import { NUMBER_VALUES } from '../src/courses/number-data.js';
import { NUMBER_MEMORY_SCENES, getNumberMemoryScene } from '../src/courses/number-memory.js';

test('every number lesson has its own local illustration and matching numeral', () => {
  assert.equal(NUMBER_MEMORY_SCENES.length, NUMBER_VALUES.length);
  for (const number of NUMBER_VALUES) {
    const scene = getNumberMemoryScene(number);
    assert.equal(scene.symbol, String(number));
    assert.ok(scene.title && scene.description);
    assert.match(scene.art, /viewBox="0 0 320 180"/);
    assert.match(scene.art, /class="memory-art-object"/);
    assert.match(scene.art, /class="memory-art-shape" pathLength="1"/);
    assert.doesNotMatch(scene.art, /<script|https?:|<image/i);
  }
  assert.equal(new Set(NUMBER_MEMORY_SCENES.map(scene => scene.art)).size, 11);
});

test('zero keeps its quantity meaning and ten explains its two written digits', () => {
  assert.match(getNumberMemoryScene(0).description, /一个也没有.*0/);
  assert.match(getNumberMemoryScene(10).description, /左边是 1，右边是 0/);
  assert.match(getNumberMemoryScene(10).description, /十个/);
});

test('invalid number ids cannot open an unrelated memory scene', () => {
  for (const number of [-1, 11, '0', null, NaN, 1.5]) assert.equal(getNumberMemoryScene(number), null);
});
