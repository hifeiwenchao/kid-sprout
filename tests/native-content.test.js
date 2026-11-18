import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildCurriculum } from '../scripts/export-native-content.mjs';
import { NUMBER_VALUES, numberName } from '../src/courses/number-data.js';
import { PINYIN_ITEMS, PINYIN_LESSONS, PINYIN_TONES } from '../src/courses/pinyin-data.js';
import { ALPHABET, ALPHABET_GROUPS } from '../src/courses/alphabet-data.js';

test('native offline curriculum preserves every number, 2024 pinyin lesson, and letter', () => {
  const data = buildCurriculum();
  assert.equal(data.schemaVersion, 1);
  assert.equal(data.brand, '萌芽启蒙');
  assert.deepEqual(data.numbers, NUMBER_VALUES.map(value => ({ value, name: numberName(value) })));
  assert.equal(data.numbers.length, 11);
  assert.deepEqual(data.pinyin.lessons, PINYIN_LESSONS);
  assert.equal(data.pinyin.lessons.length, 14);
  assert.deepEqual(data.pinyin.lessons[8].symbols, ['y', 'w']);
  assert.deepEqual(data.pinyin.items, Object.values(PINYIN_ITEMS));
  assert.equal(data.pinyin.items.length, 47);
  assert.deepEqual(data.pinyin.tones, PINYIN_TONES);
  assert.deepEqual(data.alphabet.letters, ALPHABET);
  assert.equal(data.alphabet.letters.length, 26);
  assert.deepEqual(data.alphabet.groups, ALPHABET_GROUPS);
});

test('native exports can be modified without mutating the website curriculum', () => {
  const original = JSON.stringify(buildCurriculum());
  const modified = buildCurriculum();
  modified.pinyin.lessons[0].symbols.push('invalid');
  modified.alphabet.letters[0].word = 'invalid';
  assert.equal(JSON.stringify(buildCurriculum()), original);
});

test('committed offline resource is current and deterministic', async () => {
  const resource = await readFile(new URL('../native/shared/curriculum.json', import.meta.url), 'utf8');
  assert.equal(resource, `${JSON.stringify(buildCurriculum(), null, 2)}\n`);
});
