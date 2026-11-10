import test from 'node:test';
import assert from 'node:assert/strict';
import { restoreLearningProgress, serializeLearningProgress, viewFromHash } from '../src/hub-state.js';

const allowed = { pinyin: ['lesson-1', 'lesson-2'], alphabet: ['A', 'B'] };

test('unavailable, corrupt, and non-object storage produces empty learning records', () => {
  for (const raw of [null, '', 'broken', 'null', '[]', 'false']) {
    const value = restoreLearningProgress(raw, allowed);
    assert.deepEqual([...value.pinyin], []);
    assert.deepEqual([...value.alphabet], []);
  }
});

test('saved records only restore valid, unique lesson and letter ids', () => {
  const value = restoreLearningProgress(JSON.stringify({ pinyin: ['lesson-1', 'lesson-1', 'A', 2], alphabet: ['A', 'Z', 'A', null] }), allowed);
  assert.deepEqual([...value.pinyin], ['lesson-1']);
  assert.deepEqual([...value.alphabet], ['A']);
});

test('bad individual fields do not erase another subject and saved progress round trips', () => {
  const value = restoreLearningProgress('{"pinyin": {}, "alphabet": ["B"]}', allowed);
  value.pinyin.add('lesson-2');
  const restored = restoreLearningProgress(serializeLearningProgress(value), allowed);
  assert.deepEqual([...restored.pinyin], ['lesson-2']);
  assert.deepEqual([...restored.alphabet], ['B']);
});

test('hash navigation resolves known subject views and safely defaults unknown paths', () => {
  for (const view of ['home', 'numbers', 'pinyin', 'alphabet', 'games']) assert.equal(viewFromHash('#' + view), view);
  for (const hash of ['', '#missing', '#%bad', '#__proto__']) assert.equal(viewFromHash(hash), 'home');
});
