export function restoreLearningProgress(raw, allowed) {
  let saved;
  try { saved = JSON.parse(raw); } catch {}
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = {};
  return Object.fromEntries(Object.entries(allowed).map(([subject, ids]) => [
    subject, new Set((Array.isArray(saved[subject]) ? saved[subject] : []).filter(id => ids.includes(id))),
  ]));
}

export function serializeLearningProgress(progress) {
  return JSON.stringify(Object.fromEntries(Object.entries(progress).map(([subject, ids]) => [subject, [...ids]])));
}

export function viewFromHash(hash) {
  const view = hash.replace(/^#/, '');
  return ['home', 'numbers', 'pinyin', 'alphabet', 'games'].includes(view) ? view : 'home';
}
