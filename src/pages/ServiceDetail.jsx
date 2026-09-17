import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import SmartImage from '../components/SmartImage.jsx';
import RichText from '../components/RichText.jsx';
import PageBanner from '../components/template/PageBanner.jsx';
import Sidebar from '../components/template/Sidebar.jsx';
import SmartLink from '../components/template/SmartLink.jsx';
import { CaseCard, FlipCard } from '../components/template/cards.jsx';
import { LoadingSection, ErrorState } from '../components/states.jsx';
import { usePage, useService, section } from '../hooks/useContent.js';
import { graph, service as serviceSchema, breadcrumbs } from '../lib/structuredData.js';

/** practice-single.html */
export default function ServiceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: page } = usePage('service-detail');
  const { data: service, isLoading, isError, error } = useService(slug);

  useEffect(() => {
    if (service?.slug && service.slug !== slug) navigate(`/services/${service.slug}`, { replace: true });
  }, [service, slug, navigate]);

  const hero = section(page, 'hero');
  const parent = { label: hero.labels?.parent, href: '/services' };

  if (isLoading) return <div className="container py-5"><LoadingSection rows={8} /></div>;
  if (isError) return <div className="container py-5"><ErrorState error={error} /></div>;

  const overview = section(page, 'overview');
  const help = section(page, 'help');
  const advisors = section(page, 'advisors');

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
          breadcrumbs([{ label: 'Home', href: '/' }, { label: parent.label, href: parent.href }, { label: service.title }]),
        )}
      />
      <PageBanner title={service.title} image={hero.image || service.image} parent={parent} />

      <section className="ftco-section ftco-degree-bg">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 ftco-animate">
              {service.image && (
                <p>
                  <SmartImage media={service.image} width={1200} className="img-fluid" sizes="(max-width: 992px) 100vw, 66vw" priority />
                </p>
              )}
              {overview.heading && <h2 className="mb-3">{overview.heading}</h2>}
              {service.body ? <RichText html={service.body} /> : <p>{service.summary}</p>}

              {help.heading && <h2 className="mb-3 mt-5">{help.heading}</h2>}
              {help.body && <p>{help.body}</p>}
              {help.cta?.label && (
                <p><SmartLink href={help.cta.href} className="btn btn-primary">{help.cta.label}</SmartLink></p>
              )}

              {service.advisors?.length > 0 && (
                <div className="row mt-5 pt-5">
                  <div className="col-md-12">
                    <h2 className="mb-4 font-weight-bold">{advisors.heading}</h2>
                  </div>
                  {service.advisors.map((l) => (
                    <div className="col-lg-6" key={l.slug}><FlipCard lawyer={l} compact /></div>
                  ))}
                </div>
              )}

              {service.cases?.length > 0 && (
                <div className="row mt-5">
                  <div className="col-md-12">
                    <h2 className="mb-4 font-weight-bold">{section(page, 'relatedCases').heading}</h2>
                  </div>
                  {service.cases.map((c) => (
                    <div className="col-md-6" key={c.slug}><CaseCard item={c} /></div>
                  ))}
                </div>
              )}
            </div>

            <Sidebar
              kind="service"
              activeSlug={service.slug}
              widgets={section(page, 'widgets').labels}
              paragraph={section(page, 'sidebar')}
            />
          </div>
        </div>
      </section>
    </>
  );
}
