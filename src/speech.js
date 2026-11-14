// Web Speech exposes voice names, but no gender. Prefer familiar female voices
// before falling back to the device's other voices in the requested language.
const femaleVoices = {
  zh: /xiaoxiao|xiaoyi|xiaohan|xiaomeng|xiaomo|xiaorui|xiaoshuang|xiaoxuan|xiaoyan|xiaoyou|晓晓|晓伊|晓涵|晓梦|晓墨|晓睿|晓双|晓萱|晓颜|晓悠|ting[ -]?ting|婷婷|huihui|hui[ -]?hui|慧慧|yaoyao|瑶瑶|lili|莉莉|google.*普通话/i,
  en: /jenny|aria|emma|ava|michelle|sara\b|samantha|victoria|karen|moira|tessa|allison|susan|zira|hazel|google.*(?:us english|uk english female)/i,
};
const normalizeLanguage = language => language.replaceAll('_', '-').toLowerCase();

function matchesLanguage(voiceLanguage, language) {
  if (voiceLanguage === language) return true;
  if (language.startsWith('zh')) {
    // Cantonese is also tagged zh on some devices; don't use it for pinyin.
    return /^(?:zh|zh-cn|zh-sg|zh-tw|zh-hans(?:-cn|-sg)?|zh-hant(?:-tw)?)$/.test(voiceLanguage);
  }
  return voiceLanguage.split('-')[0] === language.split('-')[0];
}

export function selectFriendlyVoice(voices, language = 'zh-CN') {
  const target = normalizeLanguage(language);
  const female = femaleVoices[target.split('-')[0]];
  const score = voice => {
    const name = `${voice.name || ''} ${voice.voiceURI || ''}`;
    return (normalizeLanguage(voice.lang) === target ? 1000 : 0)
      + (female?.test(name) ? 100 : 0)
      + (/natural|neural|premium|enhanced|高品质|增强/i.test(name) ? 20 : 0)
      + (voice.default ? 1 : 0);
  };
  return voices
    .filter(voice => matchesLanguage(normalizeLanguage(voice.lang || ''), target))
    .reduce((best, voice) => !best || score(voice) > score(best) ? voice : best, null);
}

export function createSpeechPlayer({
  synthesis,
  Utterance,
  isEnabled = () => true,
  onUnavailable = () => {},
  onError = () => {},
  voiceWaitMs = 800,
}) {
  let current = null;

  function clearPending(request) {
    clearTimeout(request.timer);
    if (request.onVoicesChanged) synthesis?.removeEventListener?.('voiceschanged', request.onVoicesChanged);
    request.onVoicesChanged = null;
  }

  function stop() {
    // Invalidate before cancel(): engines may dispatch cancellation immediately.
    const previous = current;
    current = null;
    if (previous) clearPending(previous);
    synthesis?.cancel();
  }

  function speak(text, onend, language = 'zh-CN') {
    stop();
    if (!isEnabled()) { onend?.(); return; }
    if (!synthesis || !Utterance) { onUnavailable(); onend?.(); return; }

    const request = {};
    current = request;
    const finish = error => {
      if (current !== request) return;
      clearPending(request);
      current = null;
      if (error) {
        if (['canceled', 'interrupted'].includes(error)) return;
        onError(error);
      }
      onend?.();
    };
    const play = voice => {
      if (current !== request) return;
      clearPending(request);
      if (!isEnabled()) { current = null; return; }
      const utterance = new Utterance(text);
      utterance.lang = language;
      utterance.rate = normalizeLanguage(language).startsWith('en') ? .9 : .92;
      utterance.pitch = 1.03;
      if (voice) utterance.voice = voice;
      // Retain the utterance while playing (some engines otherwise lose events).
      request.utterance = utterance;
      utterance.onend = () => finish();
      utterance.onerror = event => finish(event.error);
      try { synthesis.speak(utterance); } catch { finish('synthesis-failed'); }
    };

    const voice = selectFriendlyVoice(synthesis.getVoices(), language);
    if (voice) { play(voice); return; }

    // Browser voices often arrive after page load. Wait briefly so the first
    // tap gets the same voice as later taps; stop() also clears this pending work.
    request.onVoicesChanged = () => {
      const loaded = selectFriendlyVoice(synthesis.getVoices(), language);
      if (loaded) play(loaded);
    };
    synthesis.addEventListener?.('voiceschanged', request.onVoicesChanged);
    request.timer = setTimeout(() => play(selectFriendlyVoice(synthesis.getVoices(), language)), voiceWaitMs);
  }

  // Ask early so browsers can populate the voice list before the first tap.
  synthesis?.getVoices();
  return { speak, stop };
}
