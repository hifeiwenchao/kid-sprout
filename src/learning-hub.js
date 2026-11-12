import { GAME_CATALOG } from './game-catalog.js';
import { renderGameCard, renderGameFilters } from './game-cards.js';
export { GAME_CATALOG } from './game-catalog.js';


export function renderLearningHub({ icon, visits, numbersPage, pinyinPage, alphabetPage }) {
  return `
    <a class="skip-link" href="#main-content">跳到学习内容</a>
    <aside class="sidebar hub-sidebar">
      <a class="brand" href="#home" aria-label="萌芽启蒙首页"><span class="hub-brand-mark">${icon('leaf', 27)}</span><span><strong>萌芽启蒙</strong><small>让好奇心，慢慢发芽</small></span></a>
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
      <header class="topbar hub-topbar"><div class="hub-breadcrumb">萌芽启蒙 <span>/</span> <b id="current-page-label">探索首页</b></div><div class="header-actions"><span class="streak">${icon('fire', 18)}<span>第 <b>${visits}</b> 天打卡</span></span><button id="sound-toggle" class="sound-toggle" aria-label="关闭声音" title="关闭声音"></button><button class="hub-achievements" data-action="achievements" aria-label="查看我的小成就">${icon('medal', 20)}<span>我的成就</span></button></div></header>
      <section id="home" class="subject-view home-page" data-page="home" aria-labelledby="home-title">
        <div class="hub-welcome"><div><span class="hub-eyebrow">HELLO, LITTLE EXPLORER</span><h1 id="home-title" tabindex="-1">嗨，小小探险家 <span>☀</span></h1><p>今天的小发现，会长成明天的大本领。</p></div><span class="hub-date-note">每天 5–10 分钟<br><b>陪伴，是最好的启蒙</b></span></div>
        <div class="hub-hero"><div class="hub-hero-copy"><span class="hub-hero-tag"><span>✦</span> 好奇的小脑袋，欢迎来到</span><h2>小小的你，<br>有大大的<span>探索力。</span></h2><p>认数字、学拼音、读字母。<br>把每一个「我会啦」，装进成长的小口袋。</p><a class="button primary" href="#numbers">开始今天的探索 ${icon('arrow', 18)}</a></div><div class="hub-hero-art" aria-hidden="true"><span class="hub-floating-label">一起，慢慢长大 <i>✧</i></span><span class="hub-art-letter">A<i>a</i></span><span class="hub-art-pinyin">ā</span><img src="/number-garden.svg" alt=""/><span class="hub-art-spark spark-one">✦</span><span class="hub-art-spark spark-two">✧</span></div></div>
        <div class="hub-section-heading"><div><span class="hub-eyebrow">PICK A LITTLE ADVENTURE</span><h2>今天，想去哪里玩？</h2></div><span class="hub-heading-note">三片小天地，慢慢探索就好</span></div>
        <div class="subject-grid">
          <a class="subject-card subject-numbers" href="#numbers"><div class="subject-card-top"><span>01 / 数字启蒙</span><span class="subject-card-arrow">${icon('arrow', 19)}</span></div><div class="subject-art art-numbers" aria-hidden="true"><b>1</b><b>2</b><b>3</b><i>✧</i></div><h3>数字乐园</h3><p>听一听，数一数<br>和 1–10 交朋友</p><div class="subject-card-footer"><span>10 个数字 · 20 个游戏</span><strong data-subject-progress="numbers">0 / 10</strong></div></a>
          <a class="subject-card subject-pinyin" href="#pinyin"><div class="subject-card-top"><span>02 / 中文启蒙</span><span class="subject-card-arrow">${icon('arrow', 19)}</span></div><div class="subject-art art-pinyin" aria-hidden="true"><b>ā</b><b>o</b><b>e</b><i>✧</i></div><h3>拼音天地</h3><p>声母韵母，声调拼读<br>走进汉语的小世界</p><div class="subject-card-footer"><span>14 课 · 20 个游戏</span><strong data-subject-progress="pinyin">0 / 14</strong></div></a>
          <a class="subject-card subject-alphabet" href="#alphabet"><div class="subject-card-top"><span>03 / 英语启蒙</span><span class="subject-card-arrow">${icon('arrow', 19)}</span></div><div class="subject-art art-alphabet" aria-hidden="true"><b>A</b><b>a</b><i>✧</i></div><h3>字母森林</h3><p>大写小写，听读配对<br>遇见 A–Z 新朋友</p><div class="subject-card-footer"><span>26 个字母 · 20 个游戏</span><strong data-subject-progress="alphabet">0 / 26</strong></div></a>
        </div>
        <div class="hub-lower-grid"><section class="hub-continue"><span class="hub-eyebrow">ONE LITTLE STEP</span><h2>一点点，就很了不起</h2><p>选一位朋友，留下今天的小进步。</p><button class="continue-row" data-continue="numbers"><span class="continue-icon subject-numbers">12</span><span><strong>数字好朋友</strong><small data-continue-label="numbers">从数字 1 开始</small></span>${icon('arrow', 17)}</button><button class="continue-row" data-continue="pinyin"><span class="continue-icon subject-pinyin">ā</span><span><strong>拼音第一站</strong><small data-continue-label="pinyin">从 a o e 开始</small></span>${icon('arrow', 17)}</button><button class="continue-row" data-continue="alphabet"><span class="continue-icon subject-alphabet">Aa</span><span><strong>字母的奇妙森林</strong><small data-continue-label="alphabet">从字母 A 开始</small></span>${icon('arrow', 17)}</button></section><section class="hub-featured"><div class="hub-section-heading"><div><span class="hub-eyebrow">LEARN THROUGH PLAY</span><h2>玩一会，也学一点</h2></div><a class="hub-text-link" href="#games">全部游戏 ${icon('arrow', 15)}</a></div><div class="hub-featured-list">${['numbers:count', 'pinyin:listen', 'alphabet:match'].map(key => GAME_CATALOG.find(game => `${game.subject}:${game.type}` === key)).map(game => renderGameCard(game, icon)).join('')}</div></section></div>
      </section>
      <section id="numbers" class="subject-view number-page" data-page="numbers" aria-labelledby="number-page-title" hidden>${numbersPage}</section>
      <section id="pinyin" class="subject-view pinyin-page" data-page="pinyin" aria-labelledby="pinyin-page-title" hidden>${pinyinPage}</section>
      <section id="alphabet" class="subject-view alphabet-page" data-page="alphabet" aria-labelledby="alphabet-page-title" hidden>${alphabetPage}</section>
      <section id="games" class="subject-view games-page" data-page="games" aria-labelledby="games-page-title" hidden><header class="hub-page-heading"><span class="hub-eyebrow">THE PLAYROOM</span><h1 id="games-page-title" tabindex="-1">把学习，变成一场游戏 <span>🎈</span></h1><p>60 个小小挑战。不计时、不比较，试一试就很棒。</p></header>${renderGameFilters()}<p id="game-filter-status" class="hub-filter-status" role="status">60 个游戏，选一个开始吧</p><div class="hub-games-grid">${GAME_CATALOG.map(game => renderGameCard(game, icon)).join('')}</div><div id="game-empty" class="game-empty" hidden><span aria-hidden="true">🌱</span><h2>小伙伴还没找到</h2><p>换个词，或试试其他练习目标吧。</p><button class="button secondary" id="game-filter-clear">显示全部游戏</button></div></section>
      <footer class="page-footer hub-footer">
        <div class="hub-footer-message">${icon('leaf', 15)}<span>不着急，不比较。每一个小发现，都很了不起。</span><button class="footer-parent" data-action="parents">家长指南 ${icon('chevron', 12)}</button></div>
        <a class="footer-filing" href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">沪ICP备2026060185号-1</a>
      </footer>
    </main>
    <dialog id="activity-dialog" aria-labelledby="dialog-title"><button class="modal-close" aria-label="关闭">${icon('close', 22)}</button><div id="dialog-content"></div></dialog><div id="toast" role="status" aria-live="polite"></div><div id="confetti" aria-hidden="true"></div>
  `;
}
