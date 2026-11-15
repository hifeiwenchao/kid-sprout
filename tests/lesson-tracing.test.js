import test from 'node:test';
import assert from 'node:assert/strict';
import { renderLessonTracing, createLessonTracing } from '../src/courses/lesson-tracing.js';

class FakeTarget {
  handlers = new Map();
  addEventListener(type, handler, { signal } = {}) {
    if (signal?.aborted) return;
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    const handlers = this.handlers.get(type);
    handlers.add(handler);
    signal?.addEventListener('abort', () => handlers.delete(handler), { once: true });
  }
  emit(type, details = {}) {
    const event = { button: 0, isPrimary: true, pointerId: 1, clientX: 100, clientY: 100, preventDefault() {}, ...details };
    for (const handler of [...(this.handlers.get(type) || [])]) handler(event);
  }
  listenerCount(type) { return this.handlers.get(type)?.size || 0; }
}

function fakeContext() {
  const operations = [];
  const marks = [];
  const context = { operations, marks };
  for (const method of ['save', 'restore', 'beginPath', 'arc', 'moveTo', 'lineTo', 'translate', 'scale', 'setLineDash']) {
    context[method] = (...args) => operations.push([method, ...args]);
  }
  context.clearRect = (...args) => { operations.push(['clearRect', ...args]); marks.length = 0; };
  for (const method of ['stroke', 'fill']) context[method] = path => { operations.push([method, path]); marks.push(method); };
  return context;
}

class FakeCanvas extends FakeTarget {
  captured = new Set();
  constructor(context) { super(); this.context = context; }
  getContext() { return this.context; }
  getBoundingClientRect() { return { left: 10, top: 20, width: 400, height: 300 }; }
  focus() {}
  setPointerCapture(pointer) { this.captured.add(pointer); }
  hasPointerCapture(pointer) { return this.captured.has(pointer); }
  releasePointerCapture(pointer) { this.captured.delete(pointer); }
}

function setup(t, { unsupported = null } = {}) {
  const frames = new Map();
  let nextFrame = 0;
  const window = new FakeTarget();
  const globals = { window, Path2D: class { constructor(path) { this.path = path; } }, requestAnimationFrame(callback) { frames.set(++nextFrame, callback); return nextFrame; }, cancelAnimationFrame(id) { frames.delete(id); } };
  const original = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(globalThis, globals);
  let controller;
  t.after(() => {
    controller?.destroy();
    for (const [key, descriptor] of original) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; }
  });
  const inkContext = fakeContext();
  const guideContext = fakeContext();
  const ink = new FakeCanvas(unsupported === 'ink' ? null : inkContext);
  const guide = new FakeCanvas(unsupported === 'guide' ? null : guideContext);
  const undo = Object.assign(new FakeTarget(), { disabled: true });
  const clear = Object.assign(new FakeTarget(), { disabled: true });
  const finish = Object.assign(new FakeTarget(), { disabled: true });
  const status = { textContent: '' };
  const elements = { '[data-lesson-ink]': ink, '[data-lesson-guide]': guide, '[data-lesson-undo]': undo, '[data-lesson-clear]': clear, '[data-lesson-finish]': finish, '[data-lesson-tracing-status]': status };
  const root = { querySelector: selector => elements[selector] };
  controller = createLessonTracing(root, { groupId: 'numbers', character: '0' });
  return { controller, ink, inkContext, guideContext, undo, clear, finish, status, frames, window };
}

function writeStroke(ink) {
  ink.emit('pointerdown');
  ink.emit('pointermove', { clientX: 180, clientY: 140 });
  ink.emit('pointerup', { clientX: 200, clientY: 160 });
}

test('lesson practice renders zero and paired letters with a separate noninteractive guide', () => {
  for (const [groupId, character, label] of [['numbers', '0', '数字 0'], ['alphabet', 'Aa', '字母 Aa']]) {
    const markup = renderLessonTracing({ groupId, character });
    assert.ok(markup.includes(`aria-label="${label}临摹练写区域"`));
    assert.match(markup, /data-lesson-guide[^>]+aria-hidden="true"/);
    assert.match(markup, /data-lesson-ink[^>]+tabindex="0"/);
    assert.match(markup, /我练好啦/);
  }
  assert.equal(renderLessonTracing({ groupId: 'numbers', character: '11' }), '');
});

test('undo and rewriting change only the learner ink, and clearing can be undone', t => {
  const { ink, inkContext, guideContext, undo, clear, finish, status } = setup(t);
  const guideBefore = [...guideContext.operations];
  assert.equal(undo.disabled, true);
  writeStroke(ink);
  assert.ok(inkContext.marks.length > 0);
  assert.equal(finish.disabled, false);
  undo.emit('click');
  assert.equal(inkContext.marks.length, 0);
  assert.equal(clear.disabled, true);
  writeStroke(ink);
  clear.emit('click');
  assert.equal(inkContext.marks.length, 0);
  assert.equal(undo.disabled, false);
  undo.emit('click');
  assert.ok(inkContext.marks.length > 0, 'undo restores the cleared practice');
  finish.emit('click');
  assert.match(status.textContent, /请大人/);
  assert.deepEqual(guideContext.operations, guideBefore, 'drawing and editing never repaint or erase the guide');
});

test('closing practice cancels an unfinished stroke and prevents later events or frames from reviving it', t => {
  const { controller, ink, inkContext, frames, window, status } = setup(t);
  assert.equal(window.listenerCount('resize'), 1);
  ink.emit('pointerdown');
  ink.emit('pointermove', { clientX: 180 });
  const pendingRender = [...frames.values()][0];
  assert.equal(frames.size, 1);
  assert.equal(ink.captured.size, 1);
  controller.destroy();
  controller.destroy();
  assert.equal(frames.size, 0);
  assert.equal(ink.captured.size, 0);
  assert.equal(window.listenerCount('resize'), 0);
  assert.equal(ink.listenerCount('pointerdown'), 0);
  const operationCount = inkContext.operations.length;
  const message = status.textContent;
  pendingRender();
  writeStroke(ink);
  window.emit('resize');
  assert.equal(inkContext.operations.length, operationCount);
  assert.equal(status.textContent, message);
  assert.equal(frames.size, 0);
});

test('a missing canvas context gives a paper practice hint without registering live controls', t => {
  const { controller, status, frames, window, ink } = setup(t, { unsupported: 'ink' });
  assert.match(status.textContent, /暂不支持临摹.*纸上练习/);
  assert.equal(window.listenerCount('resize'), 0);
  assert.doesNotThrow(() => { writeStroke(ink); controller.destroy(); });
  assert.equal(frames.size, 0);
});
