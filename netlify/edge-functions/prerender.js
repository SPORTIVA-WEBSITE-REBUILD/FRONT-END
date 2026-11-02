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
  extractMeta, extractWebinarMeta, renderPreview, renderNotFound,
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

const API = env('VITE_API_URL', 'https://pcnsportivalp-api.netlify.app/api');
const SITE = env('VITE_SITE_URL', 'https://pcnsportivalp.com').replace(/\/$/, '');

const NOT_FOUND_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'public, s-maxage=60',
};

export default async function prerender(request, context) {
  // The Insights section is now Articles. Old links, bookmarks and search
  // results keep working through a permanent redirect.
  const legacy = new URL(request.url);
  if (legacy.pathname === '/insights' || legacy.pathname.startsWith('/insights/')) {
    legacy.pathname = legacy.pathname.replace('/insights', '/articles');
    return Response.redirect(legacy.toString(), 301);
  }

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

  /*
   * /webinar is not a CMS page — resolveRoute() has no mapping for it, its
   * data lives at /webinar (not /public/pages/webinar), and its meta is
   * built from a different shape (extractWebinarMeta, not extractMeta).
   * Handled as its own branch, before the generic resolveRoute() flow below,
   * which would otherwise just fall through to the SPA for this path.
   *
   * Search crawlers still get the real SPA here too, same reasoning as every
   * other page: the stub has no FAQ/speaker content, and serving it would
   * get the thin version indexed instead of the real page.
   */
  if (pathname === '/webinar') {
    if (!isSocialCrawler(userAgent)) return context.next();
    try {
      const res = await fetch(`${API}/webinar`, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) return context.next();
      const webinar = (await res.json()).data;
      const meta = extractWebinarMeta(webinar, 'PCN Sportiva LP', SITE);
      const html = renderPreview(meta, { siteName: 'PCN Sportiva LP', url: `${SITE}${pathname}`, ogType: 'website' });
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=600' },
      });
    } catch {
      return context.next();
    }
  }

  const route = resolveRoute(pathname);
  if (!route) return context.next();

  /*
   * Search engines execute JavaScript, so they are handed the real SPA rather
   * than the preview stub: the stub carries a title and a link but no article
   * body, and serving it would get the thin version indexed in place of the
   * real content and its structured data.
   *
   * Two things still have to be answered here, in HTTP, because a client-side
   * router cannot express either one — the SPA can only ever reply 200:
   *   - an unpublished or deleted item must return a real 404, or the soft 200
   *     keeps the dead URL in the index;
   *   - a renamed slug must return a real 301, or the ranking never moves to
   *     the new address.
   * Only detail routes are checked, so static pages cost no extra request.
   */
  if (!isSocialCrawler(userAgent)) {
    if (route.endpoint.startsWith('/public/pages/')) return context.next();

    try {
      const res = await fetch(`${API}${route.endpoint}`, { signal: AbortSignal.timeout(2000) });

      if (res.status === 404) {
        return new Response(
          renderNotFound({ siteName: 'PCN Sportiva LP', url: `${SITE}${pathname}` }),
          { status: 404, headers: NOT_FOUND_HEADERS },
        );
      }
      if (res.ok) {
        const payload = await res.json();
        const canonical = payload.meta?.redirectTo;
        if (canonical && payload.data?.slug && canonical !== pathname.split('/').pop()) {
          return new Response(null, {
            status: 301,
            headers: { Location: `${SITE}${pathname.replace(/[^/]+$/, canonical)}` },
          });
        }
      }
    } catch {
      // API down or slow: fall through to the SPA rather than block the crawl.
    }

    return context.next();
  }

  try {
    // The webinar fetch only runs for '/' — every other page has nothing to
    // do with it, so it would just be a wasted request everywhere else.
    const [contentRes, settingsRes, webinarRes] = await Promise.all([
      fetch(`${API}${route.endpoint}`, { signal: AbortSignal.timeout(2500) }),
      fetch(`${API}/public/settings`, { signal: AbortSignal.timeout(2500) }),
      pathname === '/' ? fetch(`${API}/webinar`, { signal: AbortSignal.timeout(2500) }) : Promise.resolve(null),
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
    let meta = extractMeta(contentForMeta, siteName, settings?.seoDefaults?.ogImage);

    // While the webinar hero is live, the home page's share card describes
    // the webinar instead of the firm's usual homepage copy — matches the
    // real <Home> component, which does the exact same swap client-side
    // (see src/pages/Home.jsx). An admin's own seo.metaTitle on the Home
    // page still wins; extractMeta() above already applied that priority
    // before this runs, so it is only overridden when the page had none.
    if (pathname === '/' && webinarRes?.ok && !data?.seo?.metaTitle) {
      const webinar = (await webinarRes.json()).data;
      if (webinar?.isHeroActive) {
        meta = extractWebinarMeta(webinar, siteName, SITE);
      }
    }

    // No page photo and no default set in Settings > SEO yet: fall back to
    // the site's own logo, so a shared link still shows a picture rather than
    // a bare text card. Replaced the moment an administrator sets a proper
    // image in Settings > SEO, since that fallback is checked first, above.
    // 600x600, not the 1200x630 a real photo gets transformed to — declaring
    // the wrong size can make a client stretch or crop it oddly.
    if (!meta.imageUrl) {
      meta.imageUrl = `${SITE}/favicon.png`;
      meta.imageWidth = 600;
      meta.imageHeight = 600;
    }

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
