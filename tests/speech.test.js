import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpeechPlayer, selectFriendlyVoice } from '../src/speech.js';

const voice = (name, lang, extra = {}) => ({ name, lang, default: false, localService: true, ...extra });

class FakeUtterance {
  constructor(text) {
    this.text = text;
    this.voice = null;
  }
}

class FakeSynthesis {
  constructor(voices = []) {
    this.voices = voices;
    this.spoken = [];
    this.cancelCount = 0;
    this.listeners = new Map();
  }

  getVoices() { return this.voices; }
  speak(utterance) { this.spoken.push(utterance); }
  cancel() { this.cancelCount++; }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }
  removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener); }
  emitVoices(voices) {
    this.voices = voices;
    for (const listener of [...(this.listeners.get('voiceschanged') || [])]) listener();
    this.onvoiceschanged?.();
  }
}

function setup(options = {}, voices = [voice('Tingting', 'zh-CN')]) {
  const synthesis = new FakeSynthesis(voices);
  const player = createSpeechPlayer({ synthesis, Utterance: FakeUtterance, ...options });
  return { synthesis, player };
}

test('Chinese and English prefer known female voices over the locale default', () => {
  const chinese = voice('Microsoft Xiaoxiao', 'zh-CN');
  const english = voice('Samantha', 'en-US');
  const voices = [voice('Microsoft Kangkang', 'zh-CN', { default: true }), chinese,
    voice('Alex', 'en-US', { default: true }), english];
  assert.equal(selectFriendlyVoice(voices), chinese);
  assert.equal(selectFriendlyVoice(voices, 'en-US'), english);
});

test('voice locale matching normalizes casing and underscores', () => {
  const chinese = voice('Tingting', 'ZH_cn');
  const english = voice('Google US English', 'EN_us');
  assert.equal(selectFriendlyVoice([chinese], 'zh-CN'), chinese);
  assert.equal(selectFriendlyVoice([english], 'en-US'), english);
});

test('the requested locale wins over a female voice in another locale', () => {
  const chinese = voice('Mandarin default', 'zh-CN', { default: true });
  const english = voice('Alex', 'en-US', { default: true });
  assert.equal(selectFriendlyVoice([voice('Female Mandarin', 'zh-TW'), chinese]), chinese);
  assert.equal(selectFriendlyVoice([voice('Samantha', 'en-GB'), english], 'en-US'), english);
});

test('a natural variant wins over the standard version of the same female voice', () => {
  const standard = voice('Microsoft Xiaoxiao - Chinese (Mainland)', 'zh-CN');
  const natural = voice('Microsoft Xiaoxiao Online (Natural) - Chinese (Mainland)', 'zh-CN', { localService: false });
  assert.equal(selectFriendlyVoice([standard, natural]), natural);
  const standardEnglish = voice('Microsoft Jenny', 'en-US');
  const naturalEnglish = voice('Microsoft Jenny Online (Natural)', 'en-US', { localService: false });
  assert.equal(selectFriendlyVoice([standardEnglish, naturalEnglish], 'en-US'), naturalEnglish);
});

test('Chinese may fall back to common Mandarin locales', () => {
  for (const lang of ['zh', 'zh-SG', 'zh-Hans', 'zh-TW']) {
    const fallback = voice('Mandarin voice', lang);
    assert.equal(selectFriendlyVoice([fallback]), fallback, lang);
  }
});

test('Mandarin never falls back to Cantonese or an unrelated language', () => {
  assert.equal(selectFriendlyVoice([
    voice('Sinji', 'zh-HK'), voice('Cantonese', 'yue-CN'), voice('Samantha', 'en-US'),
  ]), null);
  assert.equal(selectFriendlyVoice([voice('Tingting', 'zh-CN')], 'en-US'), null);
  assert.equal(selectFriendlyVoice([], 'en-US'), null);
});

test('English can use another English locale without choosing unrelated languages', () => {
  const english = voice('Serena', 'en-GB');
  assert.equal(selectFriendlyVoice([voice('Tingting', 'zh-CN'), english], 'en-US'), english);
  assert.equal(selectFriendlyVoice([voice('Unknown', 'eng-US')], 'en-US'), null);
});

test('playback uses the selected female voice and gentle speech settings synchronously', () => {
  const chinese = voice('Tingting', 'zh-CN');
  const english = voice('Samantha', 'en-US');
  const { player, synthesis } = setup({}, [chinese, english]);
  player.speak('你好呀');
  assert.equal(synthesis.cancelCount, 1);
  assert.equal(synthesis.spoken.length, 1);
  assert.equal(synthesis.spoken[0].voice, chinese);
  assert.equal(synthesis.spoken[0].lang, 'zh-CN');
  assert.equal(synthesis.spoken[0].rate, .92);
  assert.equal(synthesis.spoken[0].pitch, 1.03);
  player.speak('Apple', undefined, 'en-US');
  assert.equal(synthesis.spoken[1].voice, english);
  assert.equal(synthesis.spoken[1].lang, 'en-US');
  assert.equal(synthesis.spoken[1].rate, .9);
  assert.equal(synthesis.spoken[1].pitch, 1.03);
  player.stop();
});

test('voices loaded later are used once and do not speak again after the timeout', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { player, synthesis } = setup({}, []);
  player.speak('你好呀');
  assert.equal(synthesis.spoken.length, 0);
  const female = voice('Microsoft Xiaoxiao Online (Natural)', 'zh-CN');
  synthesis.emitVoices([female]);
  assert.equal(synthesis.spoken.length, 1);
  assert.equal(synthesis.spoken[0].voice, female);
  synthesis.emitVoices([female]);
  t.mock.timers.tick(1000);
  assert.equal(synthesis.spoken.length, 1);
  player.stop();
});

test('a missing matching voice waits before using the requested language default', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { player, synthesis } = setup({}, [voice('Sinji', 'zh-HK')]);
  player.speak('你好呀');
  t.mock.timers.tick(799);
  assert.equal(synthesis.spoken.length, 0);
  t.mock.timers.tick(1);
  assert.equal(synthesis.spoken.length, 1);
  assert.equal(synthesis.spoken[0].lang, 'zh-CN');
  assert.equal(synthesis.spoken[0].voice, null);
  player.stop();
});

test('unrelated voiceschanged events do not force an early fallback', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { player, synthesis } = setup({}, []);
  player.speak('Apple', undefined, 'en-US');
  synthesis.emitVoices([voice('Tingting', 'zh-CN')]);
  assert.equal(synthesis.spoken.length, 0);
  t.mock.timers.tick(800);
  assert.equal(synthesis.spoken.length, 1);
  assert.equal(synthesis.spoken[0].lang, 'en-US');
  assert.equal(synthesis.spoken[0].voice, null);
  player.stop();
});

test('stopping pending playback prevents voiceschanged and timeout from reviving it', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let ended = 0;
  const { player, synthesis } = setup({}, []);
  player.speak('已经关闭的弹窗', () => ended++);
  player.stop();
  synthesis.emitVoices([voice('Tingting', 'zh-CN')]);
  t.mock.timers.tick(1000);
  assert.equal(synthesis.spoken.length, 0);
  assert.equal(ended, 0);
});

test('rapid pending requests only speak the latest text', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let obsoleteEnd = 0;
  const { player, synthesis } = setup({}, []);
  player.speak('一', () => obsoleteEnd++);
  player.speak('二');
  synthesis.emitVoices([voice('Tingting', 'zh-CN')]);
  t.mock.timers.tick(1000);
  assert.deepEqual(synthesis.spoken.map(utterance => utterance.text), ['二']);
  assert.equal(obsoleteEnd, 0);
  assert.equal(synthesis.cancelCount, 2);
  player.stop();
});

test('replaced utterance callbacks cannot complete or report errors for a newer request', () => {
  let ended = 0;
  let errors = 0;
  const { player, synthesis } = setup({ onError: () => errors++ });
  player.speak('一', () => ended++);
  const staleEnd = synthesis.spoken[0].onend;
  const staleError = synthesis.spoken[0].onerror;
  player.speak('二');
  staleEnd?.();
  staleError?.({ error: 'synthesis-failed' });
  assert.equal(ended, 0);
  assert.equal(errors, 0);
  player.stop();
});

test('stopped utterance callbacks cannot complete or report errors', () => {
  let ended = 0;
  let errors = 0;
  const { player, synthesis } = setup({ onError: () => errors++ });
  player.speak('一', () => ended++);
  const staleEnd = synthesis.spoken[0].onend;
  const staleError = synthesis.spoken[0].onerror;
  player.stop();
  staleEnd?.();
  staleError?.({ error: 'synthesis-failed' });
  assert.equal(ended, 0);
  assert.equal(errors, 0);
});

test('normal completion calls onend only once', () => {
  let ended = 0;
  let errors = 0;
  const { player, synthesis } = setup({ onError: () => errors++ });
  player.speak('一', () => ended++);
  const utterance = synthesis.spoken[0];
  utterance.onend?.();
  utterance.onend?.();
  utterance.onerror?.({ error: 'synthesis-failed' });
  assert.equal(ended, 1);
  assert.equal(errors, 0);
  player.stop();
});

test('a real synthesis error reports and completes only once', () => {
  let ended = 0;
  let errors = 0;
  const { player, synthesis } = setup({ onError: () => errors++ });
  player.speak('一', () => ended++);
  const utterance = synthesis.spoken[0];
  utterance.onerror?.({ error: 'synthesis-failed' });
  utterance.onerror?.({ error: 'synthesis-failed' });
  utterance.onend?.();
  assert.equal(errors, 1);
  assert.equal(ended, 1);
  player.stop();
});

test('cancellation and interruption errors do not advance a speech sequence', () => {
  for (const error of ['canceled', 'interrupted']) {
    let ended = 0;
    let errors = 0;
    const { player, synthesis } = setup({ onError: () => errors++ });
    player.speak('数字儿歌', () => ended++);
    synthesis.spoken[0].onerror?.({ error });
    assert.equal(ended, 0, error);
    assert.equal(errors, 0, error);
    player.stop();
  }
});

test('muted playback completes without speaking or showing an unavailable message', () => {
  let ended = 0;
  let unavailable = 0;
  const { player, synthesis } = setup({ isEnabled: () => false, onUnavailable: () => unavailable++ });
  player.speak('安静学习', () => ended++);
  assert.equal(synthesis.spoken.length, 0);
  assert.equal(ended, 1);
  assert.equal(unavailable, 0);
});

test('muting while voices load prevents pending playback', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let enabled = true;
  const { player, synthesis } = setup({ isEnabled: () => enabled }, []);
  player.speak('安静学习');
  enabled = false;
  synthesis.emitVoices([voice('Tingting', 'zh-CN')]);
  t.mock.timers.tick(1000);
  assert.equal(synthesis.spoken.length, 0);
  player.stop();
});

test('unsupported speech notifies and completes without throwing', () => {
  for (const support of [{ synthesis: null, Utterance: FakeUtterance }, { synthesis: new FakeSynthesis(), Utterance: null }]) {
    let ended = 0;
    let unavailable = 0;
    const player = createSpeechPlayer({ ...support, onUnavailable: () => unavailable++ });
    player.speak('一起读一读', () => ended++);
    assert.equal(unavailable, 1);
    assert.equal(ended, 1);
    assert.doesNotThrow(() => player.stop());
  }
});
