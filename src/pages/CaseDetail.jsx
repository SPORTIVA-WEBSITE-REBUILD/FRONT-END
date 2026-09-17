import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import SmartImage from '../components/SmartImage.jsx';
import RichText from '../components/RichText.jsx';
import PageBanner from '../components/template/PageBanner.jsx';
import SmartLink from '../components/template/SmartLink.jsx';
import { LoadingSection, ErrorState } from '../components/states.jsx';
import { useCase, useLayout, usePage, useSiteSettings, section } from '../hooks/useContent.js';
import { term } from '../lib/format.js';
import { graph, article as articleSchema, breadcrumbs } from '../lib/structuredData.js';

/** A single case, laid out like practice-single.html. */
export default function CaseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: result, isLoading, isError, error } = useCase(slug);
  const { data: page } = usePage('case-detail');
  const { data: siteData } = useSiteSettings();
  const terms = useLayout().labels('caseTerms');

  const item = result?.data;
  const redirectTo = result?.meta?.redirectTo;

  useEffect(() => {
    if (redirectTo && redirectTo !== slug) navigate(`/record/${redirectTo}`, { replace: true });
  }, [redirectTo, slug, navigate]);

  if (isLoading) return <div className="container py-5"><LoadingSection rows={8} /></div>;
  if (isError) return <div className="container py-5"><ErrorState error={error} /></div>;

  const hero = section(page, 'hero');
  const parent = { label: hero.labels?.parent, href: '/record' };
  const overview = section(page, 'overview');
  const details = section(page, 'details');
  const dl = details.labels || {};
  const sidebar = section(page, 'sidebar');

  return (
    <>
      <Seo
        seo={item.seo}
        title={item.title}
        description={item.summary}
        image={item.featuredImage}
        path={`/record/${item.slug}`}
        type="article"
        jsonLd={graph(
          articleSchema({ ...item, excerpt: item.summary }, siteData?.settings, '/record'),
          breadcrumbs([{ label: 'Home', href: '/' }, { label: parent.label, href: parent.href }, { label: item.title }]),
        )}
      />
      <PageBanner title={item.title} image={hero.image || item.featuredImage} parent={parent} />

      <section className="ftco-section ftco-degree-bg">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 ftco-animate">
              {item.featuredImage && (
                <p><SmartImage media={item.featuredImage} width={1200} className="img-fluid" sizes="(max-width: 992px) 100vw, 66vw" priority /></p>
              )}
              {overview.heading && <h2 className="mb-3">{overview.heading}</h2>}
              {item.summary && <p>{item.summary}</p>}
              <RichText html={item.body} />
              {item.anonymised && overview.body && (
                <p className="text-muted mt-5"><small>{overview.body}</small></p>
              )}
            </div>

            <div className="col-lg-4 sidebar pl-lg-5 ftco-animate">
              <div className="sidebar-box ftco-animate">
                <h3>{details.heading}</h3>
                <ul className="list-unstyled">
                  <li className="mb-2"><strong>{dl.forum}</strong> {item.forum}</li>
                  <li className="mb-2"><strong>{dl.year}</strong> {item.year}</li>
                  <li className="mb-2"><strong>{dl.represented}</strong> {term(terms, 'party', item.partyRepresented)}</li>
                  <li className="mb-2"><strong>{dl.outcome}</strong> {term(terms, 'outcome', item.outcome)}</li>
                  {item.practiceArea && (
                    <li className="mb-2">
                      <strong>{dl.practiceArea}</strong>{' '}
                      <Link to={`/services/${item.practiceArea.slug}`}>{item.practiceArea.title}</Link>
                    </li>
                  )}
                </ul>
              </div>

              {(sidebar.heading || sidebar.body || sidebar.cta?.label) && (
                <div className="sidebar-box ftco-animate">
                  {sidebar.heading && <h3>{sidebar.heading}</h3>}
                  {sidebar.body && <p>{sidebar.body}</p>}
                  {sidebar.cta?.label && (
                    <p><SmartLink href={sidebar.cta.href} className="btn btn-primary">{sidebar.cta.label}</SmartLink></p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
