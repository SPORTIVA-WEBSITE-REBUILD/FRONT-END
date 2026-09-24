import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useArticles, useLayout } from '../hooks/useContent.js';
import { shortDate } from '../lib/format.js';
import { distinctExcerpt } from './template/cards.jsx';

const SEEN_KEY = 'pcn-articles-popup-dismissed';
const DELAY_MS = 4000;

function alreadyDismissed() {
  try { return sessionStorage.getItem(SEEN_KEY) === '1'; } catch { return false; }
}

/**
 * A one-time "latest articles" prompt: appears a few seconds after the first
 * page load, offers the two newest Articles, and stays away for the rest of
 * the browser session once closed. Content only, no email capture (the
 * newsletter band already does that). Not shown on the Articles pages, where
 * the articles are already on screen.
 */
export default function ArticlesPopup() {
  const { pathname } = useLocation();
  const layout = useLayout();
  const copy = layout.section('articlesPopup');
  const labels = copy.labels || {};
  const onInsights = pathname.startsWith('/articles');
  const [open, setOpen] = useState(false);
  const { data } = useArticles({ limit: 2 });
  const articles = data?.data || [];
  const ready = layout.ready && articles.length > 0 && !onInsights;

  useEffect(() => {
    if (!ready || alreadyDismissed()) return undefined;
    const timer = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, [ready]);

  const close = useCallback(() => {
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* private mode: it just may reappear */ }
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  // Opening an article from the popup counts as having seen it.
  useEffect(() => { if (open && onInsights) close(); }, [open, onInsights, close]);

  if (!open) return null;

  return (
    <div className="pcn-popup" onClick={close} role="presentation">
      <div
        className="pcn-popup__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pcn-popup-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="pcn-popup__close" onClick={close} aria-label={labels.close || 'Close'}>
          <span aria-hidden="true">×</span>
        </button>

        {copy.subheading && <span className="pcn-popup__eyebrow">{copy.subheading}</span>}
        <h2 id="pcn-popup-title" className="pcn-popup__heading">{copy.heading}</h2>

        <ul className="pcn-popup__list">
          {articles.map((a) => {
            const excerpt = distinctExcerpt(a.title, a.excerpt);
            return (
              <li key={a.slug} className="pcn-popup__item">
                <p className="pcn-popup__meta">
                  {[a.category?.name, shortDate(a.publishedAt)].filter(Boolean).join(' · ')}
                </p>
                <h3 className="pcn-popup__title pcn-clamp pcn-clamp--2">
                  <Link to={`/articles/${a.slug}`} onClick={close}>{a.title}</Link>
                </h3>
                {excerpt && <p className="pcn-popup__excerpt pcn-clamp pcn-clamp--2">{excerpt}</p>}
                <Link to={`/articles/${a.slug}`} className="pcn-blog__more" onClick={close}>
                  {labels.readMore || 'Read more'}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link to={copy.cta?.href || '/articles'} className="btn btn-primary pcn-popup__cta" onClick={close}>
          {copy.cta?.label || 'View All Articles'}
        </Link>
      </div>
    </div>
  );
}
