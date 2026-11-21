// Every tuning number and colour in one place. The playfield is a fixed 1280x720 logical
// area; the renderer scales it to the window, so no rule below depends on the screen size.
// Two picture panels sit side by side under a HUD bar: each panel is 600x560, drawn from
// the same scene painter, the right one with every difference switched on.

export const FIELD = { width: 1280, height: 720 };

/** The two picture panels, in logical coordinates. */
export const PANEL = {
  width: 600,
  height: 560,
  leftX: 20,
  rightX: 660,
  y: 92,
  gap: 40,
};

/** The HUD bar across the top. */
export const HUD = { height: 72, pad: 20 };

/** How close a click must land to a difference's centre to count, in scene pixels. */
export const HIT_RADIUS = 34;

/** Points for a find, and the bonus per second left when a level is cleared. */
export const SCORE = { find: 100, hintCost: 0, timeBonusPerSecond: 5, wrongClick: -25 };

/** Seconds lost on a wrong click. */
export const WRONG_TIME_PENALTY = 5;

/** How long a hint ring pulses around a difference, in seconds. */
export const HINT_SECONDS = 2.5;

/** The three levels: name, time limit, hints, and how many differences each hides. */
export const LEVELS = [
  { id: 'park', name: 'Sunny Park', tagline: 'A lazy afternoon in the park', seconds: 150, hints: 3, diffs: 5 },
  { id: 'kitchen', name: 'Cozy Kitchen', tagline: 'Tea is on, the cat is watching', seconds: 180, hints: 3, diffs: 7 },
  { id: 'moon', name: 'Moon Base', tagline: 'One small step for a sharp eye', seconds: 210, hints: 3, diffs: 9 },
];

/** Where the best total score is kept between visits (this browser only). */
export const BEST_KEY = 'twin-tales.best';

export const PALETTE = {
  backdrop: '#171a26',
  panelFrame: '#2c3247',
  panelShadow: 'rgba(0,0,0,0.45)',
  hud: '#222636',
  hudLine: '#3a415c',
  text: '#f2f0e6',
  muted: '#9aa1b8',
  accent: '#ffc53d',
  accentDark: '#e09e00',
  good: '#58d68d',
  bad: '#ff6b6b',
  hint: '#ffd94d',
  marker: '#ff5252',
  markerSoft: 'rgba(255,82,82,0.25)',
  timerFull: '#58d68d',
  timerLow: '#ff6b6b',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
export const FONT_DISPLAY = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';
