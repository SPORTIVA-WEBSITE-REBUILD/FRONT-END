import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import RichText from "../components/RichText.jsx";
import PageBanner from "../components/template/PageBanner.jsx";
import { LoadingSection, ErrorState } from "../components/states.jsx";
import {
  useLayout,
  usePage,
  useVacancy,
  section,
} from "../hooks/useContent.js";
import { longDate, term } from "../lib/format.js";
import { graph, jobPosting, breadcrumbs } from "../lib/structuredData.js";

/** A single job, laid out like practice-single.html. */
export default function VacancyDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: result, isLoading, isError, error } = useVacancy(slug);
  const { data: page } = usePage("vacancy-detail");
  const layout = useLayout();

  const vacancy = result?.data;
  const redirectTo = result?.meta?.redirectTo;

  useEffect(() => {
    if (redirectTo && redirectTo !== slug)
      navigate(`/careers/${redirectTo}`, { replace: true });
  }, [redirectTo, slug, navigate]);

  if (isLoading)
    return (
      <div className="container py-5">
        <LoadingSection rows={8} />
      </div>
    );
  if (isError)
    return (
      <div className="container py-5">
        <ErrorState error={error} />
      </div>
    );

  const settings = layout.settings;
  const terms = layout.labels("jobTerms");
  const hero = section(page, "hero");
  const parent = { label: hero.labels?.parent, href: "/careers" };
  const apply = section(page, "apply");
  const closed = section(page, "closed");
  const d = section(page, "details").labels || {};

  const inbox =
    vacancy.applyEmail || settings.careersEmail || settings.contact?.email;
  const applyHref =
    vacancy.applyUrl ||
    (inbox
      ? `mailto:${inbox}?subject=${encodeURIComponent(vacancy.title)}`
      : null);

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
            { label: "Home", href: "/" },
            { label: parent.label, href: parent.href },
            { label: vacancy.title },
          ]),
        )}
      />
      <PageBanner title={vacancy.title} image={hero.image} parent={parent} />

      <section className="ftco-section ftco-degree-bg">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 ftco-animate">
              {vacancy.isClosed && closed.body && (
                <div
                  className="pcn-form-alert pcn-form-alert--error"
                  role="status"
                >
                  {closed.body}
                </div>
              )}
              <h1 className="pcn-matter-title mb-2">{vacancy.title}</h1>
              <div className="pcn-career-card__tags mb-4">
                {vacancy.employmentType && (
                  <span className="pcn-career-pill">
                    {term(terms, "", vacancy.employmentType)}
                  </span>
                )}
                {vacancy.workplaceType && (
                  <span className="pcn-career-pill">
                    {term(terms, "", vacancy.workplaceType)}
                  </span>
                )}
                {vacancy.location && (
                  <span className="pcn-career-pill">{vacancy.location}</span>
                )}
              </div>
              {vacancy.summary && (
                <p
                  className="lead mb-4"
                  style={{ color: "var(--ink-2)", fontSize: "1.1rem" }}
                >
                  {vacancy.summary}
                </p>
              )}
              <RichText html={vacancy.description} />

              {vacancy.responsibilities?.length > 0 && (
                <div className="mt-5 pt-2">
                  <h2
                    className="mb-3"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.45rem",
                      fontWeight: 600,
                    }}
                  >
                    {d.responsibilities}
                  </h2>
                  <ul className="pcn-qualification-list">
                    {vacancy.responsibilities.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {vacancy.requirements?.length > 0 && (
                <div className="mt-4 pt-2">
                  <h2
                    className="mb-3"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.45rem",
                      fontWeight: 600,
                    }}
                  >
                    {d.requirements}
                  </h2>
                  <ul className="pcn-qualification-list">
                    {vacancy.requirements.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="col-lg-4 sidebar pl-lg-5 ftco-animate pcn-sidebar">
              <div className="sidebar-box ftco-animate">
                <h3>{d.glance}</h3>
                <ul className="list-unstyled mb-0">
                  {vacancy.location && (
                    <li className="mb-2">
                      <strong>{d.location}</strong> {vacancy.location}
                    </li>
                  )}
                  <li className="mb-2">
                    <strong>{d.type}</strong>{" "}
                    {term(terms, "", vacancy.employmentType)}
                  </li>
                  {vacancy.workplaceType && (
                    <li className="mb-2">
                      <strong>{d.arrangement}</strong>{" "}
                      {term(terms, "", vacancy.workplaceType)}
                    </li>
                  )}
                  {vacancy.department && (
                    <li className="mb-2">
                      <strong>{d.team}</strong> {vacancy.department}
                    </li>
                  )}
                  {vacancy.salaryRange && (
                    <li className="mb-2">
                      <strong>{d.salary}</strong> {vacancy.salaryRange}
                    </li>
                  )}
                  {vacancy.closingDate && (
                    <li className="mb-2">
                      <strong>{d.closes}</strong>{" "}
                      <time dateTime={vacancy.closingDate}>
                        {longDate(vacancy.closingDate)}
                      </time>
                    </li>
                  )}
                </ul>
              </div>

              {!vacancy.isClosed && applyHref && (
                <div className="sidebar-box ftco-animate">
                  <h3>{apply.heading}</h3>
                  {apply.body && <p>{apply.body}</p>}
                  <p className="mb-0">
                    <a
                      className="btn btn-primary btn-block text-center"
                      href={applyHref}
                      {...(vacancy.applyUrl
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {apply.cta?.label}
                    </a>
                  </p>
                </div>
              )}

              <div className="sidebar-box ftco-animate">
                <h3>{d.otherOpenings}</h3>
                <p className="mb-0">
                  <Link to="/careers" className="btn btn-primary">
                    {d.viewAll}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
