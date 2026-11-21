// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s
// steps, and the renderer paints what is there. The game moves between six screens:
// title, play, paused, level clear, game over and win.
//
// ?seed=N fixes the hunt's random choices (the hint's pick). ?shot=start|play|end (with
// &seed=N) stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_FOUND, EVENT_LEVEL_CLEAR, EVENT_MISS, EVENT_OVER, EVENT_WIN } from './world.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_NEXT, ACTION_PAUSE, createInput } from './input.js';
import { createRenderer, SCREEN_CLEAR, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);

let audio = null;
function beep(freq, delay, duration) {
  try {
    audio = audio ?? new (window.AudioContext || window.webkitAudioContext)();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, audio.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(audio.currentTime + delay);
    osc.stop(audio.currentTime + delay + duration);
  } catch {
    // Sound is a garnish: a browser without audio still plays the game.
  }
}

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

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best);
    painted += 1;
  }
  // Paint twice, then keep the frame fresh: a resize (the headless window settling, or
  // a metrics override) clears the canvas by resetting its size, so every resize repaints
  // the staged scene, and the ready flag goes up only after a quiet half second.
  window.addEventListener('resize', () => {
    paint();
    paint();
  });
  function loop() {
    paint();
    if (painted < 2) {
      requestAnimationFrame(loop);
      return;
    }
    setTimeout(() => {
      paint();
      paint();
      window.__shotReady = true;
    }, 400);
  }
  requestAnimationFrame(loop);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  // Screen readers (and anyone watching the page's text) hear the screen changes and each find.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Find 7 differences in the Sunset Harbor.');
  }

  function endGame(won) {
    screen = won ? SCREEN_WIN : SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(won ? `You found them all! Score ${world.state.score}.` : `Game over. Score ${world.state.score}. Best ${best}.`);
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_CONFIRM) {
      if (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_WIN) startGame();
      else if (screen === SCREEN_CLEAR) {
        const events = world.nextLevel();
        if (events & EVENT_WIN) endGame(true);
        else {
          screen = SCREEN_PLAY;
          announce(`Level ${world.state.level + 1}: ${world.levelScene().name}. Find 7 differences.`);
        }
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
    }
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
    }
    if (actions & ACTION_HINT && screen === SCREEN_PLAY) {
      if (world.hint()) announce('Hint: one difference is ringing.');
    }
    if (actions & ACTION_NEXT && screen === SCREEN_CLEAR) {
      const events = world.nextLevel();
      if (events & EVENT_WIN) endGame(true);
      else screen = SCREEN_PLAY;
    }
  }

  function handleClicks() {
    if (screen !== SCREEN_PLAY) return;
    const clicks = input.takeClicks();
    for (const click of clicks) {
      const events = world.click(click.x, click.y);
      if (events & EVENT_FOUND) {
        beep(660, 0, 0.12);
        beep(880, 0.09, 0.18);
        const left = 7 - world.state.found.length;
        announce(left === 0 ? 'All found!' : `Found one! ${left} to go.`);
      } else if (events & EVENT_MISS) {
        beep(160, 0, 0.2);
      }
      if (events & EVENT_LEVEL_CLEAR) {
        screen = SCREEN_CLEAR;
        beep(523, 0, 0.12);
        beep(659, 0.1, 0.12);
        beep(784, 0.2, 0.22);
        announce('Level clear!');
      } else if (events & EVENT_OVER) {
        endGame(false);
      }
    }
  }

  function step() {
    if (screen !== SCREEN_PLAY) return;
    const events = world.step(STEP);
    if (events & EVENT_OVER) endGame(false);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    handleClicks();
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP && screen === SCREEN_PLAY) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best);
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Harbor Twins. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
