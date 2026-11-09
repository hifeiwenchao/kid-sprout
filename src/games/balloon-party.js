import './balloon-party.css';

const shuffle = values => {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export function createBalloonParty({ openModal, dialogContent, icon, names, speak, chime, celebrate, onLearn, complete }) {
  function start() {
    const rounds = [
      [1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    ];
    let round = 0;
    let finished = false;

    function renderRound() {
      const sequence = rounds[round];
      const positions = shuffle(sequence);
      let popped = 0;
      let roundCleared = false;
      const task = () => roundCleared ? '这一关的气球都找到啦！' : `按从小到大的顺序点气球。现在请找到数字${names[sequence[popped] - 1]}。`;

      openModal(`
        <div class="round-indicator" aria-label="第 ${round + 1} 关，共 3 关">${rounds.map((_, index) => `<span class="${index < round ? 'done' : index === round ? 'current' : ''}">${index < round ? '✓' : index + 1}</span>`).join('')}</div>
        <span class="modal-kicker">数字气球派对 · 第 ${round + 1} / 3 关</span>
        <h2 id="dialog-title">数字气球，排队来！</h2>
        <p class="modal-subtitle">按从小到大的顺序，点一点气球朋友</p>
        <div class="balloon-task"><span id="balloon-task-label">下一位数字朋友</span><strong id="balloon-target">${sequence[0]}</strong><button id="balloon-listen" aria-label="再听听气球任务">${icon('sound', 19)}</button></div>
        <div class="balloon-sky" role="group" aria-label="从 ${sequence[0]} 到 ${sequence.at(-1)} 的数字气球">
          <span class="balloon-pennants" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
          <div class="balloon-grid">${positions.map(value => `
            <button class="balloon-button color-${value - 1}" data-balloon="${value}" aria-label="数字 ${value} 的气球">
              <span class="balloon-shape"><strong>${value}</strong><i></i></span>
              <span class="balloon-string" aria-hidden="true"></span>
              <span class="balloon-pop-mark" aria-hidden="true">${icon('check', 25)}<small>${value}</small></span>
            </button>`).join('')}</div>
        </div>
        <div class="balloon-progress"><span class="balloon-progress-track"><i id="balloon-progress-fill"></i></span><span id="balloon-count" aria-live="polite">已经找到 0 / ${sequence.length} 个</span></div>
        <p id="balloon-feedback" class="game-feedback" role="status">先找到数字 ${sequence[0]}，我们就出发！</p>
        <button id="balloon-next" class="button primary" hidden>${round === rounds.length - 1 ? '领取小星星' : '去下一场派对'}${icon('arrow', 18)}</button>
      `, 'balloon-modal');

      dialogContent.querySelector('#balloon-listen').onclick = () => speak(task());
      dialogContent.querySelectorAll('[data-balloon]').forEach(button => {
        button.onclick = () => {
          if (finished || roundCleared || button.disabled) return;
          const value = Number(button.dataset.balloon);
          const target = sequence[popped];
          const feedback = dialogContent.querySelector('#balloon-feedback');
          if (value !== target) {
            button.classList.remove('balloon-wiggle');
            void button.offsetWidth;
            button.classList.add('balloon-wiggle');
            feedback.classList.remove('success');
            feedback.textContent = `不着急，先找数字 ${target} 的气球哦～`;
            speak(`先找数字${names[target - 1]}的气球哦`);
            return;
          }

          button.disabled = true;
          button.classList.add('balloon-popped');
          button.setAttribute('aria-label', `已经找到数字 ${value} 的气球`);
          popped++;
          onLearn([value]);
          chime();
          feedback.classList.add('success');
          dialogContent.querySelector('#balloon-count').textContent = `已经找到 ${popped} / ${sequence.length} 个`;
          dialogContent.querySelector('#balloon-progress-fill').style.width = `${popped / sequence.length * 100}%`;

          if (popped < sequence.length) {
            const next = sequence[popped];
            dialogContent.querySelector('#balloon-target').textContent = next;
            feedback.textContent = `数字 ${value} 找到啦，下一位是 ${next}！`;
            speak(`${names[value - 1]}！接下来找数字${names[next - 1]}`);
            dialogContent.querySelector('[data-balloon]:not(:disabled)')?.focus({ preventScroll: true });
            return;
          }

          roundCleared = true;
          dialogContent.querySelector('#balloon-task-label').textContent = '这一关全部找到啦';
          dialogContent.querySelector('#balloon-target').textContent = '✓';
          feedback.textContent = '气球朋友排好队啦，真棒！';
          const nextButton = dialogContent.querySelector('#balloon-next');
          nextButton.hidden = false;
          nextButton.focus({ preventScroll: true });
          celebrate();
          chime(true);
          speak('气球朋友都找到啦，你真棒！');
        };
      });
      dialogContent.querySelector('#balloon-next').onclick = () => {
        if (!roundCleared || finished) return;
        if (round < rounds.length - 1) { round++; renderRound(); }
        else {
          finished = true;
          complete({ title: '气球派对，圆满成功！', message: '从 1 到 10，你把数字朋友都排好队啦！', replay: start });
        }
      };
      speak(task());
    }

    renderRound();
  }

  return start;
}
