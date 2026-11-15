import test from 'node:test';
import assert from 'node:assert/strict';
import { ALPHABET } from '../src/courses/alphabet-data.js';
import { getTracingTemplate } from '../src/drawing-tracing.js';
import { ALPHABET_MEMORY_SCENES, getAlphabetMemoryScene } from '../src/courses/alphabet-memory.js';

test('every alphabet lesson has its own shape analogy and paired handwriting scene', () => {
  assert.equal(ALPHABET_MEMORY_SCENES.length, 26);
  assert.equal(new Set(ALPHABET_MEMORY_SCENES.map(scene => scene.title)).size, 26);
  assert.equal(new Set(ALPHABET_MEMORY_SCENES.map(scene => scene.art)).size, 26);
  for (const letter of ALPHABET) {
    const scene = getAlphabetMemoryScene(letter.id);
    const pair = letter.uppercase + letter.lowercase;
    assert.equal(scene.symbol, pair);
    assert.equal(scene.description, letter.hint);
    assert.match(scene.art, /viewBox="0 0 320 180"/);
    assert.match(scene.art, /class="memory-art-object"/);
    assert.match(scene.art, /class="memory-art-shape"/);
    for (const glyph of getTracingTemplate('alphabet', pair).glyphs) {
      for (const path of glyph.paths) assert.ok(scene.art.includes(`d="${path}" pathLength="1"`), pair);
    }
    assert.equal(getAlphabetMemoryScene(letter.lowercase), scene);
  }
});

test('letter shape reminders preserve the distinguishing dots, tails and left or right placement', () => {
  assert.match(getAlphabetMemoryScene('B').description, /两个.*一个/);
  assert.match(getAlphabetMemoryScene('D').description, /左边/);
  assert.match(getAlphabetMemoryScene('G').description, /尾巴.*下/);
  assert.match(getAlphabetMemoryScene('I').description, /圆点/);
  assert.match(getAlphabetMemoryScene('J').description, /圆点/);
  assert.match(getAlphabetMemoryScene('Q').description, /右边/);
  for (const invalid of [null, undefined, '', 'Aa', 'AA', '0', 1]) assert.equal(getAlphabetMemoryScene(invalid), null);
});
