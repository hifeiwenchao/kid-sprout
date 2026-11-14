import test from 'node:test';
import assert from 'node:assert/strict';
import { TRACING_GROUPS, getTracingTemplate, drawTracingGuide } from '../src/drawing-tracing.js';

test('tracing offers 37 templates covering 0 to 10 and all paired uppercase / lowercase letters', () => {
  assert.deepEqual(TRACING_GROUPS.map(group => group.characters.join(',')), [
    Array.from({ length: 11 }, (_, index) => String(index)).join(','),
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => letter + letter.toLowerCase()).join(','),
  ]);
  assert.equal(TRACING_GROUPS.reduce((count, group) => count + group.characters.length, 0), 37);
  for (const group of TRACING_GROUPS) {
    for (const character of group.characters) {
      const template = getTracingTemplate(group.id, character);
      assert.equal(template.groupId, group.id);
      assert.equal(template.character, character);
      assert.ok(template.glyphs.every(glyph => glyph.paths.length > 0 && glyph.paths.every(path => /^M/.test(path))));
    }
  }
});

test('invalid characters and case mismatches cannot select another template', () => {
  for (const args of [['numbers', '11'], ['numbers', 0], ['alphabet', 'A'], ['alphabet', 'a'], ['alphabet', 'Ab'], ['alphabet', 'aA'], ['uppercase', 'A'], ['lowercase', 'a'], ['free', '0'], ['__proto__', '0'], [null, null]]) {
    assert.equal(getTracingTemplate(...args), null);
  }
});

test('every letter template places the matching uppercase before its lowercase on one writing area', () => {
  for (const pair of TRACING_GROUPS.find(group => group.id === 'alphabet').characters) {
    const template = getTracingTemplate('alphabet', pair);
    assert.equal(template.label, `字母 ${pair}`);
    assert.deepEqual(template.glyphs.map(glyph => glyph.character), [...pair]);
    assert.equal(template.glyphs[0].character.toLowerCase(), template.glyphs[1].character);
    assert.equal(template.glyphs[0].x, 0);
    assert.ok(template.glyphs[1].x >= 100);
    assert.ok(template.width >= template.glyphs[1].x + 100);
  }
  assert.notDeepEqual(getTracingTemplate('alphabet', 'Aa').glyphs[0].paths, getTracingTemplate('alphabet', 'Aa').glyphs[1].paths);
});

test('10 uses separately positioned 1 and 0 guides within a wider template', () => {
  const ten = getTracingTemplate('numbers', '10');
  assert.equal(ten.label, '数字 10');
  assert.deepEqual(ten.glyphs.map(glyph => glyph.character), ['1', '0']);
  assert.equal(ten.glyphs[0].x, 0);
  assert.ok(ten.glyphs[1].x >= 100);
  assert.ok(ten.width >= ten.glyphs[1].x + 100);
  assert.deepEqual(ten.glyphs[0].paths, getTracingTemplate('numbers', '1').glyphs[0].paths);
  assert.deepEqual(ten.glyphs[1].paths, getTracingTemplate('numbers', '0').glyphs[0].paths);
  assert.throws(() => ten.glyphs[0].paths.push('M0 0'), TypeError);
});

test('returning to free drawing clears the guide without painting anything', () => {
  const calls = [];
  drawTracingGuide({ clearRect: (...args) => calls.push(args) }, null);
  assert.deepEqual(calls, [[0, 0, 1200, 900]]);
  drawTracingGuide(null, getTracingTemplate('alphabet', 'Gg'));
});
