// The simulation: screens, level state, timer, scoring and hints. It knows nothing
// about pixels beyond the panels' rectangles, which render.js owns; it answers clicks
// with "found", "wrong" or "nothing there" and tells the renderer what to paint.

import { HIT_RADIUS, LEVELS, PANEL, SCORE, WRONG_TIME_PENALTY, HINT_SECONDS } from './config.js';
import { SCENES } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL_CLEAR = 'level-clear';
export const SCREEN_TIME_UP = 'time-up';
export const SCREEN_VICTORY = 'victory';

export function createWorld(seed) {
  const state = {
    seed,
    screen: SCREEN_TITLE,
    levelIndex: 0,
    found: new Set(),
    foundOrder: [],
    score: 0,
    totalScore: 0,
    timeLeft: LEVELS[0].seconds,
    hintsLeft: LEVELS[0].hints,
    hint: null, // {diffId, until} while a hint ring is showing
    lastFindAt: 0,
    lastFindId: null,
    wrongAt: 0,
    wrongPoint: null,
    levelBonus: 0,
    stars: 0,
    best: 0,
    time: 0,
    tickedSecond: -1,
    message: '',
    messageAt: 0,
  };

  function level() {
    return LEVELS[state.levelIndex];
  }

  function scene() {
    return SCENES[level().id];
  }

  function diffs() {
    return scene().diffs;
  }

  function startLevel(index) {
    state.levelIndex = index;
    state.found = new Set();
    state.foundOrder = [];
    state.timeLeft = level().seconds;
    state.hintsLeft = level().hints;
    state.hint = null;
    state.lastFindId = null;
    state.wrongPoint = null;
    state.screen = SCREEN_PLAY;
  }

  function flash(message) {
    state.message = message;
    state.messageAt = state.time;
  }

  return {
    state,
    level,
    scene,
    diffs,

    startGame() {
      state.totalScore = 0;
      state.score = 0;
      startLevel(0);
    },

    startLevel,

    nextLevel() {
      if (state.levelIndex + 1 < LEVELS.length) startLevel(state.levelIndex + 1);
      else state.screen = SCREEN_VICTORY;
    },

    retryLevel() {
      startLevel(state.levelIndex);
    },

    pause() {
      if (state.screen === SCREEN_PLAY) state.screen = SCREEN_PAUSED;
    },

    resume() {
      if (state.screen === SCREEN_PAUSED) state.screen = SCREEN_PLAY;
    },

    toTitle() {
      state.screen = SCREEN_TITLE;
    },

    /** A click in logical coordinates. Returns 'found' | 'wrong' | 'none'. */
    click(x, y) {
      if (state.screen !== SCREEN_PLAY) return 'none';
      // Which panel was clicked? The same scene point counts on either side.
      let sceneX = null;
      let sceneY = null;
      if (x >= PANEL.leftX && x < PANEL.leftX + PANEL.width && y >= PANEL.y && y < PANEL.y + PANEL.height) {
        sceneX = x - PANEL.leftX;
        sceneY = y - PANEL.y;
      } else if (x >= PANEL.rightX && x < PANEL.rightX + PANEL.width && y >= PANEL.y && y < PANEL.y + PANEL.height) {
        sceneX = x - PANEL.rightX;
        sceneY = y - PANEL.y;
      }
      if (sceneX === null) return 'none';
      const hit = diffs().find((d) => {
        if (state.found.has(d.id)) return false;
        const dx = sceneX - d.x;
        const dy = sceneY - d.y;
        return dx * dx + dy * dy <= HIT_RADIUS * HIT_RADIUS;
      });
      if (hit) {
        state.found.add(hit.id);
        state.foundOrder.push(hit.id);
        state.score += SCORE.find;
        state.lastFindId = hit.id;
        state.lastFindAt = state.time;
        flash(`Found: ${hit.label}! +${SCORE.find}`);
        if (state.found.size === diffs().length) {
          state.levelBonus = Math.round(state.timeLeft) * SCORE.timeBonusPerSecond;
          state.score += state.levelBonus;
          state.stars = state.timeLeft > level().seconds * 0.5 ? 3 : state.timeLeft > level().seconds * 0.25 ? 2 : 1;
          state.totalScore += state.score;
          state.screen = SCREEN_LEVEL_CLEAR;
        }
        return 'found';
      }
      state.score = Math.max(0, state.score + SCORE.wrongClick);
      state.timeLeft = Math.max(0, state.timeLeft - WRONG_TIME_PENALTY);
      state.wrongAt = state.time;
      state.wrongPoint = { x, y };
      flash(`Not a difference — ${WRONG_TIME_PENALTY}s lost`);
      return 'wrong';
    },

    /** Spend a hint: briefly ring a difference still unfound. Returns its id or null. */
    useHint() {
      if (state.screen !== SCREEN_PLAY || state.hintsLeft <= 0) return null;
      const remaining = diffs().filter((d) => !state.found.has(d.id));
      if (remaining.length === 0) return null;
      // Deterministic pick (driven by the clock, not Math.random): the same hint
      // always lands on the same difference for the same game state.
      const pick = remaining[Math.floor(state.time * 7) % remaining.length];
      state.hintsLeft -= 1;
      state.hint = { diffId: pick.id, until: state.time + HINT_SECONDS };
      flash('Hint: look inside the glowing ring');
      return pick.id;
    },

    /** Advance the clock by dt seconds. Returns 'tick' when a new second starts under 10s. */
    update(dt) {
      state.time += dt;
      if (state.screen !== SCREEN_PLAY) return null;
      state.timeLeft -= dt;
      if (state.hint && state.time >= state.hint.until) state.hint = null;
      const whole = Math.ceil(state.timeLeft);
      let tick = null;
      if (whole !== state.tickedSecond) {
        state.tickedSecond = whole;
        if (whole <= 10 && whole > 0) tick = 'tick';
      }
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.totalScore += state.score;
        state.screen = SCREEN_TIME_UP;
      }
      return tick;
    },

    remaining() {
      return diffs().length - state.found.size;
    },

    isLastLevel() {
      return state.levelIndex === LEVELS.length - 1;
    },
  };
}
