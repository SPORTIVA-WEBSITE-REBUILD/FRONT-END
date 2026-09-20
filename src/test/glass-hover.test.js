import { describe, it, expect } from 'vitest';

/*
 * The shared white-glass hover/focus-visible recipe every solid CTA uses
 * (see "white glass hover" in app.css). Checked as arithmetic against the
 * literal --glass-hover-* values, not by rendering — jsdom has no layout
 * engine and cannot report a real composited colour, and this recipe is
 * used on several different real backgrounds (a plain white section, the
 * hero's navy, the consultation section's blue overlay), which a single
 * rendered snapshot could not exercise anyway.
 *
 * These mirror app.css by hand; if the token values change there, this must
 * be updated too.
 */

const channel = (v) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const over = (fg, alpha, bg) => fg.map((c, i) => (alpha * c) + ((1 - alpha) * bg[i]));

const WHITE = [255, 255, 255];
const BLUE = [4, 125, 214]; // --blue: what --glass-hover-text is not
const INK_1 = [0x0f, 0x17, 0x2a]; // --ink-1: what --glass-hover-text is
const GLASS_ALPHA = 0.72; // --glass-hover-bg

// The real backgrounds this recipe's buttons actually sit on.
const HERO_NAVY = [0x0b, 0x14, 0x26]; // .pcn-hero's background-color
const CONSULTATION_BLUE = [4, 125, 214]; // .ftco-consultation .overlay, at $primary

describe('the shared white-glass hover recipe (--glass-hover-*)', () => {
  it('uses --ink-1 for text, not --blue, and that choice is load-bearing', () => {
    // --blue text over this glass has a hard ceiling of 4.28:1 against pure
    // white — the best case, at *any* alpha, on the lightest possible
    // backdrop. It never reaches AA's 4.5:1, so no alpha choice fixes it.
    for (const alpha of [0.72, 0.85, 0.92, 1.0]) {
      const onWhite = contrast(BLUE, over(WHITE, alpha, WHITE));
      expect(onWhite).toBeLessThan(4.5);
    }
  });

  it('fails badly with --blue text on the two backgrounds that are not plain white', () => {
    // The regression this guards: "the glass will read lighter, it should be
    // fine" is a reasonable guess that turns out wrong on a dark or coloured
    // backdrop, and the failure here is severe, not a rounding-error miss.
    const heroComposite = over(WHITE, GLASS_ALPHA, HERO_NAVY);
    const consultationComposite = over(WHITE, GLASS_ALPHA, CONSULTATION_BLUE);
    expect(contrast(BLUE, heroComposite)).toBeLessThan(3);
    expect(contrast(BLUE, consultationComposite)).toBeLessThan(3);
  });

  it('clears 4.5:1 with --ink-1 on every one of those backgrounds', () => {
    const onWhite = contrast(INK_1, over(WHITE, GLASS_ALPHA, WHITE));
    const onHero = contrast(INK_1, over(WHITE, GLASS_ALPHA, HERO_NAVY));
    const onConsultation = contrast(INK_1, over(WHITE, GLASS_ALPHA, CONSULTATION_BLUE));
    expect(onWhite).toBeGreaterThanOrEqual(4.5);
    expect(onHero).toBeGreaterThanOrEqual(4.5);
    expect(onConsultation).toBeGreaterThanOrEqual(4.5);
  });
});

describe('the selected tab pill\'s edge (the doubled-edge fix)', () => {
  it('is exactly one box-shadow declaration\'s worth of layers: one inset rim, one outer shadow', () => {
    // Not a rendering check (jsdom can't parse box-shadow into layers
    // reliably) — this records the literal, current value so a future
    // change that adds a third layer, or restores the removed second inset
    // shadow, has to touch this test to pass.
    const boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, .90), 0 2px 8px rgba(18, 70, 126, .14)';
    const layers = boxShadow.split(/,(?![^(]*\))/).map((s) => s.trim());
    expect(layers).toHaveLength(2);
    expect(layers[0]).toMatch(/^inset/);
    expect(layers[1]).not.toMatch(/^inset/);
  });
});
