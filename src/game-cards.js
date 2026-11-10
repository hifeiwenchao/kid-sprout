import { GAME_CATALOG, GAME_CATEGORIES, SUBJECT_NAMES } from './game-catalog.js';

export const renderGameCard = (game, icon = () => '↗') => `<button class="hub-game-card subject-${game.subject}" data-play="${game.subject}:${game.type}" data-game-subject="${game.subject}" data-game-category="${game.category}"><span class="hub-game-art ${[...game.symbol].length > 4 ? 'hub-game-art-small' : [...game.symbol].length > 2 ? 'hub-game-art-text' : ''}" aria-hidden="true">${game.symbol}</span><span class="hub-game-copy"><small>${SUBJECT_NAMES[game.subject]} · ${game.skill}</small><strong>${game.title}</strong><span>${game.description}</span></span><span class="hub-game-arrow" aria-hidden="true">${icon('arrow', 18)}</span></button>`;

export function renderSubjectGames(subject, icon) {
  const games = GAME_CATALOG.filter(game => game.subject === subject);
  return `<section class="subject-game-library" aria-labelledby="${subject}-games-heading"><div class="hub-section-heading"><div><span class="hub-eyebrow">LEARN THROUGH PLAY</span><h2 id="${subject}-games-heading">学一点，再玩一点</h2><p>${games.length} 个小游戏 · 从喜欢的目标开始，不着急</p></div><a class="hub-text-link" href="#games">去游戏大厅 ↗</a></div>${Object.entries(GAME_CATEGORIES).map(([category, label]) => {
    const group = games.filter(game => game.category === category);
    return group.length ? `<section class="subject-game-group" aria-labelledby="${subject}-${category}-heading"><h3 id="${subject}-${category}-heading"><span>${label}</span><small>${group.length} 个游戏</small></h3><div class="hub-games-grid">${group.map(game => renderGameCard(game, icon)).join('')}</div></section>` : '';
  }).join('')}</section>`;
}

export function renderGameFilters() {
  return `<div class="game-library-toolbar"><label class="game-search"><span>找个想玩的游戏</span><input id="game-search" type="search" placeholder="试试：声调、排序、单词…" autocomplete="off" /></label><label class="game-goal"><span>今天想练什么？</span><select id="game-goal"><option value="all">全部练习目标</option>${Object.entries(GAME_CATEGORIES).map(([key, label]) => `<option value="${key}">${label}</option>`).join('')}</select></label></div><div class="game-filters" role="group" aria-label="按学科筛选游戏"><button class="selected" data-game-filter="all" aria-pressed="true">全部游戏 <span>${GAME_CATALOG.length}</span></button>${Object.entries(SUBJECT_NAMES).map(([subject, label]) => `<button data-game-filter="${subject}" aria-pressed="false">${label} <span>${GAME_CATALOG.filter(game => game.subject === subject).length}</span></button>`).join('')}</div>`;
}
