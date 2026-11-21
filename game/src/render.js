// Everything the player sees: the HUD bar, the two picture panels with their markers,
// and the title, pause, level-clear, time-up and victory overlays. The renderer scales
// the fixed 1280x720 field to the canvas, so the layout is identical at any window size.

import { FIELD, HUD, LEVELS, PALETTE, PANEL, FONT, FONT_DISPLAY } from './config.js';
import { SCENES } from './scenes.js';
import { SCREEN_LEVEL_CLEAR, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TIME_UP, SCREEN_TITLE, SCREEN_VICTORY } from './world.js';

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function text(ctx, s, x, y, size, color, weight, align = 'left', font = FONT) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function fitCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(canvas.clientWidth * dpr);
    const h = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const scale = Math.min(canvas.width / FIELD.width, canvas.height / FIELD.height);
    const ox = (canvas.width - FIELD.width * scale) / 2;
    const oy = (canvas.height - FIELD.height * scale) / 2;
    ctx.setTransform(scale, 0, 0, scale, ox, oy);
  }

  function drawPanels(world, time) {
    const s = world.state;
    const scene = SCENES[LEVELS[s.levelIndex].id];
    const all = new Set(scene.diffs.map((d) => d.id));
    const none = new Set();

    for (const [panelX, variant] of [[PANEL.leftX, none], [PANEL.rightX, all]]) {
      ctx.save();
      ctx.shadowColor = PALETTE.panelShadow;
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = PALETTE.panelFrame;
      rr(ctx, panelX - 6, PANEL.y - 6, PANEL.width + 12, PANEL.height + 12, 10);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.rect(panelX, PANEL.y, PANEL.width, PANEL.height);
      ctx.clip();
      ctx.translate(panelX, PANEL.y);
      scene.draw(ctx, variant, s.seed);
      ctx.restore();
      // Markers on the differences found, on both panels.
      for (const d of scene.diffs) {
        if (!s.found.has(d.id)) continue;
        const pulse = d.id === s.lastFindId ? 1 + 0.12 * Math.sin((time - s.lastFindAt) * 10) : 1;
        ctx.save();
        ctx.strokeStyle = PALETTE.marker;
        ctx.lineWidth = 4;
        circle(ctx, panelX + d.x, PANEL.y + d.y, 26 * pulse);
        ctx.stroke();
        ctx.strokeStyle = PALETTE.markerSoft;
        ctx.lineWidth = 10;
        circle(ctx, panelX + d.x, PANEL.y + d.y, 26 * pulse);
        ctx.stroke();
        ctx.restore();
        // A small tick above the ring, so a found difference reads at a glance.
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(panelX + d.x - 8, PANEL.y + d.y - 30);
        ctx.lineTo(panelX + d.x - 2, PANEL.y + d.y - 23);
        ctx.lineTo(panelX + d.x + 9, PANEL.y + d.y - 34);
        ctx.stroke();
        ctx.restore();
      }
      // The hint ring, on both panels, pulsing while it lasts.
      if (s.hint) {
        const d = scene.diffs.find((x) => x.id === s.hint.diffId);
        if (d) {
          const pulse = 1 + 0.15 * Math.sin(time * 8);
          ctx.save();
          ctx.strokeStyle = PALETTE.hint;
          ctx.lineWidth = 5;
          ctx.setLineDash([10, 8]);
          circle(ctx, panelX + d.x, PANEL.y + d.y, 30 * pulse);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    // A red X where the last wrong click landed, fading fast.
    if (s.wrongPoint && time - s.wrongAt < 0.6) {
      const a = 1 - (time - s.wrongAt) / 0.6;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = PALETTE.bad;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      const { x, y } = s.wrongPoint;
      ctx.beginPath();
      ctx.moveTo(x - 9, y - 9); ctx.lineTo(x + 9, y + 9);
      ctx.moveTo(x + 9, y - 9); ctx.lineTo(x - 9, y + 9);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawHud(world) {
    const s = world.state;
    const lvl = LEVELS[s.levelIndex];
    ctx.fillStyle = PALETTE.hud;
    ctx.fillRect(0, 0, FIELD.width, HUD.height);
    ctx.fillStyle = PALETTE.hudLine;
    ctx.fillRect(0, HUD.height - 2, FIELD.width, 2);

    text(ctx, 'TWIN TALES', HUD.pad, 32, 26, PALETTE.accent, 800, 'left', FONT_DISPLAY);
    text(ctx, 'spot the difference', HUD.pad, 56, 13, PALETTE.muted, 400);
    text(ctx, `Level ${s.levelIndex + 1}/3 · ${lvl.name}`, 300, 32, 18, PALETTE.text, 700);
    text(ctx, lvl.tagline, 300, 56, 13, PALETTE.muted, 400);

    // Timer bar and seconds.
    const frac = Math.max(0, s.timeLeft / lvl.seconds);
    const barX = 560;
    const barW = 220;
    ctx.fillStyle = '#10131d';
    rr(ctx, barX, 22, barW, 14, 7);
    ctx.fill();
    ctx.fillStyle = frac < 0.17 ? PALETTE.timerLow : PALETTE.timerFull;
    if (frac > 0) {
      rr(ctx, barX, 22, barW * frac, 14, 7);
      ctx.fill();
    }
    text(ctx, `⏱ ${formatTime(s.timeLeft)}`, barX + barW + 10, 36, 18, frac < 0.17 ? PALETTE.timerLow : PALETTE.text, 700);

    // Found counter: the number that matters most.
    const total = SCENES[lvl.id].diffs.length;
    const left = total - s.found.size;
    text(ctx, `Found ${s.found.size}/${total}`, 920, 32, 20, PALETTE.text, 800);
    text(ctx, left === 0 ? 'all found!' : `${left} left to find`, 920, 56, 14, left === 0 ? PALETTE.good : PALETTE.accent, 700);

    text(ctx, `Score ${s.score}`, 1100, 32, 18, PALETTE.text, 700);
    text(ctx, `Hints ${s.hintsLeft}  (H)`, 1100, 56, 13, PALETTE.muted, 400);
  }

  function drawFooter(world) {
    const s = world.state;
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `400 13px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Click a difference in either picture  ·  H hint  ·  P pause  ·  R restart  ·  M sound', FIELD.width / 2, 700);
    if (s.message && world.state.time - s.messageAt < 2.5) {
      ctx.fillStyle = PALETTE.accent;
      ctx.font = `700 17px ${FONT}`;
      ctx.fillText(s.message, FIELD.width / 2, 678);
    }
  }

  function overlay(title, lines, buttons) {
    ctx.fillStyle = 'rgba(10,12,20,0.72)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = PALETTE.hud;
    rr(ctx, 340, 170, 600, 380, 16);
    ctx.fill();
    ctx.strokeStyle = PALETTE.hudLine;
    ctx.lineWidth = 2;
    rr(ctx, 340, 170, 600, 380, 16);
    ctx.stroke();
    text(ctx, title, 640, 240, 40, PALETTE.accent, 800, 'center', FONT_DISPLAY);
    let y = 296;
    for (const line of lines) {
      text(ctx, line, 640, y, 19, PALETTE.text, 400, 'center');
      y += 34;
    }
    y += 18;
    for (const b of buttons) {
      ctx.fillStyle = b.primary ? PALETTE.accent : '#39405a';
      rr(ctx, 640 - 130, y, 260, 48, 10);
      ctx.fill();
      text(ctx, b.label, 640, y + 31, 18, b.primary ? '#222636' : PALETTE.text, 700, 'center');
      y += 62;
    }
  }

  function drawTitle(world) {
    const s = world.state;
    drawPanels(world, s.time);
    ctx.fillStyle = 'rgba(10,12,20,0.66)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    text(ctx, 'TWIN TALES', 640, 190, 72, PALETTE.accent, 800, 'center', FONT_DISPLAY);
    text(ctx, 'Spot the Difference', 640, 240, 30, PALETTE.text, 600, 'center', FONT_DISPLAY);
    text(ctx, 'Two pictures. A handful of sneaky changes. Find them all before the clock runs out.', 640, 296, 19, PALETTE.muted, 400, 'center');
    text(ctx, '3 hand-drawn scenes  ·  5 → 7 → 9 differences  ·  hints, timer and a best score to beat', 640, 330, 17, PALETTE.text, 400, 'center');
    if (s.best > 0) text(ctx, `Best score: ${s.best}`, 640, 366, 17, PALETTE.good, 700, 'center');
    ctx.fillStyle = PALETTE.accent;
    rr(ctx, 510, 400, 260, 56, 12);
    ctx.fill();
    text(ctx, '▶  Start playing', 640, 436, 20, '#222636', 800, 'center');
    text(ctx, 'or press Enter', 640, 482, 14, PALETTE.muted, 400, 'center');
    text(ctx, 'Click a difference in either picture — a red ring marks each find. H asks for a hint.', 640, 540, 15, PALETTE.muted, 400, 'center');
  }

  function draw(state, screen, best) {
    fitCanvas();
    ctx.clearRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    const world = { state, time: state.time };
    if (screen === SCREEN_TITLE) {
      drawTitle(world);
      return;
    }
    drawHud(world);
    drawPanels(world, state.time);
    drawFooter(world);
    if (screen === SCREEN_PAUSED) {
      overlay('Paused', ['Take a breath — the clock is waiting too.'], [
        { label: 'Resume  (P)', primary: true },
        { label: 'Restart level  (R)', primary: false },
      ]);
    } else if (screen === SCREEN_LEVEL_CLEAR) {
      const lvl = LEVELS[state.levelIndex];
      const stars = '★'.repeat(state.stars) + '☆'.repeat(3 - state.stars);
      overlay(`${lvl.name} — cleared!`, [
        `${stars}`,
        `All ${SCENES[lvl.id].diffs.length} differences found · time bonus +${state.levelBonus}`,
        `Level score ${state.score} · total ${state.totalScore}`,
      ], state.levelIndex + 1 < LEVELS.length
        ? [{ label: 'Next level  (N)', primary: true }]
        : [{ label: 'See your result  (N)', primary: true }]);
    } else if (screen === SCREEN_TIME_UP) {
      const lvl = LEVELS[state.levelIndex];
      overlay(`Time's up!`, [
        `You found ${state.found.size} of ${SCENES[lvl.id].diffs.length} differences in ${lvl.name}.`,
        'The missing ones were closer than they looked.',
      ], [
        { label: 'Try again  (R)', primary: true },
        { label: 'Back to title', primary: false },
      ]);
    } else if (screen === SCREEN_VICTORY) {
      overlay('You found them all!', [
        'Three scenes, twenty-one differences, one sharp eye.',
        `Total score ${state.totalScore}${state.totalScore >= best && state.totalScore > 0 ? ' — a new best!' : ` · best ${best}`}`,
        'Thanks for playing Twin Tales.',
      ], [
        { label: 'Play again  (Enter)', primary: true },
        { label: 'Back to title', primary: false },
      ]);
    }
  }

  return { draw };
}
