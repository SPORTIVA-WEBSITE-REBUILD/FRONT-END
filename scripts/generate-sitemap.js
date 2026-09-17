#!/usr/bin/env node
/**
 * Builds a FALLBACK sitemap.xml and robots.txt into dist/.
 *
 * In production, vercel.json rewrites /sitemap.xml and /robots.txt to the API,
 * which generates them live — so publishing an article updates the sitemap
 * without a redeploy. These files matter only if the site is served somewhere
 * those rewrites do not apply.
 *
 * Run after `vite build`, against a reachable API:
 *   VITE_API_URL=https://api.pcnsportivalp.com/api node scripts/generate-sitemap.js
 *
 * If the API cannot be reached the build is NOT failed: a missing sitemap is a
 * minor SEO loss, while a failed deploy takes the whole site down.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const API = process.env.VITE_API_URL || 'http://localhost:4000/api';
const SITE = (process.env.VITE_SITE_URL || 'https://pcnsportivalp.com').replace(/\/$/, '');
const OUT = path.resolve('dist');

// Static routes and how much they matter relative to one another.
const STATIC_ROUTES = [
  ['/', 1.0, 'weekly'],
  ['/services', 0.9, 'monthly'],
  ['/record', 0.9, 'weekly'],
  ['/insights', 0.9, 'weekly'],
  ['/lawyers', 0.7, 'monthly'],
  ['/careers', 0.6, 'weekly'],
  ['/about', 0.7, 'monthly'],
  ['/contact', 0.7, 'yearly'],
  ['/privacy-policy', 0.3, 'yearly'],
];

function urlEntry(loc, { lastmod, priority = 0.6, changefreq = 'monthly' } = {}) {
  return [
    '  <url>',
    `    <loc>${SITE}${loc}</loc>`,
    lastmod ? `    <lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n');
}

async function main() {
  const entries = STATIC_ROUTES.map(([loc, priority, changefreq]) => urlEntry(loc, { priority, changefreq }));

  try {
    const res = await fetch(`${API}/public/sitemap`, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`API responded ${res.status}`);
    const { data } = await res.json();

    const sections = [
      ['services', '/services', 0.7],
      ['cases', '/record', 0.8],
      ['articles', '/insights', 0.8],
      ['lawyers', '/lawyers', 0.6],
      ['vacancies', '/careers', 0.6],
    ];

    for (const [key, prefix, priority] of sections) {
      for (const item of data[key] || []) {
        entries.push(urlEntry(`${prefix}/${item.slug}`, { lastmod: item.updatedAt, priority }));
      }
    }

    console.log(`  sitemap: ${entries.length} URLs (${entries.length - STATIC_ROUTES.length} from the database)`);
  } catch (err) {
    console.warn(`  sitemap: could not reach the API (${err.message}) — writing static routes only`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;

  await fs.mkdir(OUT, { recursive: true });
  await fs.writeFile(path.join(OUT, 'sitemap.xml'), xml);
  await fs.writeFile(path.join(OUT, 'robots.txt'), robots);
  console.log('  wrote dist/sitemap.xml and dist/robots.txt');
}

main().catch((err) => {
  console.warn(`  sitemap generation skipped: ${err.message}`);
});
