import './style.css';
import './games/game-cards.css';
import { createNumberAdventures } from './games/number-adventures.js';
import { createMemoryGarden } from './games/memory-garden.js';
import { createBalloonParty } from './games/balloon-party.js';
import { createBearPicnic } from './games/bear-picnic.js';
import { createLittleDrum } from './games/little-drum.js';
import './games/new-game-cards.css';
import { renderLearningHub } from './learning-hub.js';
import { filterGames } from './game-catalog.js';
import { renderSubjectGames } from './game-cards.js';
import { NUMBER_EXTRA_GAMES, buildNumberExtraRounds } from './games/number-extras.js';
import { PINYIN_EXTRA_GAMES, buildPinyinExtraRounds } from './courses/pinyin-extras.js';
import { ALPHABET_EXTRA_GAMES, buildAlphabetExtraRounds } from './courses/alphabet-extras.js';
import { playActivity } from './games/activity-player.js';
import { restoreLearningProgress, serializeLearningProgress, viewFromHash } from './hub-state.js';
import { renderPinyinPage, createPinyinCourse, PINYIN_PROGRESS_IDS } from './courses/pinyin.js';
import { renderAlphabetPage, createAlphabetCourse } from './courses/alphabet.js';
import { ALPHABET_PROGRESS_IDS } from './courses/alphabet-data.js';
import './courses/pinyin.css';
import './courses/alphabet.css';
import './learning-hub.css';

const icon = (name, size = 22) => {
  const paths = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    game: '<path d="M7 7h10a4 4 0 0 1 4 3l1 7a3 3 0 0 1-5 2l-3-3h-4l-3 3a3 3 0 0 1-5-2l1-7a4 4 0 0 1 4-3Z"/><path d="M7 10v5m-2-2.5h4m7-1.5h.01m3 3h.01"/>',
    music: '<path d="M9 18V5l12-2v13M9 9l12-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="18" cy="16" rx="3" ry="3"/>',
    medal: '<circle cx="12" cy="9" r="6"/><path d="m8 14-2 8 6-3 6 3-2-8m-4-16 1.1 2.2 2.4.4-1.8 1.7.5 2.5-2.2-1.2-2.2 1.2.5-2.5-1.8-1.7 2.4-.4Z"/>',
    sound: '<path d="m11 4-6 5H2v6h3l6 5zM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute: '<path d="m11 4-6 5H2v6h3l6 5zM16 9l6 6m0-6-6 6"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    leaf: '<path d="M20 3S4 2 4 13a7 7 0 0 0 12 5c5-5 4-15 4-15ZM3 22 15 10"/>',
    play: '<path d="m8 4 12 8-12 8z"/>',
    fire: '<path d="M12 3c2 5-1 5 2 9 2-1 3-3 3-3 6 8 2 13-5 13S2 17 5 12c0 3 2 3 2 3-2-6 5-8 5-12Z"/>',
    pencil: '<path d="m16 3 5 5-13 13-6 1 1-6ZM13 6l5 5M3 16l5 5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.star}</svg>`;
};

const names = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const fruits = ['苹果', '橘子', '草莓', '小花', '星星', '樱桃', '小树', '胡萝卜', '气球', '蓝莓'];
const units = ['个', '个', '颗', '朵', '颗', '颗', '棵', '根', '个', '颗'];
const motifs = [
  '<path d="M16 8C7 1 0 11 5 21c3 6 7 6 11 4 4 2 8 2 11-4 5-10-2-20-11-13Z" fill="#e98a75"/><path d="M16 8c0-5 4-7 7-6 0 4-4 6-7 6Z" fill="#6c9870"/><path d="M16 8V4" stroke="#7d7450" stroke-width="2"/><path d="M8 13c-1 2-1 4 0 5" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>',
  '<circle cx="16" cy="18" r="12" fill="#efa94d"/><path d="M16 7c0-5 6-6 8-4-1 4-5 5-8 4Z" fill="#71966b"/><path d="M8 14c-1 2-1 4 0 5" stroke="#ffe1a9" stroke-width="2" stroke-linecap="round"/>',
  '<path d="M4 12C5 4 27 4 28 12c0 8-9 17-12 17S4 20 4 12Z" fill="#e78280"/><path d="m7 8 6 1 3-7 3 7 6-1-6 6-3-3-3 3Z" fill="#7eab75"/><path d="m10 16 1 1m10-1 1 1m-7 4 1 1" stroke="#fff2bf" stroke-width="2" stroke-linecap="round"/>',
  '<g fill="#e7a2bb"><circle cx="16" cy="7" r="6"/><circle cx="25" cy="14" r="6"/><circle cx="22" cy="24" r="6"/><circle cx="10" cy="24" r="6"/><circle cx="6" cy="14" r="6"/></g><circle cx="16" cy="16" r="6" fill="#f2cc61"/>',
  '<path d="m16 2 4.4 9 9.8 1.4-7.1 6.9 1.7 9.7-8.8-4.6-8.8 4.6 1.7-9.7-7.1-6.9 9.8-1.4Z" fill="#eac45d"/>',
  '<path d="M16 18c-1-7 3-10 6-15" fill="none" stroke="#749868" stroke-width="2"/><circle cx="16" cy="23" r="10" fill="#dc8183"/><path d="M21 7c-4-6-9-5-10-3 2 4 7 5 10 3Z" fill="#8eb27c"/><path d="M10 20c0-2 1-3 2-4" stroke="#f5bcc1" stroke-width="2" stroke-linecap="round"/>',
  '<path d="M16 2 4 18h5l-6 8h26l-6-8h5Z" fill="#81a886"/><path d="M16 26v5" stroke="#a28260" stroke-width="4"/>',
  '<path d="m12 8 12 6L8 31c-2 1-4 0-3-3Z" fill="#eaaa69"/><path d="M17 12c0-7 3-9 6-11m-5 11c6-4 10-4 13-3m-14 2c-5-4-6-6-5-9" fill="none" stroke="#87a87a" stroke-width="3" stroke-linecap="round"/><path d="m11 19 4 2m0-6 4 2" stroke="#d98c4b" stroke-width="2"/>',
  '<ellipse cx="16" cy="13" rx="10" ry="12" fill="#b29bc9"/><path d="m16 25-2 3h4Zm0 3c-7 3 7 3 0 6" fill="none" stroke="#a690b9" stroke-width="1.6"/><path d="M10 9c0-2 1-3 2-4" stroke="#d7cae5" stroke-width="2" stroke-linecap="round"/>',
  '<circle cx="16" cy="19" r="13" fill="#93a7cf"/><path d="m12 7 4 3 4-3-1 5-3-1-3 1Z" fill="#7189ae"/><path d="M8 18c0-3 1-4 2-5" stroke="#c2cfe6" stroke-width="2" stroke-linecap="round"/>',
];
const fruitIcon = (index, className = '') => `<svg class="fruit ${className}" viewBox="0 0 34 36" aria-hidden="true">${motifs[index % 10]}</svg>`;

const readSaved = () => { try { const value = JSON.parse(localStorage.getItem('number-garden') || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; } catch { return {}; } };
const saved = readSaved();
const state = {
  learned: new Set((Array.isArray(saved.learned) ? saved.learned : []).filter(n => Number.isInteger(n) && n >= 1 && n <= 10)),
  sound: saved.sound !== false,
  wins: Number(saved.wins) || 0,
  visits: Math.max(1, Number(saved.visits) || 1),
  lastVisit: saved.lastVisit,
};
const today = new Date().toLocaleDateString('en-CA');
if (state.lastVisit && state.lastVisit !== today) {
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  state.visits = state.lastVisit === yesterday.toLocaleDateString('en-CA') ? state.visits + 1 : 1;
}
state.lastVisit = today;
const save = () => { try { localStorage.setItem('number-garden', JSON.stringify({ ...state, learned: [...state.learned] })); } catch {} };
save();
let languageSaved;
try { languageSaved = localStorage.getItem('sprout-learning'); } catch {}
const learning = restoreLearningProgress(languageSaved, { pinyin: PINYIN_PROGRESS_IDS, alphabet: ALPHABET_PROGRESS_IDS });
const saveLearning = () => { try { localStorage.setItem('sprout-learning', serializeLearningProgress(learning)); } catch {} };
let pinyinCourse;
let alphabetCourse;

const numbersPage = `<header class="hub-page-heading"><span class="hub-eyebrow">01 / NUMBER GARDEN</span><h1 id="number-page-title" tabindex="-1">和数字，交个朋友 <span>🌱</span></h1><p>从 1 到 10，听一听、数一数、玩一玩。每一个小发现，都值得一颗星星。</p><button class="button secondary" data-action="song">${icon('music', 18)}听首数字儿歌</button></header>
    <section class="numbers-section" id="number-cards" aria-labelledby="numbers-title">
      <div class="section-heading"><div><h2 id="numbers-title"><span class="heading-icon number-heading">123</span>认识数字 <span class="latin">1–10</span></h2><p>点一点小卡片，听听数字的声音</p></div><span class="section-aside">每一个数字，都是新朋友 <span>✧</span></span></div>
      <div class="number-grid">${Array.from({length: 10}, (_, i) => `<button class="number-card color-${i}" data-number="${i + 1}" aria-label="认识数字 ${i + 1}，${names[i]}"><span class="card-top"><span class="chinese-number">${names[i]}</span><span class="card-speaker">${icon('sound', 16)}</span></span><span class="big-number">${i + 1}</span><span class="counting-icons">${Array.from({length: i + 1}, () => fruitIcon(i)).join('')}</span><span class="learned-indicator" aria-label="已认识">${icon('check', 11)}</span></button>`).join('')}</div>
      <div class="learning-progress"><span class="progress-star">${icon('star', 17)}</span><span id="learning-message"></span><div class="progress-dots">${Array.from({length:10}, (_, i) => `<span data-progress="${i + 1}"></span>`).join('')}</div><span id="progress-count"></span></div>
    </section>
    ${renderSubjectGames('numbers', icon)}
`;
document.querySelector('#app').innerHTML = renderLearningHub({ icon, visits: state.visits, numbersPage, pinyinPage: renderPinyinPage(), alphabetPage: renderAlphabetPage() });

const dialog = document.querySelector('#activity-dialog');
const dialogContent = document.querySelector('#dialog-content');
let soundContext;
let activeSong = false;
let toastTimer;
let game = null;
let cleanupActivity = null;

function toast(message) {
  document.querySelector('#toast').textContent = message;
  document.querySelector('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => document.querySelector('#toast').classList.remove('visible'), 2600);
}

function chime(success = false) {
  if (!state.sound) return;
  try {
    soundContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (soundContext.state === 'suspended') soundContext.resume();
    (success ? [523.25, 659.25, 783.99, 1046.5] : [659.25, 880]).forEach((note, index) => {
      const oscillator = soundContext.createOscillator();
      const gain = soundContext.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = note;
      gain.gain.setValueAtTime(0, soundContext.currentTime + index * .11);
      gain.gain.linearRampToValueAtTime(.075, soundContext.currentTime + index * .11 + .02);
      gain.gain.exponentialRampToValueAtTime(.001, soundContext.currentTime + index * .11 + .32);
      oscillator.connect(gain); gain.connect(soundContext.destination);
      oscillator.start(soundContext.currentTime + index * .11); oscillator.stop(soundContext.currentTime + index * .11 + .34);
    });
  } catch {}
}

function speak(text, onend, language = 'zh-CN') {
  if (!state.sound) { onend?.(); return; }
  if (!('speechSynthesis' in window)) { toast('这个浏览器暂不支持点读，可以和爸爸妈妈一起念哦'); onend?.(); return; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language; utterance.rate = language === 'en-US' ? .72 : .78; utterance.pitch = 1.15;
  const voices = window.speechSynthesis.getVoices();
  const prefix = language.split('-')[0];
  const voice = voices.find(v => v.lang.replace('_', '-').toLowerCase() === language.toLowerCase()) || voices.find(v => v.lang.toLowerCase().startsWith(prefix));
  if (voice) utterance.voice = voice;
  utterance.onend = onend;
  utterance.onerror = event => {
    if (!['canceled', 'interrupted'].includes(event.error)) { toast('声音暂时无法播放，试试再听一遍'); onend?.(); }
  };
  window.speechSynthesis.speak(utterance);
}

function stopActivity() {
  activeSong = false;
  window.speechSynthesis?.cancel();
  cleanupActivity?.(); cleanupActivity = null;
}
function openModal(html, className = '') {
  stopActivity();
  dialog.className = className;
  dialogContent.innerHTML = html;
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  const title = dialogContent.querySelector('#dialog-title');
  if (title) { title.tabIndex = -1; title.focus({ preventScroll: true }); }
}
function closeModal() { stopActivity(); dialog.close(); }
document.querySelector('.modal-close').addEventListener('click', closeModal);
dialog.addEventListener('cancel', stopActivity);
dialog.addEventListener('click', e => { if (e.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) closeModal(); } });

function updateProgress() {
  const count = state.learned.size;
  const learnedTotal = count + learning.pinyin.size + learning.alphabet.size;
  const total = 10 + PINYIN_PROGRESS_IDS.length + ALPHABET_PROGRESS_IDS.length;
  document.querySelector('#side-progress').style.width = `${learnedTotal / total * 100}%`;
  document.querySelector('#side-progress-text').textContent = `已收集 ${learnedTotal} / ${total} 颗学习小星星`;
  const subjects = { numbers: [count, 10], pinyin: [learning.pinyin.size, PINYIN_PROGRESS_IDS.length], alphabet: [learning.alphabet.size, 26] };
  Object.entries(subjects).forEach(([subject, [learned, available]]) => {
    document.querySelectorAll(`[data-subject-progress="${subject}"]`).forEach(el => { el.textContent = `${learned} / ${available}`; });
  });
  const nextNumber = Array.from({length: 10}, (_, i) => i + 1).find(n => !state.learned.has(n));
  const nextPinyin = PINYIN_PROGRESS_IDS.find(id => !learning.pinyin.has(id));
  const nextLetter = ALPHABET_PROGRESS_IDS.find(id => !learning.alphabet.has(id));
  document.querySelector('[data-continue-label="numbers"]').textContent = nextNumber ? `下一位朋友：数字 ${nextNumber}` : '10 个数字都认识啦，再复习一下吧';
  document.querySelector('[data-continue-label="pinyin"]').textContent = nextPinyin ? `继续学习第 ${PINYIN_PROGRESS_IDS.indexOf(nextPinyin) + 1} 课` : '14 课都完成啦，再复习一下吧';
  document.querySelector('[data-continue-label="alphabet"]').textContent = nextLetter ? `下一位朋友：字母 ${nextLetter}` : 'A–Z 都认识啦，再复习一下吧';
  pinyinCourse?.refreshProgress();
  alphabetCourse?.refreshProgress();
  document.querySelector('#progress-count').textContent = `${count} / 10`;
  document.querySelector('#learning-message').textContent = count === 10 ? '真棒！10 个数字朋友都认识你啦！' : count ? `真棒！你已经认识 ${count} 个数字朋友啦` : '收集你的数字小星星，开始第一步吧！';
  document.querySelectorAll('[data-progress]').forEach(el => el.classList.toggle('filled', state.learned.has(Number(el.dataset.progress))));
  document.querySelectorAll('[data-number]').forEach(el => el.classList.toggle('learned', state.learned.has(Number(el.dataset.number))));
  const soundButton = document.querySelector('#sound-toggle');
  soundButton.innerHTML = icon(state.sound ? 'sound' : 'mute', 21);
  soundButton.setAttribute('aria-label', state.sound ? '关闭声音' : '开启声音');
  soundButton.setAttribute('aria-pressed', String(state.sound));
  soundButton.title = state.sound ? '关闭声音' : '开启声音';
  save();
}

function celebrate() {
  const colors = ['#f1c65c', '#e89b8b', '#8caf8c', '#91b8d2', '#b29bc9'];
  const container = document.querySelector('#confetti');
  container.innerHTML = Array.from({length:30}, (_,i) => `<i style="--x:${Math.random() * 100}%;--delay:${Math.random() * .4}s;--rotation:${Math.random() * 720}deg;background:${colors[i % colors.length]}"></i>`).join('');
  setTimeout(() => { container.innerHTML = ''; }, 2000);
}

function showNumber(n) {
  const wasNew = !state.learned.has(n);
  state.learned.add(n); updateProgress();
  openModal(`<span class="modal-kicker">认识一位新朋友</span><h2 id="dialog-title">你好，我是数字${names[n - 1]}！</h2><div class="number-friend color-${n - 1}"><span>${n}</span><i>● ●</i><b>⌣</b></div><p class="modal-subtitle">${names[n - 1]}${units[n - 1]}${fruits[n - 1]}，一起数一数</p><div class="modal-fruits">${Array.from({length:n}, (_, i) => `<button class="count-fruit" data-count="${i + 1}" aria-label="第 ${i + 1} ${units[n - 1]}${fruits[n - 1]}">${fruitIcon(n - 1)}<small>${i + 1}</small></button>`).join('')}</div><div class="modal-actions"><button class="button secondary" data-modal-action="repeat">${icon('sound',18)}再听一遍</button><button class="button primary" data-modal-action="next">${n === 10 ? '和数字一起玩' : '下一个朋友'}${icon('arrow',18)}</button></div><p class="modal-footnote">试着点一点每${units[n - 1]}${fruits[n - 1]}吧</p>`, 'number-modal');
  speak(`${names[n - 1]}，数字${names[n - 1]}。${names[n - 1]}${units[n - 1]}${fruits[n - 1]}`);
  if (wasNew && state.learned.size === 10) celebrate();
  dialogContent.querySelectorAll('[data-count]').forEach(button => button.addEventListener('click', () => { button.classList.add('counted'); speak(names[Number(button.dataset.count) - 1]); }));
  dialogContent.querySelector('[data-modal-action="repeat"]').onclick = () => speak(`数字${names[n - 1]}，${names[n - 1]}${units[n - 1]}${fruits[n - 1]}`);
  dialogContent.querySelector('[data-modal-action="next"]').onclick = () => n < 10 ? showNumber(n + 1) : startGame('count');
}

const rhyme = ['一像铅笔细又长', '二像小鸭水上漂', '三像耳朵听声音', '四像小旗迎风飘', '五像秤钩来买菜', '六像口哨嘟嘟响', '七像镰刀割青草', '八像葫芦扭扭腰', '九像气球天上飞', '一零手拉手就是十'];
function showSong() {
  openModal(`<span class="modal-symbol song-symbol">${icon('music',32)}</span><span class="modal-kicker">唱唱念念，记住数字</span><h2 id="dialog-title">数字朋友歌</h2><p class="modal-subtitle">拍一拍小手，跟着节奏一起念</p><div class="song-lyrics">${rhyme.map((line,i) => `<div data-lyric="${i}"><span class="lyric-number color-${i}">${i + 1}</span>${line}</div>`).join('')}</div><button class="button primary" id="song-play">${icon('play',18)}播放数字儿歌</button>`, 'song-modal');
  const play = document.querySelector('#song-play');
  let songLine = 0;
  function playLine(i) {
    if (!activeSong) return;
    if (i >= rhyme.length) { activeSong = false; songLine = 0; play.innerHTML = `${icon('play',18)}再听一遍`; return; }
    songLine = i;
    document.querySelectorAll('[data-lyric]').forEach(el => el.classList.toggle('singing', Number(el.dataset.lyric) === i));
    chime(); speak(rhyme[i], () => { if (activeSong) { const timeout = setTimeout(() => playLine(i + 1), 400); cleanupActivity = () => clearTimeout(timeout); } });
  }
  play.onclick = () => {
    if (activeSong) { stopActivity(); play.innerHTML = `${icon('play',18)}继续听儿歌`; return; }
    if (!state.sound) { state.sound = true; updateProgress(); }
    activeSong = true; play.textContent = '暂停播放'; playLine(songLine);
  };
}

const shuffle = values => [...values].sort(() => Math.random() - .5);
function startGame(type) {
  game = { type, round: 1, target: 1, locked: false, used: [] };
  showGameRound();
}
function showGameRound() {
  const targets = Array.from({length:10},(_,i)=>i+1).filter(n => !game.used.includes(n));
  game.target = targets[Math.floor(Math.random()*targets.length)];
  game.used.push(game.target); game.locked = false;
  const n = game.target;
  const isCounting = game.type === 'count';
  const fruit = Math.floor(Math.random()*3);
  const answers = shuffle([n, ...shuffle(Array.from({length:10},(_,i)=>i+1).filter(v=>v!==n)).slice(0, isCounting ? 2 : 5)]);
  openModal(`<div class="round-indicator">${Array.from({length:5},(_,i)=>`<span class="${i < game.round - 1 ? 'done' : i === game.round - 1 ? 'current' : ''}">${i < game.round - 1 ? '✓' : i+1}</span>`).join('')}</div><span class="modal-kicker">${isCounting ? '数一数水果' : '数字捉迷藏'} · 第 ${game.round} / 5 关</span><h2 id="dialog-title">${isCounting ? '一共有几个水果呢？' : `请找到数字「${names[n-1]}」`}</h2><p class="modal-subtitle">${isCounting ? '伸出小手，一个一个慢慢数' : '仔细看一看，点一点它的小卡片'}</p>${isCounting ? `<div class="game-fruit-basket">${Array.from({length:n},(_,i)=>`<button class="basket-fruit" data-fruit-count="${i+1}" aria-label="数第 ${i+1} 个水果">${fruitIcon(fruit)}</button>`).join('')}</div>` : `<button class="listen-prompt" id="listen-prompt">${icon('sound',24)}听听要找谁</button>`}<div class="answer-grid ${isCounting ? '' : 'six-answers'}">${answers.map(value=>`<button class="answer-button color-${value-1}" data-answer="${value}" aria-label="数字 ${value}">${value}</button>`).join('')}</div><p id="game-feedback" class="game-feedback" role="status">${isCounting ? '点一点水果，也可以听见数数声哦' : '找到了就点一下，你一定可以的！'}</p><button id="next-round" class="button primary" hidden>${game.round === 5 ? '看看我的小奖励' : '继续下一关'} ${icon('arrow',18)}</button>`, 'game-modal');
  speak(isCounting ? '一共有几个水果呢？一起数一数吧' : `请找到数字${names[n-1]}`);
  dialogContent.querySelectorAll('[data-fruit-count]').forEach(el => el.onclick = () => { el.classList.add('counted'); speak(names[Number(el.dataset.fruitCount)-1]); });
  dialogContent.querySelector('#listen-prompt')?.addEventListener('click', () => speak(`请找到数字${names[n-1]}`));
  dialogContent.querySelectorAll('[data-answer]').forEach(el => el.onclick = () => {
    if (game.locked) return;
    const feedback = document.querySelector('#game-feedback');
    if (Number(el.dataset.answer) !== n) {
      el.classList.remove('try-again'); void el.offsetWidth; el.classList.add('try-again');
      feedback.textContent = isCounting ? '再数一次试试看，慢慢来～' : '差一点点，再找找看～';
      speak(feedback.textContent); return;
    }
    game.locked = true; el.classList.add('correct');
    state.learned.add(n); updateProgress();
    feedback.textContent = ['太棒啦，你找对了！', '小小脑袋，真聪明！', '答对啦，送你一颗小星星！'][Math.floor(Math.random()*3)];
    feedback.classList.add('success');
    chime(true); speak(`答对啦，是${names[n-1]}！`); celebrate();
    document.querySelector('#next-round').hidden = false;
  });
  document.querySelector('#next-round').onclick = () => { if (game.round === 5) finishGame(); else { game.round++; showGameRound(); } };
}
function finishGame() {
  state.wins++; save();
  openModal(`<div class="reward-star">★<span>✦</span><i>✧</i></div><span class="modal-kicker">5 / 5 关，全部完成！</span><h2 id="dialog-title">你是数字小能手！</h2><p class="modal-subtitle">认真观察、勇敢尝试，你做得真棒！<br>一颗闪闪的小星星送给你。</p><div class="modal-actions"><button class="button secondary" id="finish-close">休息一下</button><button class="button primary" id="play-again">再玩一次${icon('arrow',18)}</button></div>`, 'reward-modal');
  celebrate(); chime(true); speak('太棒啦！你是数字小能手！');
  document.querySelector('#play-again').onclick = () => startGame(game.type);
  document.querySelector('#finish-close').onclick = closeModal;
}

function completeExtraGame({ title, message, replay }) {
  state.wins++;
  updateProgress();
  openModal(`<div class="reward-star">★<span>✦</span><i>✧</i></div><span class="modal-kicker">这次的挑战，全部完成！</span><h2 id="dialog-title">${title}</h2><p class="modal-subtitle">${message}<br>送你一颗闪闪的小星星！</p><div class="modal-actions"><button class="button secondary" id="extra-finish-close">休息一下</button><button class="button primary" id="extra-play-again">再玩一次${icon('arrow', 18)}</button></div>`, 'reward-modal');
  celebrate();
  chime(true);
  speak(`太棒啦！${title}`);
  dialogContent.querySelector('#extra-finish-close').onclick = closeModal;
  dialogContent.querySelector('#extra-play-again').onclick = replay;
}

function showTrace(n = 1) {
  openModal(`<span class="modal-kicker">小手描数字</span><h2 id="dialog-title">一起画出数字${names[n-1]}吧</h2><p class="modal-subtitle">用小手指或鼠标，沿着数字描一描</p><div class="trace-wrap"><span class="trace-guide">${n}</span><canvas id="trace-canvas" aria-label="数字 ${n} 的自由描画区域"></canvas></div><div class="trace-number-picker">${names.map((_,i)=>`<button class="${i+1 === n ? 'selected' : ''}" data-trace="${i+1}" aria-label="描数字 ${i+1}">${i+1}</button>`).join('')}</div><div class="modal-actions"><button id="clear-trace" class="button secondary">重新画一画</button><button id="finish-trace" class="button primary">我画好啦${icon('check',18)}</button></div><p class="modal-footnote">大胆试一试，每一条线都是进步</p>`, 'trace-modal');
  const canvas = document.querySelector('#trace-canvas');
  const ratio = window.devicePixelRatio || 1;
  const canvasWidth = canvas.clientWidth;
  const canvasHeight = canvas.clientHeight;
  canvas.width = canvasWidth * ratio; canvas.height = canvasHeight * ratio;
  const ctx = canvas.getContext('2d'); ctx.scale(ratio, ratio);
  ctx.strokeStyle = '#6f9b7a'; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  let drawing = false; let painted = false;
  const point = e => { const r=canvas.getBoundingClientRect(); return [(e.clientX-r.left)*canvasWidth/r.width,(e.clientY-r.top)*canvasHeight/r.height]; };
  canvas.onpointerdown = e => { drawing=true; canvas.setPointerCapture(e.pointerId); ctx.beginPath(); ctx.moveTo(...point(e)); };
  canvas.onpointermove = e => { if (!drawing) return; painted=true; ctx.lineTo(...point(e)); ctx.stroke(); };
  canvas.onpointerup = canvas.onpointercancel = () => { drawing=false; };
  document.querySelector('#clear-trace').onclick = () => { ctx.clearRect(0,0,canvasWidth,canvasHeight); painted=false; };
  document.querySelectorAll('[data-trace]').forEach(el => el.onclick = () => showTrace(Number(el.dataset.trace)));
  document.querySelector('#finish-trace').onclick = () => {
    if (!painted) { toast('先在数字上描一描，再点「我画好啦」哦'); return; }
    state.learned.add(n); updateProgress(); celebrate(); chime(true);
    speak(`画得真棒！这是数字${names[n-1]}`);
    toast(`数字${names[n-1]}收集成功，你真棒！`);
    const button=document.querySelector('#finish-trace');
    button.innerHTML=`下一个数字${icon('arrow',18)}`;
    button.onclick=()=>showTrace(n === 10 ? 1 : n+1);
  };
}

function showAchievements() {
  const achievements = [
    { title:'第一位朋友', description:'认识第 1 个数字', earned:state.learned.size > 0, symbol:'🌱' },
    { title:'数字好伙伴', description:'认识 5 个数字', earned:state.learned.size >= 5, symbol:'🌼' },
    { title:'闪亮小星星', description:'认识全部 10 个数字', earned:state.learned.size === 10, symbol:'🌟' },
    { title:'游戏小能手', description:'完整通关任意小游戏', earned:state.wins > 0, symbol:'🏆' },
    { title:'拼音小萌芽', description:'完成任意一课拼音学习', earned:learning.pinyin.size > 0, symbol:'🌷' },
    { title:'拼音好伙伴', description:'完成全部 14 课拼音', earned:learning.pinyin.size === PINYIN_PROGRESS_IDS.length, symbol:'🦋' },
    { title:'字母新朋友', description:'认识第一个英文字母', earned:learning.alphabet.size > 0, symbol:'🍃' },
    { title:'字母收藏家', description:'认识全部 26 个字母', earned:learning.alphabet.size === 26, symbol:'🌈' },
  ];
  openModal(`<span class="modal-kicker">每一次努力，都闪闪发光</span><h2 id="dialog-title">我的小成就</h2><p class="modal-subtitle">认识 <b>${state.learned.size}</b> 个数字 · 完成 <b>${learning.pinyin.size}</b> 课拼音 · 认识 <b>${learning.alphabet.size}</b> 个字母<br>已经完成 <b>${state.wins}</b> 次小游戏</p><div class="achievement-grid">${achievements.map(a=>`<div class="achievement ${a.earned?'earned':''}"><span class="achievement-symbol">${a.earned ? a.symbol : icon('lock',30)}</span><strong>${a.title}</strong><small>${a.description}</small><span class="achievement-status">${a.earned?'已获得 · 你真棒！':'等待你来点亮'}</span></div>`).join('')}</div><button class="button primary" id="back-to-learn">继续探索${icon('arrow',18)}</button>`, 'achievement-modal');
  document.querySelector('#back-to-learn').onclick = () => { closeModal(); navigate('home'); };
}
function showParents() {
  openModal(`<span class="modal-symbol parent-symbol">${icon('heart',30)}</span><span class="modal-kicker">写给温柔的大朋友</span><h2 id="dialog-title">陪伴，是最好的启蒙</h2><p class="modal-subtitle">从数字到语言，跟着孩子自己的节奏探索</p><div class="parent-tips"><p><b>01 · 每天一点点</b>一次玩 5–10 分钟就好。低龄孩子先认数字、看看字母；拼音可以在准备好时一起慢慢学。</p><p><b>02 · 把发现带进生活</b>数桌上的苹果、找书里的字母、听一个汉字的声调。屏幕外也有很多小课堂。</p><p><b>03 · 陪孩子一起听读</b>拼音按 2024 新版人教一年级上册顺序组织，是自主制作的辅助练习。例字合成语音用于读音参考；声母要读得轻短，建议结合老师示范。英文字母学习的是字母名和常见单词。</p><p><b>04 · 鼓励每一次尝试</b>答错可以再试，没有倒计时和排名。认识的数字、完成的拼音课、字母和成就自动保存在当前浏览器中。</p></div><button class="button primary" id="parents-close">和宝贝一起出发${icon('heart',18)}</button>`, 'parent-modal');
  document.querySelector('#parents-close').onclick = closeModal;
}

const extraGameEnvironment = {
  openModal, dialogContent, icon, fruitIcon, names, speak, chime, celebrate,
  onLearn(numbers) { numbers.forEach(n => state.learned.add(n)); updateProgress(); },
  complete: completeExtraGame,
  setCleanup(fn) { cleanupActivity = fn; },
  isSoundEnabled: () => state.sound,
  enableSound() { if (!state.sound) { state.sound = true; updateProgress(); } },
  stopSpeech() { window.speechSynthesis?.cancel(); },
};
const adventures = createNumberAdventures(extraGameEnvironment);
const memoryGarden = createMemoryGarden(extraGameEnvironment);
const balloonParty = createBalloonParty(extraGameEnvironment);
const bearPicnic = createBearPicnic(extraGameEnvironment);
const littleDrum = createLittleDrum(extraGameEnvironment);

function courseEnvironment(subject) {
  return {
    ...extraGameEnvironment,
    learned: learning[subject],
    speakEnglish: (text, onend) => speak(text, onend, 'en-US'),
    onLearn(id) { learning[subject].add(id); saveLearning(); updateProgress(); },
  };
}
pinyinCourse = createPinyinCourse(courseEnvironment('pinyin'));
alphabetCourse = createAlphabetCourse(courseEnvironment('alphabet'));
pinyinCourse.bind(document.querySelector('#pinyin'));
alphabetCourse.bind(document.querySelector('#alphabet'));

const actions = {
  explore: () => showNumber(Array.from({length:10},(_,i)=>i+1).find(n=>!state.learned.has(n)) || 1),
  song: showSong, count: () => startGame('count'), find: () => startGame('find'), trace: () => showTrace(), parents: showParents, achievements: showAchievements,
  train: adventures.train, compare: adventures.compare, memory: memoryGarden,
  balloons: balloonParty, picnic: bearPicnic, drum: littleDrum,
};
document.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>actions[el.dataset.action]?.()));
document.querySelectorAll('[data-number]').forEach(el=>el.addEventListener('click',()=>showNumber(Number(el.dataset.number))));
const pageNames = { home: '探索首页', numbers: '数字乐园', pinyin: '拼音天地', alphabet: '字母森林', games: '游戏大厅' };
function showView(view, focus = true) {
  closeModal();
  document.querySelectorAll('[data-page]').forEach(el => { el.hidden = el.dataset.page !== view; });
  document.querySelectorAll('[data-nav]').forEach(el => {
    const selected = el.dataset.nav === view;
    el.classList.toggle('active', selected);
    if (selected) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
  });
  document.querySelector('#current-page-label').textContent = pageNames[view];
  document.title = `${pageNames[view]} · 小芽学习乐园`;
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (focus) {
    const heading = document.querySelector(`[data-page="${view}"] h1, [data-page="${view}"] h2`);
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }
}
function navigate(view) {
  if (location.hash !== `#${view}`) history.pushState(null, '', `#${view}`);
  showView(view);
}
document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  document.querySelector('#main-content').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
});
document.querySelectorAll('a[href^="#"]').forEach(link => {
  const view = link.getAttribute('href').slice(1);
  if (!Object.hasOwn(pageNames, view)) return;
  link.addEventListener('click', event => { event.preventDefault(); navigate(view); });
});
window.addEventListener('hashchange', () => showView(viewFromHash(location.hash)));
document.querySelectorAll('[data-continue]').forEach(button => button.onclick = () => {
  const subject = button.dataset.continue;
  navigate(subject);
  if (subject === 'numbers') actions.explore();
  if (subject === 'pinyin') pinyinCourse.openLesson();
  if (subject === 'alphabet') alphabetCourse.openLesson();
});
document.querySelectorAll('[data-play]').forEach(button => button.onclick = () => {
  const [subject, type] = button.dataset.play.split(':');
  const builders = { numbers: buildNumberExtraRounds, pinyin: buildPinyinExtraRounds, alphabet: buildAlphabetExtraRounds };
  const extraGames = { numbers: NUMBER_EXTRA_GAMES, pinyin: PINYIN_EXTRA_GAMES, alphabet: ALPHABET_EXTRA_GAMES };
  const extra = extraGames[subject]?.find(game => game.type === type);
  if (extra) return playActivity({ ...extraGameEnvironment, speakEnglish: (text, onend) => speak(text, onend, 'en-US') }, extra, builders[subject]);
  if (subject === 'numbers') actions[type]?.();
  if (subject === 'pinyin') pinyinCourse.startGame(type);
  if (subject === 'alphabet') alphabetCourse.startGame(type);
});
let gameSubject = 'all';
function updateGameFilters() {
  const filtered = new Set(filterGames({ subject: gameSubject, category: document.querySelector('#game-goal').value, query: document.querySelector('#game-search').value }).map(game => `${game.subject}:${game.type}`));
  document.querySelectorAll('#games [data-play]').forEach(button => { button.hidden = !filtered.has(button.dataset.play); });
  document.querySelectorAll('[data-game-filter]').forEach(button => {
    const selected = button.dataset.gameFilter === gameSubject;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelector('#game-filter-status').textContent = `${filtered.size} 个游戏，选一个开始吧`;
  document.querySelector('#game-empty').hidden = filtered.size !== 0;
}
document.querySelectorAll('[data-game-filter]').forEach(button => button.onclick = () => { gameSubject = button.dataset.gameFilter; updateGameFilters(); });
document.querySelector('#game-search').addEventListener('input', updateGameFilters);
document.querySelector('#game-goal').addEventListener('change', updateGameFilters);
document.querySelector('#game-filter-clear').onclick = () => {
  gameSubject = 'all';
  document.querySelector('#game-search').value = '';
  document.querySelector('#game-goal').value = 'all';
  updateGameFilters();
  document.querySelector('#game-search').focus();
};
document.querySelector('#sound-toggle').onclick = () => { state.sound=!state.sound; if (!state.sound) stopActivity(); updateProgress(); toast(state.sound?'声音已开启，听听新朋友的声音吧':'声音已关闭'); };
updateProgress();
showView(viewFromHash(location.hash), false);
