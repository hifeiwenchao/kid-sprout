import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as nativeExport from '../scripts/export-native-content.mjs';
import { NUMBER_VALUES, numberName } from '../src/courses/number-data.js';
import { PINYIN_ITEMS, PINYIN_LESSONS, PINYIN_TONES } from '../src/courses/pinyin-data.js';
import { ALPHABET, ALPHABET_GROUPS } from '../src/courses/alphabet-data.js';
import { GAME_CATALOG } from '../src/game-catalog.js';

const { buildCurriculum } = nativeExport;

test('native offline curriculum preserves every number, 2024 pinyin lesson, and letter', () => {
  const data = buildCurriculum();
  assert.equal(data.schemaVersion, 1);
  assert.equal(data.brand, '萌芽启蒙');
  assert.deepEqual(data.numbers.map(({ value, name }) => ({ value, name })), NUMBER_VALUES.map(value => ({ value, name: numberName(value) })));
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

test('native curriculum provides the original motifs, memory frames, and paired tracing guides', () => {
  const data = buildCurriculum();
  assert.ok(data.numbers.every(item => item.motifAsset && item.fruit && item.unit));
  assert.equal(data.numbers[0].fruit, '苹果');
  assert.equal(data.numbers[7].fruit, '小树');
  assert.equal(data.memoryScenes.length, 11 + 47 + 4 + 26);
  for (const scene of data.memoryScenes) {
    assert.equal(scene.frames.length, 3);
    assert.equal(new Set(scene.frames).size, 3);
    assert.ok(scene.frames.every(name => /^[a-z0-9_-]+$/.test(name)));
    assert.ok(scene.title && scene.description);
  }
  assert.equal(data.tracingTemplates.length, 37);
  assert.equal(data.tracingTemplates.find(item => item.id === 'alphabet:Aa').group, 'alphabet');
});

test('native activity export preserves all 60 games, eight deterministic sets, and original round counts', () => {
  assert.equal(typeof nativeExport.buildActivities, 'function', 'missing native activity exporter');
  const data = nativeExport.buildActivities();
  assert.equal(data.schemaVersion, 1);
  assert.equal(data.games.length, 60);
  assert.deepEqual(data.games.map(({ id }) => id), GAME_CATALOG.map(game => `${game.subject}-${game.type}`));
  const modes = new Set();
  for (const subject of ['numbers', 'pinyin', 'alphabet']) assert.equal(data.games.filter(game => game.subject === subject).length, 20);
  for (const game of data.games) {
    assert.equal(game.sets.length, 8, game.id);
    const length = ['numbers-memory', 'numbers-balloons'].includes(game.id) ? 3 : game.id === 'numbers-trace' ? 1 : 5;
    for (const rounds of game.sets) {
      assert.equal(rounds.length, length, game.id);
      for (const round of rounds) {
        modes.add(round.mode);
        assert.ok(round.id && round.prompt, game.id);
        assert.ok(Array.isArray(round.answer), game.id);
        assert.ok(Array.isArray(round.choices), game.id);
        assert.equal(new Set(round.choices.map(choice => choice.value)).size, round.choices.length, game.id);
        if (round.mode === 'build') assert.ok(Number(round.answer[0]) >= 0 && Number(round.answer[0]) <= round.max, game.id);
        else if (!['memory', 'trace'].includes(round.mode)) {
          for (const answer of round.answer) assert.equal(round.choices.filter(choice => choice.value === answer).length, 1, game.id);
        }
        if (round.mode === 'memory') {
          const matches = new Map();
          for (const choice of round.choices) matches.set(choice.match, (matches.get(choice.match) || 0) + 1);
          assert.deepEqual([...matches.values()], [2, 2, 2]);
        }
        assert.doesNotMatch(JSON.stringify(round), /<\/?(?:div|span|svg|table|tr|td|path|strong)\b/);
        assert.equal('visual' in round, false);
      }
    }
  }
  assert.deepEqual([...modes].sort(), ['balloons', 'build', 'choice', 'memory', 'select', 'sequence', 'trace']);
  assert.deepEqual(nativeExport.buildActivities(), data);
});

test('native visual descriptions retain separate collections and the two five-cell rows', () => {
  assert.equal(typeof nativeExport.buildActivities, 'function', 'missing native activity exporter');
  const data = nativeExport.buildActivities();
  const combined = data.games.find(game => game.type === 'block-combine').sets.flat();
  assert.ok(combined.every(round => round.visualText.includes('＋') && round.visualText.includes('\n')));
  const frames = data.games.find(game => game.type === 'ten-frame').sets.flat();
  assert.ok(frames.every(round => round.visualText.split('\n').filter(line => /^[🌼○ ]+$/u.test(line)).length === 2));
  const scenes = Object.fromEntries(data.games.filter(game => game.subject === 'numbers').map(game => [game.type, game.sets[0][0].scene]));
  assert.equal(scenes.count, 'fruit');
  assert.equal(scenes.compare, 'compare');
  assert.equal(scenes.train, 'train');
  assert.equal(scenes.drum, 'drum');
  assert.equal(scenes.picnic, 'picnic');
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
