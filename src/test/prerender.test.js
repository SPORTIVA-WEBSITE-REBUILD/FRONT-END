import { describe, it, expect } from 'vitest';
import {
  isCrawler, isSocialCrawler, isSearchCrawler, resolveRoute, extractMeta, renderPreview,
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
    expect(resolveRoute('/insights/a-note-on-eligibility'))
      .toEqual({ endpoint: '/public/articles/a-note-on-eligibility', ogType: 'article' });
    expect(resolveRoute('/record/club-licensing-appeal'))
      .toEqual({ endpoint: '/public/cases/club-licensing-appeal', ogType: 'article' });
    expect(resolveRoute('/lawyers/agu-richard'))
      .toEqual({ endpoint: '/public/lawyers/agu-richard', ogType: 'profile' });
  });

  it('maps the fixed pages', () => {
    expect(resolveRoute('/').endpoint).toBe('/public/pages/home');
    expect(resolveRoute('/about').endpoint).toBe('/public/pages/about');
    expect(resolveRoute('/record').endpoint).toBe('/public/pages/record-insights');
  });

  it('tolerates a trailing slash', () => {
    expect(resolveRoute('/about/').endpoint).toBe('/public/pages/about');
  });

  it('returns nothing for an unknown route so the SPA handles it', () => {
    expect(resolveRoute('/nonsense')).toBeNull();
    expect(resolveRoute('/a/b/c')).toBeNull();
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
  const base = { siteName: 'PCN Sportiva LP', url: 'https://pcnsportivalp.com/insights/x', ogType: 'article' };

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
    expect(html).toContain('<link rel="canonical" href="https://pcnsportivalp.com/insights/x">');
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
});
