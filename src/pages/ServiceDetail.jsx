import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import RichText from '../components/RichText.jsx';
import SmartImage from '../components/SmartImage.jsx';
import { LoadingSection, ErrorState } from '../components/states.jsx';
import { useService, useServices } from '../hooks/useContent.js';
import { graph, service as serviceSchema, breadcrumbs } from '../lib/structuredData.js';

export default function ServiceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: result, isLoading, isError, error } = useService(slug);
  const { data: allServices } = useServices();

  const service = result?.data;
  const redirectTo = result?.meta?.redirectTo;

  useEffect(() => {
    if (redirectTo && redirectTo !== slug) {
      navigate(`/services/${redirectTo}`, { replace: true });
    }
  }, [redirectTo, slug, navigate]);

  if (isLoading) return <div className="container py-5"><LoadingSection rows={8} /></div>;
  if (isError) return <div className="container py-5"><ErrorState error={error} title="Service not found" /></div>;

  return (
    <>
      <Seo
        seo={service.seo}
        title={service.title}
        description={service.summary}
        image={service.image}
        path={`/services/${service.slug}`}
        jsonLd={graph(
          serviceSchema(service),
          breadcrumbs([
            { label: 'Home', href: '/' },
            { label: 'Services', href: '/services' },
            { label: service.title },
          ]),
        )}
      />
      <PageHero
        title={service.title}
        image={service.image}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services' }, { label: service.title }]}
      />

      <section className="ftco-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 ftco-animate">
              {service.image && (
                <SmartImage
                  media={service.image}
                  width={1200}
                  className="img-fluid mb-4"
                  sizes="(max-width: 992px) 100vw, 66vw"
                  priority
                />
              )}
              <h2 className="mb-4">Overview</h2>
              {service.summary && <p className="lead">{service.summary}</p>}
              <RichText html={service.body} />
            </div>

            <div className="col-lg-4 sidebar pl-lg-5 ftco-animate">
              <div className="sidebar-box ftco-animate">
                <h3 className="heading">Other services</h3>
                <ul className="list-unstyled categories">
                  {(allServices || [])
                    .filter((s) => s.slug !== service.slug)
                    .map((s) => (
                      <li key={s.slug}>
                        <Link to={`/services/${s.slug}`}>{s.title}</Link>
                      </li>
                    ))}
                </ul>
              </div>

              <div className="sidebar-box">
                <h3 className="heading">How can we help?</h3>
                <p>Tell us about your matter and we will come back to you.</p>
                <Link to="/contact" className="btn btn-primary py-2 px-4">Make an enquiry</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
