import { Link, useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import SmartImage from '../components/SmartImage.jsx';
import Pagination from '../components/Pagination.jsx';
import { LoadingCards, ErrorState, EmptyState } from '../components/states.jsx';
import { useArticles, usePage, section } from '../hooks/useContent.js';

export default function Insights() {
  const [params, setParams] = useSearchParams();
  const { data: page } = usePage('record-insights');

  const filters = {
    tag: params.get('tag') || '',
    q: params.get('q') || '',
    page: Number(params.get('page')) || 1,
    limit: 9,
  };

  const { data: result, isLoading, isError, error, refetch } = useArticles(filters);
  const articles = result?.data || [];
  const intro = section(page, 'insights') ;

  return (
    <>
      <Seo
        title="Insights"
        description="Commentary and analysis on sports law, regulation and dispute resolution."
        path="/insights"
      />
      <PageHero
        title="Insights"
        image={intro.image}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Insights' }]}
      />

      <section className="ftco-section">
        <div className="container">
          <div className="row mb-5">
            <div className="col-md-6 ml-auto">
              <input
                type="search"
                className="form-control"
                placeholder="Search insights"
                aria-label="Search insights"
                defaultValue={filters.q}
                onChange={(e) => {
                  const next = new URLSearchParams(params);
                  if (e.target.value) next.set('q', e.target.value); else next.delete('q');
                  next.delete('page');
                  setParams(next, { replace: true });
                }}
              />
            </div>
          </div>

          {isError && <ErrorState error={error} onRetry={refetch} />}
          {isLoading && !result && <LoadingCards count={6} />}

          {result && articles.length === 0 && (
            <EmptyState
              title="No articles yet"
              message="There is nothing published here at the moment. Please check back soon."
            />
          )}

          <div className="row d-flex">
            {articles.map((a) => (
              <div className="col-md-4 d-flex ftco-animate mb-4" key={a.slug}>
                <div className="blog-entry justify-content-end">
                  <Link to={`/insights/${a.slug}`} className="block-20">
                    {a.featuredImage && (
                      <SmartImage media={a.featuredImage} width={600} height={400} sizes="(max-width: 768px) 100vw, 33vw" />
                    )}
                  </Link>
                  <div className="text pt-4">
                    <div className="meta mb-3">
                      {a.publishedAt && (
                        <div>
                          <time dateTime={a.publishedAt}>
                            {new Date(a.publishedAt).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'long', year: 'numeric',
                            })}
                          </time>
                        </div>
                      )}
                      {a.author?.name && <div><span>{a.author.name}</span></div>}
                      {a.readingMinutes && <div><span>{a.readingMinutes} min read</span></div>}
                    </div>
                    <h3 className="heading"><Link to={`/insights/${a.slug}`}>{a.title}</Link></h3>
                    <p>{a.excerpt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {result?.meta && (
            <Pagination
              page={result.meta.page}
              pages={result.meta.pages}
              onChange={(p) => {
                const next = new URLSearchParams(params);
                if (p > 1) next.set('page', p); else next.delete('page');
                setParams(next);
              }}
            />
          )}
        </div>
      </section>
    </>
  );
}
