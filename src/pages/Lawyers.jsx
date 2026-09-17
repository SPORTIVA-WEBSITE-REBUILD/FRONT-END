import Seo from '../components/Seo.jsx';
import PageBanner from '../components/template/PageBanner.jsx';
import { FlipCard } from '../components/template/cards.jsx';
import { LoadingCards, ErrorState } from '../components/states.jsx';
import { usePage, useLawyers, section } from '../hooks/useContent.js';
import { graph, breadcrumbs } from '../lib/structuredData.js';

/** attorneys.html */
export default function Lawyers() {
  const { data: page } = usePage('lawyers');
  const { data: lawyers, isLoading, isError, error, refetch } = useLawyers();
  const hero = section(page, 'hero');

  return (
    <>
      <Seo
        seo={page?.seo}
        title={page?.title}
        path="/lawyers"
        jsonLd={graph(breadcrumbs([{ label: 'Home', href: '/' }, { label: hero.heading || page?.title }]))}
      />
      <PageBanner title={hero.heading} crumb={hero.subheading} image={hero.image} />
      <section className="ftco-section">
        <div className="container-fluid px-md-5">
          {isError && <ErrorState error={error} onRetry={refetch} />}
          {isLoading && <LoadingCards count={4} col="col-lg-3 col-sm-6" />}
          <div className="row">
            {(lawyers || []).map((l) => (
              <div className="col-lg-3 col-sm-6" key={l.slug}><FlipCard lawyer={l} /></div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
