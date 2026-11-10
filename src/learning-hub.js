export const GAME_CATALOG = [
  ['numbers', 'count', '数一数水果', '数数篮子里有几个水果', '🍎', '观察与数数'],
  ['numbers', 'find', '数字捉迷藏', '找出藏起来的数字朋友', '🔎', '认知与记忆'],
  ['numbers', 'trace', '小手描数字', '沿着数字的模样描一描', '✏️', '动手与探索'],
  ['numbers', 'train', '数字小火车', '补上空车厢，让火车出发', '🚂', '顺序与逻辑'],
  ['numbers', 'compare', '小兔分胡萝卜', '找出胡萝卜更多的一篮', '🥕', '数量与比较'],
  ['numbers', 'memory', '记忆翻翻乐', '数字与相同数量的星星配对', '⭐', '记忆与配对'],
  ['numbers', 'balloons', '数字气球派对', '按数字顺序点亮小气球', '🎈', '顺序与专注'],
  ['numbers', 'picnic', '小熊点心铺', '按小熊的订单装好小饼干', '🍪', '动手与数量'],
  ['numbers', 'drum', '小耳朵听听', '仔细听，小鼓敲了几下', '🥁', '聆听与数数'],
  ['pinyin', 'listen', '拼音找朋友', '听例字，寻找韵母朋友', '🎧', '听音与识别'],
  ['pinyin', 'sort', '拼音小房子', '声母、韵母找小家', '🧺', '分类与认知'],
  ['pinyin', 'tones', '声调小滑梯', '看一看，认出四声的模样', '🛝', '声调与观察'],
  ['alphabet', 'match', '大小写找朋友', '让大写和小写牵起手', '🧩', '大小写配对'],
  ['alphabet', 'listen', '小耳朵找字母', '听一听，字母朋友在哪里', '🔤', '听音与识别'],
  ['alphabet', 'order', '字母排排队', '给字母列车补上空位', '🚃', '顺序与逻辑'],
].map(([subject, type, title, description, symbol, skill]) => ({ subject, type, title, description, symbol, skill }));

const subjectNames = { numbers: '数字乐园', pinyin: '拼音天地', alphabet: '字母森林' };
const gameCard = (game, icon) => `<button class="hub-game-card subject-${game.subject}" data-play="${game.subject}:${game.type}" data-game-subject="${game.subject}"><span class="hub-game-art" aria-hidden="true">${game.symbol}</span><span class="hub-game-copy"><small>${subjectNames[game.subject]} · ${game.skill}</small><strong>${game.title}</strong><span>${game.description}</span></span><span class="hub-game-arrow">${icon('arrow', 18)}</span></button>`;

export function renderLearningHub({ icon, visits, numbersPage, pinyinPage, alphabetPage }) {
  return `
    <a class="skip-link" href="#main-content">跳到学习内容</a>
    <aside class="sidebar hub-sidebar">
      <a class="brand" href="#home" aria-label="小芽学习乐园首页"><span class="hub-brand-mark">${icon('leaf', 27)}</span><span><strong>小芽学习乐园</strong><small>让好奇心，慢慢发芽</small></span></a>
      <div class="nav-caption">我的学习地图</div>
      <nav class="navigation" aria-label="主要导航">
        <a class="nav-item active" href="#home" data-nav="home">${icon('home')}<span>探索首页</span></a>
        <a class="nav-item" href="#numbers" data-nav="numbers"><span class="nav-subject-symbol nav-number">12</span><span>数字乐园</span></a>
        <a class="nav-item" href="#pinyin" data-nav="pinyin"><span class="nav-subject-symbol nav-pinyin">ā</span><span>拼音天地</span></a>
        <a class="nav-item" href="#alphabet" data-nav="alphabet"><span class="nav-subject-symbol nav-alphabet">Aa</span><span>字母森林</span></a>
        <a class="nav-item" href="#games" data-nav="games">${icon('game')}<span>游戏大厅</span></a>
      </nav>
      <div class="sidebar-bottom">
        <div class="growth-card"><span class="growth-drawing">${icon('leaf', 34)}<span>✧</span></span><strong>每一份小小努力<br>都在悄悄发芽</strong><div class="growth-line"><span id="side-progress"></span></div><small id="side-progress-text"></small></div>
        <button class="parent-link" data-action="parents">${icon('heart', 17)}<span>给爸爸妈妈的话</span>${icon('chevron', 15)}</button>
        <div class="sidebar-note">不着急，不比较 <span>♥</span></div>
      </div>
    </aside>
    <main class="main hub-main" id="main-content" tabindex="-1">
      <header class="topbar hub-topbar"><div class="hub-breadcrumb">学习乐园 <span>/</span> <b id="current-page-label">探索首页</b></div><div class="header-actions"><span class="streak">${icon('fire', 18)}<span>第 <b>${visits}</b> 天打卡</span></span><button id="sound-toggle" class="sound-toggle" aria-label="关闭声音" title="关闭声音"></button><button class="hub-achievements" data-action="achievements" aria-label="查看我的小成就">${icon('medal', 20)}<span>我的成就</span></button></div></header>
      <section id="home" class="subject-view home-page" data-page="home" aria-labelledby="home-title">
        <div class="hub-welcome"><div><span class="hub-eyebrow">HELLO, LITTLE EXPLORER</span><h1 id="home-title" tabindex="-1">嗨，小小探险家 <span>☀</span></h1><p>今天的小发现，会长成明天的大本领。</p></div><span class="hub-date-note">每天 5–10 分钟<br><b>陪伴，是最好的启蒙</b></span></div>
        <div class="hub-hero"><div class="hub-hero-copy"><span class="hub-hero-tag"><span>✦</span> 好奇的小脑袋，欢迎来到</span><h2>小小的你，<br>有大大的<span>探索力。</span></h2><p>认数字、学拼音、读字母。<br>把每一个「我会啦」，装进成长的小口袋。</p><a class="button primary" href="#numbers">开始今天的探索 ${icon('arrow', 18)}</a></div><div class="hub-hero-art" aria-hidden="true"><span class="hub-floating-label">一起，慢慢长大 <i>✧</i></span><span class="hub-art-letter">A<i>a</i></span><span class="hub-art-pinyin">ā</span><img src="/number-garden.svg" alt=""/><span class="hub-art-spark spark-one">✦</span><span class="hub-art-spark spark-two">✧</span></div></div>
        <div class="hub-section-heading"><div><span class="hub-eyebrow">PICK A LITTLE ADVENTURE</span><h2>今天，想去哪里玩？</h2></div><span class="hub-heading-note">三片小天地，慢慢探索就好</span></div>
        <div class="subject-grid">
          <a class="subject-card subject-numbers" href="#numbers"><div class="subject-card-top"><span>01 / 数字启蒙</span><span class="subject-card-arrow">${icon('arrow', 19)}</span></div><div class="subject-art art-numbers" aria-hidden="true"><b>1</b><b>2</b><b>3</b><i>✧</i></div><h3>数字乐园</h3><p>听一听，数一数<br>和 1–10 交朋友</p><div class="subject-card-footer"><span>10 个数字 · 9 个游戏</span><strong data-subject-progress="numbers">0 / 10</strong></div></a>
          <a class="subject-card subject-pinyin" href="#pinyin"><div class="subject-card-top"><span>02 / 中文启蒙</span><span class="subject-card-arrow">${icon('arrow', 19)}</span></div><div class="subject-art art-pinyin" aria-hidden="true"><b>ā</b><b>o</b><b>e</b><i>✧</i></div><h3>拼音天地</h3><p>声母韵母，声调拼读<br>走进汉语的小世界</p><div class="subject-card-footer"><span>人教版 2024 · 14 课</span><strong data-subject-progress="pinyin">0 / 14</strong></div></a>
          <a class="subject-card subject-alphabet" href="#alphabet"><div class="subject-card-top"><span>03 / 英语启蒙</span><span class="subject-card-arrow">${icon('arrow', 19)}</span></div><div class="subject-art art-alphabet" aria-hidden="true"><b>A</b><b>a</b><i>✧</i></div><h3>字母森林</h3><p>大写小写，听读配对<br>遇见 A–Z 新朋友</p><div class="subject-card-footer"><span>26 个字母 · 3 个游戏</span><strong data-subject-progress="alphabet">0 / 26</strong></div></a>
        </div>
        <div class="hub-lower-grid"><section class="hub-continue"><span class="hub-eyebrow">ONE LITTLE STEP</span><h2>一点点，就很了不起</h2><p>选一位朋友，留下今天的小进步。</p><button class="continue-row" data-continue="numbers"><span class="continue-icon subject-numbers">12</span><span><strong>数字好朋友</strong><small data-continue-label="numbers">从数字 1 开始</small></span>${icon('arrow', 17)}</button><button class="continue-row" data-continue="pinyin"><span class="continue-icon subject-pinyin">ā</span><span><strong>拼音第一站</strong><small data-continue-label="pinyin">从 a o e 开始</small></span>${icon('arrow', 17)}</button><button class="continue-row" data-continue="alphabet"><span class="continue-icon subject-alphabet">Aa</span><span><strong>字母的奇妙森林</strong><small data-continue-label="alphabet">从字母 A 开始</small></span>${icon('arrow', 17)}</button></section><section class="hub-featured"><div class="hub-section-heading"><div><span class="hub-eyebrow">LEARN THROUGH PLAY</span><h2>玩一会，也学一点</h2></div><a class="hub-text-link" href="#games">全部游戏 ${icon('arrow', 15)}</a></div><div class="hub-featured-list">${[GAME_CATALOG[0], GAME_CATALOG[9], GAME_CATALOG[12]].map(game => gameCard(game, icon)).join('')}</div></section></div>
      </section>
      <section id="numbers" class="subject-view number-page" data-page="numbers" aria-labelledby="number-page-title" hidden>${numbersPage}</section>
      <section id="pinyin" class="subject-view pinyin-page" data-page="pinyin" aria-labelledby="pinyin-page-title" hidden>${pinyinPage}</section>
      <section id="alphabet" class="subject-view alphabet-page" data-page="alphabet" aria-labelledby="alphabet-page-title" hidden>${alphabetPage}</section>
      <section id="games" class="subject-view games-page" data-page="games" aria-labelledby="games-page-title" hidden><header class="hub-page-heading"><span class="hub-eyebrow">THE PLAYROOM</span><h1 id="games-page-title" tabindex="-1">把学习，变成一场游戏 <span>🎈</span></h1><p>15 个小小挑战。不计时、不比较，试一试就很棒。</p></header><div class="game-filters" role="group" aria-label="按学科筛选游戏"><button class="selected" data-game-filter="all" aria-pressed="true">全部游戏 <span>15</span></button><button data-game-filter="numbers" aria-pressed="false">数字乐园 <span>9</span></button><button data-game-filter="pinyin" aria-pressed="false">拼音天地 <span>3</span></button><button data-game-filter="alphabet" aria-pressed="false">字母森林 <span>3</span></button></div><p id="game-filter-status" class="hub-filter-status" role="status">15 个游戏，选一个开始吧</p><div class="hub-games-grid">${GAME_CATALOG.map(game => gameCard(game, icon)).join('')}</div></section>
      <footer class="page-footer hub-footer">${icon('leaf', 15)}<span>不着急，不比较。每一个小发现，都很了不起。</span><button class="footer-parent" data-action="parents">家长指南 ${icon('chevron', 12)}</button></footer>
    </main>
    <dialog id="activity-dialog" aria-labelledby="dialog-title"><button class="modal-close" aria-label="关闭">${icon('close', 22)}</button><div id="dialog-content"></div></dialog><div id="toast" role="status" aria-live="polite"></div><div id="confetti" aria-hidden="true"></div>
  `;
}
