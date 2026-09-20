import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import SmartImage from "../components/SmartImage.jsx";
import RichText from "../components/RichText.jsx";
import PageBanner from "../components/template/PageBanner.jsx";
import SmartLink from "../components/template/SmartLink.jsx";
import { LoadingSection, ErrorState } from "../components/states.jsx";
import {
  useCase,
  useLayout,
  usePage,
  useSiteSettings,
  section,
} from "../hooks/useContent.js";
import { term } from "../lib/format.js";
import {
  graph,
  article as articleSchema,
  breadcrumbs,
} from "../lib/structuredData.js";

/** A single case, laid out like practice-single.html. */
export default function CaseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: result, isLoading, isError, error } = useCase(slug);
  const { data: page } = usePage("case-detail");
  const { data: siteData } = useSiteSettings();
  const terms = useLayout().labels("caseTerms");

  const item = result?.data;
  const redirectTo = result?.meta?.redirectTo;

  useEffect(() => {
    if (redirectTo && redirectTo !== slug)
      navigate(`/record/${redirectTo}`, { replace: true });
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

  const hero = section(page, "hero");
  const parent = { label: hero.labels?.parent, href: "/record" };
  const overview = section(page, "overview");
  const details = section(page, "details");
  const dl = details.labels || {};
  const sidebar = section(page, "sidebar");

  const title = item.anonymised ? "Anonymised Matter" : item.title;

  return (
    <>
      <Seo
        seo={item.seo}
        title={title}
        description={item.summary || item.holding}
        path={`/record/${item.slug}`}
        type="article"
        jsonLd={graph(
          articleSchema(
            { ...item, title, excerpt: item.summary || item.holding },
            siteData?.settings,
            "/record",
          ),
          breadcrumbs([
            { label: "Home", href: "/" },
            { label: parent.label, href: parent.href },
            { label: title },
          ]),
        )}
      />
      <PageBanner title={title} image={hero.image} parent={parent} />

      <section className="ftco-section ftco-degree-bg">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 ftco-animate">
              <div className="pcn-matter-summary">
                <div className="pcn-case__meta mb-2">
                  {[item.forum, item.year, item.country]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
                <h1 className="pcn-matter-title">{title}</h1>
                <div className="d-flex flex-wrap align-items-center mb-0">
                  {item.outcome && (
                    <span
                      className={`pcn-badge pcn-badge--${item.outcome} mr-3`}
                    >
                      {term(terms, "outcome", item.outcome)}
                    </span>
                  )}
                  <span className="pcn-case__party mb-0">
                    Acting for the {item.partyRepresented || "client"}
                    {item.opposingParty && !item.anonymised
                      ? ` · Opposing ${item.opposingParty}`
                      : ""}
                  </span>
                </div>

                {item.holding && (
                  <div className="pcn-holding-callout mt-4 mb-1">
                    <div className="pcn-holding-callout__label">
                      Key Holding & Decision
                    </div>
                    <p className="pcn-holding-callout__text">{item.holding}</p>
                  </div>
                )}
              </div>

              {overview.heading && <h2 className="mb-3">{overview.heading}</h2>}
              {item.summary && (
                <p
                  className="lead mb-4"
                  style={{ color: "var(--ink-2)", fontSize: "1.1rem" }}
                >
                  {item.summary}
                </p>
              )}
              <RichText html={item.body} />
              {item.anonymised && overview.body && (
                <p className="text-muted mt-5">
                  <small>{overview.body}</small>
                </p>
              )}
            </div>

            <div className="col-lg-4 sidebar pl-lg-5 ftco-animate pcn-sidebar">
              <div className="sidebar-box ftco-animate">
                <h3>{details.heading}</h3>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <strong>{dl.forum}</strong> {item.forum}
                  </li>
                  <li className="mb-2">
                    <strong>{dl.year}</strong> {item.year}
                  </li>
                  <li className="mb-2">
                    <strong>{dl.represented}</strong>{" "}
                    {term(terms, "party", item.partyRepresented)}
                  </li>
                  {item.opposingParty && !item.anonymised && (
                    <li className="mb-2">
                      <strong>Opposing Party:</strong> {item.opposingParty}
                    </li>
                  )}
                  {item.country && (
                    <li className="mb-2">
                      <strong>Jurisdiction:</strong> {item.country}
                    </li>
                  )}
                  <li className="mb-2">
                    <strong>{dl.outcome}</strong>{" "}
                    {term(terms, "outcome", item.outcome)}
                  </li>
                  {item.practiceArea && (
                    <li className="mb-2">
                      <strong>{dl.practiceArea}</strong>{" "}
                      <Link to={`/services/${item.practiceArea.slug}`}>
                        {item.practiceArea.title}
                      </Link>
                    </li>
                  )}
                </ul>
              </div>

              {(sidebar.heading || sidebar.body || sidebar.cta?.label) && (
                <div className="sidebar-box ftco-animate">
                  {sidebar.heading && <h3>{sidebar.heading}</h3>}
                  {sidebar.body && <p>{sidebar.body}</p>}
                  {sidebar.cta?.label && (
                    <p className="mb-0">
                      <SmartLink
                        href={sidebar.cta.href}
                        className="btn btn-primary"
                      >
                        {sidebar.cta.label}
                      </SmartLink>
                    </p>
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
