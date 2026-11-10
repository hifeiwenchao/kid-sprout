import { PINYIN_LESSONS, PINYIN_PROGRESS_IDS, PINYIN_ITEMS, PINYIN_SOURCES, PINYIN_TONES, buildPinyinRounds } from './pinyin-data.js';
export { PINYIN_PROGRESS_IDS } from './pinyin-data.js';

const games = [
  { type: 'listen', title: '拼音找朋友', tag: '聆听与辨认', description: '听听例字，找到韵母小伙伴', art: 'ɑ<span>♪</span>', color: 'lilac' },
  { type: 'sort', title: '拼音小房子', tag: '认识与归类', description: '声母、韵母，各自住哪一家？', art: 'b<span>🏠</span>', color: 'peach' },
  { type: 'tones', title: '声调小滑梯', tag: '观察与声调', description: '平平、上坡、转弯、下坡', art: 'ǎ<span>⌁</span>', color: 'sage' },
];
const toneArt = tone => `<svg viewBox="0 0 100 90" aria-hidden="true"><path d="${tone.path}" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="${tone.number === 1 ? 25 : tone.number === 2 ? 66 : tone.number === 3 ? 35 : 22}" r="7" fill="currentColor"/></svg>`;

export function renderPinyinPage() {
  return `
    <div class="pinyin-hero">
      <div class="pinyin-hero-copy"><span class="pinyin-eyebrow">字音里的小小魔法</span><h1 id="pinyin-page-title" tabindex="-1">你好呀，<br><em>拼音朋友！</em></h1><p>看看口型，跟着读一读。<br>从 a o e 出发，慢慢拼出新世界。</p><button class="button primary pinyin-start" data-pinyin-start>开始拼音探险 <span aria-hidden="true">→</span></button><span class="pinyin-hero-note">14节小课 · 2024新版人教教材顺序</span></div>
      <div class="pinyin-hero-art" aria-hidden="true"><span class="pinyin-art-spark pinyin-art-spark-one">✦</span><span class="pinyin-art-cloud">☁</span><div class="pinyin-letter-card pinyin-letter-a">ā<i></i></div><div class="pinyin-letter-card pinyin-letter-b">b<i></i></div><div class="pinyin-letter-card pinyin-letter-o">ō<i></i></div><span class="pinyin-art-caption">听一听，世界有声音</span><span class="pinyin-art-spark pinyin-art-spark-two">✧</span><span class="pinyin-art-leaf">❧</span></div>
    </div>
    <div class="pinyin-section-heading"><div><span class="pinyin-eyebrow">一课一课，认识新朋友</span><h2>我的拼音小路</h2><p>按课次慢慢学，点开卡片就能开始</p></div><span class="pinyin-progress-count" data-pinyin-progress>已学 0 / 14 课</span></div>
    <div class="pinyin-course-progress" aria-label="拼音课程学习进度"><span data-pinyin-progress-bar></span></div>
    ${[2, 3, 4].map(unit => `<section class="pinyin-unit" aria-labelledby="pinyin-unit-${unit}"><div class="pinyin-unit-heading"><span>0${unit - 1}</span><div><h3 id="pinyin-unit-${unit}">${unit === 2 ? '从单韵母开始' : unit === 3 ? '声母朋友来集合' : '韵母的奇妙组合'}</h3><p>教材第${['', '', '二', '三', '四'][unit]}单元 · ${unit === 2 ? '第1–4课' : unit === 3 ? '第5–9课' : '第10–14课'}</p></div></div><div class="pinyin-lesson-grid">${PINYIN_LESSONS.filter(lesson => lesson.unit === unit).map(lesson => `<button class="pinyin-lesson-card" data-pinyin-lesson="${lesson.id}" aria-label="第${lesson.number}课 ${lesson.title}"><span class="pinyin-lesson-top">第 ${String(lesson.number).padStart(2, '0')} 课<span class="pinyin-lesson-check" aria-hidden="true">✓</span></span><strong>${lesson.title}</strong><span class="pinyin-lesson-bottom"><span>${lesson.number < 3 ? '口型与四声' : lesson.number < 10 ? '声母与拼读' : '韵母与拼读'}</span><span aria-hidden="true">↗</span></span></button>`).join('')}</div></section>`).join('')}
    <section class="pinyin-tones-section" aria-labelledby="pinyin-tones-title"><div><span class="pinyin-eyebrow">声音也会走小路</span><h2 id="pinyin-tones-title">四顶声调小帽子</h2><p>伸出小手，跟着线条比划一下</p></div><div class="pinyin-tones-grid">${PINYIN_TONES.map(tone => `<button class="pinyin-tone-card" data-pinyin-tone="${tone.number}" aria-label="${tone.name}，${tone.hint}">${toneArt(tone)}<strong>${tone.name} <span>${['ā', 'á', 'ǎ', 'à'][tone.number - 1]}</span></strong><small>${['高高平平', '往上爬坡', '先降再升', '往下滑坡'][tone.number - 1]}</small></button>`).join('')}</div></section>
    <section class="pinyin-games-section" aria-labelledby="pinyin-games-title"><div class="pinyin-section-heading"><div><span class="pinyin-eyebrow">学一点，再玩一点</span><h2 id="pinyin-games-title">和拼音一起玩</h2><p>每次5小关，试一试，答错也没关系</p></div><span class="pinyin-section-flower" aria-hidden="true">✿</span></div><div class="pinyin-games-grid">${games.map(game => `<button class="pinyin-game-card pinyin-game-${game.color}" data-pinyin-game="${game.type}"><span class="pinyin-game-art" aria-hidden="true">${game.art}</span><span class="pinyin-game-tag">${game.tag}</span><strong>${game.title}</strong><p>${game.description}</p><span class="pinyin-game-go">一起玩 <span aria-hidden="true">→</span></span></button>`).join('')}</div></section>
    <details class="pinyin-parent-note"><summary>给陪伴的大朋友：学习顺序与读音说明</summary><p>按2024新版人教一年级上册第二至第四单元的14课顺序编排，第9课为 y w。口型提示、例字和游戏由本站自主设计。</p><p>按钮播放的是浏览器中文语音提供的<strong>例字读音参考</strong>，不是独立拼音标准录音。声母发音应轻而短，例字含完整音节；请结合口型提示，由大人陪读。语音可用性取决于浏览器和系统，也可全程看提示学习。</p><p>课次依据：${PINYIN_SOURCES.map(source => `<a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.title}</a>`).join(' · ')}</p></details>
  `;
}

export function createPinyinCourse(env) {
  let pageRoot;
  let pageHandler;
  const soundIcon = () => env.icon?.('sound', 18) || '<span aria-hidden="true">♪</span>';
  const say = text => { if (env.isSoundEnabled?.()) env.speak?.(text); };

  function refreshProgress() {
    if (!pageRoot) return;
    const count = PINYIN_PROGRESS_IDS.filter(id => env.learned.has(id)).length;
    pageRoot.querySelectorAll('[data-pinyin-lesson]').forEach(button => {
      const learned = env.learned.has(button.dataset.pinyinLesson);
      button.classList.toggle('pinyin-learned', learned);
      button.setAttribute('aria-label', `${button.getAttribute('aria-label').replace(/，已学过$/, '')}${learned ? '，已学过' : ''}`);
    });
    const progress = pageRoot.querySelector('[data-pinyin-progress]');
    const bar = pageRoot.querySelector('[data-pinyin-progress-bar]');
    if (progress) progress.textContent = `已学 ${count} / 14 课`;
    if (bar) bar.style.width = `${count / 14 * 100}%`;
  }

  function readReference(text, feedback) {
    if (!env.isSoundEnabled?.()) {
      if (feedback) feedback.textContent = '现在是安静学习，看看例字和口型，也可以请大人陪读。';
      return;
    }
    env.stopSpeech?.();
    env.speak?.(text);
    if (feedback) feedback.textContent = '正在听例字读音参考；也可以跟大人一起读。';
  }

  function openLesson(id) {
    const lesson = PINYIN_LESSONS.find(item => item.id === id) || PINYIN_LESSONS.find(item => !env.learned.has(item.id)) || PINYIN_LESSONS[0];
    let selected = lesson.symbols[0];
    let alive = true;
    env.openModal(`
      <span class="modal-kicker">拼音小路 · 第 ${lesson.number} / 14 课</span><h2 id="dialog-title">你好，${lesson.title}</h2><p class="modal-subtitle">先看口型，再跟着大人读一读</p>
      <div class="pinyin-symbol-tabs" role="group" aria-label="本课拼音">${lesson.symbols.map((symbol, index) => `<button class="pinyin-symbol-tab ${index === 0 ? 'pinyin-selected' : ''}" data-pinyin-symbol="${symbol}" aria-pressed="${index === 0}">${symbol}</button>`).join('')}</div>
      <div class="pinyin-detail" data-pinyin-detail></div>
      ${lesson.readSyllables.length ? `<div class="pinyin-whole-syllables"><h3>整体认读小伙伴</h3><p>整个音节直接读，和声母短音分开体会。</p><div>${lesson.readSyllables.map(syllable => `<span>${syllable}</span>`).join('')}</div></div>` : ''}
      <details class="pinyin-spelling-practice" open><summary>${lesson.number < 3 ? '给韵母戴上四声小帽子' : '和大人一起拼一拼'}</summary><div>${lesson.spellings.map(spelling => `<p>${spelling}</p>`).join('')}</div><p class="pinyin-rule">${lesson.rule}</p></details>
      <p class="pinyin-reference-note">例字读音参考 · ${env.isSoundEnabled?.() ? '浏览器中文语音' : '声音已关闭，仍可看提示学习'}</p>
      <p class="game-feedback pinyin-lesson-feedback" data-pinyin-lesson-feedback role="status">慢慢读，不着急。学会一课就收下一片小叶子。</p>
      <div class="pinyin-lesson-actions"><button class="button pinyin-secondary" data-pinyin-prev ${lesson.number === 1 ? 'disabled' : ''}>上一课</button><button class="button primary" data-pinyin-finish>完成这一课 ✓</button></div>
    `, 'pinyin-modal pinyin-lesson-modal');
    env.setCleanup?.(() => { alive = false; env.stopSpeech?.(); });
    const content = env.dialogContent;
    const feedback = content.querySelector('[data-pinyin-lesson-feedback]');
    function showSymbol(symbol) {
      if (!alive) return;
      env.stopSpeech?.();
      selected = symbol;
      const item = PINYIN_ITEMS[symbol];
      content.querySelectorAll('[data-pinyin-symbol]').forEach(button => {
        button.classList.toggle('pinyin-selected', button.dataset.pinyinSymbol === symbol);
        button.setAttribute('aria-pressed', String(button.dataset.pinyinSymbol === symbol));
      });
      const spelling = ['ü', 'üe', 'ün'].includes(symbol) ? '和 y、j、q、x 拼写时，ü 的两点会藏起来，读音要记住。' : symbol === 'i' ? 'i 戴上声调小帽子时，要把上面的小点去掉。' : ['ui', 'iu', 'un'].includes(symbol) ? `${symbol}是复合韵母的简写形式，跟着例字连起来读。` : '';
      content.querySelector('[data-pinyin-detail]').innerHTML = `<div class="pinyin-feature-letter" aria-label="拼音 ${symbol}">${symbol}<span>${item.kind === 'initial' ? '声母' : '韵母'}</span></div><div class="pinyin-mouth-hint"><span>口型小提示</span><h3>${item.hint}</h3><p>${item.kind === 'initial' ? '声母读得轻而短。例字里还有韵母，要分开体会。' : '韵母读得响亮一些，注意嘴巴怎样变化。'}</p>${spelling ? `<p class="pinyin-spelling-note">${spelling}</p>` : ''}</div><div class="pinyin-example"><span>例字读音参考</span><strong>${item.example} <small>${item.examplePinyin}</small></strong>${symbol === 'o' ? '' : `<button class="button pinyin-secondary" data-pinyin-read>${soundIcon()}听例字</button>`}${item.referenceNote ? `<p class="pinyin-o-note">${item.referenceNote}</p>` : ''}</div>`;
      const readButton = content.querySelector('[data-pinyin-read]');
      if (readButton) readButton.onclick = () => readReference(item.speech, feedback);
    }
    content.querySelectorAll('[data-pinyin-symbol]').forEach(button => button.onclick = () => showSymbol(button.dataset.pinyinSymbol));
    content.querySelector('[data-pinyin-prev]').onclick = () => openLesson(`lesson-${lesson.number - 1}`);
    let finished = false;
    content.querySelector('[data-pinyin-finish]').onclick = () => {
      if (!alive) return;
      if (finished) {
        openLesson(lesson.number < 14 ? `lesson-${lesson.number + 1}` : undefined);
        return;
      }
      finished = true;
      env.onLearn?.(lesson.id);
      refreshProgress();
      env.chime?.(true);
      env.celebrate?.();
      feedback.textContent = `第${lesson.number}课的小叶子收好啦！${lesson.number === 14 ? '最后一课也读过啦，还可以回头多读几遍。' : '再读一遍，或去认识下一课吧。'}`;
      feedback.classList.add('success');
      content.querySelector('[data-pinyin-finish]').textContent = lesson.number < 14 ? '认识下一课 →' : '继续复习 →';
      say('真棒，收下一片拼音小叶子！');
    };
    showSymbol(selected);
  }

  function openTone(number) {
    const tone = PINYIN_TONES[number - 1];
    if (!tone) return;
    env.openModal(`<span class="modal-kicker">声音的小路</span><h2 id="dialog-title">${tone.name}，${tone.hint.slice(0, 4)}</h2><div class="pinyin-tone-big">${toneArt(tone)}<strong>${['ā', 'á', 'ǎ', 'à'][number - 1]}</strong></div><p class="modal-subtitle">${tone.hint}</p><p class="pinyin-reference-note">伸出手指画一画，再请大人带着读一读。</p><button class="button primary" data-pinyin-tone-game>玩声调小滑梯 →</button>`, 'pinyin-modal');
    env.setCleanup?.(() => env.stopSpeech?.());
    env.dialogContent.querySelector('[data-pinyin-tone-game]').onclick = () => startGame('tones');
    say(`${tone.name}。${tone.hint}`);
  }

  function startGame(type) {
    const gameInfo = games.find(game => game.type === type);
    if (!gameInfo) return;
    const rounds = buildPinyinRounds(type);
    let index = 0;
    let completed = false;
    function renderRound() {
      const round = rounds[index];
      let alive = true;
      let locked = false;
      env.openModal(`
        <div class="round-indicator">${rounds.map((_, i) => `<span class="${i < index ? 'done' : i === index ? 'current' : ''}">${i < index ? '✓' : i + 1}</span>`).join('')}</div>
        <span class="modal-kicker">${gameInfo.title} · 第 ${index + 1} / 5 关</span><h2 id="dialog-title">${round.prompt}</h2><p class="modal-subtitle">${type === 'listen' ? '例字读音参考，听一听，也可以看文字提示' : type === 'sort' ? '选一选它的小房子，想一想发音的样子' : '看看声调的小路，选出带对小帽子的音节'}</p>
        <div class="pinyin-question-stage ${type === 'sort' ? 'pinyin-house-stage' : ''}"><span>${round.display}</span>${round.tone ? `<div class="pinyin-question-tone">${toneArt(PINYIN_TONES[round.tone - 1])}<strong>${PINYIN_TONES[round.tone - 1].name}</strong></div>` : ''}</div>
        ${type !== 'sort' ? `<button class="button pinyin-secondary" data-pinyin-listen>${soundIcon()}听例字读音参考</button>` : ''}
        <details class="pinyin-game-hint" ${!env.isSoundEnabled?.() || type === 'tones' ? 'open' : ''}><summary>${type === 'listen' ? '看看例字和口型提示' : '看看小提示'}</summary><p>${round.hint}</p></details>
        <div class="pinyin-answers ${type === 'tones' ? 'pinyin-four-answers' : ''}">${round.choices.map(choice => `<button class="pinyin-answer" data-pinyin-answer="${choice.value}"><strong>${choice.label}</strong>${choice.small ? `<small>${choice.small}</small>` : ''}</button>`).join('')}</div>
        <p class="game-feedback" data-pinyin-feedback role="status">${type === 'listen' && !env.isSoundEnabled?.() ? '声音关闭啦，文字提示也能帮你找到答案。' : '慢慢想一想，选好就点一下。'}</p>
        <div class="pinyin-game-controls"><button class="button pinyin-secondary" data-pinyin-restart>重新开始</button><button class="button primary" data-pinyin-next hidden>${index === 4 ? '领取小奖励 ✦' : '下一关 →'}</button></div>
      `, 'game-modal pinyin-modal');
      env.setCleanup?.(() => { alive = false; env.stopSpeech?.(); });
      const content = env.dialogContent;
      const feedback = content.querySelector('[data-pinyin-feedback]');
      const hint = content.querySelector('.pinyin-game-hint');
      const listen = content.querySelector('[data-pinyin-listen]');
      if (listen) listen.onclick = () => readReference(round.speech, feedback);
      content.querySelectorAll('[data-pinyin-answer]').forEach(button => button.onclick = () => {
        if (!alive || locked) return;
        if (button.dataset.pinyinAnswer !== round.answer) {
          button.classList.add('pinyin-try-again');
          button.setAttribute('aria-label', `${button.textContent.trim()}，再试一试`);
          hint.open = true;
          feedback.textContent = '差一点点，看看小提示，再选一次吧。';
          return;
        }
        locked = true;
        env.stopSpeech?.();
        button.classList.add('pinyin-correct');
        hint.open = true;
        content.querySelectorAll('[data-pinyin-answer]').forEach(choice => { choice.disabled = true; });
        feedback.textContent = `答对啦！${round.explanation}`;
        feedback.classList.add('success');
        content.querySelector('[data-pinyin-next]').hidden = false;
        env.chime?.(true);
        env.celebrate?.();
        say('答对啦！真棒！');
      });
      content.querySelector('[data-pinyin-restart]').onclick = () => startGame(type);
      content.querySelector('[data-pinyin-next]').onclick = () => {
        if (!alive || !locked || completed) return;
        if (index < 4) { index++; renderRound(); }
        else {
          completed = true;
          env.complete?.({ title: '拼音小探险家，真棒！', message: `${gameInfo.title}的5关都完成啦！收下一颗小星星，再读一读，记得更牢。`, replay: () => startGame(type) });
        }
      };
    }
    renderRound();
  }

  function bind(root) {
    if (pageRoot && pageHandler) pageRoot.removeEventListener('click', pageHandler);
    pageRoot = root;
    pageHandler = event => {
      const button = event.target.closest('button');
      if (!button || !root.contains(button)) return;
      if (button.hasAttribute('data-pinyin-start')) openLesson();
      else if (button.dataset.pinyinLesson) openLesson(button.dataset.pinyinLesson);
      else if (button.dataset.pinyinGame) startGame(button.dataset.pinyinGame);
      else if (button.dataset.pinyinTone) openTone(Number(button.dataset.pinyinTone));
    };
    root.addEventListener('click', pageHandler);
    refreshProgress();
  }

  return { bind, openLesson, startGame, refreshProgress };
}
