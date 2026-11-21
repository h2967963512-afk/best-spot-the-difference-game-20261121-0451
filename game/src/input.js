// Mouse and keyboard input, read once per frame. Clicks are reported as logical
// coordinates (the canvas is scaled to the window, so client pixels are mapped back
// through its bounding box), and keys become named actions the world consumes.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_RESTART = 8;
export const ACTION_MUTE = 16;
export const ACTION_NEXT = 32;

const KEY_ACTIONS = {
  Enter: ACTION_CONFIRM,
  ' ': ACTION_CONFIRM,
  p: ACTION_PAUSE,
  P: ACTION_PAUSE,
  Escape: ACTION_PAUSE,
  h: ACTION_HINT,
  H: ACTION_HINT,
  r: ACTION_RESTART,
  R: ACTION_RESTART,
  m: ACTION_MUTE,
  M: ACTION_MUTE,
  n: ACTION_NEXT,
  N: ACTION_NEXT,
};

export function createInput(canvas, field) {
  let actions = 0;
  const clicks = [];
  const keysDown = new Set();

  // Invert the renderer's transform exactly: the canvas letterboxes the fixed field
  // into the window, so a client pixel maps to (client - offset) / scale, not to a
  // plain stretch of the field. (A stretch mapping silently shifts every click
  // sideways whenever the window's aspect differs from the field's.)
  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / field.width, rect.height / field.height);
    const ox = (rect.width - field.width * scale) / 2;
    const oy = (rect.height - field.height * scale) / 2;
    return {
      x: (event.clientX - rect.left - ox) / scale,
      y: (event.clientY - rect.top - oy) / scale,
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    clicks.push(toLogical(event));
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    keysDown.add(event.key);
    const action = KEY_ACTIONS[event.key];
    if (action) {
      actions |= action;
      event.preventDefault();
    }
  });
  window.addEventListener('keyup', (event) => keysDown.delete(event.key));
  window.addEventListener('blur', () => keysDown.clear());

  return {
    /** Every click since the last call, as {x, y} in logical coordinates. */
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
    /** Every action key pressed since the last call, as a bitmask. */
    takeActions() {
      const out = actions;
      actions = 0;
      return out;
    },
    isDown(key) {
      return keysDown.has(key);
    },
  };
}
