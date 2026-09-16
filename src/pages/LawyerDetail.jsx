import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import RichText from '../components/RichText.jsx';
import SmartImage from '../components/SmartImage.jsx';
import { LoadingSection, ErrorState } from '../components/states.jsx';
import { useLawyer } from '../hooks/useContent.js';
import { graph, person, breadcrumbs } from '../lib/structuredData.js';
import SocialIcon, { hasIcon, platformLabel } from '../components/SocialIcon.jsx';
import { safeHref } from '../lib/links.js';

export default function LawyerDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: result, isLoading, isError, error } = useLawyer(slug);

  const lawyer = result?.data;
  const redirectTo = result?.meta?.redirectTo;

  useEffect(() => {
    if (redirectTo && redirectTo !== slug) {
      navigate(`/lawyers/${redirectTo}`, { replace: true });
    }
  }, [redirectTo, slug, navigate]);

  if (isLoading) return <div className="container py-5"><LoadingSection rows={8} /></div>;
  if (isError) return <div className="container py-5"><ErrorState error={error} title="Profile not found" /></div>;

  return (
    <>
      <Seo
        seo={lawyer.seo}
        title={lawyer.name}
        description={lawyer.role}
        image={lawyer.photo}
        path={`/lawyers/${lawyer.slug}`}
        type="profile"
        jsonLd={graph(
          person(lawyer),
          breadcrumbs([
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about' },
            { label: lawyer.name },
          ]),
        )}
      />
      <PageHero
        title={lawyer.name}
        image={lawyer.photo}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'About', href: '/about' }, { label: lawyer.name }]}
      />

      <section className="ftco-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4">
              {lawyer.photo && (
                <SmartImage
                  media={lawyer.photo}
                  width={600}
                  height={720}
                  crop="fill"
                  className="img-fluid"
                  sizes="(max-width: 992px) 100vw, 33vw"
                  priority
                />
              )}

              <div className="sidebar-box mt-4">
                <h3 className="heading">Contact</h3>
                <ul className="list-unstyled">
                  {lawyer.email && (
                    <li><a href={`mailto:${lawyer.email}`}>{lawyer.email}</a></li>
                  )}
                  {lawyer.phone && (
                    <li><a href={`tel:${lawyer.phone.replace(/\s/g, '')}`}>{lawyer.phone}</a></li>
                  )}
                </ul>
                {(() => {
                  const links = (lawyer.socials || [])
                    .map((s) => ({ ...s, url: safeHref(s.url) }))
                    .filter((s) => s.url && hasIcon(s.platform));
                  if (!links.length) return null;
                  return (
                    <ul className="ftco-footer-social list-unstyled">
                      {links.map((s) => (
                        <li key={`${s.platform}-${s.url}`}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${lawyer.name} on ${platformLabel(s.platform)}`}
                          >
                            <SocialIcon platform={s.platform} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            </div>

            <div className="col-lg-8 pl-lg-5 ftco-animate">
              <h2 className="mb-1">{lawyer.name}</h2>
              {lawyer.role && <span className="position d-block mb-4">{lawyer.role}</span>}

              <RichText html={lawyer.bio} />

              {lawyer.qualifications?.length > 0 && (
                <>
                  <h3 className="mt-5 mb-3 h4">Qualifications</h3>
                  <ul>
                    {lawyer.qualifications.map((q) => <li key={q}>{q}</li>)}
                  </ul>
                </>
              )}

              {lawyer.practiceAreas?.length > 0 && (
                <>
                  <h3 className="mt-5 mb-3 h4">Practice areas</h3>
                  <ul className="list-unstyled">
                    {lawyer.practiceAreas.map((p) => (
                      <li key={p.slug}><Link to={`/services/${p.slug}`}>{p.title}</Link></li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
