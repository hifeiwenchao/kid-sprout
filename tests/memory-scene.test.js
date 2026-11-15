import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMemoryScene, createMemoryScene } from '../src/courses/memory-scene.js';

class FakeTarget {
  handlers = new Map();
  addEventListener(type, handler) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type).add(handler);
  }
  removeEventListener(type, handler) { this.handlers.get(type)?.delete(handler); }
  emit(type) { for (const handler of [...(this.handlers.get(type) || [])]) handler(); }
  listenerCount(type) { return this.handlers.get(type)?.size || 0; }
}

function setup(t, reduced = false) {
  const frames = new Map();
  const timers = new Map();
  let nextId = 0;
  const media = Object.assign(new FakeTarget(), { matches: reduced });
  const button = new FakeTarget();
  const note = { textContent: '跟着图形记一记，再用小手比划一下。' };
  const classes = new Set();
  const root = {
    classList: { add: value => classes.add(value), remove: value => classes.delete(value) },
    querySelector: selector => selector === '[data-memory-replay]' ? button : note,
  };
  const globals = {
    window: { matchMedia: query => { assert.equal(query, '(prefers-reduced-motion: reduce)'); return media; } },
    requestAnimationFrame(callback) { const id = ++nextId; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id),
    setTimeout(callback, delay) { const id = ++nextId; timers.set(id, { callback, delay }); return id; },
    clearTimeout: id => timers.delete(id),
  };
  const original = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(globalThis, globals);
  let controller;
  t.after(() => {
    controller?.destroy();
    for (const [key, descriptor] of original) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  controller = createMemoryScene(root);
  const flushFrame = () => {
    const entry = frames.entries().next().value;
    if (!entry) return;
    frames.delete(entry[0]);
    entry[1]();
  };
  const changeMotion = matches => { media.matches = matches; media.emit('change'); };
  return { controller, root, button, note, media, classes, frames, timers, flushFrame, changeMotion };
}

test('memory scene escapes lesson text while preserving its trusted SVG artwork', () => {
  const markup = renderMemoryScene({ symbol: 'A"<&', title: '<img src=x>', description: "a & b's \"idea\"", art: '<svg viewBox="0 0 320 180"></svg>' });
  assert.match(markup, /aria-label="A&quot;&lt;&amp;记忆小剧场"/);
  assert.match(markup, /<h3>&lt;img src=x&gt;<\/h3>/);
  assert.match(markup, /<p>a &amp; b&#39;s &quot;idea&quot;<\/p>/);
  assert.ok(markup.includes('<svg viewBox="0 0 320 180"></svg>'));
  assert.ok(!markup.includes('<img src=x>'));
  assert.equal(renderMemoryScene(null), '');
});

test('rapid replay replaces pending animation work and keeps only one bounded playback', t => {
  const { button, classes, frames, timers, flushFrame } = setup(t);
  button.emit('click');
  button.emit('click');
  assert.equal(frames.size, 1);
  assert.equal(timers.size, 0);
  flushFrame();
  button.emit('click');
  assert.equal(frames.size, 1, 'replay also replaces the second pending animation frame');
  flushFrame();
  flushFrame();
  assert.equal(classes.has('memory-playing'), true);
  assert.equal(timers.size, 1);
  button.emit('click');
  assert.equal(classes.has('memory-playing'), false);
  assert.equal(timers.size, 0);
  assert.equal(frames.size, 1);
  flushFrame();
  flushFrame();
  assert.equal(timers.size, 1);
  const [id, timer] = timers.entries().next().value;
  assert.ok(timer.delay > 0 && timer.delay <= 5000, 'motion stops after a short finite story');
  timers.delete(id);
  timer.callback();
  assert.equal(classes.has('memory-playing'), false);
});

test('closing a scene removes listeners and blocks an already queued playback callback', t => {
  const { controller, button, media, classes, frames, timers, flushFrame } = setup(t);
  flushFrame();
  const pendingPlayback = [...frames.values()][0];
  controller.destroy();
  controller.destroy();
  assert.equal(button.listenerCount('click'), 0);
  assert.equal(media.listenerCount('change'), 0);
  assert.equal(frames.size, 0);
  assert.equal(timers.size, 0);
  pendingPlayback();
  button.emit('click');
  media.emit('change');
  assert.equal(classes.has('memory-playing'), false);
  assert.equal(frames.size, 0);
  assert.equal(timers.size, 0);
  assert.doesNotThrow(() => createMemoryScene(null).destroy());
});

test('reduced motion starts static and immediately stops playback when the preference changes', t => {
  const { button, note, classes, frames, timers, flushFrame, changeMotion } = setup(t, true);
  button.emit('click');
  assert.equal(frames.size, 0);
  assert.equal(timers.size, 0);
  assert.match(note.textContent, /安静/);
  changeMotion(false);
  flushFrame();
  flushFrame();
  assert.equal(classes.has('memory-playing'), true);
  assert.equal(timers.size, 1);
  changeMotion(true);
  assert.equal(classes.has('memory-playing'), false);
  assert.equal(frames.size, 0);
  assert.equal(timers.size, 0);
  changeMotion(false);
  assert.equal(frames.size, 1);
  changeMotion(true);
  assert.equal(frames.size, 0, 'a preference change also cancels playback before it starts');
});
