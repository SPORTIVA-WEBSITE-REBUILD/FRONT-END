import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import Pagination from '../components/Pagination.jsx';
import PageBanner from '../components/template/PageBanner.jsx';
import { CaseCard } from '../components/template/cards.jsx';
import { LoadingCards, ErrorState, EmptyState } from '../components/states.jsx';
import { useCases, useCaseFilters, useLayout, usePage, section } from '../hooks/useContent.js';
import { term } from '../lib/format.js';
import { graph, breadcrumbs } from '../lib/structuredData.js';

/**
 * case.html, plus the filter bar the firm's brief asks for (switchable in
 * Settings). Filters and the page number live in the URL, so a filtered view
 * can be linked and shared.
 */
export default function Record() {
  const [params, setParams] = useSearchParams();
  const { data: page } = usePage('record');
  const layout = useLayout();
  const showFilters = layout.settings.showCaseFilters !== false;
  const { data: filterOptions } = useCaseFilters();
  const partyTerms = layout.labels('caseTerms');

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
    next.delete('page');
    setParams(next, { replace: true });
  }, [params, setParams]);

  const clearAll = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams]);

  const hero = section(page, 'hero');
  const labels = section(page, 'filters').labels || {};
  const activeFilters = Object.entries(filters).filter(([k, v]) => v && !['page', 'limit'].includes(k));
  const cases = result?.data || [];
  const meta = result?.meta;

  return (
    <>
      <Seo
        seo={page?.seo}
        title={page?.title}
        path="/record"
        jsonLd={graph(breadcrumbs([{ label: 'Home', href: '/' }, { label: hero.heading || page?.title }]))}
      />
      <PageBanner title={hero.heading} crumb={hero.subheading} image={hero.image} />

      <section className="ftco-section">
        <div className="container">
          {showFilters && (
            <div className="pcn-filters">
              <div className="row">
                <div className="col-md-3 mb-3 mb-md-0">
                  <label htmlFor="filter-forum">{labels.forum}</label>
                  <select id="filter-forum" className="form-control" value={filters.forum} onChange={(e) => setFilter('forum', e.target.value)}>
                    <option value="">{labels.allForums}</option>
                    {(filterOptions?.forums || []).map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="col-md-2 mb-3 mb-md-0">
                  <label htmlFor="filter-year">{labels.year}</label>
                  <select id="filter-year" className="form-control" value={filters.year} onChange={(e) => setFilter('year', e.target.value)}>
                    <option value="">{labels.allYears}</option>
                    {(filterOptions?.years || []).map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="col-md-3 mb-3 mb-md-0">
                  <label htmlFor="filter-party">{labels.party}</label>
                  <select id="filter-party" className="form-control" value={filters.party} onChange={(e) => setFilter('party', e.target.value)}>
                    <option value="">{labels.anyParty}</option>
                    {(filterOptions?.parties || []).map((p) => <option key={p} value={p}>{term(partyTerms, 'party', p)}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="filter-q">{labels.search}</label>
                  <input
                    id="filter-q"
                    type="search"
                    className="form-control"
                    placeholder={labels.searchPlaceholder}
                    defaultValue={filters.q}
                    onChange={(e) => setFilter('q', e.target.value)}
                  />
                </div>
              </div>

              {activeFilters.length > 0 && (
                <div className="pcn-active-filters">
                  {activeFilters.map(([key, value]) => (
                    <button type="button" className="pcn-chip" key={key} onClick={() => setFilter(key, '')}>
                      {key === 'party' ? term(partyTerms, 'party', value) : value} <span aria-hidden="true">×</span>
                    </button>
                  ))}
                  <button type="button" className="pcn-chip" onClick={clearAll}>{labels.clearAll}</button>
                </div>
              )}

              {meta && (
                <p className="text-muted mb-0 mt-3">
                  {meta.total} {meta.total === 1 ? labels.resultOne : labels.resultMany}
                </p>
              )}
            </div>
          )}

          {isError && <ErrorState error={error} onRetry={refetch} />}
          {isLoading && !result && <LoadingCards count={6} />}

          {result && cases.length === 0 && (
            <EmptyState
              title={labels.emptyTitle}
              message={labels.emptyText}
              action={activeFilters.length > 0 && (
                <button type="button" className="btn btn-primary py-2 px-4" onClick={clearAll}>{labels.clearFilters}</button>
              )}
            />
          )}

          <div className="row" style={isPlaceholderData ? { opacity: 0.6 } : undefined}>
            {cases.map((c) => (
              <div className="col-md-4 ftco-animate" key={c.slug}><CaseCard item={c} /></div>
            ))}
          </div>

          {meta && <Pagination page={meta.page} pages={meta.pages} />}
        </div>
      </section>
    </>
  );
}
