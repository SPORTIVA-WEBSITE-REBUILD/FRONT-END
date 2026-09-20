import Seo from "../components/Seo.jsx";
import PageBanner from "../components/template/PageBanner.jsx";
import { TeamCard } from "../components/template/cards.jsx";
import { LoadingCards, ErrorState } from "../components/states.jsx";
import { usePage, useLawyers, section } from "../hooks/useContent.js";
import { graph, breadcrumbs } from "../lib/structuredData.js";

/** attorneys.html */
export default function Lawyers() {
  const { data: page } = usePage("lawyers");
  const { data: lawyers, isLoading, isError, error, refetch } = useLawyers();
  const hero = section(page, "hero");

  return (
    <>
      <Seo
        seo={page?.seo}
        title={page?.title}
        path="/lawyers"
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
          {isError && <ErrorState error={error} onRetry={refetch} />}
          {isLoading && <LoadingCards count={3} col="col-lg-4 col-md-6" />}
          <div className="row justify-content-center">
            {(lawyers || []).map((l) => (
              <div className="col-lg-4 col-md-6 mb-4" key={l.slug}>
                <TeamCard lawyer={l} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
