import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import PageBanner from "../components/template/PageBanner.jsx";
import { LoadingCards, ErrorState } from "../components/states.jsx";
import {
  useLayout,
  usePage,
  useVacancies,
  section,
} from "../hooks/useContent.js";
import { longDate, term } from "../lib/format.js";
import { graph, breadcrumbs } from "../lib/structuredData.js";

/** Careers, built from the template's practice-area cards. */
export default function Careers() {
  const { data: page } = usePage("careers");
  const layout = useLayout();
  const {
    data: vacancies,
    isLoading,
    isError,
    error,
    refetch,
  } = useVacancies();

  const hero = section(page, "hero");
  const intro = section(page, "intro");
  const speculative = section(page, "speculative");
  const list = section(page, "list").labels || {};
  const jobTerms = layout.labels("jobTerms");
  const inbox = layout.settings.careersEmail || layout.settings.contact?.email;

  return (
    <>
      <Seo
        seo={page?.seo}
        title={page?.title}
        path="/careers"
        jsonLd={graph(
          breadcrumbs([
            { label: "Home", href: "/" },
            { label: hero.heading || page?.title },
          ]),
        )}
      />
      <PageBanner
        title={hero.heading}
        crumb={hero.subheading}
        image={hero.image}
      />

      <section className="ftco-section">
        <div className="container">
          {(intro.heading || intro.body) && (
            <div className="row justify-content-center mb-5">
              <div className="col-md-8 text-center heading-section ftco-animate">
                {intro.heading && <h2 className="mb-4">{intro.heading}</h2>}
                {intro.body && <p>{intro.body}</p>}
              </div>
            </div>
          )}

          {isError && <ErrorState error={error} onRetry={refetch} />}
          {isLoading && <LoadingCards count={3} />}

          {vacancies?.length === 0 && (
            <div className="row justify-content-center">
              <div className="col-md-8 text-center heading-section ftco-animate">
                <h2 className="mb-4">{speculative.heading}</h2>
                {speculative.body && <p>{speculative.body}</p>}
                {inbox && speculative.cta?.label && (
                  <p>
                    <a
                      className="btn btn-primary py-3 px-4"
                      href={`mailto:${inbox}?subject=${encodeURIComponent(speculative.cta.label)}`}
                    >
                      {speculative.cta.label}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="row d-flex justify-content-center">
            {(vacancies || []).map((v) => (
              <div
                className="col-lg-4 col-md-6 mb-4 d-flex align-items-stretch"
                key={v.slug}
              >
                <div className="pcn-career-card practice-area ftco-animate w-100">
                  <h3 className="pcn-career-card__title">
                    <Link to={`/careers/${v.slug}`}>{v.title}</Link>
                  </h3>
                  <div className="pcn-career-card__tags">
                    {v.employmentType && (
                      <span className="pcn-career-pill">
                        {term(jobTerms, "", v.employmentType)}
                      </span>
                    )}
                    {v.workplaceType && (
                      <span className="pcn-career-pill">
                        {term(jobTerms, "", v.workplaceType)}
                      </span>
                    )}
                    {v.location && (
                      <span className="pcn-career-pill">{v.location}</span>
                    )}
                  </div>
                  {v.summary && (
                    <p className="pcn-career-card__summary pcn-clamp pcn-clamp--3">
                      {v.summary}
                    </p>
                  )}
                  <div className="pcn-career-card__footer">
                    {v.closingDate ? (
                      <span className="text-muted small">
                        <span className="icon icon-calendar mr-1" />{" "}
                        {list.closes} {longDate(v.closingDate)}
                      </span>
                    ) : (
                      <span />
                    )}
                    <Link
                      to={`/careers/${v.slug}`}
                      className="btn btn-primary pcn-btn--sm"
                      aria-label={`${list.viewRole}: ${v.title}`}
                    >
                      {list.viewRole || "View role"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
