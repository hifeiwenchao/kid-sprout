import test from 'node:test';
import assert from 'node:assert/strict';
import { createActivitySession } from '../src/games/activity-session.js';

test('wrong answers retry; solved rounds advance once and finish once', () => {
  const session = createActivitySession([{ answer: '3' }, { answer: '0', mode: 'build' }]);
  assert.equal(session.submit('2'), 'retry');
  assert.equal(session.advance(), 'ignored');
  assert.equal(session.submit('3'), 'correct');
  assert.equal(session.submit('3'), 'ignored');
  assert.equal(session.advance(), 'next');
  assert.equal(session.roundNumber, 2);
  assert.equal(session.submit('0'), 'correct');
  assert.equal(session.advance(), 'complete');
  assert.equal(session.advance(), 'ignored');
  assert.equal(session.submit('0'), 'ignored');
});

test('sequences require exact order; selections require exact unique membership', () => {
  const session = createActivitySession([
    { mode: 'sequence', answer: ['b', 'a'] },
    { mode: 'select', answer: ['a', 'c'] },
  ]);
  assert.equal(session.submit(['a', 'b']), 'retry');
  assert.equal(session.submit(['b']), 'retry');
  assert.equal(session.submit(['b', 'a']), 'correct');
  session.advance();
  assert.equal(session.submit(['a', 'c', 'c']), 'retry');
  assert.equal(session.submit(['c']), 'retry');
  assert.equal(session.submit(['c', 'a']), 'correct');
});

test('empty sessions fail early', () => {
  assert.throws(() => createActivitySession([]), /round/i);
});
