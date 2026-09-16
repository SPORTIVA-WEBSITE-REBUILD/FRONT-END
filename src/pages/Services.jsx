import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import { LoadingCards, ErrorState, EmptyState } from '../components/states.jsx';
import { useServices, usePage, section } from '../hooks/useContent.js';

export default function Services() {
  const { data: page } = usePage('services');
  const { data: services, isLoading, isError, error, refetch } = useServices();
  const intro = section(page, 'intro');

  return (
    <>
      <Seo seo={page?.seo} title={page?.title || 'Services'} path="/services" />
      <PageHero
        title={intro.heading || 'Services'}
        image={intro.image}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
      />

      <section className="ftco-section">
        <div className="container">
          {intro.body && (
            <div className="row justify-content-center mb-5">
              <div className="col-md-8 text-center"><p>{intro.body}</p></div>
            </div>
          )}

          {isError && <ErrorState error={error} onRetry={refetch} />}
          {isLoading && <LoadingCards count={6} />}
          {services?.length === 0 && (
            <EmptyState title="No services listed yet" message="Please check back shortly." />
          )}

          <div className="row">
            {(services || []).map((s) => (
              <div className="col-md-4 d-flex align-items-stretch mb-4" key={s.slug}>
                <div className="services text-center">
                  <div className="icon d-flex justify-content-center align-items-center">
                    <span className={s.icon || 'flaticon-lawyer'} />
                  </div>
                  <div className="text">
                    <h3>{s.title}</h3>
                    <p>{s.summary}</p>
                  </div>
                  <Link
                    to={`/services/${s.slug}`}
                    className="btn-custom d-flex align-items-center justify-content-center"
                    aria-label={`Read about ${s.title}`}
                  >
                    <span className="ion-ios-arrow-round-forward" />
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
