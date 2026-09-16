import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

/**
 * Bootstrap is trimmed to the components this site renders (see
 * src/styles/bootstrap/_pcn-bootstrap.scss), and the failure mode is silent —
 * a component that starts using `.card` would simply render unstyled.
 *
 * The check is a REGRESSION check against the original template stylesheet:
 * a class that the original styled, and that our markup still uses, must still
 * be styled. Classes the template never styled (`js-fullheight`, `ftco_navbar`
 * and other script hooks) are not failures, because nothing was lost.
 */
const ROOT = path.resolve(__dirname, '../..');

function compiledCss() {
  const out = execFileSync(
    process.execPath,
    ['-e', "const sass=require('sass');process.stdout.write(sass.compile('src/styles/style.scss',{loadPaths:['src/styles'],style:'compressed'}).css)"],
    { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
  );
  return out + fs.readFileSync(path.join(ROOT, 'src/styles/app.css'), 'utf8');
}

function classNames(css) {
  return new Set([...css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]));
}

function classesUsedInMarkup() {
  const used = new Set();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { if (!full.includes('/test')) walk(full); continue; }
      if (!/\.jsx?$/.test(entry.name)) continue;
      const text = fs.readFileSync(full, 'utf8');
      for (const m of text.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\}|\{'([^']*)'\})/g)) {
        for (const group of [m[1], m[2], m[3]]) {
          if (!group) continue;
          for (const cls of group.split(/[\s${}?:()'"]+/)) {
            if (/^[a-zA-Z][\w-]*$/.test(cls)) used.add(cls);
          }
        }
      }
    }
  };
  walk(path.join(ROOT, 'src'));
  return used;
}

describe('the trimmed stylesheet does not lose anything the design had', () => {
  it('still styles every class the original template styled and we still use', () => {
    const original = classNames(fs.readFileSync(path.join(ROOT, 'legacy-template/css/style.css'), 'utf8'));
    const current = classNames(compiledCss());
    const used = classesUsedInMarkup();

    const lost = [...used].filter((c) => original.has(c) && !current.has(c)).sort();

    expect(
      lost,
      `Styled in the original template, used by our markup, missing now:\n  ${lost.join(', ')}\n`
      + 'Add the Bootstrap partial back to _pcn-bootstrap.scss or define it in app.css.',
    ).toEqual([]);
  });

  it('replaces the jQuery-driven full-height hero with CSS', () => {
    // main.js used to set .js-fullheight to window.height(); .hero-wrap is
    // height:100%, so without a replacement the home hero collapses.
    const css = compiledCss();
    expect(css).toContain('.js-fullheight');
    expect(css).toMatch(/\.js-fullheight\s*\{[^}]*height:\s*100vh/);
  });

  it('actually dropped the unused Bootstrap components', () => {
    const css = compiledCss();
    for (const gone of ['.carousel-inner', '.modal-dialog', '.popover-header', '.jumbotron', '.list-group-item']) {
      expect(css, `${gone} should no longer be compiled in`).not.toContain(gone);
    }
  });
});
