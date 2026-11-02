/**
 * `npm run share-image` — generates the 1200x630 link-preview image for the
 * webinar from the live Webinar data, using Playwright to screenshot an
 * HTML template rather than hand-drawing it. Uses the already-installed
 * system Chrome (channel: 'chrome'), not Playwright's own bundled browser
 * download, since the latter needs an extra install step this project does
 * not otherwise require.
 *
 * Text only, no photos, by design — a cropped or mis-scaled headshot in a
 * 1200x630 crop reads worse than no photo at all, and this has to look
 * right on the first try since most shares never get a second rendering.
 *
 * Output: public/webinar-share.jpg, served at
 * <SITE_URL>/webinar-share.jpg once deployed, and used as the fallback for
 * Webinar.shareImageUrl until an administrator uploads a photographic one
 * through the admin.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const API = process.env.VITE_API_URL || 'https://pcnsportivalp-api.netlify.app/api';
const OUT = path.resolve(process.cwd(), 'public/webinar-share.jpg');

function escapeHtml(v = '') {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function dateChip(startsAt, endsAt, timezone = 'Africa/Lagos') {
  if (!startsAt) return '';
  const start = new Date(startsAt);
  const datePart = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: timezone,
  }).format(start).replace(',', '');
  const startTime = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone }).format(start);
  const end = endsAt ? new Date(endsAt) : null;
  const endTime = end ? new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone }).format(end) : '';
  return endTime ? `${datePart}, ${startTime} to ${endTime} WAT` : `${datePart}, ${startTime} WAT`;
}

function buildHtml(webinar) {
  const title = webinar?.title || 'Webinar';
  const chip = dateChip(webinar?.startsAt, webinar?.endsAt, webinar?.timezone);
  const speakerNames = (webinar?.speakers || [])
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((s) => s.name)
    .filter(Boolean);

  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family: 'SourceSerif'; src: local('Source Serif 4'), local('Georgia'); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    font-family: 'Open Sans', Arial, Helvetica, sans-serif;
    background: linear-gradient(135deg, #124b89 0%, #0b3464 100%);
    color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 64px 72px;
  }
  .mark { font-size: 20px; font-weight: 800; letter-spacing: 0.08em; color: #8ec9ff; }
  .title {
    font-family: 'SourceSerif', Georgia, serif;
    font-size: 48px;
    font-weight: 700;
    line-height: 1.25;
    max-width: 1020px;
    margin-top: 28px;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .chip {
    display: inline-block;
    margin-top: 28px;
    padding: 10px 22px;
    border-radius: 999px;
    background: rgba(255,255,255,0.14);
    border: 1px solid rgba(255,255,255,0.3);
    font-size: 21px;
    font-weight: 600;
  }
  .speakers { font-size: 22px; color: #cfe2f7; font-weight: 600; }
  .speakers span { color: #8ec9ff; font-weight: 800; letter-spacing: 0.05em; font-size: 14px; display: block; margin-bottom: 6px; text-transform: uppercase; }
</style></head>
<body>
  <div class="mark">PCNSLP — PCN SPORTIVA LP</div>
  <div>
    <div class="title">${escapeHtml(title)}</div>
    ${chip ? `<div class="chip">${escapeHtml(chip)}, Google Meet</div>` : ''}
  </div>
  ${speakerNames.length ? `<div class="speakers"><span>Speakers</span>${escapeHtml(speakerNames.join('  ·  '))}</div>` : '<div></div>'}
</body></html>`;
}

async function fetchWebinar() {
  try {
    const res = await fetch(`${API}/webinar`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const payload = await res.json();
    return payload.data;
  } catch (err) {
    console.warn('Could not fetch live webinar data, using placeholder text:', err.message);
    return {
      title: 'Promoting Clean Sport: Strengthening Anti-Doping and Integrity Across the Sports Ecosystem.',
      startsAt: '2026-11-06T15:00:00Z',
      endsAt: '2026-11-06T17:00:00Z',
      timezone: 'Africa/Lagos',
      speakers: [{ name: 'Caroline Mwanzia', order: 1 }, { name: 'Martina Spreitzer-Kropiunik', order: 2 }, { name: 'Khayran Noor', order: 3 }],
    };
  }
}

async function run() {
  const webinar = await fetchWebinar();
  const html = buildHtml(webinar);

  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: 'load' });
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await page.screenshot({ path: OUT, type: 'jpeg', quality: 92 });
  await browser.close();

  const buf = await fs.readFile(OUT);
  console.log(`Wrote ${OUT} — ${(buf.length / 1024).toFixed(1)} KB`);
  if (buf.length > 300 * 1024) {
    console.warn('WARNING: over the 300 KB limit the brief specifies.');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
