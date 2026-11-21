// Keyboard and pointer input. Held keys are not needed here; one-shot presses (start,
// pause, hint, next level) are queued as bit flags and taken once by the loop, so a press
// between two frames is never lost and never counted twice. Pointer clicks are queued with
// their logical coordinates, so the loop can test them against the pictures.

import { FIELD, PANEL } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_NEXT = 8;

const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);
const HINT = new Set(['KeyH']);
const NEXT = new Set(['KeyN']);

export function createInput(canvas) {
  let actions = 0;
  const clicks = [];

  function logical(event) {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / FIELD.width, rect.height / FIELD.height);
    const ox = (rect.width - FIELD.width * scale) / 2;
    const oy = (rect.height - FIELD.height * scale) / 2;
    return {
      x: (event.clientX - rect.left - ox) / scale,
      y: (event.clientY - rect.top - oy) / scale,
    };
  }

  window.addEventListener('keydown', (event) => {
    if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (HINT.has(event.code)) {
      if (!event.repeat) actions |= ACTION_HINT;
    } else if (NEXT.has(event.code)) {
      if (!event.repeat) actions |= ACTION_NEXT;
    } else return;
    event.preventDefault();
  });

  canvas.addEventListener('pointerdown', (event) => {
    // Every click is also a confirm: on menu screens it starts or advances the game, and
    // during play the loop ignores confirms, so a hunt click never double-fires.
    actions |= ACTION_CONFIRM;
    const point = logical(event);
    // A click on a picture panel is a hunt click; a click on the hint bar is a hint.
    if (point.y >= PANEL.top && point.y <= PANEL.top + PANEL.height) {
      if (point.x >= PANEL.leftX && point.x <= PANEL.leftX + PANEL.width) {
        clicks.push({ x: point.x - PANEL.leftX, y: point.y - PANEL.top });
        return;
      }
      if (point.x >= PANEL.rightX && point.x <= PANEL.rightX + PANEL.width) {
        clicks.push({ x: point.x - PANEL.rightX, y: point.y - PANEL.top });
        return;
      }
    }
    if (point.y > 620 && point.y < 668 && point.x > 1080 && point.x < 1244) actions |= ACTION_HINT;
  });

  return {
    /** The one-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** The hunt clicks since the last call, in scene coordinates. */
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
  };
}
