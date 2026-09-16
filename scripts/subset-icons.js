#!/usr/bin/env node
/**
 * Regenerates the icon-font subsets.
 *
 * The template shipped four full icon fonts — 410 KB for about a dozen glyphs.
 * These subsets carry the same artwork at ~10 KB. Run this after adding a new
 * icon to a component, or `npm test` will fail with the missing glyph named.
 *
 *   node scripts/subset-icons.js
 *
 * Requires Python with fontTools:  pip3 install fonttools brotli
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const FONTS = [
  {
    name: 'icomoon',
    css: 'public/css/icomoon.css',
    font: 'public/fonts/icomoon/icomoon.ttf',
    out: 'public/fonts/icomoon/icomoon-subset',
    prefix: 'icon-',
  },
  {
    name: 'ionicons',
    css: 'public/css/ionicons.min.css',
    font: 'public/fonts/ionicons/fonts/ionicons.ttf',
    out: 'public/fonts/ionicons/fonts/ionicons-subset',
    prefix: 'ion-',
  },
];

function sourceText() {
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { if (!full.includes('/test')) walk(full); continue; }
      if (/\.jsx?$/.test(e.name)) out.push(fs.readFileSync(full, 'utf8'));
    }
  };
  walk(path.join(ROOT, 'src'));
  return out.join('\n');
}

const text = sourceText();

for (const font of FONTS) {
  const css = fs.readFileSync(path.join(ROOT, font.css), 'utf8');
  const defs = new Map(
    [...css.matchAll(new RegExp(`\\.(${font.prefix}[a-z0-9-]+):before\\s*\\{\\s*content:\\s*["']\\\\([0-9a-fA-F]+)["']`, 'g'))]
      .map((m) => [m[1], m[2]]),
  );

  const used = [...new Set([...text.matchAll(new RegExp(`\\b${font.prefix}[a-z0-9-]+`, 'g'))].map((m) => m[0]))]
    .filter((n) => defs.has(n));

  const unicodes = used.map((n) => `U+${defs.get(n)}`).join(',');
  for (const flavor of ['woff2', 'woff']) {
    execFileSync('python3', [
      '-m', 'fontTools.subset', path.join(ROOT, font.font),
      `--unicodes=${unicodes}`, `--flavor=${flavor}`,
      `--output-file=${path.join(ROOT, `${font.out}.${flavor}`)}`,
      '--layout-features=', '--no-hinting', '--desubroutinize',
    ]);
  }

  const before = fs.statSync(path.join(ROOT, font.font)).size;
  const after = fs.statSync(path.join(ROOT, `${font.out}.woff2`)).size;
  console.log(`  ${font.name}: ${used.length} glyph(s), ${before} -> ${after} bytes`);
  console.log(`    ${used.join(', ')}`);
}

console.log('\n  Now update the matching *-subset.css if glyphs were added.');
