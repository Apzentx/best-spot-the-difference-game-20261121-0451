// Every tuning number and colour in one place. The playfield is a fixed 1280x720 logical
// area; the renderer scales it to the window, so no rule below depends on screen size.

export const FIELD = { width: 1280, height: 720 };

/** Two picture panels, side by side, each 560x420 in logical units. */
export const PANEL = { width: 560, height: 420, top: 96, leftX: 36, rightX: 684 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

export const DIFFS_PER_LEVEL = 7;
export const LIVES = 3;
export const LEVEL_TIME = 120;
export const HINT_COOLDOWN = 10;
export const HINT_COST = 50;
export const POINTS_PER_DIFF = 100;
export const TIME_BONUS_PER_SECOND = 5;

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'harbor-twins.best';

export const PALETTE = {
  backdrop: '#141821',
  panel: '#232a3a',
  panelEdge: '#4a5872',
  text: '#f2ede3',
  muted: '#9aa5b8',
  gold: '#f2c94c',
  green: '#58c96b',
  red: '#e5534b',
  hint: '#7ec8f2',
  bar: '#2c3547',
  barFill: '#f2c94c',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
