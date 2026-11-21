// The screenshot scenes behind ?shot=start|play|end. Each one stages a real state of the
// game — the title over the harbor, a hunt halfway through with three differences ringed
// and four still to find, and the win screen after the night market — so every frame is
// what a short game really looks like, and the same seed always gives the same frame.

import { SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';

export function stageShot(name, world) {
  const state = world.state;
  world.reset();
  if (name !== 'play' && name !== 'end') {
    return { screen: SCREEN_TITLE, best: 0 };
  }
  if (name === 'play') {
    // Halfway through the harbor: three found (ringed on both panels), four still hidden,
    // the counter reading 3 / 7 and the clock running.
    const diffs = world.levelScene().diffs;
    state.found = diffs.slice(0, 3);
    state.score = 300;
    state.timeLeft = 74;
    state.elapsed = 46;
    return { screen: SCREEN_PLAY, best: 1200 };
  }
  // The end: the night market finished, all seven ringed, the win panel up.
  world.startLevel(2);
  state.found = world.levelScene().diffs.slice();
  state.score = 2400;
  state.timeLeft = 41;
  state.elapsed = 79;
  state.finished = true;
  state.won = true;
  return { screen: SCREEN_WIN, best: 2400 };
}
