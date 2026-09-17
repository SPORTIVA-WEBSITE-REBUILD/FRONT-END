import { Link } from 'react-router-dom';
import SmartLink from './SmartLink.jsx';
import { SectionHeading } from './cards.jsx';
import { useLayout, useVacancies } from '../../hooks/useContent.js';
import { longDate, term } from '../../lib/format.js';

/**
 * "We're hiring" on the home page: each open role with its type, location and
 * closing date, and a link to it. Renders nothing while no role is open.
 */
export default function HiringStrip({ section }) {
  const { data: vacancies } = useVacancies();
  const jobTerms = useLayout().labels('jobTerms');
  const labels = section.labels || {};
  const roles = (vacancies || []).slice(0, 3);
  if (!roles.length) return null;

  return (
    <section className="ftco-section ftco-no-pt">
      <div className="container">
        <SectionHeading section={section} />
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {roles.map((v) => (
              <div className="pcn-role ftco-animate" key={v.slug}>
                <div className="pcn-role__text">
                  <h3 className="pcn-role__title"><Link to={`/careers/${v.slug}`}>{v.title}</Link></h3>
                  <p className="pcn-role__meta">
                    {[
                      term(jobTerms, '', v.employmentType),
                      v.location,
                      v.closingDate ? `${labels.closes} ${longDate(v.closingDate)}` : null,
                    ].filter(Boolean).join(' · ')}
                  </p>
                  {v.summary && <p className="pcn-role__summary pcn-clamp pcn-clamp--2">{v.summary}</p>}
                </div>
                <Link to={`/careers/${v.slug}`} className="btn btn-primary px-4">{labels.viewRole}</Link>
              </div>
            ))}
            {section.cta?.label && (vacancies || []).length > roles.length && (
              <p className="text-center mt-4">
                <SmartLink href={section.cta.href} className="btn btn-primary px-5">{section.cta.label}</SmartLink>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
