import test from 'node:test';
import assert from 'node:assert/strict';
import { GAME_CATALOG, filterGames } from '../src/game-catalog.js';
import { NUMBER_EXTRA_GAMES, buildNumberExtraRounds } from '../src/games/number-extras.js';
import { PINYIN_EXTRA_GAMES, buildPinyinExtraRounds } from '../src/courses/pinyin-extras.js';
import { ALPHABET_EXTRA_GAMES, buildAlphabetExtraRounds } from '../src/courses/alphabet-extras.js';

test('60 unique games cover exactly20 per subject and every new entry has playable rounds', () => {
  assert.equal(GAME_CATALOG.length, 60);
  assert.equal(new Set(GAME_CATALOG.map(game => `${game.subject}:${game.type}`)).size, 60);
  for (const subject of ['numbers', 'pinyin', 'alphabet']) assert.equal(filterGames({ subject }).length, 20);
  for (const [games, build] of [[NUMBER_EXTRA_GAMES, buildNumberExtraRounds], [PINYIN_EXTRA_GAMES, buildPinyinExtraRounds], [ALPHABET_EXTRA_GAMES, buildAlphabetExtraRounds]]) {
    for (const game of games) {
      assert.ok(GAME_CATALOG.includes(game));
      assert.equal(build(game.type).length, 5);
      assert.ok(['recognize', 'listen', 'think', 'build'].includes(game.category));
    }
  }
});

test('subject, goal, and trimmed case insensitive search combine and empty results work', () => {
  const game = GAME_CATALOG.find(game => game.subject === 'alphabet');
  assert.deepEqual(filterGames({ subject: game.subject, category: game.category, query: `  ${game.title}  ` }), [game]);
  assert.equal(filterGames({ query: '没有这个游戏' }).length, 0);
  assert.equal(filterGames({ subject: 'pinyin', query: '字母' }).length, 0);
  assert.equal(filterGames({ subject: 'all', category: 'all', query: '' }).length, 60);
});
