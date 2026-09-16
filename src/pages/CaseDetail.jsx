import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import RichText from '../components/RichText.jsx';
import SmartImage from '../components/SmartImage.jsx';
import { LoadingSection, ErrorState } from '../components/states.jsx';
import { useCase, useSiteSettings } from '../hooks/useContent.js';
import { graph, article as articleSchema, breadcrumbs } from '../lib/structuredData.js';

const PARTY_LABELS = {
  athlete: 'Athlete', club: 'Club', federation: 'Federation',
  agent: 'Agent', sponsor: 'Sponsor', other: 'Other',
};

export default function CaseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: result, isLoading, isError, error } = useCase(slug);
  const { data: siteData } = useSiteSettings();

  const item = result?.data;
  const redirectTo = result?.meta?.redirectTo;

  // The administrator renamed this slug; send the visitor (and any crawler) to
  // the current URL rather than serving the same page at two addresses.
  useEffect(() => {
    if (redirectTo && redirectTo !== slug) {
      navigate(`/record/${redirectTo}`, { replace: true });
    }
  }, [redirectTo, slug, navigate]);

  if (isLoading) return <div className="container py-5"><LoadingSection rows={8} /></div>;
  if (isError) return <div className="container py-5"><ErrorState error={error} title="Case not found" /></div>;

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
          breadcrumbs([
            { label: 'Home', href: '/' },
            { label: 'Record', href: '/record' },
            { label: item.title },
          ]),
        )}
      />
      <PageHero
        title={item.title}
        image={item.featuredImage}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Record', href: '/record' }, { label: item.title }]}
      />

      <section className="ftco-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 ftco-animate">
              <div className="pcn-meta mb-4">
                <span className="pcn-badge">{item.forum}</span>
                <span className="pcn-badge">{item.year}</span>
                <span className="pcn-badge">{PARTY_LABELS[item.partyRepresented]}</span>
                <span className={`pcn-badge pcn-badge--${item.outcome}`}>{item.outcome}</span>
              </div>

              {item.featuredImage && (
                <SmartImage
                  media={item.featuredImage}
                  width={1200}
                  className="img-fluid mb-4"
                  sizes="(max-width: 992px) 100vw, 66vw"
                  priority
                />
              )}

              <h2 className="mb-3">Overview</h2>
              <p className="lead">{item.summary}</p>

              <RichText html={item.body} />

              {item.anonymised && (
                <p className="text-muted mt-5">
                  <small>
                    Details of this matter have been anonymised. Nothing on this page
                    is legal advice or a guarantee of any particular outcome.
                  </small>
                </p>
              )}
            </div>

            <div className="col-lg-4 sidebar pl-lg-5 ftco-animate">
              <div className="sidebar-box">
                <h3 className="heading">Matter details</h3>
                <ul className="list-unstyled">
                  <li className="mb-2"><strong>Forum:</strong> {item.forum}</li>
                  <li className="mb-2"><strong>Year:</strong> {item.year}</li>
                  <li className="mb-2"><strong>Represented:</strong> {PARTY_LABELS[item.partyRepresented]}</li>
                  <li className="mb-2"><strong>Outcome:</strong> {item.outcome}</li>
                  {item.practiceArea && (
                    <li className="mb-2">
                      <strong>Practice area:</strong>{' '}
                      <Link to={`/services/${item.practiceArea.slug}`}>{item.practiceArea.title}</Link>
                    </li>
                  )}
                </ul>
              </div>

              <div className="sidebar-box">
                <h3 className="heading">Discuss a similar matter</h3>
                <p>If your situation resembles this one, the firm can advise on your options.</p>
                <Link to="/contact" className="btn btn-primary py-2 px-4">Make an enquiry</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
