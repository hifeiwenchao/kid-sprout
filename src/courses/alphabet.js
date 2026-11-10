import { ALPHABET, ALPHABET_GROUPS, getAlphabetLesson, createAlphabetRounds, createAlphabetSession } from './alphabet-data.js';

const lettersById = new Map(ALPHABET.map(letter => [letter.id, letter]));
const gameDetails = {
  match: { title: '大小写找朋友', heading: '谁是它的小写朋友？', subtitle: '大写字母和小写字母，是一家人哦', reward: '你是字母配对小能手！', message: '5 对大小写朋友都牵好手啦。' },
  listen: { title: '小耳朵找字母', heading: '听一听，找到字母朋友', subtitle: '听字母的英文名字，再点一下它', reward: '你有一双会听的小耳朵！', message: '5 位字母朋友，都被你找到啦。' },
  order: { title: '字母排排队', heading: '哪位字母朋友还没来？', subtitle: '按照 A 到 Z 的顺序，补上空位吧', reward: '你是字母排队小队长！', message: '5 支字母小队都排整齐啦。' },
};

function cardMarkup(letter) {
  return `<button class="alphabet-card" data-alphabet-letter="${letter.id}" aria-label="认识字母 ${letter.id}，小写 ${letter.lowercase}，${letter.word} ${letter.translation}">
    <span class="alphabet-card-head"><span>字母朋友</span><span aria-hidden="true">♫</span></span>
    <span class="alphabet-card-letters" lang="en"><b>${letter.uppercase}</b><span>${letter.lowercase}</span></span>
    <span class="alphabet-card-picture" aria-hidden="true">${letter.emoji}</span>
    <span class="alphabet-card-word" lang="en">${letter.word}</span>
    <span class="alphabet-card-translation">${letter.translation}</span>
    <span class="alphabet-learned-marker" aria-hidden="true">✓</span>
  </button>`;
}

export function renderAlphabetPage() {
  return `
    <div class="alphabet-hero">
      <div class="alphabet-hero-copy"><span class="alphabet-eyebrow">ENGLISH GARDEN · 英文字母</span><h1 id="alphabet-page-title" tabindex="-1">小小字母，<br>大声说 <em lang="en">Hello!</em></h1><p>认识 A–Z，发现大小写的小秘密。<br>听一听、找一找，和字母朋友一起玩。</p><button class="button primary" data-alphabet-resume>从 A 开始认识 <span aria-hidden="true">→</span></button><span class="alphabet-hero-note">每次认识几个，每天进步一点点</span></div>
      <div class="alphabet-hero-art" aria-hidden="true"><span class="alphabet-art-spark">✦</span><span class="alphabet-art-cloud">☁</span><span class="alphabet-art-word">Hello, little learner!</span><span class="alphabet-art-block alphabet-art-a">A<i>a</i></span><span class="alphabet-art-block alphabet-art-b">B<i>b</i></span><span class="alphabet-art-apple">🍎</span><span class="alphabet-art-bear">🐻</span><span class="alphabet-art-flower">✿</span></div>
    </div>
    <section class="alphabet-study" aria-labelledby="alphabet-cards-title">
      <div class="alphabet-section-heading"><div><span class="alphabet-eyebrow">MEET THE LETTERS</span><h2 id="alphabet-cards-title">今天，认识哪几个字母？</h2><p>点开卡片，听字母名和英文单词</p></div><div class="alphabet-progress" role="status" aria-live="polite"><span aria-hidden="true">✦</span><span>已认识 <b id="alphabet-progress-count">0 / 26</b></span></div></div>
      <div class="alphabet-group-picker" role="group" aria-label="选择一组字母">${ALPHABET_GROUPS.map((group, index) => `<button data-alphabet-group="${group.id}" aria-pressed="${index === 0}"><strong lang="en">${group.label}</strong><span data-alphabet-group-progress="${group.id}">0 / ${group.letters.length}</span></button>`).join('')}</div>
      ${ALPHABET_GROUPS.map((group, index) => `<div class="alphabet-card-grid" data-alphabet-panel="${group.id}" role="group" aria-label="${group.label} 字母卡片" ${index ? 'hidden' : ''}>${group.letters.map(id => cardMarkup(lettersById.get(id))).join('')}</div>`).join('')}
      <p class="alphabet-study-note"><span aria-hidden="true">💡</span> 大写和小写，都是同一位字母朋友的名字。先看模样，再跟着读。</p>
    </section>
    <section class="alphabet-play" aria-labelledby="alphabet-games-title">
      <div class="alphabet-section-heading"><div><span class="alphabet-eyebrow">LEARN THROUGH PLAY</span><h2 id="alphabet-games-title">字母朋友，陪你玩一会儿</h2><p>每次 5 小关，慢慢想，答错也没关系</p></div><span class="alphabet-play-decoration" aria-hidden="true">✧</span></div>
      <div class="alphabet-game-grid">
        <button class="alphabet-game-card alphabet-match-card" data-alphabet-game="match"><span class="alphabet-game-art alphabet-match-art" aria-hidden="true"><b>A</b><i>↔</i><span>a</span></span><span class="alphabet-game-copy"><small>观察 · 认知</small><strong>大小写找朋友</strong><span>帮大字母找到小写伙伴</span></span><span class="alphabet-game-arrow" aria-hidden="true">↗</span></button>
        <button class="alphabet-game-card alphabet-listen-card" data-alphabet-game="listen"><span class="alphabet-game-art alphabet-listen-art" aria-hidden="true"><i>♫</i><b>B</b><span>♪</span></span><span class="alphabet-game-copy"><small>倾听 · 辨认</small><strong>小耳朵找字母</strong><span>听听谁在和你打招呼</span></span><span class="alphabet-game-arrow" aria-hidden="true">↗</span></button>
        <button class="alphabet-game-card alphabet-order-card" data-alphabet-game="order"><span class="alphabet-game-art alphabet-order-art" aria-hidden="true"><b>A</b><i>?</i><b>C</b></span><span class="alphabet-game-copy"><small>顺序 · 思考</small><strong>字母排排队</strong><span>补上空位，让字母排好队</span></span><span class="alphabet-game-arrow" aria-hidden="true">↗</span></button>
      </div>
    </section>`;
}

export function createAlphabetCourse(env) {
  const { openModal, dialogContent, icon, speak, speakEnglish, chime, celebrate, complete, setCleanup, isSoundEnabled, enableSound, stopSpeech, learned, onLearn } = env;
  let pageRoot;
  let boundHandler;

  function markLearned(id) {
    onLearn(id);
    refreshProgress();
  }

  function refreshProgress() {
    if (!pageRoot) return;
    const count = ALPHABET.filter(letter => learned.has(letter.id)).length;
    const progress = pageRoot.querySelector('#alphabet-progress-count');
    if (progress) progress.textContent = `${count} / 26`;
    pageRoot.querySelectorAll('[data-alphabet-letter]').forEach(button => {
      const letter = lettersById.get(button.dataset.alphabetLetter);
      const isLearned = learned.has(letter.id);
      button.classList.toggle('alphabet-is-learned', isLearned);
      button.setAttribute('aria-label', `${isLearned ? '复习' : '认识'}字母 ${letter.id}，小写 ${letter.lowercase}，${letter.word} ${letter.translation}${isLearned ? '，已认识' : ''}`);
    });
    ALPHABET_GROUPS.forEach(group => {
      const counter = pageRoot.querySelector(`[data-alphabet-group-progress="${group.id}"]`);
      if (counter) counter.textContent = `${group.letters.filter(id => learned.has(id)).length} / ${group.letters.length}`;
    });
    const resume = pageRoot.querySelector('[data-alphabet-resume]');
    const next = ALPHABET.find(letter => !learned.has(letter.id));
    if (resume) resume.innerHTML = `${count === 0 ? '从 A 开始认识' : next ? `继续认识 ${next.id}` : '再听听字母朋友'} <span aria-hidden="true">→</span>`;
  }

  function selectGroup(id) {
    pageRoot.querySelectorAll('[data-alphabet-group]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.alphabetGroup === id)));
    pageRoot.querySelectorAll('[data-alphabet-panel]').forEach(panel => { panel.hidden = panel.dataset.alphabetPanel !== id; });
  }

  function bind(root) {
    if (pageRoot && boundHandler) pageRoot.removeEventListener('click', boundHandler);
    pageRoot = root;
    boundHandler = event => {
      const button = event.target.closest('button');
      if (!button || !root.contains(button)) return;
      if (button.dataset.alphabetGroup) selectGroup(button.dataset.alphabetGroup);
      else if (button.dataset.alphabetLetter) openLesson(button.dataset.alphabetLetter);
      else if (button.dataset.alphabetGame) startGame(button.dataset.alphabetGame);
      else if (button.hasAttribute('data-alphabet-resume')) openLesson();
    };
    root.addEventListener('click', boundHandler);
    refreshProgress();
  }

  function playEnglish(text, enableIfMuted = false) {
    if (!isSoundEnabled()) {
      if (!enableIfMuted) return false;
      enableSound();
    }
    speakEnglish(text);
    return true;
  }

  function openLesson(id) {
    const letter = getAlphabetLesson(learned, id);
    const index = ALPHABET.indexOf(letter);
    const soundOn = isSoundEnabled();
    openModal(`
      <span class="modal-kicker">英文字母 · 第 ${index + 1} / 26 位朋友</span>
      <h2 id="dialog-title">你好，我是字母 <span lang="en">${letter.id}</span></h2>
      <p class="modal-subtitle">一个大写，一个小写，都是我哦</p>
      <div class="alphabet-lesson-pair"><div><span>大写字母</span><strong lang="en">${letter.uppercase}</strong></div><div><span>小写字母</span><strong lang="en">${letter.lowercase}</strong></div></div>
      <button class="alphabet-speak-button" id="alphabet-letter-speak">${icon('sound', 19)}${soundOn ? '听字母名' : '开启声音听字母名'} <b lang="en">${letter.id}</b></button>
      <div class="alphabet-word-friend"><span class="alphabet-word-picture" aria-hidden="true">${letter.emoji}</span><div><span>我的单词朋友</span><strong lang="en">${letter.word}</strong><span>${letter.translation}</span></div><button id="alphabet-word-speak" aria-label="${soundOn ? `听英文单词 ${letter.word}` : '声音已关闭，点此查看听音提示'}">${icon(soundOn ? 'sound' : 'mute', 22)}</button></div>
      <p class="alphabet-letter-hint"><span aria-hidden="true">✎</span>${letter.hint}</p>
      <p class="alphabet-speech-note" id="alphabet-speech-status" role="status">${soundOn ? '听到的是字母的名字。点单词旁的小喇叭，还能听英文单词。' : '声音已关闭，仍然可以看卡片学习。想听英文，点“开启声音听字母名”。'}</p>
      <div class="alphabet-lesson-actions"><button class="button secondary" id="alphabet-previous" ${index === 0 ? 'disabled' : ''}>上一位朋友</button><button class="button primary" id="alphabet-next">${index === 25 ? '和字母一起玩' : `认识 ${ALPHABET[index + 1].id}`} ${icon('arrow', 18)}</button></div>
    `, 'alphabet-modal alphabet-lesson-modal');
    let active = true;
    setCleanup(() => { active = false; stopSpeech(); });
    markLearned(letter.id);
    dialogContent.querySelector('#alphabet-letter-speak').onclick = () => {
      if (!active) return;
      playEnglish(letter.id, true);
      dialogContent.querySelector('#alphabet-letter-speak').innerHTML = `${icon('sound', 19)}听字母名 <b lang="en">${letter.id}</b>`;
      dialogContent.querySelector('#alphabet-word-speak').innerHTML = icon('sound', 22);
      dialogContent.querySelector('#alphabet-word-speak').setAttribute('aria-label', `听英文单词 ${letter.word}`);
      dialogContent.querySelector('#alphabet-speech-status').textContent = '听到的是字母的名字。点单词旁的小喇叭，还能听英文单词。';
    };
    dialogContent.querySelector('#alphabet-word-speak').onclick = () => {
      if (!active) return;
      if (!playEnglish(letter.word)) dialogContent.querySelector('#alphabet-speech-status').textContent = '声音已关闭。可以先看卡片，想听单词请点“开启声音听字母名”。';
    };
    dialogContent.querySelector('#alphabet-previous').onclick = () => { if (active && index > 0) openLesson(ALPHABET[index - 1].id); };
    dialogContent.querySelector('#alphabet-next').onclick = () => {
      if (!active) return;
      if (index === 25) startGame('match');
      else openLesson(ALPHABET[index + 1].id);
    };
    if (isSoundEnabled()) speakEnglish(letter.id);
  }

  function startGame(type) {
    if (!gameDetails[type]) return;
    const details = gameDetails[type];
    const session = createAlphabetSession(createAlphabetRounds(type));

    function renderRound() {
      const round = session.current;
      const number = session.roundNumber;
      const soundOn = isSoundEnabled();
      const letter = lettersById.get(round.target);
      const prompt = type === 'match'
        ? `<div class="alphabet-match-target"><span>大写朋友</span><strong lang="en">${round.target}</strong><span>找到它的小写朋友 ↓</span></div>`
        : type === 'listen'
          ? `<div class="alphabet-listen-prompt"><button class="alphabet-listen-button" id="alphabet-listen">${icon('sound', 28)}<span>${soundOn ? '再听一次' : '开启声音听字母'}</span></button><button class="alphabet-hint-button" id="alphabet-reveal" aria-expanded="${!soundOn}" aria-controls="alphabet-listen-hint">看看字母提示</button><div id="alphabet-listen-hint" class="alphabet-listen-hint" ${soundOn ? 'hidden' : ''}>这一关要找 <strong lang="en">${round.target}</strong></div><p class="alphabet-audio-note">没有声音也能玩，点提示看一看</p></div>`
          : `<div class="alphabet-order-line" role="group" aria-label="按字母顺序补上空位">${round.sequence.map(value => `<span class="alphabet-order-tile ${value ? '' : 'alphabet-order-gap'}" ${value ? `lang="en"` : 'aria-label="等你补上的字母"'}>${value || '?'}</span>`).join('')}</div>`;
      openModal(`
        <div class="round-indicator" aria-label="第 ${number} 关，共 5 关">${Array.from({ length: 5 }, (_, index) => `<span class="${index < number - 1 ? 'done' : index === number - 1 ? 'current' : ''}">${index < number - 1 ? '✓' : index + 1}</span>`).join('')}</div>
        <span class="modal-kicker">${details.title} · 第 ${number} / 5 关</span><h2 id="dialog-title">${details.heading}</h2><p class="modal-subtitle">${details.subtitle}</p>
        ${prompt}
        <div class="alphabet-answer-grid" role="group" aria-label="选择一个字母答案">${round.choices.map(value => `<button class="alphabet-answer" data-alphabet-answer="${value}" aria-label="字母 ${value}" lang="en">${value}</button>`).join('')}</div>
        <p class="game-feedback" id="alphabet-game-feedback" role="status" aria-live="polite">${type === 'listen' && !soundOn ? '可以看着提示找一找，也可以开启声音听一听' : '找到啦，就点一下它的小卡片吧'}</p>
        <button class="button primary" id="alphabet-next-round" hidden>${number === 5 ? '领取我的小星星' : '继续下一关'} ${icon('arrow', 18)}</button>
      `, `game-modal alphabet-modal alphabet-${type}-modal`);
      let active = true;
      setCleanup(() => { active = false; stopSpeech(); });
      const feedback = dialogContent.querySelector('#alphabet-game-feedback');
      const answers = [...dialogContent.querySelectorAll('[data-alphabet-answer]')];
      const next = dialogContent.querySelector('#alphabet-next-round');
      answers.forEach(button => {
        button.onclick = () => {
          if (!active) return;
          const result = session.submit(button.dataset.alphabetAnswer);
          if (result === 'ignored') return;
          if (result === 'retry') {
            feedback.textContent = type === 'match' ? '还差一点点，看看字母的模样，再试一次～' : type === 'order' ? '慢慢念一念字母顺序，再找找看～' : '再听一次，或者打开字母提示，再试试看～';
            feedback.classList.remove('success');
            if (isSoundEnabled()) speak('没关系，慢慢看，再试一次。');
            return;
          }
          button.classList.add('alphabet-answer-correct');
          answers.forEach(answer => { answer.disabled = true; });
          if (type === 'order') {
            const gap = dialogContent.querySelector('.alphabet-order-gap');
            gap.textContent = round.answer;
            gap.classList.add('alphabet-order-filled');
            gap.setAttribute('aria-label', `补对啦，字母 ${round.answer}`);
          }
          feedback.textContent = type === 'match' ? `配对成功！${letter.uppercase} 和 ${letter.lowercase} 是好朋友。` : type === 'order' ? `排好啦，字母 ${round.target} 找到自己的位置了！` : `听对啦！这位朋友是 ${round.target}。`;
          feedback.classList.add('success');
          markLearned(round.target);
          chime(true);
          celebrate();
          if (isSoundEnabled()) speakEnglish(round.target);
          next.hidden = false;
          next.focus({ preventScroll: true });
        };
      });
      next.onclick = () => {
        if (!active) return;
        const result = session.advance();
        if (result === 'next') renderRound();
        else if (result === 'complete') {
          active = false;
          complete({ title: details.reward, message: details.message, replay: () => startGame(type) });
        }
      };
      if (type === 'listen') {
        dialogContent.querySelector('#alphabet-listen').onclick = () => {
          if (!active) return;
          playEnglish(round.target, true);
          dialogContent.querySelector('#alphabet-listen').innerHTML = `${icon('sound', 28)}<span>再听一次</span>`;
        };
        dialogContent.querySelector('#alphabet-reveal').onclick = () => {
          if (!active) return;
          dialogContent.querySelector('#alphabet-listen-hint').hidden = false;
          dialogContent.querySelector('#alphabet-reveal').setAttribute('aria-expanded', 'true');
        };
        if (soundOn) speakEnglish(round.target);
      } else if (isSoundEnabled()) {
        if (type === 'match') speakEnglish(round.target);
        else speak('看一看字母队伍，找到空位里的字母朋友。');
      }
    }

    renderRound();
  }

  return { bind, openLesson, startGame, refreshProgress };
}
