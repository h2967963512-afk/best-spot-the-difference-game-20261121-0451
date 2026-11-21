// Boot and the one loop: input is read every frame, the world advances in real time,
// and the renderer paints what is there. The game moves between six screens: title,
// play, paused, level clear, time up and victory.
//
// ?seed=N fixes the scenes' decoration. ?shot=cover|kitchen|moon|win (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.

import { BEST_KEY, FIELD } from './config.js';
import { createWorld, SCREEN_LEVEL_CLEAR, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TIME_UP, SCREEN_TITLE, SCREEN_VICTORY } from './world.js';
import {
  ACTION_CONFIRM,
  ACTION_HINT,
  ACTION_MUTE,
  ACTION_NEXT,
  ACTION_PAUSE,
  ACTION_RESTART,
  createInput,
} from './input.js';
import { createAudio } from './audio.js';
import { createRenderer } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(seed);
const renderer = createRenderer(canvas);
const audio = createAudio();
const input = createInput(canvas, FIELD);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function announce(message) {
  status.textContent = message;
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let screen = SCREEN_TITLE;
  let best = readBest();
  world.state.best = best;
  let last = performance.now();

  function startGame() {
    audio.unlock();
    audio.startMusic();
    world.startGame();
    screen = SCREEN_PLAY;
    announce('Playing. Find every difference before the clock runs out.');
  }

  function finishLevel() {
    if (world.state.screen === SCREEN_LEVEL_CLEAR) {
      screen = SCREEN_LEVEL_CLEAR;
      audio.win();
      announce(`Level cleared. Score ${world.state.score}.`);
    }
  }

  function endRun() {
    const total = world.state.totalScore;
    if (total > best) {
      best = total;
      world.state.best = best;
      saveBest(best);
    }
    audio.stopMusic();
  }

  function handleClicks() {
    for (const click of input.takeClicks()) {
      audio.unlock();
      if (screen === SCREEN_TITLE) {
        // The big start button, or anywhere on the title: start playing.
        if (click.y > 380 && click.y < 480) startGame();
        continue;
      }
      if (screen === SCREEN_PLAY) {
        // HUD buttons: the hint area is the "Hints N (H)" text at top right.
        if (click.y < 72 && click.x > 1080) {
          const id = world.useHint();
          if (id) audio.click();
          continue;
        }
        const result = world.click(click.x, click.y);
        if (result === 'found') audio.found();
        else if (result === 'wrong') audio.wrong();
        if (world.state.screen === SCREEN_LEVEL_CLEAR) finishLevel();
        else if (world.state.screen === SCREEN_TIME_UP) {
          screen = SCREEN_TIME_UP;
          endRun();
          announce(`Time's up. You found ${world.state.found.size} differences.`);
        }
        continue;
      }
      if (screen === SCREEN_PAUSED) {
        if (click.y > 340 && click.y < 400) {
          screen = SCREEN_PLAY;
          world.resume();
        } else if (click.y > 405 && click.y < 465) {
          world.retryLevel();
          screen = SCREEN_PLAY;
        }
        continue;
      }
      if (screen === SCREEN_LEVEL_CLEAR) {
        if (click.y > 410 && click.y < 470) {
          if (world.isLastLevel()) {
            screen = SCREEN_VICTORY;
            endRun();
          } else {
            world.nextLevel();
            screen = SCREEN_PLAY;
          }
        }
        continue;
      }
      if (screen === SCREEN_TIME_UP) {
        if (click.y > 375 && click.y < 435) {
          world.retryLevel();
          screen = SCREEN_PLAY;
          audio.startMusic();
        } else if (click.y > 440 && click.y < 495) {
          screen = SCREEN_TITLE;
          world.toTitle();
        }
        continue;
      }
      if (screen === SCREEN_VICTORY) {
        if (click.y > 410 && click.y < 470) startGame();
        else if (click.y > 475 && click.y < 530) {
          screen = SCREEN_TITLE;
          world.toTitle();
        }
      }
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) {
      const muted = audio.toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
      if (!muted && screen === SCREEN_PLAY) audio.startMusic();
    }
    if (actions & ACTION_CONFIRM) {
      if (screen === SCREEN_TITLE || screen === SCREEN_VICTORY) startGame();
      else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        world.resume();
      }
    }
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        world.pause();
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        world.resume();
      }
    }
    if (actions & ACTION_HINT && screen === SCREEN_PLAY) {
      if (world.useHint()) audio.click();
    }
    if (actions & ACTION_RESTART) {
      if (screen === SCREEN_PLAY || screen === SCREEN_PAUSED || screen === SCREEN_TIME_UP) {
        world.retryLevel();
        screen = SCREEN_PLAY;
        audio.startMusic();
        announce('Level restarted.');
      }
    }
    if (actions & ACTION_NEXT && screen === SCREEN_LEVEL_CLEAR) {
      if (world.isLastLevel()) {
        screen = SCREEN_VICTORY;
        endRun();
      } else {
        world.nextLevel();
        screen = SCREEN_PLAY;
      }
    }
  }

  function frame(nowMs) {
    const dt = Math.min((nowMs - last) / 1000, MAX_FRAME);
    last = nowMs;
    handleClicks();
    handleActions();
    const tick = world.update(dt);
    if (tick === 'tick') audio.tick();
    if (world.state.screen === SCREEN_LEVEL_CLEAR && screen === SCREEN_PLAY) finishLevel();
    if (world.state.screen === SCREEN_TIME_UP && screen === SCREEN_PLAY) {
      screen = SCREEN_TIME_UP;
      endRun();
      announce(`Time's up. You found ${world.state.found.size} differences.`);
    }
    renderer.draw(world.state, screen, best);
    requestAnimationFrame(frame);
  }

  world.state.best = best;
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
