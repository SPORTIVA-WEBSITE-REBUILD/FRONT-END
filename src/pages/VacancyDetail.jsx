import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import RichText from '../components/RichText.jsx';
import { LoadingSection, ErrorState } from '../components/states.jsx';
import { useVacancy, useSiteSettings } from '../hooks/useContent.js';
import { graph, jobPosting, breadcrumbs } from '../lib/structuredData.js';

const TYPE_LABELS = {
  full_time: 'Full time', part_time: 'Part time', contract: 'Contract',
  internship: 'Internship', pupillage: 'Pupillage', nysc: 'NYSC placement',
};

const WORKPLACE_LABELS = { on_site: 'On site', hybrid: 'Hybrid', remote: 'Remote' };

export default function VacancyDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: result, isLoading, isError, error } = useVacancy(slug);
  const { data: siteData } = useSiteSettings();

  const vacancy = result?.data;
  const redirectTo = result?.meta?.redirectTo;

  useEffect(() => {
    if (redirectTo && redirectTo !== slug) {
      navigate(`/careers/${redirectTo}`, { replace: true });
    }
  }, [redirectTo, slug, navigate]);

  if (isLoading) return <div className="container py-5"><LoadingSection rows={8} /></div>;
  if (isError) return <div className="container py-5"><ErrorState error={error} title="Position not found" /></div>;

  const settings = siteData?.settings || {};
  const inbox = vacancy.applyEmail || settings.careersEmail || settings.contact?.email;
  const applyHref = vacancy.applyUrl
    || (inbox ? `mailto:${inbox}?subject=${encodeURIComponent(`Application: ${vacancy.title}`)}` : null);

  return (
    <>
      <Seo
        seo={vacancy.seo}
        title={vacancy.title}
        description={vacancy.summary}
        path={`/careers/${vacancy.slug}`}
        jsonLd={graph(
          jobPosting(vacancy, settings),
          breadcrumbs([
            { label: 'Home', href: '/' },
            { label: 'Careers', href: '/careers' },
            { label: vacancy.title },
          ]),
        )}
      />
      <PageHero
        title={vacancy.title}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Careers', href: '/careers' }, { label: vacancy.title }]}
      />

      <section className="ftco-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 ftco-animate">
              {vacancy.isClosed && (
                <div className="pcn-form-alert pcn-form-alert--error" role="status">
                  Applications for this position have closed.{' '}
                  <Link to="/careers">See our current openings</Link>.
                </div>
              )}

              <div className="pcn-meta mb-4">
                <span className="pcn-badge">{TYPE_LABELS[vacancy.employmentType] || vacancy.employmentType}</span>
                <span className="pcn-badge">{vacancy.location}</span>
                {vacancy.workplaceType && <span className="pcn-badge">{WORKPLACE_LABELS[vacancy.workplaceType]}</span>}
                {vacancy.department && <span className="pcn-badge">{vacancy.department}</span>}
              </div>

              <p className="lead">{vacancy.summary}</p>

              <RichText html={vacancy.description} />

              {vacancy.responsibilities?.length > 0 && (
                <>
                  <h3 className="mt-5 mb-3 h4">What you will do</h3>
                  <ul>{vacancy.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>
                </>
              )}

              {vacancy.requirements?.length > 0 && (
                <>
                  <h3 className="mt-5 mb-3 h4">What we are looking for</h3>
                  <ul>{vacancy.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
                </>
              )}
            </div>

            <div className="col-lg-4 sidebar pl-lg-5 ftco-animate">
              <div className="sidebar-box">
                <h3 className="heading">At a glance</h3>
                <ul className="list-unstyled">
                  <li className="mb-2"><strong>Location:</strong> {vacancy.location}</li>
                  <li className="mb-2"><strong>Type:</strong> {TYPE_LABELS[vacancy.employmentType]}</li>
                  {vacancy.workplaceType && (
                    <li className="mb-2"><strong>Arrangement:</strong> {WORKPLACE_LABELS[vacancy.workplaceType]}</li>
                  )}
                  {vacancy.department && <li className="mb-2"><strong>Team:</strong> {vacancy.department}</li>}
                  {vacancy.salaryRange && <li className="mb-2"><strong>Salary:</strong> {vacancy.salaryRange}</li>}
                  {vacancy.closingDate && (
                    <li className="mb-2">
                      <strong>Closes:</strong>{' '}
                      <time dateTime={vacancy.closingDate}>
                        {new Date(vacancy.closingDate).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </time>
                    </li>
                  )}
                </ul>
              </div>

              {!vacancy.isClosed && applyHref && (
                <div className="sidebar-box">
                  <h3 className="heading">Apply</h3>
                  <p>
                    {vacancy.applyUrl
                      ? 'Applications are handled on our recruitment page.'
                      : 'Send your CV and a short covering note, quoting the role title.'}
                  </p>
                  <a
                    className="btn btn-primary py-2 px-4"
                    href={applyHref}
                    {...(vacancy.applyUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    Apply for this role
                  </a>
                </div>
              )}

              <div className="sidebar-box">
                <h3 className="heading">Other openings</h3>
                <Link to="/careers" className="btn btn-primary py-2 px-4">View all roles</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
