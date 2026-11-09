import './bear-picnic.css';

const shuffled = values => {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const bear = `<svg class="picnic-bear" viewBox="0 0 120 113" fill="none" aria-hidden="true"><circle cx="27" cy="29" r="19" fill="#caa37b"/><circle cx="92" cy="29" r="19" fill="#caa37b"/><circle cx="27" cy="29" r="10" fill="#e6c5a4"/><circle cx="92" cy="29" r="10" fill="#e6c5a4"/><ellipse cx="60" cy="60" rx="46" ry="42" fill="#d6b28a"/><ellipse cx="60" cy="76" rx="24" ry="20" fill="#f4ddbb"/><path d="M42 57v5m36-5v5" stroke="#685d49" stroke-width="5" stroke-linecap="round"/><ellipse cx="60" cy="71" rx="7" ry="5" fill="#7c6850"/><path d="M60 76v6m0 0q-8 7-13 0m13 0q8 7 13 0" stroke="#8a7459" stroke-width="2" stroke-linecap="round"/><ellipse cx="31" cy="73" rx="8" ry="5" fill="#e7b29a"/><ellipse cx="88" cy="73" rx="8" ry="5" fill="#e7b29a"/><path d="m44 101 16-8 16 8v10H44z" fill="#91a987"/><circle cx="60" cy="104" r="3" fill="#f0d99a"/><path d="m85 20 10-5 7 5-7 5z" fill="#ecc777"/></svg>`;
const cookie = `<svg class="picnic-cookie-drawing" viewBox="0 0 60 60" fill="none" aria-hidden="true"><path d="M30 4c4-2 6 2 9 2 5-1 7 3 9 6 4 1 5 6 5 9 4 3 3 8 2 11 1 5-3 7-4 11-1 5-6 5-9 8-3 3-8 2-11 4-5 1-7-3-11-3-5 0-6-4-9-6-4-2-4-7-6-10-2-4 1-8 0-12-1-5 3-7 5-10 2-4 7-3 10-6 3-3 6-1 10-4Z" fill="#d6ad6e"/><circle cx="30" cy="29" r="23" fill="#e8c68b"/><path d="M16 18c3-3 6-4 9-4" stroke="#f7dfaf" stroke-width="3" stroke-linecap="round"/><path d="m22 19 6 2-2 6-6-2Zm16 5 6-2 2 6-6 2Zm-9 15 5-3 3 5-5 3Z" fill="#9a7959"/><circle cx="17" cy="35" r="3" fill="#ad8860"/><circle cx="37" cy="13" r="2.5" fill="#b28d60"/><circle cx="43" cy="39" r="2" fill="#b28d60"/><circle cx="30" cy="30" r="1.4" fill="#c5a069"/></svg>`;

export function createBearPicnic({ openModal, dialogContent, icon, names, speak, chime, celebrate, onLearn, complete }) {
  function start() {
    const targets = shuffled(Array.from({ length: 10 }, (_, i) => i + 1)).slice(0, 5);
    let round = 1;
    let completed = false;

    function renderRound() {
      const target = targets[round - 1];
      let count = 0;
      let locked = false;
      let advanced = false;
      const prompt = `小熊想要${names[target - 1]}块小饼干。点一下，放一块，装好以后送给小熊吧。`;
      openModal(`
        <div class="round-indicator" aria-label="第 ${round} 关，共 5 关">${Array.from({ length: 5 }, (_, i) => `<span class="${i < round - 1 ? 'done' : i === round - 1 ? 'current' : ''}">${i < round - 1 ? '✓' : i + 1}</span>`).join('')}</div>
        <span class="modal-kicker">小熊点心铺 · 第 ${round} / 5 关</span>
        <h2 id="dialog-title">给小熊装点小饼干吧</h2>
        <p class="modal-subtitle">放一块，数一下；装多了，也可以拿回来</p>
        <div class="picnic-order">${bear}<div class="picnic-order-bubble"><span>我想要</span><strong id="picnic-target">${target}</strong><span>块小饼干</span></div></div>
        <div class="picnic-tray" role="group" aria-label="小熊的点心盘">
          <span class="picnic-tray-caption">小熊的点心盘</span>
          <div id="picnic-cookies" class="picnic-cookies"></div>
        </div>
        <div class="picnic-count" role="status" aria-live="polite">已经装了 <strong id="picnic-count">0</strong> 块</div>
        <div class="picnic-controls"><button id="picnic-remove" class="picnic-remove" aria-label="拿回一块饼干" disabled>−<span>拿回一块</span></button><button id="picnic-add" class="picnic-add">${cookie}<span>再放一块</span><b aria-hidden="true">+</b></button></div>
        <div class="picnic-bottom-actions"><button id="picnic-listen" class="picnic-listen">${icon('sound', 17)}听听小熊要几块</button><button id="picnic-check" class="button primary">装好啦${icon('check', 18)}</button></div>
        <p id="picnic-feedback" class="game-feedback" role="status">点一点小饼干，让点心盘慢慢装满吧</p>
        <button id="picnic-next" class="button primary" hidden>${round === 5 ? '领取小星星' : '继续下一关'}${icon('arrow', 18)}</button>
      `, 'game-modal picnic-modal');

      const feedback = dialogContent.querySelector('#picnic-feedback');
      const add = dialogContent.querySelector('#picnic-add');
      const remove = dialogContent.querySelector('#picnic-remove');
      const submit = dialogContent.querySelector('#picnic-check');
      const tray = dialogContent.querySelector('#picnic-cookies');

      function renderTray() {
        tray.innerHTML = count ? Array.from({ length: count }, (_, i) => `<button class="picnic-cookie" data-picnic-cookie="${i}" aria-label="取出第 ${i + 1} 块饼干" ${locked ? 'disabled' : ''}>${cookie}</button>`).join('') : `<span class="picnic-empty" aria-hidden="true"><span>✧</span>还没有小饼干</span>`;
        dialogContent.querySelector('#picnic-count').textContent = count;
        remove.disabled = locked || count === 0;
        add.disabled = locked;
        tray.querySelectorAll('[data-picnic-cookie]').forEach(button => {
          button.onclick = () => {
            if (locked) return;
            count--;
            renderTray();
            feedback.classList.remove('success');
            feedback.textContent = '拿回一块啦，再数数盘子里的小饼干';
            speak(count ? `现在有${names[count - 1]}块小饼干` : '盘子里没有小饼干啦');
            add.focus({ preventScroll: true });
          };
        });
      }

      add.onclick = () => {
        if (locked) return;
        feedback.classList.remove('success');
        if (count === 10) {
          feedback.textContent = '盘子可以装 10 块，先数一数；装多了就拿回一块哦';
          speak('盘子装满啦，数一数，装多了可以拿回一块哦');
          return;
        }
        count++;
        renderTray();
        feedback.textContent = '放好啦！数一数，和小熊想要的一样多了吗？';
        chime();
        speak(names[count - 1]);
      };
      remove.onclick = () => {
        if (locked || count === 0) return;
        count--;
        renderTray();
        feedback.classList.remove('success');
        feedback.textContent = '拿回一块啦，再数数盘子里的小饼干';
        speak(count ? `现在有${names[count - 1]}块小饼干` : '盘子里没有小饼干啦');
      };
      dialogContent.querySelector('#picnic-listen').onclick = () => speak(prompt);
      submit.onclick = () => {
        if (locked) return;
        if (count !== target) {
          const message = count < target ? '还少了一点点，再放些小饼干试试看～' : '装得多了一点点，拿回几块再数数～';
          feedback.textContent = message;
          feedback.classList.remove('success');
          speak(message);
          return;
        }
        locked = true;
        renderTray();
        submit.hidden = true;
        feedback.textContent = `刚刚好！${target} 块小饼干，小熊收到你的心意啦！`;
        feedback.classList.add('success');
        onLearn([target]);
        chime(true);
        celebrate();
        speak(`刚刚好，${names[target - 1]}块小饼干。小熊谢谢你！`);
        const next = dialogContent.querySelector('#picnic-next');
        next.hidden = false;
        next.focus({ preventScroll: true });
      };
      dialogContent.querySelector('#picnic-next').onclick = () => {
        if (!locked || advanced || completed) return;
        advanced = true;
        if (round < 5) { round++; renderRound(); }
        else {
          completed = true;
          complete({ title: '你是贴心的小点心师！', message: '5 份小点心全部装好啦，小熊要和你分享快乐！', replay: start });
        }
      };
      renderTray();
      speak(prompt);
    }

    renderRound();
  }

  return start;
}
