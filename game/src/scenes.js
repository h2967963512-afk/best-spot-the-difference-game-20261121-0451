// The three scenes, all drawn in code: no borrowed art, every shape is a canvas path
// below. Each scene is 600x560 and is painted twice per frame — once plain on the left
// panel, once on the right with every difference in its DIFFS list switched on. A
// difference is a small, fair change: visible when you look for it, easy to miss at a
// glance. Each painter takes the same seed for both panels, so decoration (stars,
// tufts of grass, pebbles) lands identically on each side.

import { createRandom } from './random.js';

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function poly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, width, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function cloud(ctx, x, y, s) {
  ctx.fillStyle = '#ffffff';
  circle(ctx, x, y, 22 * s);
  circle(ctx, x + 22 * s, y - 8 * s, 18 * s);
  circle(ctx, x + 44 * s, y, 20 * s);
  circle(ctx, x + 22 * s, y + 8 * s, 18 * s);
}

function flower(ctx, x, y, petal) {
  ctx.fillStyle = petal;
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2;
    circle(ctx, x + Math.cos(a) * 9, y + Math.sin(a) * 9, 7);
  }
  ctx.fillStyle = '#ffd94d';
  circle(ctx, x, y, 6);
}

// ---------------------------------------------------------------------------
// Level 1 — Sunny Park. 5 differences.
// ---------------------------------------------------------------------------

export const PARK_DIFFS = [
  { id: 'sun-shades', x: 88, y: 78, r: 30, label: 'the sun put on sunglasses' },
  { id: 'cloud-gone', x: 458, y: 108, r: 40, label: 'a cloud drifted away' },
  { id: 'flower-purple', x: 190, y: 518, r: 26, label: 'a flower changed colour' },
  { id: 'duck-turn', x: 438, y: 462, r: 30, label: 'the duck turned around' },
  { id: 'kite-tail', x: 428, y: 152, r: 30, label: 'the kite lost its tail bows' },
];

export function drawPark(ctx, v, seed) {
  const rng = createRandom(seed);
  // Grass first, so no gap shows between the sky and the hills.
  ctx.fillStyle = '#7ec850';
  ctx.fillRect(0, 360, 600, 200);
  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 380);
  sky.addColorStop(0, '#7ec3ee');
  sky.addColorStop(1, '#d8f1fc');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 380);
  // Sun with rays.
  ctx.fillStyle = '#ffd94d';
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    line(ctx, 88 + Math.cos(a) * 52, 78 + Math.sin(a) * 52, 88 + Math.cos(a) * 66, 78 + Math.sin(a) * 66, 5, '#ffd94d');
  }
  circle(ctx, 88, 78, 42);
  if (v.has('sun-shades')) {
    ctx.fillStyle = '#222636';
    rr(ctx, 58, 66, 26, 16, 7);
    rr(ctx, 90, 66, 26, 16, 7);
    line(ctx, 84, 72, 90, 72, 4, '#222636');
    line(ctx, 58, 72, 50, 66, 4, '#222636');
  }
  // Clouds (the middle one may drift away).
  cloud(ctx, 250, 58, 1);
  if (!v.has('cloud-gone')) cloud(ctx, 436, 108, 0.9);
  cloud(ctx, 120, 148, 0.7);
  // Kite with a bowed tail.
  ctx.fillStyle = '#ff6b6b';
  poly(ctx, [[428, 92], [458, 122], [428, 152], [398, 122]]);
  ctx.fillStyle = '#ffffff';
  poly(ctx, [[428, 92], [443, 122], [428, 152], [413, 122]]);
  line(ctx, 428, 152, 428, 196, 2, '#5b5470');
  const bows = v.has('kite-tail') ? 1 : 3;
  for (let i = 0; i < bows; i += 1) {
    ctx.fillStyle = i % 2 ? '#4fc3f7' : '#ffd94d';
    poly(ctx, [[428, 160 + i * 13], [436, 166 + i * 13], [428, 172 + i * 13], [420, 166 + i * 13]]);
  }
  // Birds.
  ctx.strokeStyle = '#5b5470';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(300, 190); ctx.quadraticCurveTo(308, 182, 316, 190);
  ctx.moveTo(316, 190); ctx.quadraticCurveTo(324, 182, 332, 190);
  ctx.moveTo(520, 60); ctx.quadraticCurveTo(528, 52, 536, 60);
  ctx.moveTo(536, 60); ctx.quadraticCurveTo(544, 52, 552, 60);
  ctx.stroke();
  // Hills and grass.
  ctx.fillStyle = '#7ec850';
  ellipse(ctx, 150, 560, 330, 150);
  ctx.fillStyle = '#6ab844';
  ellipse(ctx, 480, 580, 320, 140);
  ctx.fillStyle = '#5da83c';
  for (let i = 0; i < 26; i += 1) {
    const x = rng.range(10, 590);
    const y = rng.range(430, 545);
    line(ctx, x, y, x + 3, y - 9, 2, '#4c8f31');
  }
  // Tree.
  ctx.fillStyle = '#8a5a2b';
  rr(ctx, 470, 300, 22, 110, 6);
  ctx.fillStyle = '#3f9e4d';
  circle(ctx, 481, 268, 52);
  circle(ctx, 440, 300, 38);
  circle(ctx, 522, 300, 38);
  ctx.fillStyle = '#ff8a65';
  circle(ctx, 452, 282, 6);
  circle(ctx, 500, 258, 6);
  circle(ctx, 516, 296, 6);
  // Bench.
  ctx.fillStyle = '#a06a35';
  rr(ctx, 96, 372, 130, 14, 4);
  rr(ctx, 96, 392, 130, 14, 4);
  ctx.fillStyle = '#7c4f22';
  rr(ctx, 108, 406, 12, 34, 3);
  rr(ctx, 202, 406, 12, 34, 3);
  // Pond and duck.
  ctx.fillStyle = '#5fb7e8';
  ellipse(ctx, 430, 480, 110, 42);
  ctx.fillStyle = '#8fd4f5';
  ellipse(ctx, 415, 472, 60, 18);
  const facing = v.has('duck-turn') ? -1 : 1;
  ctx.fillStyle = '#fff3c4';
  ellipse(ctx, 438, 462, 22, 15);
  circle(ctx, 438 + 16 * facing, 444, 11);
  ctx.fillStyle = '#ff9f43';
  poly(ctx, [[438 + 25 * facing, 442], [438 + 36 * facing, 446], [438 + 25 * facing, 450]]);
  ctx.fillStyle = '#222636';
  circle(ctx, 438 + 19 * facing, 441, 2.5);
  // Path.
  ctx.fillStyle = '#e8d9a8';
  ctx.beginPath();
  ctx.moveTo(0, 560);
  ctx.lineTo(0, 520);
  ctx.quadraticCurveTo(200, 500, 300, 530);
  ctx.quadraticCurveTo(420, 556, 600, 540);
  ctx.lineTo(600, 560);
  ctx.closePath();
  ctx.fill();
  // Flowers along the path.
  const petals = ['#ff6b6b', '#ff8ac2', '#ff6b6b', '#ffffff', '#ff8ac2'];
  [70, 130, 190, 250, 310].forEach((x, i) => {
    line(ctx, x, 518, x, 540, 3, '#3f9e4d');
    flower(ctx, x, 514, i === 2 && v.has('flower-purple') ? '#9b59d0' : petals[i]);
  });
}

// ---------------------------------------------------------------------------
// Level 2 — Cozy Kitchen. 7 differences.
// ---------------------------------------------------------------------------

export const KITCHEN_DIFFS = [
  { id: 'clock-time', x: 430, y: 92, r: 40, label: 'the clock shows a different time' },
  { id: 'cat-tail', x: 232, y: 208, r: 30, label: 'the cat moved its tail' },
  { id: 'steam-gone', x: 152, y: 282, r: 30, label: 'the teapot stopped steaming' },
  { id: 'apple-gone', x: 330, y: 392, r: 28, label: 'an apple vanished from the bowl' },
  { id: 'jar-label', x: 478, y: 192, r: 26, label: 'a jar label changed colour' },
  { id: 'leaf-gone', x: 92, y: 402, r: 26, label: 'the plant lost a leaf' },
  { id: 'rug-stripe', x: 300, y: 514, r: 34, label: 'a rug stripe changed colour' },
];

export function drawKitchen(ctx, v, seed) {
  const rng = createRandom(seed);
  // Wall and floor.
  ctx.fillStyle = '#f7e8c8';
  ctx.fillRect(0, 0, 600, 420);
  ctx.fillStyle = '#c98f5a';
  ctx.fillRect(0, 420, 600, 140);
  ctx.fillStyle = '#b57a45';
  for (let x = 0; x < 600; x += 75) ctx.fillRect(x, 420, 3, 140);
  // Window with night sky, moon and stars.
  ctx.fillStyle = '#8a5a2b';
  rr(ctx, 84, 36, 200, 190, 8);
  ctx.fillStyle = '#1d2b52';
  ctx.fillRect(96, 48, 176, 166);
  ctx.fillStyle = '#f4f1de';
  circle(ctx, 240, 86, 22);
  ctx.fillStyle = '#d9d4b8';
  circle(ctx, 232, 80, 5);
  circle(ctx, 246, 94, 4);
  ctx.fillStyle = '#ffffff';
  const stars = [[120, 70], [150, 120], [200, 66], [252, 140], [130, 170]];
  stars.forEach(([x, y]) => {
    circle(ctx, x, y, 3);
    line(ctx, x - 7, y, x + 7, y, 1.5, '#ffffff');
    line(ctx, x, y - 7, x, y + 7, 1.5, '#ffffff');
  });
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(180, 48, 8, 166);
  ctx.fillRect(96, 126, 176, 8);
  // Cat on the sill, tail curled or lowered.
  ctx.fillStyle = '#e8912d';
  ellipse(ctx, 200, 226, 34, 20);
  circle(ctx, 172, 206, 15);
  poly(ctx, [[162, 196], [166, 180], [174, 194]]);
  poly(ctx, [[178, 194], [184, 180], [188, 196]]);
  ctx.fillStyle = '#c97a1e';
  line(ctx, 228, 226, 252, v.has('cat-tail') ? 246 : 214, 6, '#e8912d');
  ctx.fillStyle = '#222636';
  circle(ctx, 168, 204, 2.5);
  // Wall clock: 3 o'clock, or half past four.
  ctx.fillStyle = '#ffffff';
  circle(ctx, 430, 92, 46);
  ctx.strokeStyle = '#5b5470';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(430, 92, 46, 0, Math.PI * 2);
  ctx.stroke();
  const late = v.has('clock-time');
  line(ctx, 430, 92, late ? 430 : 458, late ? 118 : 92, 4, '#222636');
  line(ctx, 430, 92, late ? 452 : 430, late ? 92 : 62, 4, '#222636');
  ctx.fillStyle = '#222636';
  circle(ctx, 430, 92, 4);
  // Shelf with two jars.
  ctx.fillStyle = '#a06a35';
  rr(ctx, 330, 168, 220, 12, 4);
  ctx.fillStyle = '#bfe3f0';
  rr(ctx, 360, 118, 44, 50, 8);
  rr(ctx, 452, 118, 44, 50, 8);
  ctx.fillStyle = '#8a5a2b';
  rr(ctx, 368, 110, 28, 10, 3);
  rr(ctx, 460, 110, 28, 10, 3);
  ctx.fillStyle = v.has('jar-label') ? '#58d68d' : '#ff6b6b';
  rr(ctx, 368, 136, 28, 18, 3);
  ctx.fillStyle = '#ff6b6b';
  rr(ctx, 460, 136, 28, 18, 3);
  // Hanging pans.
  ctx.strokeStyle = '#5b5470';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(340, 240); ctx.lineTo(340, 252);
  ctx.moveTo(520, 240); ctx.lineTo(520, 252);
  ctx.stroke();
  ctx.fillStyle = '#7d7468';
  circle(ctx, 340, 272, 20);
  circle(ctx, 520, 272, 20);
  ctx.fillStyle = '#5b5470';
  circle(ctx, 340, 272, 12);
  circle(ctx, 520, 272, 12);
  // Counter.
  ctx.fillStyle = '#e8d9a8';
  ctx.fillRect(0, 330, 600, 90);
  // Teapot with steam that may stop.
  ctx.fillStyle = '#4a90d9';
  ellipse(ctx, 152, 330, 42, 30);
  ctx.fillStyle = '#3a78b8';
  poly(ctx, [[186, 318], [212, 306], [208, 322], [188, 330]]);
  line(ctx, 116, 318, 104, 296, 6, '#4a90d9');
  circle(ctx, 152, 296, 8);
  if (!v.has('steam-gone')) {
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(140, 288);
    ctx.quadraticCurveTo(130, 272, 142, 258);
    ctx.quadraticCurveTo(152, 246, 144, 234);
    ctx.moveTo(164, 288);
    ctx.quadraticCurveTo(174, 272, 162, 258);
    ctx.stroke();
  }
  // Fruit bowl: three apples, or two.
  ctx.fillStyle = '#c0392b';
  ellipse(ctx, 300, 402, 62, 20);
  ctx.fillStyle = '#e74c3c';
  circle(ctx, 272, 388, 16);
  circle(ctx, 300, 382, 16);
  if (!v.has('apple-gone')) circle(ctx, 328, 388, 16);
  ctx.fillStyle = '#3f9e4d';
  line(ctx, 300, 368, 308, 356, 3, '#3f9e4d');
  // Plant in a pot: five leaves, or four.
  ctx.fillStyle = '#c96f4a';
  poly(ctx, [[66, 430], [118, 430], [110, 470], [74, 470]]);
  ctx.fillStyle = '#3f9e4d';
  const leaves = [[84, 428], [92, 412], [100, 428], [108, 412], [92, 398]];
  leaves.forEach(([x, y], i) => {
    if (i === 4 && v.has('leaf-gone')) return;
    ellipse(ctx, x, y, 7, 16);
  });
  // Rug with stripes, one of which may change colour.
  ctx.fillStyle = '#7d5ba6';
  rr(ctx, 190, 486, 220, 56, 10);
  ctx.fillStyle = '#ffd94d';
  ctx.fillRect(210, 486, 24, 56);
  ctx.fillStyle = v.has('rug-stripe') ? '#58d68d' : '#ff6b6b';
  ctx.fillRect(288, 486, 24, 56);
  ctx.fillStyle = '#ffd94d';
  ctx.fillRect(366, 486, 24, 56);
  // Scattered crumbs on the counter, seeded so both panels match.
  ctx.fillStyle = '#b59a6a';
  for (let i = 0; i < 8; i += 1) circle(ctx, rng.range(420, 580), rng.range(340, 410), 2);
}

// ---------------------------------------------------------------------------
// Level 3 — Moon Base. 9 differences.
// ---------------------------------------------------------------------------

export const MOON_DIFFS = [
  { id: 'earth-land', x: 92, y: 82, r: 34, label: 'a new continent appeared on Earth' },
  { id: 'flag-star', x: 478, y: 198, r: 28, label: 'the flag lost a star' },
  { id: 'wheel-gone', x: 352, y: 472, r: 26, label: 'the rover lost a wheel' },
  { id: 'crater-gone', x: 200, y: 502, r: 26, label: 'a crater smoothed over' },
  { id: 'dish-tilt', x: 520, y: 118, r: 30, label: 'the antenna dish tilted' },
  { id: 'visor-stripe', x: 152, y: 322, r: 26, label: 'a glint appeared on the visor' },
  { id: 'rock-gone', x: 420, y: 520, r: 24, label: 'a moon rock vanished' },
  { id: 'star-gone', x: 300, y: 52, r: 24, label: 'a star went out' },
  { id: 'dome-dark', x: 482, y: 332, r: 30, label: 'the habitat window went dark' },
];

export function drawMoon(ctx, v, seed) {
  const rng = createRandom(seed);
  // Deep space.
  ctx.fillStyle = '#0d1230';
  ctx.fillRect(0, 0, 600, 420);
  // Stars, seeded so both panels match; one may go out.
  ctx.fillStyle = '#ffffff';
  const starSpots = [];
  for (let i = 0; i < 46; i += 1) starSpots.push([rng.range(10, 590), rng.range(10, 400), rng.range(1, 2.6)]);
  starSpots.forEach(([x, y, r], i) => {
    if (i === 7 && v.has('star-gone')) return;
    circle(ctx, x, y, r);
  });
  // The one at the difference's spot is drawn separately so it is easy to find.
  if (!v.has('star-gone')) {
    circle(ctx, 300, 52, 2.4);
    line(ctx, 293, 52, 307, 52, 1.2, '#ffffff');
    line(ctx, 300, 45, 300, 59, 1.2, '#ffffff');
  }
  // Earth with continents; a new one may appear.
  ctx.fillStyle = '#4a90d9';
  circle(ctx, 92, 82, 38);
  ctx.fillStyle = '#3f9e4d';
  ellipse(ctx, 80, 70, 14, 9);
  ellipse(ctx, 104, 96, 12, 8);
  if (v.has('earth-land')) ellipse(ctx, 108, 62, 10, 7);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ellipse(ctx, 78, 56, 16, 6);
  // Antenna dish, tilted up or down.
  ctx.strokeStyle = '#9aa1b8';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(520, 200);
  ctx.lineTo(520, 130);
  ctx.stroke();
  ctx.fillStyle = '#c8cede';
  ctx.beginPath();
  if (v.has('dish-tilt')) {
    ctx.moveTo(492, 108);
    ctx.quadraticCurveTo(520, 92, 548, 108);
    ctx.quadraticCurveTo(520, 128, 492, 108);
  } else {
    ctx.moveTo(492, 128);
    ctx.quadraticCurveTo(520, 146, 548, 128);
    ctx.quadraticCurveTo(520, 106, 492, 128);
  }
  ctx.fill();
  // Flag: three stars, or two.
  line(ctx, 462, 150, 462, 250, 5, '#c8cede');
  ctx.fillStyle = '#ff6b6b';
  poly(ctx, [[462, 152], [522, 164], [462, 196]]);
  ctx.fillStyle = '#ffffff';
  circle(ctx, 478, 168, 4);
  circle(ctx, 496, 172, 4);
  if (!v.has('flag-star')) circle(ctx, 484, 184, 4);
  // Habitat dome with a window that may go dark.
  ctx.fillStyle = '#dfe6f2';
  ctx.beginPath();
  ctx.arc(482, 380, 62, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#b9c2d6';
  ctx.fillRect(414, 380, 136, 10);
  ctx.fillStyle = v.has('dome-dark') ? '#2c3247' : '#ffd94d';
  rr(ctx, 466, 330, 32, 26, 4);
  ctx.strokeStyle = '#8b93a3';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(482, 330); ctx.lineTo(482, 356);
  ctx.stroke();
  // Grey surface with pebbles.
  ctx.fillStyle = '#b9b3a8';
  ctx.fillRect(0, 420, 600, 140);
  ctx.fillStyle = '#a39d90';
  for (let i = 0; i < 20; i += 1) circle(ctx, rng.range(10, 590), rng.range(430, 550), rng.range(2, 5));
  // Crater that may smooth over.
  if (!v.has('crater-gone')) {
    ctx.fillStyle = '#8f887a';
    ellipse(ctx, 200, 502, 34, 12);
    ctx.fillStyle = '#a39d90';
    ellipse(ctx, 200, 500, 28, 9);
  }
  // A rock that may vanish.
  if (!v.has('rock-gone')) {
    ctx.fillStyle = '#8f887a';
    poly(ctx, [[402, 528], [414, 500], [432, 502], [440, 528]]);
  }
  // Astronaut.
  ctx.fillStyle = '#f2f0e6';
  rr(ctx, 128, 330, 48, 62, 14);
  circle(ctx, 152, 308, 24);
  ctx.fillStyle = '#1d2b52';
  circle(ctx, 152, 308, 18);
  if (v.has('visor-stripe')) {
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(140, 318);
    ctx.lineTo(162, 300);
    ctx.stroke();
  }
  ctx.fillStyle = '#dfe6f2';
  rr(ctx, 118, 344, 12, 30, 5);
  rr(ctx, 182, 344, 12, 30, 5);
  ctx.fillStyle = '#c8cede';
  rr(ctx, 132, 392, 16, 34, 5);
  rr(ctx, 156, 392, 16, 34, 5);
  ctx.fillStyle = '#ff6b6b';
  rr(ctx, 146, 348, 12, 10, 2);
  // Rover: body and wheels, one of which may be gone.
  ctx.fillStyle = '#e8912d';
  rr(ctx, 300, 430, 120, 34, 8);
  ctx.fillStyle = '#c97a1e';
  rr(ctx, 330, 412, 56, 20, 6);
  ctx.fillStyle = '#222636';
  circle(ctx, 318, 470, 14);
  if (!v.has('wheel-gone')) circle(ctx, 352, 470, 14);
  circle(ctx, 392, 470, 14);
  ctx.fillStyle = '#9aa1b8';
  circle(ctx, 318, 470, 5);
  if (!v.has('wheel-gone')) circle(ctx, 352, 470, 5);
  circle(ctx, 392, 470, 5);
}

// ---------------------------------------------------------------------------
// Scene table: every level's painter and differences in one place.
// ---------------------------------------------------------------------------

export const SCENES = {
  park: { draw: drawPark, diffs: PARK_DIFFS },
  kitchen: { draw: drawKitchen, diffs: KITCHEN_DIFFS },
  moon: { draw: drawMoon, diffs: MOON_DIFFS },
};
