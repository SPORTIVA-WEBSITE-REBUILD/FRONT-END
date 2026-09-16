import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import { LoadingCards, ErrorState, EmptyState } from '../components/states.jsx';
import { useVacancies, usePage, useSiteSettings, section } from '../hooks/useContent.js';
import { graph, breadcrumbs } from '../lib/structuredData.js';

const TYPE_LABELS = {
  full_time: 'Full time', part_time: 'Part time', contract: 'Contract',
  internship: 'Internship', pupillage: 'Pupillage', nysc: 'NYSC placement',
};

const WORKPLACE_LABELS = { on_site: 'On site', hybrid: 'Hybrid', remote: 'Remote' };

export default function Careers() {
  const { data: page } = usePage('careers');
  const { data: settings } = useSiteSettings();
  const { data: vacancies, isLoading, isError, error, refetch } = useVacancies();

  const intro = section(page, 'intro');
  const careersEmail = settings?.settings?.careersEmail || settings?.settings?.contact?.email;

  return (
    <>
      <Seo
        seo={page?.seo}
        title={page?.title || 'Careers'}
        description="Current openings at the firm."
        path="/careers"
        jsonLd={graph(breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Careers' }]))}
      />
      <PageHero
        title={intro.heading || 'Careers'}
        image={intro.image}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Careers' }]}
      />

      <section className="ftco-section">
        <div className="container">
          {intro.body && (
            <div className="row justify-content-center mb-5">
              <div className="col-md-8 text-center"><p>{intro.body}</p></div>
            </div>
          )}

          {isError && <ErrorState error={error} onRetry={refetch} />}
          {isLoading && <LoadingCards count={3} col="col-md-6" />}

          {vacancies?.length === 0 && (
            <EmptyState
              title="No open positions at the moment"
              message={careersEmail
                ? 'We are not recruiting right now, but we are always glad to hear from strong candidates.'
                : 'Please check back soon.'}
              action={careersEmail && (
                <a className="btn btn-primary py-3 px-4" href={`mailto:${careersEmail}?subject=${encodeURIComponent('Speculative application')}`}>
                  Send a speculative application
                </a>
              )}
            />
          )}

          <div className="row">
            {(vacancies || []).map((v) => (
              <div className="col-md-6 mb-4 ftco-animate" key={v.slug}>
                <div className="case-wrap h-100 p-4" style={{ border: '1px solid #e6e6e6' }}>
                  <div className="pcn-meta">
                    <span className="pcn-badge">{TYPE_LABELS[v.employmentType] || v.employmentType}</span>
                    <span className="pcn-badge">{v.location}</span>
                    {v.workplaceType && v.workplaceType !== 'on_site' && (
                      <span className="pcn-badge">{WORKPLACE_LABELS[v.workplaceType]}</span>
                    )}
                    {v.department && <span className="pcn-badge">{v.department}</span>}
                  </div>

                  <h3 className="mb-2">
                    <Link to={`/careers/${v.slug}`}>{v.title}</Link>
                  </h3>
                  <p>{v.summary}</p>

                  {v.closingDate && (
                    <p className="text-muted mb-3">
                      <small>
                        Closes{' '}
                        <time dateTime={v.closingDate}>
                          {new Date(v.closingDate).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </time>
                      </small>
                    </p>
                  )}

                  <Link to={`/careers/${v.slug}`} className="btn btn-primary py-2 px-4">
                    View role <span className="ion-ios-arrow-forward" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
