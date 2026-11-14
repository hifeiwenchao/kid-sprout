import test from 'node:test';
import assert from 'node:assert/strict';
import { NUMBER_VALUES, numberName, restoreNumberProgress, nextNumberToLearn, zeroBasketExample } from '../src/courses/number-data.js';

test('number lessons include zero and retain the familiar one to ten names', () => {
  assert.deepEqual(NUMBER_VALUES, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(numberName(0), '零');
  assert.equal(numberName(1), '一');
  assert.equal(numberName(10), '十');
});

test('saved number progress keeps old lessons and zero while rejecting invalid values', () => {
  assert.deepEqual([...restoreNumberProgress([1, 2, 10])], [1, 2, 10]);
  assert.deepEqual([...restoreNumberProgress([0, 1, 10, 0, -1, 11, '0', null, 1.5])], [0, 1, 10]);
  assert.deepEqual([...restoreNumberProgress(null)], []);
});

test('continuing old progress learns zero before reporting all eleven lessons complete', () => {
  const learned = restoreNumberProgress([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(nextNumberToLearn(learned), 0);
  learned.add(0);
  assert.equal(nextNumberToLearn(learned), undefined);
  assert.equal(nextNumberToLearn(new Set([0, 1])), 2);
});

test('the apple example distinguishes an empty basket from one apple in speech and text', () => {
  assert.equal(zeroBasketExample(false).count, 0);
  assert.match(zeroBasketExample(false).explanation, /一个也没有.*0/);
  assert.match(zeroBasketExample(false).speech, /零/);
  assert.equal(zeroBasketExample(true).count, 1);
  assert.equal(zeroBasketExample(true).action, '拿走苹果');
});
