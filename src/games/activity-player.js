import { createActivitySession } from './activity-session.js';
import './activity-player.css';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const subjectNames = { numbers: '数字乐园', pinyin: '拼音天地', alphabet: '字母森林' };
const instructions = { choice: '选一位正确的小伙伴', sequence: '按顺序点选，再点「选好啦」；点已选卡片可以撤回', select: '找齐所有符合条件的小伙伴，再点「选好啦」', build: '点加号、减号调整数量，再点「装好啦」' };

export function playActivity(env, game, buildRounds) {
  const rounds = buildRounds(game.type);
  const session = createActivitySession(rounds);
  let alive = true;
  const replay = () => playActivity(env, game, buildRounds);
  env.openModal(`<span class="modal-kicker">${subjectNames[game.subject]} · ${escape(game.skill)}</span><h2 id="dialog-title">${escape(game.title)}</h2><div data-activity-body></div>`, 'activity-modal');
  env.setCleanup(() => { alive = false; env.stopSpeech?.(); });
  const body = env.dialogContent.querySelector('[data-activity-body]');

  function render(focus = false) {
    const round = session.current;
    const mode = round.mode || 'choice';
    let selected = [];
    let quantity = 0;
    const choices = round.choices || [];
    body.innerHTML = `
      <div class="activity-topline"><span>第 ${session.roundNumber} / ${rounds.length} 关</span><button class="activity-restart" data-activity-restart>重新开始</button></div>
      <div class="activity-progress" aria-hidden="true">${rounds.map((_, index) => `<i class="${index < session.roundNumber ? 'filled' : ''}"></i>`).join('')}</div>
      <h3 class="activity-prompt" tabindex="-1">${escape(round.prompt)}</h3>
      ${round.display ? `<div class="activity-display">${escape(round.display)}</div>` : ''}
      ${round.visual ? `<div class="activity-visual">${round.visual}</div>` : ''}
      ${round.speech ? `<button class="button secondary activity-listen" data-activity-listen>${env.icon('sound', 18)}${env.isSoundEnabled() ? (game.subject === 'pinyin' ? '听例字读音参考' : '再听一遍') : '开启声音听一听'}</button>` : ''}
      <p class="activity-instruction">${instructions[mode]}</p>
      ${mode === 'sequence' ? '<div class="activity-selected" data-activity-selected role="group" aria-label="已选顺序"></div>' : ''}
      ${mode === 'build' ? `<div class="activity-builder"><div class="activity-items" data-activity-items aria-hidden="true"></div><div class="activity-counter"><button data-activity-minus aria-label="减少一个">−</button><output data-activity-count aria-live="polite">0</output><button data-activity-plus aria-label="增加一个">＋</button></div></div>` : `<div class="activity-choices ${mode === 'choice' ? '' : 'activity-tiles'}" role="group" aria-label="答案选项">${choices.map((choice, index) => `<button class="activity-choice" data-activity-option="${index}" ${mode === 'select' ? 'aria-pressed="false"' : ''}><strong>${escape(choice.label)}</strong>${choice.small ? `<small>${escape(choice.small)}</small>` : ''}</button>`).join('')}</div>`}
      ${mode !== 'choice' ? `<div class="activity-submit-row"><button class="button secondary" data-activity-clear>清空重来</button><button class="button primary" data-activity-check>${mode === 'build' ? '装好啦' : '选好啦'}</button></div>` : ''}
      <details class="activity-hint"><summary>看看小提示</summary><p>${escape(round.hint || '慢慢观察，试一试；也可以请大人陪你一起想。')}</p></details>
      <p class="game-feedback activity-feedback" data-activity-feedback role="status">不着急，想好了再选。</p>
      <button class="button primary activity-next" data-activity-next hidden>${session.roundNumber === rounds.length ? '领取小星星' : '下一关'} ${env.icon('arrow', 18)}</button>`;
    const feedback = body.querySelector('[data-activity-feedback]');
    const options = [...body.querySelectorAll('[data-activity-option]')];
    const speakRound = () => {
      if (!round.speech || !env.isSoundEnabled()) return;
      env.stopSpeech?.();
      if (round.speechLang === 'en-US') env.speakEnglish(round.speech);
      else env.speak(round.speech);
    };
    function updateSelection() {
      if (mode === 'sequence') {
        const area = body.querySelector('[data-activity-selected]');
        area.innerHTML = selected.length ? selected.map((value, index) => `<button data-activity-undo="${index}" aria-label="撤回${escape(choices.find(choice => choice.value === value)?.label)}">${escape(choices.find(choice => choice.value === value)?.label)} <small>×</small></button>`).join('') : '<span>把小伙伴请到这里来</span>';
        area.querySelectorAll('[data-activity-undo]').forEach(button => button.onclick = () => {
          if (session.solved || !alive) return;
          const value = selected.splice(Number(button.dataset.activityUndo), 1)[0];
          updateSelection();
          options[choices.findIndex(choice => choice.value === value)]?.focus();
        });
      }
      options.forEach((button, index) => {
        const chosen = selected.includes(choices[index].value);
        button.classList.toggle('selected', chosen);
        if (mode === 'select') button.setAttribute('aria-pressed', String(chosen));
        button.disabled = session.solved || (mode === 'sequence' && chosen);
      });
    }
    function updateQuantity() {
      body.querySelector('[data-activity-count]').textContent = quantity;
      body.querySelector('[data-activity-items]').textContent = quantity ? (round.item || '⭐').repeat(quantity) : '空空的，还没有';
      body.querySelector('[data-activity-minus]').disabled = session.solved || quantity === 0;
      body.querySelector('[data-activity-plus]').disabled = session.solved || quantity === (round.max ?? 10);
    }
    function submit(answer) {
      if (!alive) return;
      const outcome = session.submit(answer);
      if (outcome === 'ignored') return;
      if (outcome === 'retry') {
        feedback.textContent = '差一点点，看看小提示，再试一次吧。';
        body.querySelector('.activity-hint').open = true;
        return;
      }
      env.stopSpeech?.();
      feedback.textContent = `答对啦！${round.explanation || '你观察得真仔细。'}`;
      feedback.classList.add('success');
      body.querySelector('.activity-hint').open = true;
      body.querySelectorAll('[data-activity-option], [data-activity-check], [data-activity-clear], [data-activity-undo], [data-activity-plus], [data-activity-minus]').forEach(button => { button.disabled = true; });
      const next = body.querySelector('[data-activity-next]');
      next.hidden = false;
      next.focus({ preventScroll: true });
      env.chime?.(true);
    }
    options.forEach((button, index) => button.onclick = () => {
      if (!alive || session.solved) return;
      const value = choices[index].value;
      if (mode === 'choice') return submit(value);
      if (mode === 'select' && selected.includes(value)) selected = selected.filter(item => item !== value);
      else selected.push(value);
      updateSelection();
      if (mode === 'sequence') (options.find(option => !option.disabled) || body.querySelector('[data-activity-check]')).focus({ preventScroll: true });
    });
    if (mode === 'sequence') updateSelection();
    if (mode === 'build') {
      body.querySelector('[data-activity-minus]').onclick = () => { if (alive && !session.solved && quantity > 0) { quantity--; updateQuantity(); } };
      body.querySelector('[data-activity-plus]').onclick = () => { if (alive && !session.solved && quantity < (round.max ?? 10)) { quantity++; updateQuantity(); } };
      updateQuantity();
    }
    const clear = body.querySelector('[data-activity-clear]');
    if (clear) clear.onclick = () => { if (!alive || session.solved) return; selected = []; quantity = 0; if (mode === 'build') updateQuantity(); else updateSelection(); };
    const check = body.querySelector('[data-activity-check]');
    if (check) check.onclick = () => submit(mode === 'build' ? String(quantity) : selected);
    const listen = body.querySelector('[data-activity-listen]');
    if (listen) listen.onclick = () => { if (!alive) return; env.enableSound(); listen.innerHTML = `${env.icon('sound', 18)}${game.subject === 'pinyin' ? '听例字读音参考' : '再听一遍'}`; speakRound(); };
    body.querySelector('[data-activity-restart]').onclick = replay;
    body.querySelector('[data-activity-next]').onclick = () => {
      if (!alive) return;
      const outcome = session.advance();
      if (outcome === 'next') render(true);
      if (outcome === 'complete') env.complete({ title: '小小探险家，真棒！', message: `${game.title}的 ${rounds.length} 关都完成啦！收下一颗小星星。`, replay });
    };
    if (focus) {
      env.dialogContent.closest('dialog')?.scrollTo({ top: 0, behavior: 'instant' });
      body.querySelector('.activity-prompt').focus({ preventScroll: true });
    }
    speakRound();
  }
  render();
}
