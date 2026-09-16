import { useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import SmartImage from '../components/SmartImage.jsx';
import Pagination from '../components/Pagination.jsx';
import { LoadingCards, ErrorState, EmptyState } from '../components/states.jsx';
import { useCases, useCaseFilters, usePage, section } from '../hooks/useContent.js';

const PARTY_LABELS = {
  athlete: 'Athlete', club: 'Club', federation: 'Federation',
  agent: 'Agent', sponsor: 'Sponsor', other: 'Other',
};

/**
 * The filterable case record. Filters live in the URL rather than component
 * state, so a filtered view can be linked, bookmarked and shared — which is the
 * point of a public archive.
 */
export default function Record() {
  const [params, setParams] = useSearchParams();
  const { data: page } = usePage('record-insights');
  const { data: filterOptions } = useCaseFilters();

  const filters = useMemo(() => ({
    forum: params.get('forum') || '',
    year: params.get('year') || '',
    party: params.get('party') || '',
    outcome: params.get('outcome') || '',
    q: params.get('q') || '',
    page: Number(params.get('page')) || 1,
    limit: 12,
  }), [params]);

  const { data: result, isLoading, isError, error, refetch, isPlaceholderData } = useCases(filters);

  const setFilter = useCallback((key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    // Any filter change returns to the first page, or the reader lands on an
    // empty page four of a two-page result.
    next.delete('page');
    setParams(next, { replace: true });
  }, [params, setParams]);

  const clearAll = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams]);

  const activeFilters = Object.entries(filters)
    .filter(([key, value]) => value && !['page', 'limit'].includes(key));

  const intro = section(page, 'intro');
  const cases = result?.data || [];
  const meta = result?.meta;

  return (
    <>
      <Seo
        title="Case Record"
        description="A record of matters handled by the firm, filterable by forum, year and party represented."
        path="/record"
        seo={page?.seo}
      />
      <PageHero
        title={intro.heading || 'Case Record'}
        image={intro.image}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Record' }]}
      />

      <section className="ftco-section">
        <div className="container">
          {intro.body && (
            <div className="row justify-content-center mb-5">
              <div className="col-md-8 text-center"><p>{intro.body}</p></div>
            </div>
          )}

          <div className="pcn-filters">
            <div className="row">
              <div className="col-md-3 mb-3 mb-md-0">
                <label htmlFor="filter-forum">Forum</label>
                <select
                  id="filter-forum"
                  className="form-control"
                  value={filters.forum}
                  onChange={(e) => setFilter('forum', e.target.value)}
                >
                  <option value="">All forums</option>
                  {(filterOptions?.forums || []).map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div className="col-md-2 mb-3 mb-md-0">
                <label htmlFor="filter-year">Year</label>
                <select
                  id="filter-year"
                  className="form-control"
                  value={filters.year}
                  onChange={(e) => setFilter('year', e.target.value)}
                >
                  <option value="">All years</option>
                  {(filterOptions?.years || []).map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div className="col-md-3 mb-3 mb-md-0">
                <label htmlFor="filter-party">Party represented</label>
                <select
                  id="filter-party"
                  className="form-control"
                  value={filters.party}
                  onChange={(e) => setFilter('party', e.target.value)}
                >
                  <option value="">Any party</option>
                  {(filterOptions?.parties || []).map((p) => (
                    <option key={p} value={p}>{PARTY_LABELS[p] || p}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label htmlFor="filter-q">Search</label>
                <input
                  id="filter-q"
                  type="search"
                  className="form-control"
                  placeholder="Search the record"
                  defaultValue={filters.q}
                  onChange={(e) => setFilter('q', e.target.value)}
                />
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="pcn-active-filters">
                {activeFilters.map(([key, value]) => (
                  <button
                    type="button"
                    className="pcn-chip"
                    key={key}
                    onClick={() => setFilter(key, '')}
                  >
                    {PARTY_LABELS[value] || value} <span aria-hidden="true">×</span>
                    <span className="sr-only">Remove filter</span>
                  </button>
                ))}
                <button type="button" className="pcn-chip" onClick={clearAll}>Clear all</button>
              </div>
            )}
          </div>

          {isError && <ErrorState error={error} onRetry={refetch} />}
          {isLoading && !result && <LoadingCards count={6} />}

          {result && cases.length === 0 && (
            <EmptyState
              title="No matters match those filters"
              message="Try widening your search, or clear the filters to see the full record."
              action={<button type="button" className="btn btn-primary py-2 px-4" onClick={clearAll}>Clear filters</button>}
            />
          )}

          {cases.length > 0 && (
            <>
              <p className="text-muted mb-4">
                {meta.total} {meta.total === 1 ? 'matter' : 'matters'}
              </p>

              <div className="row" style={{ opacity: isPlaceholderData ? 0.6 : 1 }}>
                {cases.map((c) => (
                  <div className="col-md-4 mb-4 ftco-animate" key={c.slug}>
                    <div className="case-wrap h-100">
                      <Link to={`/record/${c.slug}`} className="d-block">
                        {c.featuredImage && (
                          <SmartImage
                            media={c.featuredImage}
                            width={600}
                            height={400}
                            className="img-fluid mb-3"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        )}
                        <div className="pcn-meta">
                          <span className="pcn-badge">{c.forum}</span>
                          <span className="pcn-badge">{c.year}</span>
                          <span className="pcn-badge">{PARTY_LABELS[c.partyRepresented]}</span>
                          <span className={`pcn-badge pcn-badge--${c.outcome}`}>{c.outcome}</span>
                        </div>
                        <h3>{c.title}</h3>
                      </Link>
                      <p>{c.summary}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                page={meta.page}
                pages={meta.pages}
                onChange={(p) => {
                  const next = new URLSearchParams(params);
                  if (p > 1) next.set('page', p); else next.delete('page');
                  setParams(next);
                }}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}
