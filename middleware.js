import {
  isCrawler, isSocialCrawler, isKnownRoute, resolveRoute,
  extractMeta, renderPreview, renderNotFound,
} from './lib/prerender.js';

export const config = {
  // Static assets can never need a preview, and excluding them keeps the
  // middleware off the hot path for real visitors.
  matcher: ['/((?!assets|css|fonts|images|favicon|robots.txt|sitemap.xml).*)'],
};

const API = process.env.VITE_API_URL || 'https://api.pcnsportivalp.com/api';
const SITE = (process.env.VITE_SITE_URL || 'https://pcnsportivalp.com').replace(/\/$/, '');

const NOT_FOUND_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'public, s-maxage=60',
};

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  if (!isCrawler(userAgent)) return undefined; // real visitor: serve the SPA

  const { pathname } = new URL(request.url);

  // A single-page app answers every path with 200, which search engines read as
  // a soft 404 — junk URLs get crawled and can end up indexed. A path that maps
  // to no route at all gets a real 404 status.
  if (!isKnownRoute(pathname)) {
    return new Response(
      renderNotFound({ siteName: 'PCN Sportiva LP', url: `${SITE}${pathname}` }),
      { status: 404, headers: NOT_FOUND_HEADERS },
    );
  }

  // Search engines render JavaScript, so from here on they are left to load
  // the real page — complete with its structured data. Only link-preview
  // crawlers, which cannot run JS, receive the prerendered head.
  if (!isSocialCrawler(userAgent)) return undefined;

  const route = resolveRoute(pathname);
  if (!route) return undefined;

  try {
    const [contentRes, settingsRes] = await Promise.all([
      fetch(`${API}${route.endpoint}`, { signal: AbortSignal.timeout(2500) }),
      fetch(`${API}/public/settings`, { signal: AbortSignal.timeout(2500) }),
    ]);

    const siteName = settingsRes.ok
      ? (await settingsRes.json()).data?.settings?.siteName || 'PCN Sportiva LP'
      : 'PCN Sportiva LP';

    // The content is gone (unpublished or deleted): a real 404, not a 200 with
    // an empty page.
    if (contentRes.status === 404) {
      return new Response(
        renderNotFound({ siteName, url: `${SITE}${pathname}` }),
        { status: 404, headers: NOT_FOUND_HEADERS },
      );
    }
    if (!contentRes.ok) return undefined;

    const payload = await contentRes.json();
    const { data } = payload;

    // The administrator renamed this slug. Crawlers need a real 301 to move the
    // ranking across; the in-app client-side redirect is invisible to them.
    const canonical = payload.meta?.redirectTo;
    if (canonical && data?.slug && canonical !== pathname.split('/').pop()) {
      const target = `${SITE}${pathname.replace(/[^/]+$/, canonical)}`;
      return new Response(null, { status: 301, headers: { Location: target } });
    }

    const meta = extractMeta(data, siteName);
    const html = renderPreview(meta, { siteName, url: `${SITE}${pathname}`, ogType: route.ogType });

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
      },
    });
  } catch {
    // Never let a preview failure take down the page: fall through to the SPA.
    return undefined;
  }
}
