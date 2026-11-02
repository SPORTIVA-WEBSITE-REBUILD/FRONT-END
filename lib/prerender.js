/**
 * Social crawlers do not run JavaScript, so a client-rendered SPA gives them an
 * empty shell and shared links show no preview card. Schedule 1 item 7 of the
 * agreement requires link preview metadata, so requests from known crawlers are
 * answered with a small server-rendered document carrying the real tags.
 *
 * Human visitors are never touched by this: they get the normal SPA.
 */

/**
 * Link-preview crawlers. These do NOT execute JavaScript, so a client-rendered
 * page gives them an empty shell and shared links show no card. They get the
 * prerendered head.
 *
 * Deliberately narrow: serving the stub to a real browser would be far worse
 * than a missing preview.
 */
const SOCIAL_CRAWLERS = [
  'facebookexternalhit', 'facebookcatalog', 'whatsapp', 'twitterbot',
  'linkedinbot', 'slackbot', 'slack-imgproxy', 'discordbot', 'telegrambot',
  'pinterest', 'redditbot', 'skypeuripreview', 'embedly', 'quora link preview',
  'nuzzel', 'vkshare', 'bitlybot', 'mastodon', 'bluesky',
];

/**
 * Search engines, which DO execute JavaScript and index the rendered result.
 *
 * They are deliberately NOT served the prerendered stub: that page carries only
 * a title, a description and a link, so serving it to Google would mean the
 * thin version gets indexed instead of the real content and its structured
 * data. They are still identified, because a URL that maps to nothing should
 * answer them with a genuine 404 rather than a soft 200.
 */
const SEARCH_CRAWLERS = [
  'googlebot', 'bingbot', 'applebot', 'yandex', 'duckduckbot',
  'baiduspider', 'sogou', 'slurp',
];

export function isSocialCrawler(userAgent = '') {
  const ua = userAgent.toLowerCase();
  return SOCIAL_CRAWLERS.some((bot) => ua.includes(bot));
}

export function isSearchCrawler(userAgent = '') {
  const ua = userAgent.toLowerCase();
  return SEARCH_CRAWLERS.some((bot) => ua.includes(bot));
}

export function isCrawler(userAgent = '') {
  return isSocialCrawler(userAgent) || isSearchCrawler(userAgent);
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** The head served when a URL does not correspond to any content. */
export function renderNotFound({ siteName, url }) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Page not found | ${escapeHtml(siteName)}</title>
    <meta name="robots" content="noindex, nofollow">
    <link rel="canonical" href="${escapeHtml(url)}">
  </head>
  <body>
    <h1>Page not found</h1>
    <p>This page does not exist. <a href="${escapeHtml(url.replace(/\/.*$/, '') || '/')}">Return to the site</a>.</p>
  </body>
</html>`;
}

/** Every path the app actually serves, so anything else is a genuine 404. */
export const STATIC_ROUTES = new Set([
  '/', '/about', '/services', '/record', '/articles', '/careers', '/contact',
  '/privacy-policy', '/lawyers', '/gallery', '/webinar',
]);

const DETAIL_PREFIXES = ['/articles/', '/record/', '/services/', '/lawyers/', '/careers/'];

/**
 * Distinguishes "a real page" from "a URL nobody should have". A single-page
 * app answers every path with 200, which search engines treat as a soft 404 —
 * junk URLs get crawled and can be indexed.
 */
export function isKnownRoute(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (STATIC_ROUTES.has(clean)) return true;
  return DETAIL_PREFIXES.some((prefix) => clean.startsWith(prefix) && clean.slice(prefix.length).length > 0);
}

/** Which API call, if any, describes the content at this path. */
export function resolveRoute(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const detail = [
    [/^\/articles\/([^/]+)$/, 'articles', 'article'],
    [/^\/record\/([^/]+)$/, 'cases', 'article'],
    [/^\/services\/([^/]+)$/, 'services', 'website'],
    [/^\/lawyers\/([^/]+)$/, 'lawyers', 'profile'],
    [/^\/careers\/([^/]+)$/, 'vacancies', 'website'],
  ];

  for (const [pattern, resource, ogType] of detail) {
    const match = clean.match(pattern);
    if (match) return { endpoint: `/public/${resource}/${decodeURIComponent(match[1])}`, ogType };
  }

  const pages = {
    '/': 'home',
    '/about': 'about',
    '/services': 'services',
    '/contact': 'contact',
    '/privacy-policy': 'privacy-policy',
    '/record': 'record',
    '/articles': 'insights',
    '/lawyers': 'lawyers',
    '/careers': 'careers',
  };

  if (pages[clean]) return { endpoint: `/public/pages/${pages[clean]}`, ogType: 'website' };
  return null;
}

/**
 * Pulls preview fields out of whichever content type came back.
 * `fallbackImage` is the site-wide default (Settings > SEO), used only when
 * the page itself has none — otherwise most pages show no image at all in a
 * shared link. Mirrors the same fallback Seo.jsx applies client-side.
 */
export function extractMeta(doc = {}, fallbackTitle, fallbackImage) {
  const seo = doc.seo || {};
  const title = seo.metaTitle || doc.title || doc.name || fallbackTitle;
  const description = seo.metaDescription
    || doc.excerpt
    || doc.summary
    || doc.role
    || '';

  const image = seo.ogImage || doc.featuredImage || doc.image || doc.photo || fallbackImage;
  const imageUrl = image?.secureUrl
    ? image.secureUrl.replace('/upload/', '/upload/f_auto,q_auto,c_fill,w_1200,h_630/')
    : null;

  return { title, description, imageUrl, publishedAt: doc.publishedAt, noIndex: seo.noIndex };
}

/** "Fri 6 Nov 2026, 16:00 to 18:00 WAT" — matches FRONT-END/src/lib/format.js's
 *  webinarDateChip() exactly (including stripping Intl's weekday comma), but
 *  duplicated rather than imported: this module has no dependencies today
 *  and runs in both Node (tests) and the Deno edge runtime, and keeping it
 *  that way avoids depending on a React-app-shaped source tree from either. */
function webinarDateChipText(startsAt, endsAt, timezone = 'Africa/Lagos') {
  if (!startsAt) return '';
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) return '';
  const datePart = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: timezone,
  }).format(start).replace(',', '');
  const startTime = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone }).format(start);
  const end = endsAt ? new Date(endsAt) : null;
  const endTime = end && !Number.isNaN(end.getTime())
    ? new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone }).format(end)
    : '';
  const zoneAbbr = timezone === 'Africa/Lagos' ? 'WAT' : timezone;
  return endTime ? `${datePart}, ${startTime} to ${endTime} ${zoneAbbr}` : `${datePart}, ${startTime} ${zoneAbbr}`;
}

/**
 * Meta for the webinar: a different shape from extractMeta() above (no
 * `.seo`, and bannerUrl/shareImageUrl are plain URLs already, not
 * Cloudinary Media refs needing a transform). Description is built fresh
 * — topic, date/time with the zone, speakers — capped under the 155
 * characters the brief specifies for a meta description; the Webinar's own
 * `description` field is the long "about" copy, not sized for this.
 */
export function extractWebinarMeta(webinar, siteName, siteUrl) {
  const chip = webinarDateChipText(webinar.startsAt, webinar.endsAt, webinar.timezone);
  const speakerNames = (webinar.speakers || [])
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((s) => s.name).filter(Boolean);

  // "topic, the date and time with WAT, and the speakers" — topic comes from
  // `subtitle`, a short standalone restatement, when one is set; the full
  // title already covers that role in og:title/<title> and would consume
  // most of the 155-character budget on its own if repeated here too.
  let description = [webinar.subtitle, chip, speakerNames.length ? `with ${speakerNames.join(', ')}` : null]
    .filter(Boolean).join('. ');
  if (description.length > 155) description = `${description.slice(0, 152)}...`;

  const imageUrl = webinar.shareImageUrl || `${siteUrl}/webinar-share.jpg`;

  // <title> must stay under 60 characters (brief's own example:
  // "Promoting Clean Sport | PCN Sportiva LP"); the real title here is 94
  // characters on its own, before " | PCN Sportiva LP" is even appended by
  // renderPreview(). Using the clause before the first colon — which for
  // the real confirmed title already reads "Promoting Clean Sport", an
  // exact match for the brief's own example — rather than truncating
  // mid-word at an arbitrary character count.
  const shortTitle = (webinar.title || '').split(':')[0].trim() || webinar.title;

  return {
    title: shortTitle,
    description,
    imageUrl,
    imageWidth: 1200,
    imageHeight: 630,
    imageAlt: `${webinar.title} — ${chip}`,
    noIndex: webinar.hasEnded, // past event: a thin "it's over" page need not rank
  };
}

export function renderPreview(
  { title, description, imageUrl, imageWidth = 1200, imageHeight = 630, imageAlt, publishedAt, noIndex },
  { siteName, url, ogType },
) {
  const fullTitle = title && title !== siteName ? `${title} | ${siteName}` : siteName;

  const tags = [
    `<title>${escapeHtml(fullTitle)}</title>`,
    description && `<meta name="description" content="${escapeHtml(description)}">`,
    `<link rel="canonical" href="${escapeHtml(url)}">`,
    noIndex && '<meta name="robots" content="noindex,nofollow">',

    `<meta property="og:site_name" content="${escapeHtml(siteName)}">`,
    `<meta property="og:type" content="${escapeHtml(ogType)}">`,
    `<meta property="og:title" content="${escapeHtml(fullTitle)}">`,
    description && `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${escapeHtml(url)}">`,
    imageUrl && `<meta property="og:image" content="${escapeHtml(imageUrl)}">`,
    imageUrl && `<meta property="og:image:width" content="${imageWidth}">`,
    imageUrl && `<meta property="og:image:height" content="${imageHeight}">`,
    imageUrl && imageAlt && `<meta property="og:image:alt" content="${escapeHtml(imageAlt)}">`,

    `<meta name="twitter:card" content="${imageUrl ? 'summary_large_image' : 'summary'}">`,
    `<meta name="twitter:title" content="${escapeHtml(fullTitle)}">`,
    description && `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    imageUrl && `<meta name="twitter:image" content="${escapeHtml(imageUrl)}">`,

    publishedAt && `<meta property="article:published_time" content="${new Date(publishedAt).toISOString()}">`,
  ].filter(Boolean).join('\n    ');

  // A crawler reads the head and stops, but a person who somehow lands here
  // still gets the content and a way through to the real page.
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${tags}
  </head>
  <body>
    <h1>${escapeHtml(title || siteName)}</h1>
    ${description ? `<p>${escapeHtml(description)}</p>` : ''}
    <p><a href="${escapeHtml(url)}">Continue to ${escapeHtml(siteName)}</a></p>
  </body>
</html>`;
}
