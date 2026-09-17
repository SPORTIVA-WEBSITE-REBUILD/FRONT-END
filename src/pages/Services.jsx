import Seo from '../components/Seo.jsx';
import PageBanner from '../components/template/PageBanner.jsx';
import { PracticeCard } from '../components/template/cards.jsx';
import { LoadingCards, ErrorState } from '../components/states.jsx';
import { usePage, useServices, section } from '../hooks/useContent.js';
import { graph, breadcrumbs } from '../lib/structuredData.js';

/** practice-areas.html */
export default function Services() {
  const { data: page } = usePage('services');
  const { data: services, isLoading, isError, error, refetch } = useServices();
  const hero = section(page, 'hero');

  return (
    <>
      <Seo
        seo={page?.seo}
        title={page?.title}
        path="/services"
        jsonLd={graph(breadcrumbs([{ label: 'Home', href: '/' }, { label: hero.heading || page?.title }]))}
      />
      <PageBanner title={hero.heading} crumb={hero.subheading} image={hero.image} />
      <section className="ftco-section">
        <div className="container">
          {isError && <ErrorState error={error} onRetry={refetch} />}
          {isLoading && <LoadingCards count={4} col="col-md-3" />}
          <div className="row d-flex justify-content-center">
            {(services || []).map((s) => <PracticeCard service={s} key={s.slug} />)}
          </div>
        </div>
      </section>
    </>
  );
}
