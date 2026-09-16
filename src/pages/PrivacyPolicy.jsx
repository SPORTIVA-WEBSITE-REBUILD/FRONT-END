import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import RichText from '../components/RichText.jsx';
import { LoadingSection, ErrorState } from '../components/states.jsx';
import { usePage, section } from '../hooks/useContent.js';

export default function PrivacyPolicy() {
  const { data: page, isLoading, isError, error, refetch } = usePage('privacy-policy');
  const body = section(page, 'body');

  return (
    <>
      <Seo seo={page?.seo} title={page?.title || 'Privacy Policy'} path="/privacy-policy" />
      <PageHero
        title={body.heading || 'Privacy Policy'}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]}
      />

      <section className="ftco-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-9 ftco-animate">
              {isLoading && <LoadingSection rows={10} />}
              {isError && <ErrorState error={error} onRetry={refetch} />}
              <RichText html={body.body} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
