// The game state and its rules: three levels, seven differences each, three lives and a
// clock. A click is a hit when it lands inside an unfound difference of either panel; a
// miss costs a life. Finding all seven clears the level. The world knows nothing about
// pixels — the renderer turns this state into a picture, and input turns clicks into
// scene coordinates.

import { DIFFS_PER_LEVEL, LEVEL_TIME } from './config.js';
import { LEVELS as SCENES } from './scenes.js';

export const EVENT_FOUND = 1;
export const EVENT_MISS = 2;
export const EVENT_LEVEL_CLEAR = 4;
export const EVENT_OVER = 8;
export const EVENT_WIN = 16;

export function createWorld(random) {
  const state = {
    level: 0,
    found: [],
    lives: 3,
    score: 0,
    timeLeft: LEVEL_TIME,
    hintUsedAt: -999,
    hintFlash: null,
    flash: 0,
    popup: null,
    popupAt: 0,
    elapsed: 0,
    finished: false,
    won: false,
  };

  function levelScene() {
    return SCENES[state.level];
  }

  function reset() {
    state.level = 0;
    state.found = [];
    state.lives = 3;
    state.score = 0;
    state.timeLeft = LEVEL_TIME;
    state.hintUsedAt = -999;
    state.hintFlash = null;
    state.flash = 0;
    state.popup = null;
    state.popupAt = 0;
    state.elapsed = 0;
    state.finished = false;
    state.won = false;
  }

  function startLevel(level) {
    state.level = level;
    state.found = [];
    state.timeLeft = LEVEL_TIME;
    state.hintFlash = null;
    state.flash = 0;
    state.popup = null;
    state.elapsed = 0;
    state.finished = false;
    state.won = false;
  }

  function foundCount() {
    return state.found.length;
  }

  function unfound() {
    return levelScene().diffs.filter((diff) => !state.found.includes(diff));
  }

  /** A click in scene coordinates: returns the event flags it caused. */
  function click(x, y) {
    if (state.finished) return 0;
    const diffs = levelScene().diffs;
    for (let i = 0; i < diffs.length; i += 1) {
      const diff = diffs[i];
      if (state.found.includes(diff)) continue;
      const dx = x - diff.x;
      const dy = y - diff.y;
      if (dx * dx + dy * dy <= diff.r * diff.r) {
        state.found.push(diff);
        state.score += 100;
        state.popup = { text: `+100  ${diff.label}`, at: state.elapsed };
        if (state.found.length === DIFFS_PER_LEVEL) {
          state.score += Math.round(state.timeLeft) * 5;
          state.finished = true;
          return EVENT_FOUND | EVENT_LEVEL_CLEAR;
        }
        return EVENT_FOUND;
      }
    }
    state.lives -= 1;
    state.flash = 0.35;
    state.popup = { text: 'Not a difference…', at: state.elapsed };
    if (state.lives <= 0) {
      state.finished = true;
      return EVENT_MISS | EVENT_OVER;
    }
    return EVENT_MISS;
  }

  /** A hint: briefly rings one difference still unfound. Costs 50 points, 10 s cooldown. */
  function hint() {
    if (state.finished) return false;
    if (state.elapsed - state.hintUsedAt < 10 || state.score < 50) return false;
    const rest = unfound();
    if (rest.length === 0) return false;
    const pick = rest[Math.floor(random() * rest.length)];
    state.score -= 50;
    state.hintUsedAt = state.elapsed;
    state.hintFlash = { diff: pick, until: state.elapsed + 2 };
    return true;
  }

  function nextLevel() {
    if (state.level + 1 >= SCENES.length) {
      state.won = true;
      state.finished = true;
      return EVENT_WIN;
    }
    startLevel(state.level + 1);
    return 0;
  }

  /** Advance the clock by dt seconds; returns event flags (time out ends the game). */
  function step(dt) {
    if (state.finished) return 0;
    state.elapsed += dt;
    state.timeLeft -= dt;
    if (state.flash > 0) state.flash = Math.max(0, state.flash - dt);
    if (state.hintFlash && state.elapsed > state.hintFlash.until) state.hintFlash = null;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.finished = true;
      return EVENT_OVER;
    }
    return 0;
  }

  return {
    state,
    reset,
    startLevel,
    levelScene,
    foundCount,
    unfound,
    click,
    hint,
    nextLevel,
    step,
  };
}
