import './little-drum.css';

const shuffled = values => {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export function createLittleDrum(env) {
  const { openModal, dialogContent, icon, names, speak, chime, celebrate, onLearn, complete, setCleanup, isSoundEnabled, enableSound, stopSpeech } = env;
  let audioContext;

  function start() {
    const targets = shuffled([1, 2, 3, 4, 5]);
    let round = 1;
    let completed = false;

    function renderRound() {
      const target = targets[round - 1];
      const choices = shuffled([target, ...shuffled([1, 2, 3, 4, 5].filter(n => n !== target)).slice(0, 2)]);
      let alive = true;
      let playing = false;
      let ready = false;
      let locked = false;
      let playback = 0;
      let timers = [];
      const oscillators = new Set();

      function stopBeats() {
        playback++;
        timers.forEach(clearTimeout);
        timers = [];
        oscillators.forEach(oscillator => { try { oscillator.stop(); } catch {} });
        oscillators.clear();
        playing = false;
      }

      openModal(`
        <div class="round-indicator">${Array.from({ length: 5 }, (_, i) => `<span class="${i < round - 1 ? 'done' : i === round - 1 ? 'current' : ''}">${i < round - 1 ? '✓' : i + 1}</span>`).join('')}</div>
        <span class="modal-kicker">小耳朵听听 · 第 ${round} / 5 关</span>
        <h2 id="dialog-title">小鼓敲了几下？</h2>
        <p class="modal-subtitle">竖起小耳朵，听一听，也可以跟着拍小手</p>
        <div class="drum-stage" aria-hidden="true"><span class="drum-note drum-note-one">♪</span><span class="drum-note drum-note-two">♫</span><div class="drum-instrument"><span class="drum-stick drum-stick-left"></span><span class="drum-stick drum-stick-right"></span><span class="drum-body"><i></i><i></i><i></i></span><span class="drum-top"><b>● ●</b><i>⌣</i></span></div><span class="drum-shadow"></span></div>
        <button id="drum-listen" class="button primary">${icon('sound', 19)}${isSoundEnabled() ? '听听小鼓' : '开启声音并听一听'}</button>
        <div class="drum-clue-controls"><button id="drum-hint" class="drum-hint" aria-expanded="false" aria-controls="drum-dots">${icon('sun', 16)}看看鼓点提示</button><span>想听几遍都可以</span></div>
        <div id="drum-dots" class="drum-dots" hidden aria-label="${target} 个鼓点">${Array.from({ length: target }, (_, i) => `<span aria-hidden="true">${i + 1}</span>`).join('')}</div>
        <div class="answer-grid">${choices.map(n => `<button class="answer-button color-${n - 1}" data-drum-answer="${n}" aria-label="小鼓敲了 ${n} 下">${n}</button>`).join('')}</div>
        <p id="drum-feedback" class="game-feedback" role="status">先听一听小鼓，或者看看鼓点提示吧</p>
        <button id="drum-next" class="button primary" hidden>${round === 5 ? '领取小星星' : '继续听下一关'}${icon('arrow', 18)}</button>
      `, 'game-modal drum-modal');
      setCleanup(() => { alive = false; stopBeats(); });
      const listenButton = dialogContent.querySelector('#drum-listen');
      const feedback = dialogContent.querySelector('#drum-feedback');
      const drum = dialogContent.querySelector('.drum-instrument');

      function updateListenButton() {
        listenButton.disabled = playing;
        listenButton.innerHTML = `${icon('sound', 19)}${playing ? '仔细听，咚咚咚…' : '再听一遍'}`;
      }

      function showHint() {
        const hint = dialogContent.querySelector('#drum-hint');
        const dots = dialogContent.querySelector('#drum-dots');
        const expanded = hint.getAttribute('aria-expanded') !== 'true';
        dots.hidden = !expanded;
        hint.setAttribute('aria-expanded', String(expanded));
        hint.innerHTML = `${icon('sun', 16)}${expanded ? '收起鼓点提示' : '看看鼓点提示'}`;
        if (expanded && !locked) {
          if (playing) { stopBeats(); updateListenButton(); }
          ready = true;
          feedback.textContent = '一个圆点就是一下鼓声，慢慢数一数';
        }
      }

      async function playBeats() {
        if (playing || locked || !alive) return;
        enableSound();
        stopSpeech();
        playing = true;
        const playbackId = ++playback;
        ready = false;
        feedback.classList.remove('success');
        feedback.textContent = '咚、咚……一边听，一边数';
        updateListenButton();
        try {
          const Audio = window.AudioContext || window.webkitAudioContext;
          if (!Audio) throw new Error('Audio unavailable');
          audioContext ||= new Audio();
          if (audioContext.state !== 'running') await audioContext.resume();
          if (!alive || playbackId !== playback) return;
          if (audioContext.state !== 'running') throw new Error('Audio suspended');
          for (let i = 0; i < target; i++) {
            timers.push(setTimeout(() => {
              if (!alive || playbackId !== playback) return;
              drum.classList.remove('drum-beating');
              void drum.offsetWidth;
              drum.classList.add('drum-beating');
              const oscillator = audioContext.createOscillator();
              const gain = audioContext.createGain();
              oscillator.type = 'triangle';
              oscillator.frequency.setValueAtTime(170, audioContext.currentTime);
              oscillator.frequency.exponentialRampToValueAtTime(65, audioContext.currentTime + .2);
              gain.gain.setValueAtTime(.23, audioContext.currentTime);
              gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .25);
              oscillator.connect(gain); gain.connect(audioContext.destination);
              oscillators.add(oscillator);
              oscillator.onended = () => { oscillators.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
              oscillator.start(); oscillator.stop(audioContext.currentTime + .27);
            }, 160 + i * 700));
          }
          timers.push(setTimeout(() => {
            if (!alive || playbackId !== playback) return;
            ready = true;
            playing = false;
            updateListenButton();
            feedback.textContent = '听到几下鼓声呢？选一个数字吧';
          }, target * 700 + 100));
        } catch {
          if (!alive || playbackId !== playback) return;
          playing = false;
          ready = true;
          updateListenButton();
          const hint = dialogContent.querySelector('#drum-hint');
          if (hint.getAttribute('aria-expanded') !== 'true') showHint();
          feedback.textContent = '小鼓暂时没有声音，看看圆点，一样能玩！';
        }
      }

      listenButton.onclick = playBeats;
      dialogContent.querySelector('#drum-hint').onclick = showHint;
      dialogContent.querySelectorAll('[data-drum-answer]').forEach(button => button.onclick = () => {
        if (locked) return;
        if (playing) { feedback.textContent = '等小鼓敲完，再选一选哦'; return; }
        if (!ready) { feedback.textContent = '先点「听听小鼓」，也可以看看鼓点提示'; return; }
        if (Number(button.dataset.drumAnswer) !== target) {
          feedback.textContent = '再听一次，或者用小圆点帮忙数一数～';
          speak('再听一次，慢慢数一数');
          return;
        }
        locked = true;
        stopBeats();
        button.classList.add('correct');
        listenButton.disabled = true;
        dialogContent.querySelector('#drum-dots').hidden = false;
        dialogContent.querySelector('#drum-hint').setAttribute('aria-expanded', 'true');
        dialogContent.querySelector('#drum-hint').innerHTML = `${icon('sun', 16)}收起鼓点提示`;
        feedback.textContent = `小耳朵真灵！小鼓敲了 ${target} 下！`;
        feedback.classList.add('success');
        onLearn([target]);
        chime(true); celebrate(); speak(`答对啦！小鼓敲了${names[target - 1]}下。`);
        dialogContent.querySelector('#drum-next').hidden = false;
      });
      dialogContent.querySelector('#drum-next').onclick = () => {
        if (!locked || completed) return;
        if (round < 5) { round++; renderRound(); }
        else {
          completed = true;
          complete({ title: '你是小小节奏家！', message: '5 关都听对啦，耳朵和小脑袋配合得真棒！', replay: start });
        }
      };
      speak('小鼓敲了几下？点听听小鼓，跟着鼓声数一数。');
    }
    renderRound();
  }

  return start;
}
