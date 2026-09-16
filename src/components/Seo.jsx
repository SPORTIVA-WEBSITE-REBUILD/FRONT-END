import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '../hooks/useContent.js';
import { mediaUrl } from '../lib/media.js';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://pcnsportivalp.com';

/**
 * Per-route metadata, falling back to the site defaults an administrator sets
 * in the dashboard, so a page without its own SEO still gets sensible tags.
 */
export default function Seo({ seo = {}, title, description, image, path, type = 'website', article, jsonLd }) {
  const { data } = useSiteSettings();
  const defaults = data?.settings?.seoDefaults || {};
  const siteName = data?.settings?.siteName || 'PCN Sportiva LP';

  const pageTitle = seo.metaTitle || title;
  const fullTitle = pageTitle ? `${pageTitle} | ${siteName}` : siteName;
  const metaDescription = seo.metaDescription || description || defaults.metaDescription || '';
  const canonical = seo.canonicalUrl || (path ? `${SITE_URL}${path}` : undefined);

  const ogSource = seo.ogImage || image || defaults.ogImage;
  const ogImage = ogSource ? mediaUrl(ogSource, { width: 1200, height: 630 }) : undefined;

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      {metaDescription && <meta name="description" content={metaDescription} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {seo.noIndex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {metaDescription && <meta property="og:description" content={metaDescription} />}
      {canonical && <meta property="og:url" content={canonical} />}
      {ogImage && <meta property="og:image" content={ogImage} />}

      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      {metaDescription && <meta name="twitter:description" content={metaDescription} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {article?.publishedAt && (
        <meta property="article:published_time" content={new Date(article.publishedAt).toISOString()} />
      )}
      {article?.author && <meta property="article:author" content={article.author} />}

      {/* Structured data. Helmet serialises it into the head so crawlers that
          execute JavaScript pick it up, and the prerender middleware emits the
          same graph for those that do not. */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
