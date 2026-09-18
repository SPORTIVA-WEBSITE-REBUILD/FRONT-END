/* One-off verification of the hero's three light layers against real pixels. */
const fs = require('fs');
const jpeg = require('jpeg-js');

const img = jpeg.decode(fs.readFileSync('./_map.jpg'), { useTArray: true });
const { width: W, height: H, data } = img;
const px = (x, y) => { const i = ((y * W) + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };

const ch = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const L = ([r, g, b]) => 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
const C = (a, b) => { const [h, l] = [L(a), L(b)].sort((x, y) => y - x); return (h + 0.05) / (l + 0.05); };

const lerp = (a, b, t) => a + (b - a) * t;

/** Piecewise-linear gradient from [pos, alpha] stops. */
const ramp = (stops) => (t) => {
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [p0, a0] = stops[i - 1]; const [p1, a1] = stops[i];
      return lerp(a0, a1, (t - p0) / (p1 - p0));
    }
  }
  return stops[stops.length - 1][1];
};

function lightAlpha(u, v, [rx, ry, cx, cy]) {
  const d = Math.hypot((u - cx) / rx, (v - cy) / ry);
  if (d >= 0.72) return 0;
  if (d <= 0.40) return lerp(0.14, 0.06, d / 0.40);
  return lerp(0.06, 0, (d - 0.40) / (0.72 - 0.40));
}
const horizon = ramp([[0, 0.05], [0.30, 0], [0.72, 0], [1, 0.03]]);

const white = (c, a) => c.map((v) => a * 255 + (1 - a) * v);
const black = (c, a) => c.map((v) => (1 - a) * v);

/* The candidate numbers. Structure unchanged; only the stop values move. */
const DESKTOP = {
  light: [0.64, 0.48, 0.74, 0.16],
  scrim: ramp([[0, 0.72], [0.52, 0.55], [0.64, 0.26], [0.78, 0], [1, 0]]),
};
// Applies below 768px, where col-md-6 stops being half width and the copy
// runs the full frame — so the scrim has to carry all the way across.
const PHONE = {
  light: [0.60, 0.40, 0.82, 0.13],
  scrim: ramp([[0, 0.74], [0.50, 0.58], [1, 0.52]]),
};

function composite(c, u, v, cfg) {
  let out = white(c, lightAlpha(u, v, cfg.light));
  out = white(out, horizon(v));
  return black(out, cfg.scrim(u));
}

function visibleBand(heroW, heroH) {
  const scale = Math.max(heroW / W, heroH / H);
  const shownH = heroH / scale;
  const y0 = Math.round((H - shownH) / 2);
  return [y0, Math.round(y0 + shownH) - 1];
}

console.log(`source image ${W}x${H}\n--- check 1: white copy must hit 4.5:1 ---`);
let allPass = true;
for (const [label, heroW, heroH, u0, u1, cfg] of [
  // At >=768px Bootstrap's col-md-6 halves the copy column; below that it is
  // full width, which is where the PHONE numbers take over.
  ['desktop 1920', 1888, 760, 0.198, 0.500, DESKTOP],
  ['laptop 1280', 1248, 760, 0.160, 0.500, DESKTOP],
  ['tablet 768', 736, 560, 0.050, 0.500, DESKTOP],
  ['tablet 700', 684, 560, 0.040, 0.960, PHONE],
  ['phone 390', 374, 460, 0.040, 0.960, PHONE],
]) {
  const [ya, yb] = visibleBand(heroW, heroH);
  let worst = Infinity; let at = null;
  for (let v = 0.16; v <= 0.84; v += 0.005) {
    for (let u = u0; u <= u1; u += 0.002) {
      const sx = Math.min(W - 1, Math.round(u * W));
      const sy = Math.min(H - 1, Math.round(ya + v * (yb - ya)));
      const r = C([255, 255, 255], composite(px(sx, sy), u, v, cfg));
      if (r < worst) { worst = r; at = [u, v]; }
    }
  }
  const pass = worst >= 4.5;
  if (!pass) allPass = false;
  console.log(`  ${label.padEnd(14)} worst ${worst.toFixed(2)}:1  at u=${at[0].toFixed(3)} v=${at[1].toFixed(2)}  ${pass ? 'PASS' : 'FAIL'}`);
}

/* --- check 2: the highlight must not wash out the rings --- */
let ring = null; let best = -1;
for (let y = Math.round(0.44 * H); y < Math.round(0.60 * H); y++) {
  for (let x = Math.round(0.55 * W); x < Math.round(0.68 * W); x++) {
    const l = L(px(x, y));
    if (l > best) { best = l; ring = [x, y]; }
  }
}
const [rx, ry] = ring;
const ru = rx / W; const rv = ry / H;
const ringPx = px(rx, ry);
const land = px(Math.min(W - 1, rx + 90), ry);
const a = lightAlpha(ru, rv, DESKTOP.light);
const bare = C(ringPx, land);
// The requirement is that the *highlight* does not wash the rings out, so the
// highlight is measured on its own. The scrim darkens both ring and land and
// is doing its intended job; it is reported separately, not as a failure.
const lit = C(white(ringPx, a), white(land, a));
const full = C(composite(ringPx, ru, rv, DESKTOP), composite(land, ru, rv, DESKTOP));
console.log(`\n--- check 2: the highlight must not wash out the rings ---`);
console.log(`  rings at u=${ru.toFixed(3)} v=${rv.toFixed(3)}; highlight there = ${(a * 100).toFixed(1)}% white`);
console.log(`  ring vs land, artwork alone     : ${bare.toFixed(2)}:1`);
console.log(`  ring vs land, + highlight only  : ${lit.toFixed(2)}:1  ${lit >= bare * 0.9 ? 'PASS (highlight costs <10%)' : 'FAIL'}`);
console.log(`  ring vs land, + full stack      : ${full.toFixed(2)}:1  (scrim included, informational)`);
if (lit < bare * 0.9) allPass = false;

/* --- check 3: at 390px the highlight stays upper right --- */
console.log(`\n--- check 3: highlight position at 390px ---`);
const upper = lightAlpha(0.82, 0.14, PHONE.light);
const behind = lightAlpha(0.45, 0.55, PHONE.light);
console.log(`  upper right (u=.82 v=.14): ${(upper * 100).toFixed(1)}% white`);
console.log(`  behind copy (u=.45 v=.55): ${(behind * 100).toFixed(1)}% white`);
const ok = upper > behind * 4;
if (!ok) allPass = false;
console.log(`  ${ok ? 'PASS (highlight sits upper right, not behind the copy)' : 'FAIL'}`);

console.log(`\n${allPass ? 'ALL CHECKS PASS' : 'SOME CHECKS FAIL'}`);
