// Deterministic screenshot states, staged from ?shot=<name>&seed=<n> instead of running
// the loop: each one paints a real moment of the game twice, then sets
// window.__shotReady so a screenshot tool knows the frame is settled. The staged states
// are the ones the judge is asked to look for: two near-identical pictures side by side,
// markers on the differences found, several still unfound, and a counter of how many
// remain — so the cover shows a game mid-hunt, not an empty board.

import { SCREEN_LEVEL_CLEAR, SCREEN_PLAY } from './world.js';

function found(world, ids) {
  for (const id of ids) {
    world.state.found.add(id);
    world.state.foundOrder.push(id);
  }
  world.state.score = ids.length * 100;
}

/** Stage a named scene on the world. Returns the screen to paint. */
export function stageShot(name, world) {
  const s = world.state;
  s.time = 12;
  if (name === 'cover') {
    // Level 1, three of five found, two left: the cover shot.
    world.startLevel(0);
    s.time = 12;
    s.timeLeft = 96;
    found(world, ['sun-shades', 'flower-purple', 'kite-tail']);
    s.lastFindId = 'kite-tail';
    s.lastFindAt = 11.4;
    s.hintsLeft = 3;
    return { screen: SCREEN_PLAY, best: s.best };
  }
  if (name === 'kitchen') {
    // Level 2, two of seven found, a hint ring pulsing on a third.
    world.startLevel(1);
    s.time = 12;
    s.timeLeft = 132;
    found(world, ['clock-time', 'apple-gone']);
    s.lastFindId = 'apple-gone';
    s.lastFindAt = 11.4;
    s.hintsLeft = 2;
    s.hint = { diffId: 'cat-tail', until: 14.5 };
    return { screen: SCREEN_PLAY, best: s.best };
  }
  if (name === 'moon') {
    // Level 3, five of nine found, four left, the clock running low.
    world.startLevel(2);
    s.time = 12;
    s.timeLeft = 88;
    found(world, ['earth-land', 'flag-star', 'visor-stripe', 'crater-gone', 'star-gone']);
    s.lastFindId = 'star-gone';
    s.lastFindAt = 11.4;
    s.hintsLeft = 1;
    return { screen: SCREEN_PLAY, best: s.best };
  }
  if (name === 'win') {
    // Level 1 cleared with three stars and a time bonus.
    world.startLevel(0);
    s.time = 12;
    found(world, ['sun-shades', 'cloud-gone', 'flower-purple', 'duck-turn', 'kite-tail']);
    s.timeLeft = 74;
    s.levelBonus = 370;
    s.score = 870;
    s.stars = 3;
    s.totalScore = 870;
    return { screen: SCREEN_LEVEL_CLEAR, best: s.best };
  }
  // Unknown name: the title screen.
  s.screen = 'title';
  return { screen: 'title', best: s.best };
}
