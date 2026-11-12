import test from 'node:test';
import assert from 'node:assert/strict';
import { createFruitCounter } from '../src/games/fruit-counter.js';

test('count follows the number of distinct fruits clicked in any order', () => {
  const count = createFruitCounter();
  assert.deepEqual(['8', '2', '5', '1'].map(count), [1, 2, 3, 4]);
});

test('repeated clicks replay the current total without counting a fruit twice', () => {
  const count = createFruitCounter();
  assert.deepEqual(['4', '4', '2', '4', '2', '1'].map(count), [1, 1, 2, 2, 2, 3]);
});

test('a fresh round or restarted game counts from one independently', () => {
  const previousRound = createFruitCounter();
  previousRound('1');
  previousRound('2');
  const nextRound = createFruitCounter();
  assert.equal(nextRound('2'), 1);
  assert.equal(previousRound('3'), 3);
});
