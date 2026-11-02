import { describe, it, expect } from 'vitest';
import {
  isCrawler, isSocialCrawler, isSearchCrawler, isKnownRoute, resolveRoute,
  extractMeta, extractWebinarMeta, renderPreview,
} from '../../lib/prerender.js';

describe('crawler detection', () => {
  it('recognises the crawlers that actually build link previews', () => {
    for (const ua of [
      'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      'WhatsApp/2.23.20.0',
      'Twitterbot/1.0',
      'LinkedInBot/1.0 (compatible; Mozilla/5.0)',
      'Slackbot-LinkExpanding 1.0',
      'TelegramBot (like TwitterBot)',
      'Mozilla/5.0 (compatible; Discordbot/2.0)',
    ]) {
      expect(isCrawler(ua), ua).toBe(true);
    }
  });

  it('leaves real browsers alone', () => {
    for (const ua of [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      '',
    ]) {
      expect(isCrawler(ua), ua || '(empty)').toBe(false);
    }
  });
});

describe('search engines are handled differently from link-preview bots', () => {
  // Serving Googlebot the prerendered stub would mean a title, a description
  // and a link get indexed instead of the real page and its structured data.
  it('does not treat search engines as preview crawlers', () => {
    for (const ua of [
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
      'Mozilla/5.0 (compatible; YandexBot/3.0)',
      'Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17 Safari/605 Applebot/0.1',
    ]) {
      expect(isSearchCrawler(ua), ua).toBe(true);
      expect(isSocialCrawler(ua), ua).toBe(false);
    }
  });

  it('treats link-preview bots as preview crawlers', () => {
    for (const ua of ['facebookexternalhit/1.1', 'WhatsApp/2.23', 'LinkedInBot/1.0', 'Twitterbot/1.0']) {
      expect(isSocialCrawler(ua), ua).toBe(true);
      expect(isSearchCrawler(ua), ua).toBe(false);
    }
  });

  it('still recognises both as crawlers for 404 handling', () => {
    expect(isCrawler('Googlebot/2.1')).toBe(true);
    expect(isCrawler('WhatsApp/2.23')).toBe(true);
    expect(isCrawler('Mozilla/5.0 Chrome/120 Safari/537.36')).toBe(false);
  });
});

describe('route resolution', () => {
  it('maps detail routes to their API endpoint', () => {
    expect(resolveRoute('/articles/a-note-on-eligibility'))
      .toEqual({ endpoint: '/public/articles/a-note-on-eligibility', ogType: 'article' });
    expect(resolveRoute('/record/club-licensing-appeal'))
      .toEqual({ endpoint: '/public/cases/club-licensing-appeal', ogType: 'article' });
    expect(resolveRoute('/lawyers/agu-richard'))
      .toEqual({ endpoint: '/public/lawyers/agu-richard', ogType: 'profile' });
  });

  it('maps the fixed pages', () => {
    expect(resolveRoute('/').endpoint).toBe('/public/pages/home');
    expect(resolveRoute('/record').endpoint).toBe('/public/pages/record');
    expect(resolveRoute('/articles').endpoint).toBe('/public/pages/insights');
    expect(resolveRoute('/lawyers').endpoint).toBe('/public/pages/lawyers');
  });

  it('tolerates a trailing slash', () => {
    expect(resolveRoute('/record/').endpoint).toBe('/public/pages/record');
  });

  it('returns nothing for an unknown route so the SPA handles it', () => {
    expect(resolveRoute('/nonsense')).toBeNull();
    expect(resolveRoute('/a/b/c')).toBeNull();
  });

  it('maps the About page', () => {
    expect(resolveRoute('/about').endpoint).toBe('/public/pages/about');
  });
});

/**
 * Every path src/App.jsx actually routes, kept as a literal list rather than
 * imported from App.jsx (whose routes live inside JSX, not a plain array) —
 * this is what catches a route added to the app but never taught to
 * isKnownRoute, which /lawyers, /about and /gallery all were at one point,
 * each serving crawlers a false 404 until this test would have caught it.
 */
describe('every app route is a known route', () => {
  it.each([
    '/', '/about', '/services', '/record', '/articles', '/careers', '/contact',
    '/privacy-policy', '/lawyers', '/gallery', '/webinar',
  ])('%s', (path) => {
    expect(isKnownRoute(path)).toBe(true);
  });
});

describe('meta extraction', () => {
  it('prefers explicit SEO fields over the content itself', () => {
    const meta = extractMeta({
      title: 'The real title',
      excerpt: 'The real excerpt',
      seo: { metaTitle: 'SEO title', metaDescription: 'SEO description' },
    }, 'Site');
    expect(meta.title).toBe('SEO title');
    expect(meta.description).toBe('SEO description');
  });

  it('falls back through the content types', () => {
    expect(extractMeta({ name: 'Agu Richard', role: 'Managing Partner' }, 'Site').title).toBe('Agu Richard');
    expect(extractMeta({ title: 'A case', summary: 'What happened' }, 'Site').description).toBe('What happened');
  });

  it('sizes the preview image for social cards', () => {
    const { imageUrl } = extractMeta({
      featuredImage: { secureUrl: 'https://res.cloudinary.com/pkesmajk/image/upload/v1/x.jpg' },
    }, 'Site');
    expect(imageUrl).toContain('w_1200,h_630');
    expect(imageUrl).toContain('f_auto');
  });
});

describe('preview document', () => {
  const base = { siteName: 'PCN Sportiva LP', url: 'https://pcnsportivalp.com/articles/x', ogType: 'article' };

  it('emits the tags each platform actually reads', () => {
    const html = renderPreview({
      title: 'A note on eligibility',
      description: 'What the new rules mean.',
      imageUrl: 'https://res.cloudinary.com/pkesmajk/image/upload/w_1200,h_630/x.jpg',
      publishedAt: '2026-03-01T00:00:00Z',
    }, base);

    expect(html).toContain('<meta property="og:title" content="A note on eligibility | PCN Sportiva LP">');
    expect(html).toContain('<meta property="og:description"');
    expect(html).toContain('<meta property="og:image"');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
    expect(html).toContain('<link rel="canonical" href="https://pcnsportivalp.com/articles/x">');
    expect(html).toContain('article:published_time');
  });

  it('downgrades the card when there is no image', () => {
    const html = renderPreview({ title: 'No image here' }, base);
    expect(html).toContain('<meta name="twitter:card" content="summary">');
    expect(html).not.toContain('og:image');
  });

  it('escapes content so a quote in a title cannot break out of an attribute', () => {
    const html = renderPreview({
      title: 'The "quoted" <script>alert(1)</script> case',
      description: 'A & B',
    }, base);

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&quot;quoted&quot;');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('A &amp; B');
  });

  it('honours noIndex', () => {
    expect(renderPreview({ title: 'Hidden', noIndex: true }, base))
      .toContain('<meta name="robots" content="noindex,nofollow">');
  });

  it('does not repeat the site name when the title is the site name', () => {
    const html = renderPreview({ title: 'PCN Sportiva LP' }, base);
    expect(html).toContain('<title>PCN Sportiva LP</title>');
  });

  it('emits og:image:alt when one is given, and omits it when not', () => {
    const withAlt = renderPreview({ title: 'T', imageUrl: 'https://x/i.jpg', imageAlt: 'A description' }, base);
    expect(withAlt).toContain('<meta property="og:image:alt" content="A description">');
    const withoutAlt = renderPreview({ title: 'T', imageUrl: 'https://x/i.jpg' }, base);
    expect(withoutAlt).not.toContain('og:image:alt');
  });
});

const WEBINAR = {
  title: 'Promoting Clean Sport: Strengthening Anti-Doping and Integrity Across the Sports Ecosystem.',
  startsAt: '2026-11-06T15:00:00Z',
  endsAt: '2026-11-06T17:00:00Z',
  timezone: 'Africa/Lagos',
  speakers: [
    { name: 'Caroline Mwanzia', order: 1 },
    { name: 'Martina Spreitzer-Kropiunik', order: 2 },
    { name: 'Khayran Noor', order: 3 },
  ],
  hasEnded: false,
};
const SITE_URL = 'https://pcnsportivalp.com';

describe('webinar meta extraction', () => {
  it('builds a <title> under 60 characters from the clause before the colon', () => {
    const meta = extractWebinarMeta(WEBINAR, 'PCN Sportiva LP', SITE_URL);
    expect(meta.title).toBe('Promoting Clean Sport');
    const html = renderPreview(meta, { siteName: 'PCN Sportiva LP', url: `${SITE_URL}/webinar`, ogType: 'website' });
    const titleTag = html.match(/<title>([^<]*)<\/title>/)[1];
    expect(titleTag.length).toBeLessThan(60);
  });

  it('builds a description under 155 characters with the date/time (WAT) and the speakers', () => {
    const meta = extractWebinarMeta(WEBINAR, 'PCN Sportiva LP', SITE_URL);
    expect(meta.description.length).toBeLessThanOrEqual(155);
    expect(meta.description).toContain('WAT');
    expect(meta.description).toContain('Caroline Mwanzia');
  });

  it('includes the topic/subtitle in the description when one is set', () => {
    const meta = extractWebinarMeta({ ...WEBINAR, subtitle: 'A live discussion' }, 'PCN Sportiva LP', SITE_URL);
    expect(meta.description.startsWith('A live discussion')).toBe(true);
  });

  it('falls back to the generated share image when none is set on the Webinar document', () => {
    const meta = extractWebinarMeta(WEBINAR, 'PCN Sportiva LP', SITE_URL);
    expect(meta.imageUrl).toBe(`${SITE_URL}/webinar-share.jpg`);
  });

  it('uses the administrator-uploaded share image when one is set', () => {
    const meta = extractWebinarMeta({ ...WEBINAR, shareImageUrl: 'https://res.cloudinary.com/x/share.jpg' }, 'PCN Sportiva LP', SITE_URL);
    expect(meta.imageUrl).toBe('https://res.cloudinary.com/x/share.jpg');
  });

  it('declares exactly 1200x630', () => {
    const meta = extractWebinarMeta(WEBINAR, 'PCN Sportiva LP', SITE_URL);
    expect(meta.imageWidth).toBe(1200);
    expect(meta.imageHeight).toBe(630);
  });

  it('marks a past event noIndex', () => {
    expect(extractWebinarMeta({ ...WEBINAR, hasEnded: false }, 'PCN', SITE_URL).noIndex).toBe(false);
    expect(extractWebinarMeta({ ...WEBINAR, hasEnded: true }, 'PCN', SITE_URL).noIndex).toBe(true);
  });
});

describe('the full webinar crawler response', () => {
  const meta = extractWebinarMeta(WEBINAR, 'PCN Sportiva LP', SITE_URL);
  const html = renderPreview(meta, { siteName: 'PCN Sportiva LP', url: `${SITE_URL}/webinar`, ogType: 'website' });

  it('contains every required tag, each with an absolute https URL where a URL is expected', () => {
    const required = [
      '<title>', 'name="description"', 'property="og:title"', 'property="og:description"',
      'property="og:type" content="website"', 'property="og:url"', 'property="og:site_name"',
      'property="og:image"', 'property="og:image:width" content="1200"',
      'property="og:image:height" content="630"', 'property="og:image:alt"',
      'name="twitter:card" content="summary_large_image"', 'name="twitter:title"',
      'name="twitter:description"', 'name="twitter:image"',
    ];
    for (const tag of required) expect(html).toContain(tag);

    const urlAttrs = [...html.matchAll(/(?:content|href)="(https?:\/\/[^"]*)"/g)].map((m) => m[1]);
    expect(urlAttrs.length).toBeGreaterThan(0);
    for (const url of urlAttrs) expect(url.startsWith('https://pcnsportivalp.com')).toBe(true);
  });

  it('never includes a Google Meet link anywhere in the response', () => {
    expect(html).not.toContain('meet.google.com');
  });
});

describe('a normal browser user agent never receives the crawler HTML (gate the edge function checks)', () => {
  const REAL_BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';

  it('is not classified as any kind of crawler', () => {
    expect(isCrawler(REAL_BROWSER_UA)).toBe(false);
    expect(isSocialCrawler(REAL_BROWSER_UA)).toBe(false);
    expect(isSearchCrawler(REAL_BROWSER_UA)).toBe(false);
  });
});
