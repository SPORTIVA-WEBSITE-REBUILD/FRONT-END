import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * The icon fonts are subset to the glyphs the site uses, which is what takes
 * them from 420 KB to 3 KB. The failure mode is silent: adding `icon-tiktok`
 * to a component renders an invisible box rather than throwing. This test
 * fails the build instead.
 *
 * If it fails, regenerate the subsets — see README, "Icon fonts".
 */
const ROOT = path.resolve(__dirname, '../..');

function sourceText() {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.jsx?$/.test(entry.name) && !full.includes('/test/')) files.push(full);
    }
  };
  walk(path.join(ROOT, 'src'));
  return files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
}

function definedIn(cssFile, prefix) {
  const css = fs.readFileSync(path.join(ROOT, 'public/css', cssFile), 'utf8');
  return new Set([...css.matchAll(new RegExp(`\\.(${prefix}[a-z0-9-]+):before`, 'g'))].map((m) => m[1]));
}

function usedInSource(text, prefix, known) {
  // Only count names the ORIGINAL full font defined, so CSS utility classes
  // that merely start with "icon-" are not mistaken for glyphs.
  return [...new Set([...text.matchAll(new RegExp(`\\b${prefix}[a-z0-9-]+`, 'g'))].map((m) => m[0]))]
    .filter((name) => known.has(name));
}

describe('icon font subsets cover everything the site renders', () => {
  const text = sourceText();

  it('icomoon subset contains every icon-* glyph used', () => {
    const full = definedIn('icomoon.css', 'icon-');
    const subset = definedIn('icomoon-subset.css', 'icon-');
    const used = usedInSource(text, 'icon-', full);

    expect(used.length).toBeGreaterThan(0);
    const missing = used.filter((n) => !subset.has(n));
    expect(missing, `missing from the icomoon subset: ${missing.join(', ')}`).toEqual([]);
  });

  it('ionicons subset contains every ion-* glyph used', () => {
    const full = definedIn('ionicons.min.css', 'ion-');
    const subset = definedIn('ionicons-subset.css', 'ion-');
    const used = usedInSource(text, 'ion-', full);

    expect(used.length).toBeGreaterThan(0);
    const missing = used.filter((n) => !subset.has(n));
    expect(missing, `missing from the ionicons subset: ${missing.join(', ')}`).toEqual([]);
  });

  it('open-iconic subset still provides the mobile menu button', () => {
    const css = fs.readFileSync(path.join(ROOT, 'public/css/open-iconic-subset.css'), 'utf8');
    expect(css).toMatch(/\.oi-menu:before/);
    expect(fs.existsSync(path.join(ROOT, 'public/fonts/open-iconic/open-iconic-subset.woff2'))).toBe(true);
  });

  it('every stylesheet the page links actually exists', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const hrefs = [...html.matchAll(/href="(\/css\/[^"]+)"/g)].map((m) => m[1]);
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(
        fs.existsSync(path.join(ROOT, 'public', href)),
        `${href} is linked from index.html but does not exist`,
      ).toBe(true);
    }
  });

  it('offers only flaticon glyphs the font really contains', () => {
    // The dashboard lets an administrator pick a service icon; offering a name
    // the font lacks renders a blank square on the public site.
    const dash = fs.readFileSync(path.join(ROOT, '../dashboard/src/pages/ServiceEdit.jsx'), 'utf8');
    const offered = [...dash.matchAll(/'(flaticon-[a-z-]+)'/g)].map((m) => m[1]);
    const defined = definedIn('flaticon.css', 'flaticon-');

    expect(offered.length).toBeGreaterThan(0);
    const bogus = offered.filter((n) => !defined.has(n));
    expect(bogus, `the dashboard offers icons this font does not have: ${bogus.join(', ')}`).toEqual([]);
  });

  it('the subset font files exist and are far smaller than the originals', () => {
    const sub = fs.statSync(path.join(ROOT, 'public/fonts/icomoon/icomoon-subset.woff2')).size;
    const full = fs.statSync(path.join(ROOT, 'public/fonts/icomoon/icomoon.ttf')).size;
    expect(sub).toBeLessThan(full / 10);
  });

  it('the page links the subsets, not the full fonts', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    expect(html).toContain('icomoon-subset.css');
    expect(html).toContain('ionicons-subset.css');
    expect(html).not.toMatch(/href="\/css\/icomoon\.css"/);
    expect(html).not.toMatch(/href="\/css\/ionicons\.min\.css"/);
  });

  it('does not link stylesheets for libraries the React build never renders', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    for (const dead of ['owl.carousel', 'owl.theme', 'magnific-popup', 'aos.css']) {
      expect(html, `${dead} is still linked`).not.toContain(dead);
    }
  });
});
