import test from 'node:test';
import assert from 'node:assert/strict';
import { createDrawingHistory } from '../src/drawing-history.js';

const stroke = (x = 10, tool = 'pen') => ({
  tool, color: '#5e8e79', size: 8, points: [{ x, y: 20 }, { x: x + 10, y: 30 }],
});

test('a completed pen or eraser stroke is one reversible step', () => {
  const history = createDrawingHistory();
  assert.equal(history.canUndo, false);
  assert.equal(history.undo(), false);
  assert.equal(history.redo(), false);
  history.addStroke(stroke());
  history.addStroke(stroke(30, 'eraser'));
  assert.equal(history.strokes.length, 2);
  assert.equal(history.undo(), true);
  assert.deepEqual(history.strokes, [stroke()]);
  assert.equal(history.canRedo, true);
  assert.equal(history.redo(), true);
  assert.deepEqual(history.strokes, [stroke(), stroke(30, 'eraser')]);
  assert.equal(history.redo(), false);
});

test('clearing a drawing can be undone and redone', () => {
  const history = createDrawingHistory();
  history.addStroke(stroke());
  history.addStroke(stroke(50, 'marker'));
  assert.equal(history.clear(), true);
  assert.deepEqual(history.strokes, []);
  assert.equal(history.undo(), true);
  assert.deepEqual(history.strokes, [stroke(), stroke(50, 'marker')]);
  assert.equal(history.redo(), true);
  assert.deepEqual(history.strokes, []);
});

test('a new stroke or clear after undo discards the old redo branch', () => {
  const history = createDrawingHistory();
  history.addStroke(stroke(10));
  history.addStroke(stroke(30));
  history.undo();
  history.addStroke(stroke(50));
  assert.equal(history.canRedo, false);
  assert.equal(history.redo(), false);
  assert.deepEqual(history.strokes, [stroke(10), stroke(50)]);
  history.undo();
  assert.equal(history.canRedo, true);
  history.clear();
  assert.equal(history.canRedo, false);
  history.undo();
  assert.deepEqual(history.strokes, [stroke(10)]);
});

test('continuing to edit a stroke or returned history cannot mutate saved art', () => {
  const history = createDrawingHistory();
  const input = stroke();
  history.addStroke(input);
  input.points[0].x = 400;
  input.points.push({ x: 90, y: 90 });
  input.color = '#ffffff';
  assert.deepEqual(history.strokes, [stroke()]);
  assert.throws(() => history.strokes.push(stroke()), TypeError);
  assert.throws(() => { history.strokes[0].points[0].x = 500; }, TypeError);
  assert.throws(() => { history.strokes[0].size = 48; }, TypeError);
  history.clear();
  history.undo();
  assert.deepEqual(history.strokes, [stroke()]);
});

test('the undo limit retains earlier strokes while bounding available undo steps', () => {
  const history = createDrawingHistory({ limit: 2 });
  for (let x = 1; x <= 5; x++) history.addStroke(stroke(x));
  assert.equal(history.strokes.length, 5);
  assert.equal(history.undo(), true);
  assert.equal(history.undo(), true);
  assert.equal(history.undo(), false);
  assert.deepEqual(history.strokes, [stroke(1), stroke(2), stroke(3)]);
  history.redo();
  history.redo();
  assert.equal(history.strokes.length, 5);
  assert.equal(history.redo(), false);
});

test('empty strokes and clearing blank paper do not consume undo steps', () => {
  const history = createDrawingHistory();
  assert.equal(history.clear(), false);
  assert.equal(history.addStroke({ ...stroke(), points: [] }), false);
  assert.equal(history.canUndo, false);
  history.addStroke(stroke());
  history.undo();
  assert.equal(history.clear(), false);
  assert.equal(history.canRedo, true);
  assert.equal(history.redo(), true);
  assert.deepEqual(history.strokes, [stroke()]);
});

test('a zero undo limit still retains the complete drawing', () => {
  const history = createDrawingHistory({ limit: 0 });
  history.addStroke(stroke(10));
  history.addStroke(stroke(30));
  assert.deepEqual(history.strokes, [stroke(10), stroke(30)]);
  assert.equal(history.undo(), false);
  assert.equal(history.canUndo, false);
  assert.equal(history.canRedo, false);
});
