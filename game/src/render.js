// Drawing only: the world's state and the current screen in, pixels out. The 1280x720
// playfield is scaled to fit the window and centred, the margin filled with the backdrop
// colour. Both picture panels are drawn from the same scene code — the left whole, the
// right with its seven changes — and every difference found is ringed on both panels, so
// the frame always shows the hunt's state at a glance.

import { DIFFS_PER_LEVEL, FIELD, FONT, LIVES, PALETTE, PANEL } from './config.js';
import { LEVELS } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

const TIMER = { x: 36, y: 88, width: 1208, height: 6 };

function cachedLabel(prefix) {
  let value = -1;
  let text = '';
  return function label(next) {
    if (next !== value) {
      value = next;
      text = prefix + next;
    }
    return text;
  };
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  const scoreLabel = cachedLabel('Score ');
  const foundLabel = cachedLabel('Found ');
  const bestLabel = cachedLabel('Best ');
  const finalLabel = cachedLabel('Score ');
  const timeLabel = cachedLabel('');

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  const fonts = new Map();
  function text(value, x, y, size, color, align, baseline) {
    if (!fonts.has(size)) fonts.set(size, `${size}px ${FONT}`);
    context.font = fonts.get(size);
    context.fillStyle = color;
    context.textAlign = align || 'left';
    context.textBaseline = baseline || 'alphabetic';
    context.fillText(value, x, y);
  }

  function drawPanels(state) {
    const scene = LEVELS[state.level];
    const panels = [
      { x: PANEL.leftX, variant: 0, tag: 'A' },
      { x: PANEL.rightX, variant: 1, tag: 'B' },
    ];
    for (const panel of panels) {
      context.save();
      context.translate(panel.x, PANEL.top);
      context.fillStyle = '#000';
      context.fillRect(0, 0, PANEL.width, PANEL.height);
      scene.draw(context, panel.variant);
      // Rings on the differences already found, on both panels alike.
      for (let i = 0; i < state.found.length; i += 1) {
        const diff = state.found[i];
        context.strokeStyle = PALETTE.green;
        context.lineWidth = 4;
        context.beginPath();
        context.arc(diff.x, diff.y, diff.r + 6, 0, Math.PI * 2);
        context.stroke();
        context.fillStyle = PALETTE.green;
        context.beginPath();
        context.arc(diff.x, diff.y - diff.r - 8, 11, 0, Math.PI * 2);
        context.fill();
        text(String(i + 1), diff.x, diff.y - diff.r - 8, 14, '#12351a', 'center', 'middle');
      }
      // A hint rings its difference, pulsing, on both panels alike.
      if (state.hintFlash) {
        const diff = state.hintFlash.diff;
        const pulse = 20 + 6 * Math.sin(state.elapsed * 8);
        context.strokeStyle = PALETTE.hint;
        context.lineWidth = 4;
        context.beginPath();
        context.arc(diff.x, diff.y, diff.r + pulse, 0, Math.PI * 2);
        context.stroke();
      }
      context.restore();
      // Panel frame and tag.
      context.strokeStyle = PALETTE.panelEdge;
      context.lineWidth = 3;
      context.strokeRect(panel.x, PANEL.top, PANEL.width, PANEL.height);
      context.fillStyle = PALETTE.panel;
      context.fillRect(panel.x + 10, PANEL.top - 16, 34, 28);
      text(panel.tag, panel.x + 27, PANEL.top + 6, 20, PALETTE.text, 'center', 'middle');
    }
  }

  function drawHud(state) {
    context.textBaseline = 'top';
    text(scoreLabel(state.score), 36, 22, 30, PALETTE.text, 'left');
    text(LEVELS[state.level].name, FIELD.width / 2, 22, 30, PALETTE.text, 'center');
    const found = `${state.found.length} / ${DIFFS_PER_LEVEL}`;
    text(`Found ${found}`, FIELD.width - 340, 22, 30, PALETTE.text, 'left');
    // Lives as hearts.
    for (let life = 0; life < LIVES; life += 1) {
      text('♥', FIELD.width - 36 - life * 34, 24, 30, life < state.lives ? PALETTE.red : '#3a4152', 'right');
    }
    // Time pressure you can feel: a draining bar and the seconds left.
    const frac = Math.max(0, state.timeLeft / 120);
    context.fillStyle = PALETTE.bar;
    context.fillRect(TIMER.x, TIMER.y, TIMER.width, TIMER.height);
    context.fillStyle = frac > 0.25 ? PALETTE.barFill : PALETTE.red;
    context.fillRect(TIMER.x, TIMER.y, TIMER.width * frac, TIMER.height);
    text(timeLabel(Math.ceil(state.timeLeft)), FIELD.width / 2, 60, 20, PALETTE.muted, 'center');
  }

  function drawBottom(state) {
    const msg = state.finished
      ? ''
      : 'Click a difference in either picture — or press H for a hint (−50, 10 s wait).';
    text(msg, 36, 556, 22, PALETTE.muted, 'left');
    // Hint button.
    context.fillStyle = PALETTE.panel;
    context.fillRect(1080, 620, 164, 48);
    context.strokeStyle = PALETTE.panelEdge;
    context.lineWidth = 2;
    context.strokeRect(1080, 620, 164, 48);
    text('Hint  (H)', 1162, 651, 22, PALETTE.hint, 'center', 'middle');
    text('← → no keys needed · P pauses · N next level', 36, 651, 20, PALETTE.muted, 'left');
    // A find pops its reward over the pictures for a moment.
    if (state.popup && state.elapsed - state.popup.at < 1.2) {
      const alpha = 1 - (state.elapsed - state.popup.at) / 1.2;
      context.globalAlpha = alpha;
      text(state.popup.text, FIELD.width / 2, 600, 30, PALETTE.gold, 'center');
      context.globalAlpha = 1;
    }
  }

  function drawPanel(title, lines, prompt) {
    const width = 640;
    const height = 150 + lines.length * 34 + 70;
    const x = (FIELD.width - width) / 2;
    const y = (FIELD.height - height) / 2;
    context.fillStyle = 'rgba(10,12,18,0.72)';
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    context.fillStyle = PALETTE.panel;
    context.fillRect(x, y, width, height);
    context.strokeStyle = PALETTE.panelEdge;
    context.lineWidth = 2;
    context.strokeRect(x, y, width, height);
    context.textBaseline = 'alphabetic';
    text(title, FIELD.width / 2, y + 78, 46, PALETTE.text, 'center');
    for (let index = 0; index < lines.length; index += 1) {
      text(lines[index], FIELD.width / 2, y + 134 + index * 34, 22, PALETTE.muted, 'center');
    }
    text(prompt, FIELD.width / 2, y + height - 38, 24, PALETTE.gold, 'center');
  }

  /** Paint one frame: the pictures, the HUD, then a panel for the screen the game is on. */
  function draw(state, screen, best) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    drawPanels(state);
    if (screen === SCREEN_TITLE) {
      drawPanel('Harbor Twins', [
        'Two pictures, seven differences. Find them all.',
        'Click a difference in either picture. A wrong click costs a life.',
        'Three scenes — the harbor, the garden, the night market —',
        'each harder than the last. Hints cost 50 points.',
        bestLabel(best),
      ], 'Press Space or click to start');
      return;
    }
    drawHud(state);
    drawBottom(state);
    if (state.flash > 0) {
      context.fillStyle = `rgba(229,83,75,${(state.flash / 0.35) * 0.22})`;
      context.fillRect(0, 0, FIELD.width, FIELD.height);
    }
    if (screen === SCREEN_PAUSED) {
      drawPanel('Paused', ['The pictures will wait for you.'], 'Press P to resume');
    } else if (screen === SCREEN_CLEAR) {
      const bonus = Math.round(state.timeLeft) * 5;
      drawPanel('Level clear!', [
        `All 7 differences found in ${LEVELS[state.level].name}.`,
        `Time bonus +${bonus}.`,
        finalLabel(state.score),
        bestLabel(best),
      ], 'Press N or click for the next level');
    } else if (screen === SCREEN_OVER) {
      drawPanel(state.timeLeft <= 0 ? "Time's up!" : 'Out of lives!', [
        `You found ${state.found.length} of 7 in ${LEVELS[state.level].name}.`,
        finalLabel(state.score),
        bestLabel(best),
      ], 'Press Space or click to play again');
    } else if (screen === SCREEN_WIN) {
      drawPanel('You found them all!', [
        'All 21 differences across three scenes.',
        finalLabel(state.score),
        bestLabel(best),
      ], 'Press Space or click to play again');
    }
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw };
}
