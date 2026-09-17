import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import RichText from '../components/RichText.jsx';
import SmartImage from '../components/SmartImage.jsx';
import SocialIcon, { hasIcon, platformLabel } from '../components/SocialIcon.jsx';
import PageBanner from '../components/template/PageBanner.jsx';
import { LoadingSection, ErrorState } from '../components/states.jsx';
import { useLawyer, usePage, section } from '../hooks/useContent.js';
import { safeHref } from '../lib/links.js';
import { graph, person, breadcrumbs } from '../lib/structuredData.js';

/** A team member's profile, laid out like practice-single.html. */
export default function LawyerDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: result, isLoading, isError, error } = useLawyer(slug);
  const { data: page } = usePage('lawyer-detail');

  const lawyer = result?.data;
  const redirectTo = result?.meta?.redirectTo;

  useEffect(() => {
    if (redirectTo && redirectTo !== slug) navigate(`/lawyers/${redirectTo}`, { replace: true });
  }, [redirectTo, slug, navigate]);

  if (isLoading) return <div className="container py-5"><LoadingSection rows={8} /></div>;
  if (isError) return <div className="container py-5"><ErrorState error={error} /></div>;

  const hero = section(page, 'hero');
  const parent = { label: hero.labels?.parent, href: '/lawyers' };
  const socials = (lawyer.socials || [])
    .map((s) => ({ ...s, url: safeHref(s.url) }))
    .filter((s) => s.url && hasIcon(s.platform));

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
          breadcrumbs([{ label: 'Home', href: '/' }, { label: parent.label, href: parent.href }, { label: lawyer.name }]),
        )}
      />
      <PageBanner title={lawyer.name} image={hero.image} parent={parent} />

      <section className="ftco-section ftco-degree-bg">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 ftco-animate">
              {lawyer.photo && (
                <p>
                  <SmartImage media={lawyer.photo} width={900} height={1000} crop="fill" gravity="faces" className="img-fluid" sizes="(max-width: 992px) 100vw, 66vw" priority alt={lawyer.name} />
                </p>
              )}
              <h2 className="mb-3">{lawyer.name}</h2>
              {lawyer.role && <p className="position">{lawyer.role}</p>}
              <RichText html={lawyer.bio} />

              {lawyer.qualifications?.length > 0 && (
                <>
                  <h2 className="mb-3 mt-5">{section(page, 'qualifications').heading}</h2>
                  <ul>{lawyer.qualifications.map((q) => <li key={q}>{q}</li>)}</ul>
                </>
              )}
            </div>

            <div className="col-lg-4 sidebar pl-lg-5 ftco-animate">
              {(lawyer.email || lawyer.phone || socials.length > 0) && (
                <div className="sidebar-box ftco-animate">
                  <h3>{section(page, 'contact').heading}</h3>
                  <ul className="list-unstyled">
                    {lawyer.email && <li className="mb-2"><a href={`mailto:${lawyer.email}`}>{lawyer.email}</a></li>}
                    {lawyer.phone && <li className="mb-2"><a href={`tel:${lawyer.phone.replace(/[^\d+]/g, '')}`}>{lawyer.phone}</a></li>}
                  </ul>
                  {socials.length > 0 && (
                    <ul className="ftco-footer-social list-unstyled">
                      {socials.map((s) => (
                        <li key={`${s.platform}-${s.url}`}>
                          <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`${lawyer.name} ${platformLabel(s.platform)}`}>
                            <SocialIcon platform={s.platform} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {lawyer.practiceAreas?.length > 0 && (
                <div className="sidebar-box ftco-animate">
                  <div className="categories">
                    <h3>{section(page, 'practiceAreas').heading}</h3>
                    {lawyer.practiceAreas.map((p) => (
                      <li key={p.slug}><Link to={`/services/${p.slug}`}>{p.title} <span className="ion-ios-arrow-forward" /></Link></li>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
