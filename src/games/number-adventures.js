import './number-adventures.css';

const shuffled = values => {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const trainEngine = `<svg class="train-engine" viewBox="0 0 76 80" fill="none" aria-hidden="true"><circle cx="40" cy="8" r="6" fill="#e4e8d8"/><circle cx="30" cy="19" r="4" fill="#edf0e4"/><path d="M17 30h19v31H13V34a4 4 0 0 1 4-4Z" fill="#8ba881"/><path d="M12 29h29v6H12z" fill="#6d8d65"/><rect x="19" y="38" width="12" height="13" rx="3" fill="#f7edc6"/><path d="M35 45h23c7 0 11 5 11 12v6H35Z" fill="#efc466"/><path d="M54 35h9v14h-9z" fill="#c3a16a"/><rect x="51" y="32" width="15" height="5" rx="2" fill="#ab9165"/><path d="M9 61h61l5 7H8z" fill="#ceab7a"/><circle cx="24" cy="68" r="9" fill="#657a62"/><circle cx="57" cy="68" r="9" fill="#657a62"/><circle cx="24" cy="68" r="4" fill="#e5dfc2"/><circle cx="57" cy="68" r="4" fill="#e5dfc2"/><path d="M26 68h31" stroke="#e5dfc2" stroke-width="3" stroke-linecap="round"/><path d="M46 53v2m9-2v2" stroke="#746947" stroke-width="2.5" stroke-linecap="round"/><path d="M48 59q3 3 5 0" stroke="#746947" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const rabbit = `<svg class="carrot-rabbit" viewBox="0 0 110 100" fill="none" aria-hidden="true"><ellipse cx="40" cy="30" rx="12" ry="27" transform="rotate(-12 40 30)" fill="#fffdf7" stroke="#e7dfcf" stroke-width="2"/><ellipse cx="71" cy="29" rx="12" ry="27" transform="rotate(12 71 29)" fill="#fffdf7" stroke="#e7dfcf" stroke-width="2"/><ellipse cx="40" cy="29" rx="5" ry="17" transform="rotate(-12 40 29)" fill="#eec4bf"/><ellipse cx="71" cy="28" rx="5" ry="17" transform="rotate(12 71 28)" fill="#eec4bf"/><ellipse cx="55" cy="67" rx="36" ry="28" fill="#fffdf7" stroke="#e7dfcf" stroke-width="2"/><path d="M43 61v4m24-4v4" stroke="#7a7560" stroke-width="4" stroke-linecap="round"/><path d="m51 70 4 4 4-4Z" fill="#dcaaa1"/><path d="M55 74v4m0 0q-5 5-9 0m9 0q5 5 9 0" stroke="#9e8e7c" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="34" cy="72" rx="6" ry="4" fill="#f1d5c7"/><ellipse cx="76" cy="72" rx="6" ry="4" fill="#f1d5c7"/><ellipse cx="27" cy="88" rx="12" ry="8" fill="#fffdf7" stroke="#e7dfcf" stroke-width="1.5"/><ellipse cx="82" cy="88" rx="12" ry="8" fill="#fffdf7" stroke="#e7dfcf" stroke-width="1.5"/></svg>`;

export function createNumberAdventures(env) {
  const { openModal, dialogContent, icon, fruitIcon, names, speak, chime, celebrate, onLearn, complete } = env;
  const progress = round => `<div class="round-indicator" aria-label="第 ${round} 关，共 5 关">${Array.from({ length: 5 }, (_, i) => `<span class="${i < round - 1 ? 'done' : i === round - 1 ? 'current' : ''}">${i < round - 1 ? '✓' : i + 1}</span>`).join('')}</div>`;
  const nextButton = round => `<button class="button primary adventures-next" hidden>${round === 5 ? '看看我的小奖励' : '继续下一关'}${icon('arrow', 18)}</button>`;
  const retry = (button, message) => {
    button.classList.remove('adventures-wiggle');
    void button.offsetWidth;
    button.classList.add('adventures-wiggle');
    dialogContent.querySelector('.game-feedback').textContent = message;
    speak(message);
  };

  function train() {
    const targets = shuffled(Array.from({ length: 10 }, (_, i) => i + 1)).slice(0, 5);
    let round = 1;
    let completed = false;

    function renderRound() {
      const target = targets[round - 1];
      const start = Math.max(1, Math.min(7, target - Math.floor(Math.random() * 4)));
      const sequence = Array.from({ length: 4 }, (_, i) => start + i);
      const choices = shuffled([target, ...shuffled(Array.from({ length: 10 }, (_, i) => i + 1).filter(value => value !== target)).slice(0, 2)]);
      const prompt = `小火车按数字顺序出发啦！${sequence.map(value => value === target ? '空位' : names[value - 1]).join('，')}。空车厢里应该是几呢？`;
      let locked = false;

      openModal(`${progress(round)}<span class="modal-kicker">数字小火车 · 第 ${round} / 5 关</span><h2 id="dialog-title">谁来坐这个小车厢？</h2><p class="modal-subtitle">按数字顺序，帮小火车找到朋友</p><div class="train-scene"><span class="train-cloud train-cloud-one"></span><span class="train-cloud train-cloud-two"></span><div class="train-line" role="group" aria-label="数字按从小到大排列的小火车">${trainEngine}${sequence.map(value => `<div class="train-car ${value === target ? 'train-missing' : `color-${value - 1}`}" ${value === target ? 'data-train-missing' : ''}><span aria-label="${value === target ? '空车厢' : `数字 ${value}`}">${value === target ? '?' : value}</span><i></i><i></i></div>`).join('')}</div><div class="train-track"></div><span class="train-grass">✧</span></div><button class="adventures-listen" type="button">${icon('sound', 18)}再听听小任务</button><div class="answer-grid">${choices.map(value => `<button class="answer-button color-${value - 1}" data-train-answer="${value}" aria-label="选择数字 ${value}">${value}</button>`).join('')}</div><p class="game-feedback" role="status">从前往后念一念，再选一个数字吧</p>${nextButton(round)}`, 'game-modal adventures-modal train-modal');
      speak(prompt);
      dialogContent.querySelector('.adventures-listen').onclick = () => speak(prompt);
      dialogContent.querySelectorAll('[data-train-answer]').forEach(button => {
        button.onclick = () => {
          if (locked) return;
          if (Number(button.dataset.trainAnswer) !== target) {
            retry(button, '再念一遍数字的顺序，慢慢想一想～');
            return;
          }
          locked = true;
          button.classList.add('correct');
          const missing = dialogContent.querySelector('[data-train-missing]');
          missing.classList.remove('train-missing');
          missing.classList.add(`color-${target - 1}`, 'train-arrived');
          missing.querySelector('span').textContent = target;
          missing.querySelector('span').setAttribute('aria-label', `数字 ${target}`);
          const feedback = dialogContent.querySelector('.game-feedback');
          feedback.textContent = `呜呜～数字 ${target} 上车啦，小火车可以出发了！`;
          feedback.classList.add('success');
          dialogContent.querySelector('.adventures-next').hidden = false;
          onLearn([target]);
          chime(true); celebrate();
          speak(`答对啦！是数字${names[target - 1]}。小火车可以出发了！`);
        };
      });
      dialogContent.querySelector('.adventures-next').onclick = () => {
        if (!locked || completed) return;
        if (round < 5) { round++; renderRound(); }
        else {
          completed = true;
          complete({ title: '小小列车长，真棒！', message: '数字朋友排好队，小火车快乐出发！', replay: train });
        }
      };
    }
    renderRound();
  }

  function compare() {
    const pairs = shuffled(Array.from({ length: 5 }, (_, i) => Array.from({ length: 5 }, (_, j) => [i + 1, j + 1])).flat().filter(([left, right]) => left !== right)).slice(0, 5);
    let round = 1;
    let completed = false;

    function renderRound() {
      const [left, right] = pairs[round - 1];
      const counts = [left, right];
      const correctSide = left > right ? 0 : 1;
      const prompt = '小兔肚子饿啦！哪一篮胡萝卜更多呢？数一数，点一点更多的那一篮。';
      let locked = false;

      openModal(`${progress(round)}<span class="modal-kicker">小兔分胡萝卜 · 第 ${round} / 5 关</span><h2 id="dialog-title">哪一篮胡萝卜更多？</h2><p class="modal-subtitle">数一数，选一篮更多的送给小兔</p><div class="carrot-rabbit-friend">${rabbit}<span>谢谢你来帮我！</span></div><div class="carrot-baskets">${counts.map((count, side) => `<button class="carrot-basket" data-carrot-side="${side}" aria-label="${side === 0 ? '左' : '右'}边的篮子，${count} 根胡萝卜"><span class="carrot-basket-fruits">${Array.from({ length: count }, () => fruitIcon(7)).join('')}</span><span class="carrot-basket-weave" aria-hidden="true"></span><span class="carrot-basket-label">${side === 0 ? '这一篮' : '那一篮'}</span><span class="carrot-count" hidden>${count} 根</span></button>`).join('')}</div><button class="adventures-listen" type="button">${icon('sound', 18)}再听听小任务</button><p class="game-feedback" role="status">不用着急，左右两篮都数一数</p>${nextButton(round)}`, 'game-modal adventures-modal carrot-modal');
      speak(prompt);
      dialogContent.querySelector('.adventures-listen').onclick = () => speak(prompt);
      dialogContent.querySelectorAll('[data-carrot-side]').forEach(button => {
        button.onclick = () => {
          if (locked) return;
          if (Number(button.dataset.carrotSide) !== correctSide) {
            retry(button, '再数数两边的胡萝卜，哪一篮更多呢？');
            return;
          }
          locked = true;
          button.classList.add('carrot-correct');
          button.setAttribute('aria-label', `${button.getAttribute('aria-label')}，选对了`);
          dialogContent.querySelectorAll('.carrot-count').forEach(el => { el.hidden = false; });
          const feedback = dialogContent.querySelector('.game-feedback');
          feedback.textContent = `答对啦！${Math.max(left, right)} 根比 ${Math.min(left, right)} 根多，小兔好开心！`;
          feedback.classList.add('success');
          dialogContent.querySelector('.adventures-next').hidden = false;
          onLearn(counts);
          chime(true); celebrate();
          speak(`答对啦！这一篮有${names[Math.max(left, right) - 1]}根胡萝卜，更多！小兔谢谢你。`);
        };
      });
      dialogContent.querySelector('.adventures-next').onclick = () => {
        if (!locked || completed) return;
        if (round < 5) { round++; renderRound(); }
        else {
          completed = true;
          complete({ title: '你是小兔的好帮手！', message: '数一数、比一比，小兔吃得饱饱的！', replay: compare });
        }
      };
    }
    renderRound();
  }

  return { train, compare };
}
