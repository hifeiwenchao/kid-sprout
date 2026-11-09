import './memory-garden.css';

const shuffled = values => {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export function createMemoryGarden({ openModal, dialogContent, icon, fruitIcon, names, speak, chime, celebrate, onLearn, complete, setCleanup }) {
  let round = 1;
  let cards = [];
  let flipped = [];
  let matches = 0;
  let locked = false;
  let flipTimer;

  function start() {
    round = 1;
    renderRound();
  }

  function renderRound() {
    const pool = round === 1 ? [1, 2, 3] : round === 2 ? [4, 5, 6] : shuffled([7, 8, 9, 10]).slice(0, 3);
    cards = shuffled(pool.flatMap(value => [{ value, type: 'number' }, { value, type: 'quantity' }]));
    flipped = [];
    matches = 0;
    locked = false;
    openModal(`
      <div class="round-indicator">${Array.from({ length: 3 }, (_, i) => `<span class="${i < round - 1 ? 'done' : i === round - 1 ? 'current' : ''}">${i < round - 1 ? '✓' : i + 1}</span>`).join('')}</div>
      <span class="modal-kicker">记忆翻翻乐 · 第 ${round} / 3 关</span>
      <h2 id="dialog-title">帮数字找到好朋友</h2>
      <p class="modal-subtitle">翻开两张卡片，让数字和一样多的星星牵手</p>
      <div class="memory-example" aria-label="例如：数字 2 和两颗星星是一对"><span>2</span><i>↔</i><span>${fruitIcon(4)}${fruitIcon(4)}</span><small>它们是一对好朋友</small></div>
      <div class="memory-grid">${cards.map((card, index) => `
        <button class="memory-card" data-memory-card="${index}" aria-label="翻开第 ${index + 1} 张卡片" aria-pressed="false">
          <span class="memory-card-inner">
            <span class="memory-back" aria-hidden="true"><span>?</span><small>点我翻一翻</small><i>✧</i></span>
            <span class="memory-front ${card.type === 'number' ? 'memory-number' : 'memory-quantity'}" aria-hidden="true">
              ${card.type === 'number' ? `<strong>${card.value}</strong><small>数字朋友</small>` : `<span class="memory-stars">${Array.from({ length: card.value }, () => fruitIcon(4)).join('')}</span><small>数数有几颗星星</small>`}
            </span>
          </span>
          <span class="memory-match-mark" aria-hidden="true">${icon('check', 13)}</span>
        </button>`).join('')}</div>
      <div class="memory-bottom"><button class="memory-help" id="memory-help">${icon('sound', 17)}听听怎么玩</button><span id="memory-count" aria-live="polite">已找到 0 / 3 对</span></div>
      <p id="memory-feedback" class="game-feedback" role="status">慢慢翻，记住朋友躲在哪里</p>
      <button id="memory-next" class="button primary" hidden>${round === 3 ? '领取小星星' : '去下一片花园'}${icon('arrow', 18)}</button>
    `, 'memory-modal');
    setCleanup(() => clearTimeout(flipTimer));
    dialogContent.querySelectorAll('[data-memory-card]').forEach(button => {
      button.onclick = () => flip(Number(button.dataset.memoryCard));
    });
    dialogContent.querySelector('#memory-help').onclick = () => speak('点开两张卡片。数字几，就找几颗星星。数字和一样多的星星是一对好朋友。');
    dialogContent.querySelector('#memory-next').onclick = () => {
      if (round < 3) { round++; renderRound(); }
      else complete({ title: '记忆小花园开花啦！', message: '3 关全部完成，数字和星星都找到朋友啦。', replay: start });
    };
    speak('帮数字找到好朋友。点开两张卡片，数字几，就找几颗星星。');
  }

  function cardButton(index) { return dialogContent.querySelector(`[data-memory-card="${index}"]`); }
  function description(card) { return card.type === 'number' ? `数字${names[card.value - 1]}` : `${names[card.value - 1]}颗星星`; }
  function flip(index) {
    const card = cards[index];
    if (locked || card.matched || flipped.includes(index)) return;
    const button = cardButton(index);
    button.classList.add('revealed');
    button.setAttribute('aria-pressed', 'true');
    button.setAttribute('aria-label', description(card));
    flipped.push(index);
    const feedback = dialogContent.querySelector('#memory-feedback');
    feedback.classList.remove('success');
    if (flipped.length === 1) {
      feedback.textContent = `${description(card)}，谁是它的好朋友呢？`;
      speak(description(card));
      return;
    }
    const first = cards[flipped[0]];
    if (first.value === card.value && first.type !== card.type) {
      flipped.forEach(i => {
        cards[i].matched = true;
        cardButton(i).classList.add('matched');
        cardButton(i).disabled = true;
        cardButton(i).setAttribute('aria-label', `已配对，${description(cards[i])}`);
      });
      flipped = [];
      matches++;
      onLearn([card.value]);
      chime(true);
      feedback.textContent = matches === 3 ? '三对朋友都找到啦，你的记性真棒！' : `找到啦！数字 ${card.value} 和${names[card.value - 1]}颗星星是一对`;
      feedback.classList.add('success');
      dialogContent.querySelector('#memory-count').textContent = `已找到 ${matches} / 3 对`;
      speak(`找到啦！数字${names[card.value - 1]}，和${names[card.value - 1]}颗星星。`);
      if (matches === 3) {
        locked = true;
        celebrate();
        const next = dialogContent.querySelector('#memory-next');
        next.hidden = false;
        next.focus({ preventScroll: true });
      } else {
        const nextIndex = cards.findIndex(candidate => !candidate.matched);
        cardButton(nextIndex).focus({ preventScroll: true });
      }
      return;
    }
    locked = true;
    feedback.textContent = '记住它们的位置，再找一找～';
    speak('再找一找，记住它们的位置哦');
    flipTimer = setTimeout(() => {
      flipped.forEach(i => {
        cardButton(i).classList.remove('revealed');
        cardButton(i).setAttribute('aria-pressed', 'false');
        cardButton(i).setAttribute('aria-label', `翻开第 ${i + 1} 张卡片`);
      });
      flipped = [];
      locked = false;
      feedback.textContent = '再试一次，朋友就藏在这里';
    }, 1600);
  }

  return start;
}
