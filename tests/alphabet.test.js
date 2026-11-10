import test from 'node:test';
import assert from 'node:assert/strict';

const alphabet = await import('../src/courses/alphabet-data.js').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});

function seededRandom(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

test('every English letter has a matching lowercase form and a teachable word', () => {
  assert.ok(Array.isArray(alphabet.ALPHABET), 'exports the alphabet lesson data');
  assert.equal(alphabet.ALPHABET.map(letter => letter.id).join(''), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  for (const letter of alphabet.ALPHABET) {
    assert.equal(letter.uppercase, letter.id);
    assert.equal(letter.lowercase, letter.id.toLowerCase());
    assert.match(letter.word, /^[A-Z][a-z]+$/);
    assert.ok(letter.translation && letter.emoji && letter.hint, `${letter.id} has a visual and a learning hint`);
  }
  assert.equal(alphabet.ALPHABET[0].word, 'Apple');
  assert.equal(alphabet.ALPHABET[25].word, 'Zebra');
});

test('small study groups cover A to Z once without overwhelming the card grid', () => {
  assert.ok(Array.isArray(alphabet.ALPHABET_GROUPS), 'exports the learning groups');
  assert.equal(alphabet.ALPHABET_GROUPS.flatMap(group => group.letters).join(''), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  assert.ok(alphabet.ALPHABET_GROUPS.every(group => group.letters.length <= 8 && group.letters.length > 0));
});

test('continue learning skips familiar letters while an explicit card remains selectable', () => {
  assert.equal(typeof alphabet.getAlphabetLesson, 'function');
  const learned = new Set(['A', 'B']);
  assert.equal(alphabet.getAlphabetLesson(learned).id, 'C');
  assert.equal(alphabet.getAlphabetLesson(learned, 'a').id, 'A');
  assert.equal(alphabet.getAlphabetLesson(new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).id, 'A');
});

test('matching rounds ask for the lowercase partner and offer one correct card', () => {
  assert.equal(typeof alphabet.createAlphabetRounds, 'function');
  for (const seed of [1, 20, 800]) {
    const rounds = alphabet.createAlphabetRounds('match', seededRandom(seed));
    assert.equal(rounds.length, 5);
    assert.equal(new Set(rounds.map(round => round.target)).size, 5);
    for (const round of rounds) {
      assert.match(round.target, /^[A-Z]$/);
      assert.equal(round.answer, round.target.toLowerCase());
      assert.equal(round.choices.filter(choice => choice === round.answer).length, 1);
      assert.equal(new Set(round.choices).size, 4);
      assert.ok(round.choices.every(choice => /^[a-z]$/.test(choice)));
    }
  }
});

test('listening rounds offer the spoken letter among four distinct uppercase cards', () => {
  assert.equal(typeof alphabet.createAlphabetRounds, 'function');
  for (const seed of [8, 90, 555]) {
    const rounds = alphabet.createAlphabetRounds('listen', seededRandom(seed));
    assert.equal(rounds.length, 5);
    for (const round of rounds) {
      assert.equal(round.answer, round.target);
      assert.equal(round.choices.filter(choice => choice === round.answer).length, 1);
      assert.equal(new Set(round.choices).size, 4);
      assert.ok(round.choices.every(choice => /^[A-Z]$/.test(choice)));
    }
  }
});

test('order rounds remain consecutive at the alphabet edges and hide only the answer', () => {
  assert.equal(typeof alphabet.createAlphabetRounds, 'function');
  const allRounds = [() => 0, () => 0.999999, seededRandom(42)].flatMap(random => alphabet.createAlphabetRounds('order', random));
  assert.ok(allRounds.some(round => round.target === 'A'), 'can practice the first letter');
  assert.ok(allRounds.some(round => round.target === 'Z'), 'can practice the last letter');
  for (const round of allRounds) {
    assert.equal(round.sequence.length, 4);
    assert.equal(round.sequence.filter(letter => letter === null).length, 1);
    const restored = round.sequence.map(letter => letter ?? round.answer);
    assert.ok(restored.every((letter, index) => /^[A-Z]$/.test(letter) && (index === 0 || letter.charCodeAt(0) === restored[index - 1].charCodeAt(0) + 1)));
    assert.equal(round.answer, round.target);
    assert.equal(round.choices.filter(choice => choice === round.answer).length, 1);
    assert.equal(new Set(round.choices).size, 4);
  }
});

test('unknown game modes fail clearly instead of opening a broken round', () => {
  assert.equal(typeof alphabet.createAlphabetRounds, 'function');
  assert.throws(() => alphabet.createAlphabetRounds('unknown'), /Unknown alphabet game/);
});

test('a wrong answer can be retried and a correct round cannot advance twice', () => {
  assert.equal(typeof alphabet.createAlphabetSession, 'function');
  const session = alphabet.createAlphabetSession([
    { target: 'A', answer: 'a' },
    { target: 'B', answer: 'b' },
  ]);
  assert.equal(session.advance(), 'ignored');
  assert.equal(session.submit('b'), 'retry');
  assert.equal(session.current.target, 'A');
  assert.equal(session.submit('a'), 'correct');
  assert.equal(session.submit('a'), 'ignored');
  assert.equal(session.advance(), 'next');
  assert.equal(session.advance(), 'ignored');
  assert.equal(session.current.target, 'B');
  assert.equal(session.submit('b'), 'correct');
  assert.equal(session.advance(), 'complete');
  assert.equal(session.advance(), 'ignored');
  assert.equal(session.submit('b'), 'ignored');
  assert.equal(session.completed, true);
});
