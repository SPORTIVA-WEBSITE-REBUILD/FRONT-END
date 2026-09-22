/**
 * Netlify Edge Function wrapper around lib/prerender.js.
 *
 * The same logic used to be wired up as a Vercel Edge Middleware
 * (../../middleware.js) — but this site deploys to Netlify, which has its own,
 * differently-shaped edge runtime and never ran that file. This is the same
 * logic, in the shape Netlify actually executes: a function under
 * netlify/edge-functions, registered in netlify.toml, called with
 * (request, context) instead of Vercel's (request).
 *
 * See lib/prerender.js for why this exists at all: link-preview crawlers
 * (WhatsApp, etc.) do not run JavaScript, so without this they see the bare
 * index.html shell and no title, description or image.
 */
import {
  isCrawler, isSocialCrawler, isKnownRoute, resolveRoute,
  extractMeta, renderPreview, renderNotFound,
} from '../../lib/prerender.js';

function env(key, fallback) {
  // Netlify.env is the documented API; Deno.env is the underlying runtime and
  // works the same way, kept as a fallback in case one is unavailable.
  try {
    // eslint-disable-next-line no-undef
    const v = typeof Netlify !== 'undefined' ? Netlify.env.get(key) : Deno.env.get(key);
    return v || fallback;
  } catch {
    return fallback;
  }
}

const API = env('VITE_API_URL', 'https://pcn-sportiva-api.netlify.app/api');
const SITE = env('VITE_SITE_URL', 'https://pcn-sportiva-web.netlify.app').replace(/\/$/, '');

const NOT_FOUND_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'public, s-maxage=60',
};

export default async function prerender(request, context) {
  const userAgent = request.headers.get('user-agent') || '';
  if (!isCrawler(userAgent)) return context.next(); // real visitor: serve the SPA

  const { pathname } = new URL(request.url);

  // A single-page app answers every path with 200, which search engines read
  // as a soft 404 — junk URLs get crawled and can end up indexed. A path that
  // maps to no route at all gets a real 404 status.
  if (!isKnownRoute(pathname)) {
    return new Response(
      renderNotFound({ siteName: 'PCN Sportiva LP', url: `${SITE}${pathname}` }),
      { status: 404, headers: NOT_FOUND_HEADERS },
    );
  }

  // Search engines render JavaScript, so from here on they are left to load
  // the real page — complete with its structured data. Only link-preview
  // crawlers, which cannot run JS, receive the prerendered head.
  if (!isSocialCrawler(userAgent)) return context.next();

  const route = resolveRoute(pathname);
  if (!route) return context.next();

  try {
    const [contentRes, settingsRes] = await Promise.all([
      fetch(`${API}${route.endpoint}`, { signal: AbortSignal.timeout(2500) }),
      fetch(`${API}/public/settings`, { signal: AbortSignal.timeout(2500) }),
    ]);

    const settings = settingsRes.ok ? (await settingsRes.json()).data?.settings : null;
    const siteName = settings?.siteName || 'PCN Sportiva LP';

    // The content is gone (unpublished or deleted): a real 404, not a 200 with
    // an empty page.
    if (contentRes.status === 404) {
      return new Response(
        renderNotFound({ siteName, url: `${SITE}${pathname}` }),
        { status: 404, headers: NOT_FOUND_HEADERS },
      );
    }
    if (!contentRes.ok) return context.next();

    const payload = await contentRes.json();
    const { data } = payload;

    // The administrator renamed this slug. Crawlers need a real 301 to move
    // the ranking across; the in-app client-side redirect is invisible to
    // them.
    const canonical = payload.meta?.redirectTo;
    if (canonical && data?.slug && canonical !== pathname.split('/').pop()) {
      const target = `${SITE}${pathname.replace(/[^/]+$/, canonical)}`;
      return new Response(null, { status: 301, headers: { Location: target } });
    }

    // The home page's Page.title is "Home" — the admin-facing label in the
    // dashboard's page list, not public copy. The client-side <Seo> never
    // passes it as a title for that reason, so the crawler version has to
    // drop it the same way, or a shared homepage link reads "Home | PCN
    // Sportiva LP" instead of matching what a real visitor's browser tab says.
    const contentForMeta = pathname === '/' && !data?.seo?.metaTitle
      ? { ...data, title: undefined }
      : data;

    // Falls back to the site's own default preview image (Settings > SEO)
    // when the page itself has none — otherwise every page without its own
    // photo shows no image at all in a shared link.
    const meta = extractMeta(contentForMeta, siteName, settings?.seoDefaults?.ogImage);

    // No page photo and no default set in Settings > SEO yet: fall back to
    // the site's own logo, so a shared link still shows a picture rather than
    // a bare text card. Replaced the moment an administrator sets a proper
    // 1200x630 image in Settings > SEO, since that fallback is checked first,
    // above.
    if (!meta.imageUrl) meta.imageUrl = `${SITE}/favicon.png`;

    const html = renderPreview(meta, { siteName, url: `${SITE}${pathname}`, ogType: route.ogType });

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    });
  } catch {
    // Any failure (API down, timeout) falls through to the ordinary SPA
    // rather than showing a crawler a broken response.
    return context.next();
  }
}
