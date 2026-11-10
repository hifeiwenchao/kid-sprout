import test from 'node:test';
import assert from 'node:assert/strict';
import { ALPHABET } from '../src/courses/alphabet-data.js';

const extras = await import('../src/courses/alphabet-extras.js').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});

const TYPES = [
  'alphabet-next', 'alphabet-previous', 'alphabet-between', 'alphabet-upper',
  'alphabet-word-initial', 'alphabet-word-picture', 'alphabet-picture-word',
  'alphabet-listen-word', 'alphabet-listen-pair', 'alphabet-vowels',
  'alphabet-consonants', 'alphabet-same-letter', 'alphabet-forward',
  'alphabet-backward', 'alphabet-word-build', 'alphabet-missing-word',
  'alphabet-word-count',
];

function seededRandom(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function rounds(type, random = seededRandom(42)) {
  assert.equal(typeof extras.buildAlphabetExtraRounds, 'function', 'exports the extra alphabet round builder');
  return extras.buildAlphabetExtraRounds(type, random);
}

const pictureText = letter => `${letter.emoji} ${letter.translation}`;
const pictureLetter = display => ALPHABET.find(letter => display.split('\n')[0] === pictureText(letter));

test('the extra alphabet catalogue adds 17 distinct activities in four learning categories', () => {
  assert.ok(Array.isArray(extras.ALPHABET_EXTRA_GAMES));
  assert.equal(extras.ALPHABET_EXTRA_GAMES.length, 17);
  assert.deepEqual(new Set(extras.ALPHABET_EXTRA_GAMES.map(game => game.type)), new Set(TYPES));
  assert.deepEqual(new Set(extras.ALPHABET_EXTRA_GAMES.map(game => game.category)), new Set(['recognize', 'listen', 'think', 'build']));
  for (const game of extras.ALPHABET_EXTRA_GAMES) {
    assert.equal(game.subject, 'alphabet');
    for (const field of ['title', 'description', 'symbol', 'skill']) assert.ok(game[field], `${game.type} has ${field}`);
    assert.ok(!['match', 'listen', 'order'].includes(game.type));
  }
});

test('all activities produce five playable rounds, including either random boundary', () => {
  const modes = new Set();
  for (const type of TYPES) {
    for (const random of [() => 0, () => 0.999999, seededRandom(12), seededRandom(800)]) {
      const generated = rounds(type, random);
      assert.equal(generated.length, 5, type);
      for (const round of generated) {
        assert.ok(['choice', 'sequence', 'select', 'build'].includes(round.mode), type);
        modes.add(round.mode);
        for (const field of ['prompt', 'display', 'hint', 'explanation']) assert.ok(typeof round[field] === 'string' && round[field].length, `${type}: ${field}`);
        assert.ok(Array.isArray(round.choices), type);
        const values = round.choices.map(choice => choice.value);
        assert.equal(new Set(values).size, values.length, `${type} never repeats a choice value`);
        assert.ok(round.choices.every(choice => typeof choice.value === 'string' && typeof choice.label === 'string' && choice.label.length), type);
        if (round.mode === 'build') {
          assert.ok(Number.isInteger(Number(round.answer)) && Number(round.answer) >= 1 && Number(round.answer) <= round.max);
          assert.equal(round.max, 10);
          assert.ok(round.item);
        } else if (['sequence', 'select'].includes(round.mode)) {
          assert.ok(Array.isArray(round.answer) && round.answer.length >= 2, type);
          assert.equal(new Set(round.answer).size, round.answer.length);
          assert.ok(round.answer.every(answer => values.includes(answer)), type);
        } else {
          assert.equal(typeof round.answer, 'string');
          assert.equal(values.filter(value => value === round.answer).length, 1, type);
          assert.ok(round.choices.length >= 3, type);
        }
        if (round.speech) assert.equal(round.speechLang, 'en-US', `${type} requests an English voice`);
      }
    }
  }
  assert.deepEqual(modes, new Set(['choice', 'select', 'sequence', 'build']));
});

test('before, after and between questions keep the alphabet edges correct without wrapping', () => {
  for (const randomValue of [0, 0.999999]) {
    for (const round of rounds('alphabet-next', () => randomValue)) {
      assert.match(round.display, /^[A-Y]$/);
      assert.equal(round.answer.charCodeAt(0), round.display.charCodeAt(0) + 1);
    }
    for (const round of rounds('alphabet-previous', () => randomValue)) {
      assert.match(round.display, /^[B-Z]$/);
      assert.equal(round.answer.charCodeAt(0), round.display.charCodeAt(0) - 1);
    }
    for (const round of rounds('alphabet-between', () => randomValue)) {
      const [left, gap, right] = round.display.split(' ');
      assert.equal(gap, '?');
      assert.equal(round.answer.charCodeAt(0), left.charCodeAt(0) + 1);
      assert.equal(round.answer.charCodeAt(0), right.charCodeAt(0) - 1);
    }
  }
});

test('uppercase questions reverse the original lowercase matching activity', () => {
  for (const round of rounds('alphabet-upper')) {
    assert.match(round.display, /^[a-z]$/);
    assert.equal(round.answer, round.display.toUpperCase());
    assert.ok(round.choices.every(choice => /^[A-Z]$/.test(choice.label)));
  }
});

test('word initials and picture vocabulary agree with the taught words', () => {
  for (const round of rounds('alphabet-word-initial')) {
    const letter = ALPHABET.find(item => item.word === round.display);
    assert.ok(letter);
    assert.equal(round.answer, letter.id);
  }
  for (const type of ['alphabet-word-picture', 'alphabet-listen-word']) {
    for (const round of rounds(type)) {
      const letter = ALPHABET.find(item => item.word === (round.speech || round.display));
      assert.ok(letter);
      assert.equal(round.answer, letter.id);
      const answer = round.choices.find(choice => choice.value === round.answer);
      assert.equal(answer.label, letter.emoji);
      assert.equal(answer.small, letter.translation);
      if (type === 'alphabet-listen-word') assert.equal(round.speechLang, 'en-US');
    }
  }
  for (const round of rounds('alphabet-picture-word')) {
    const letter = pictureLetter(round.display);
    assert.ok(letter);
    assert.equal(round.answer, letter.word.toLowerCase());
    assert.equal(round.choices.find(choice => choice.value === round.answer).label, letter.word);
  }
});

test('listening to two letter names distinguishes their order', () => {
  for (const round of rounds('alphabet-listen-pair')) {
    const spoken = round.speech.match(/[A-Z]/g);
    assert.equal(spoken.length, 2);
    assert.notEqual(spoken[0], spoken[1]);
    assert.equal(round.answer, spoken.join('-'));
    assert.ok(round.choices.some(choice => choice.value === [...spoken].reverse().join('-')), 'the reversed order remains a meaningful distractor');
    assert.equal(round.speechLang, 'en-US');
  }
});

test('multiselect classifies vowel letters using A E I O U and includes every matching card', () => {
  const vowels = new Set(['A', 'E', 'I', 'O', 'U']);
  for (const type of ['alphabet-vowels', 'alphabet-consonants']) {
    for (const round of rounds(type)) {
      assert.equal(round.mode, 'select');
      const expected = round.choices.filter(choice => type === 'alphabet-vowels' ? vowels.has(choice.value) : !vowels.has(choice.value)).map(choice => choice.value);
      assert.deepEqual(new Set(round.answer), new Set(expected));
      assert.ok(expected.length >= 2 && expected.length < round.choices.length);
    }
  }
  for (const round of rounds('alphabet-same-letter')) {
    assert.equal(round.mode, 'select');
    assert.deepEqual(new Set(round.answer), new Set([round.display.toUpperCase(), round.display.toLowerCase()]));
    const expected = round.choices.filter(choice => choice.value.toUpperCase() === round.display.toUpperCase()).map(choice => choice.value);
    assert.deepEqual(new Set(round.answer), new Set(expected));
  }
});

test('letter construction puts each card in forward or backward alphabet order', () => {
  for (const type of ['alphabet-forward', 'alphabet-backward']) {
    for (const random of [() => 0, () => 0.999999, seededRandom(93)]) {
      for (const round of rounds(type, random)) {
        assert.equal(round.mode, 'sequence');
        assert.equal(round.answer[0], round.display[0]);
        assert.ok(round.answer.length >= 3 && round.answer.length <= 4);
        assert.ok(round.answer.every(letter => /^[A-Z]$/.test(letter)));
        for (let index = 1; index < round.answer.length; index++) {
          assert.equal(round.answer[index].charCodeAt(0) - round.answer[index - 1].charCodeAt(0), type === 'alphabet-forward' ? 1 : -1);
        }
      }
    }
  }
});

test('word construction uses taught short words and one usable card for every letter', () => {
  for (const random of [() => 0, () => 0.999999, seededRandom(2)]) {
    for (const round of rounds('alphabet-word-build', random)) {
      const letter = pictureLetter(round.display);
      assert.ok(letter);
      assert.equal(round.mode, 'sequence');
      assert.equal(round.answer.join(''), letter.word.toLowerCase());
      assert.ok(round.answer.length <= 5);
      assert.deepEqual(new Set(round.choices.map(choice => choice.value)), new Set(round.answer));
      assert.equal(round.speech, letter.word);
    }
  }
});

test('a missing word letter restores its taught spelling and is not another initial question', () => {
  for (const random of [() => 0, () => 0.999999, seededRandom(123)]) {
    for (const round of rounds('alphabet-missing-word', random)) {
      const letter = pictureLetter(round.display);
      assert.ok(letter);
      const shown = round.display.split('\n')[1].split(' ');
      assert.equal(shown.filter(value => value === '_').length, 1);
      assert.notEqual(shown[0], '_');
      assert.equal(shown.map(value => value === '_' ? round.answer : value).join(''), letter.word.toLowerCase());
    }
  }
});

test('word counting builds exactly one block for each written letter', () => {
  for (const round of rounds('alphabet-word-count')) {
    const letter = ALPHABET.find(item => item.word === round.display);
    assert.ok(letter);
    assert.equal(round.mode, 'build');
    assert.equal(Number(round.answer), letter.word.length);
    assert.ok(Number(round.answer) <= 10);
  }
});

test('a fixed random seed replays the same activities and unknown games fail clearly', () => {
  for (const type of TYPES) assert.deepEqual(rounds(type, seededRandom(51)), rounds(type, seededRandom(51)));
  assert.throws(() => rounds('unknown'), /Unknown alphabet game/);
});
