import test from 'node:test';
import assert from 'node:assert/strict';

const extras = await import('../src/games/number-extras.js').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});

function seededRandom(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function roundsFor(type) {
  assert.equal(typeof extras.buildNumberExtraRounds, 'function');
  return [() => 0, () => 0.999999, seededRandom(42), seededRandom(900)]
    .flatMap(random => extras.buildNumberExtraRounds(type, random));
}

test('eleven additional number games have unique playable types and discovery metadata', () => {
  assert.ok(Array.isArray(extras.NUMBER_EXTRA_GAMES));
  assert.equal(extras.NUMBER_EXTRA_GAMES.length, 11);
  const originalTypes = new Set(['count', 'find', 'trace', 'train', 'compare', 'memory', 'balloons', 'picnic', 'drum']);
  assert.equal(new Set(extras.NUMBER_EXTRA_GAMES.map(game => game.type)).size, 11);
  for (const game of extras.NUMBER_EXTRA_GAMES) {
    assert.equal(game.subject, 'numbers');
    assert.ok(!originalTypes.has(game.type));
    for (const field of ['title', 'description', 'symbol', 'skill']) assert.ok(game[field]);
    assert.ok(['recognize', 'listen', 'think', 'build'].includes(game.category));
  }
});

test('all new games produce five usable rounds at both random boundaries', () => {
  assert.ok(Array.isArray(extras.NUMBER_EXTRA_GAMES));
  assert.equal(typeof extras.buildNumberExtraRounds, 'function');
  const modes = new Set();
  for (const game of extras.NUMBER_EXTRA_GAMES) {
    for (const random of [() => 0, () => 0.999999, seededRandom(17)]) {
      const rounds = extras.buildNumberExtraRounds(game.type, random);
      assert.equal(rounds.length, 5, game.type);
      for (const round of rounds) {
        const mode = round.mode ?? 'choice';
        modes.add(mode);
        assert.ok(['choice', 'sequence', 'select', 'build'].includes(mode));
        for (const field of ['prompt', 'display', 'hint', 'explanation']) assert.ok(round[field], `${game.type}: ${field}`);
        assert.ok(Array.isArray(round.choices));
        const values = round.choices.map(choice => choice.value);
        assert.ok(round.choices.every(choice => typeof choice.value === 'string' && choice.label));
        assert.equal(new Set(values).size, values.length, `${game.type}: distinct answer buttons`);
        if (mode === 'build') {
          assert.ok(Number.isInteger(Number(round.answer)));
          assert.ok(Number(round.answer) >= 0 && Number(round.answer) <= round.max && round.max <= 10);
          assert.ok(round.item);
        } else {
          const answers = Array.isArray(round.answer) ? round.answer : [round.answer];
          assert.ok(answers.length > 0);
          assert.equal(new Set(answers).size, answers.length);
          for (const answer of answers) assert.equal(values.filter(value => value === answer).length, 1);
          assert.ok(values.some(value => !answers.includes(value)), `${game.type}: has a real alternative`);
        }
        if (round.visual) assert.doesNotMatch(round.visual, /<script|\bon\w+\s*=/i);
      }
    }
    assert.deepEqual(extras.buildNumberExtraRounds(game.type, seededRandom(75)), extras.buildNumberExtraRounds(game.type, seededRandom(75)));
  }
  assert.deepEqual([...modes].sort(), ['build', 'choice', 'select', 'sequence']);
});

test('zero shelves selects every empty collection and leaves toy collections unselected', () => {
  for (const round of roundsFor('zero-shelves')) {
    assert.equal(round.mode, 'select');
    const empty = round.choices.filter(choice => !choice.label.includes('🧸')).map(choice => choice.value);
    assert.deepEqual([...round.answer].sort(), empty.sort());
    assert.ok(empty.length > 0 && empty.length < round.choices.length);
  }
});

test('animal line answers the requested ordinal position from the left', () => {
  for (const round of roundsFor('animal-line')) {
    const position = Number(round.prompt.match(/第 (\d+) 位/)[1]);
    const animal = round.display.split(' → ')[position - 1];
    assert.ok(position >= 1 && position <= 5);
    assert.equal(round.choices.find(choice => choice.value === round.answer).label, animal);
  }
});

test('magic more asks the child to construct exactly one extra item including zero to one', () => {
  const rounds = roundsFor('magic-more');
  assert.ok(rounds.some(round => round.answer === '1'));
  assert.ok(rounds.some(round => round.answer === '10'));
  for (const round of rounds) {
    const start = Number(round.display.match(/^(\d+) \+ 1 = \?$/)[1]);
    assert.equal(round.mode, 'build');
    assert.equal(Number(round.answer), start + 1);
  }
});

test('leaf less removes one item without crossing below zero', () => {
  const rounds = roundsFor('leaf-less');
  assert.ok(rounds.some(round => round.answer === '0'));
  assert.ok(rounds.some(round => round.answer === '9'));
  for (const round of rounds) {
    const start = Number(round.display.match(/^(\d+) - 1 = \?$/)[1]);
    assert.equal(round.mode, 'build');
    assert.equal(Number(round.answer), start - 1);
  }
});

test('block combine constructs the sum of two nonempty groups within ten', () => {
  for (const round of roundsFor('block-combine')) {
    const [, left, right] = round.display.match(/^(\d+) \+ (\d+) = \?$/).map(Number);
    assert.ok(left >= 1 && right >= 1);
    assert.equal(round.mode, 'build');
    assert.equal(Number(round.answer), left + right);
    assert.ok(Number(round.answer) <= 10);
  }
});

test('bead split finds the missing part of the visible whole', () => {
  for (const round of roundsFor('bead-split')) {
    const [, whole, known] = round.display.match(/^(\d+) = (\d+) \+ \?$/).map(Number);
    assert.ok(known >= 0 && known <= whole && whole <= 10);
    assert.equal(Number(round.answer) + known, whole);
  }
});

test('bird takeaway subtracts only birds that were originally present', () => {
  const rounds = roundsFor('bird-takeaway');
  assert.ok(rounds.some(round => round.answer === '0'));
  for (const round of rounds) {
    const [, start, gone] = round.display.match(/^(\d+) - (\d+) = \?$/).map(Number);
    assert.ok(gone >= 0 && gone <= start && start <= 10);
    assert.equal(Number(round.answer), start - gone);
  }
});

test('hop pattern fills two ordered terms in a step-two pattern', () => {
  for (const round of roundsFor('hop-pattern')) {
    const [first, second] = round.display.split(' → ').slice(0, 2).map(Number);
    assert.equal(round.mode, 'sequence');
    assert.equal(second - first, 2);
    assert.deepEqual(round.answer, [String(first + 4), String(first + 6)]);
    assert.ok(Number(round.answer[1]) <= 10);
  }
});

test('ten frame asks how many empty spaces remain and renders exactly ten spaces', () => {
  const rounds = roundsFor('ten-frame');
  assert.ok(rounds.some(round => round.answer === '0'));
  for (const round of rounds) {
    const filled = Number(round.display.match(/已种 (\d+) 朵花/)[1]);
    assert.equal(Number(round.answer) + filled, 10);
    assert.equal((round.visual.match(/<td\b/g) ?? []).length, 10);
    assert.equal((round.visual.match(/🌼/gu) ?? []).length, filled);
    assert.match(round.visual, /aria-label=/);
  }
});

test('equal share constructs one of two equal portions with no remainder', () => {
  for (const round of roundsFor('equal-share')) {
    const total = Number(round.display.match(/一共有 (\d+) 条小鱼/)[1]);
    assert.equal(round.mode, 'build');
    assert.equal(Number(round.answer) * 2, total);
    assert.ok(total >= 2 && total <= 10);
  }
});

test('number between selects the open interval and excludes both boundary numbers', () => {
  for (const round of roundsFor('number-between')) {
    const [, low, high] = round.prompt.match(/比 (\d+) 大、比 (\d+) 小/).map(Number);
    assert.equal(round.mode, 'select');
    const expected = round.choices.filter(choice => Number(choice.value) > low && Number(choice.value) < high).map(choice => choice.value).sort();
    assert.deepEqual([...round.answer].sort(), expected);
    assert.ok(round.choices.some(choice => Number(choice.value) === low));
    assert.ok(round.choices.some(choice => Number(choice.value) === high));
    assert.ok(low >= 0 && high <= 10);
  }
});

test('unknown number game types report a clear error', () => {
  assert.equal(typeof extras.buildNumberExtraRounds, 'function');
  assert.throws(() => extras.buildNumberExtraRounds('unknown'), /Unknown number game/);
});
