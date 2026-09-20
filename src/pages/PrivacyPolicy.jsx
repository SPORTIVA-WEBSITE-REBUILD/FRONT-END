import Seo from "../components/Seo.jsx";
import RichText from "../components/RichText.jsx";
import PageBanner from "../components/template/PageBanner.jsx";
import { LoadingSection, ErrorState } from "../components/states.jsx";
import { usePage, section } from "../hooks/useContent.js";

export default function PrivacyPolicy() {
  const {
    data: page,
    isLoading,
    isError,
    error,
    refetch,
  } = usePage("privacy-policy");
  const hero = section(page, "hero");

  return (
    <>
      <Seo seo={page?.seo} title={page?.title} path="/privacy-policy" />
      <PageBanner
        title={hero.heading || page?.title}
        crumb={hero.subheading}
        image={hero.image}
      />
      <section className="ftco-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-9 ftco-animate">
              <div className="pcn-document-panel p-4 p-md-5 bg-white">
                {isLoading && <LoadingSection rows={10} />}
                {isError && <ErrorState error={error} onRetry={refetch} />}
                <RichText html={section(page, "body").body} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
