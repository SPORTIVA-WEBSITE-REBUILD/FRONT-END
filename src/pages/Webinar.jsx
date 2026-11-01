import Seo from '../components/Seo.jsx';
import SpeakersSection from '../components/SpeakersSection.jsx';
import WebinarRegistrationForm from '../components/WebinarRegistrationForm.jsx';
import { LoadingSection, ErrorState } from '../components/states.jsx';
import { useWebinar } from '../hooks/useWebinar.js';
import { webinarDateChip } from '../lib/format.js';
import { graph, breadcrumbs } from '../lib/structuredData.js';

/**
 * Standalone page for the webinar — always reachable at /webinar until the
 * end time (not only while the home page hero is showing it), so a shared
 * link/social post works on its own. The Meet link is never rendered here
 * either; see WebinarHero.jsx for the same note.
 */
export default function Webinar() {
  const { data: webinar, isLoading, isError, error, refetch } = useWebinar();

  const chip = webinar ? webinarDateChip(webinar.startsAt, webinar.endsAt, webinar.timezone) : '';
  const description = webinar?.description
    || (webinar?.title ? `${webinar.title} — ${chip}.` : undefined);

  return (
    <>
      <Seo
        title={webinar?.title}
        description={description}
        image={webinar?.shareImageUrl || webinar?.bannerUrl}
        path="/webinar"
        type="website"
        jsonLd={webinar ? graph(breadcrumbs([
          { label: 'Home', href: '/' },
          { label: webinar.title },
        ])) : null}
      />

      <section className="ftco-section pcn-webinar-page-hero">
        <div className="container">
          {isLoading && <LoadingSection rows={4} />}
          {isError && <ErrorState error={error} onRetry={refetch} />}

          {webinar && webinar.hasEnded && (
            <div className="row justify-content-center text-center">
              <div className="col-md-8">
                <h1 className="mb-3">{webinar.title}</h1>
                <p className="lead">This webinar has ended. Thank you for joining.</p>
                {webinar.recordingUrl && (
                  <p>
                    <a href={webinar.recordingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary pcn-cta">
                      Watch the recording
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          {webinar && !webinar.hasEnded && (
            <div className="row align-items-start">
              <div className="col-lg-7">
                {webinar.bannerUrl && (
                  <img
                    src={webinar.bannerUrl}
                    alt={webinar.title}
                    width={480}
                    height={600}
                    className="pcn-webinar-hero__banner mb-4"
                  />
                )}
                <h1 className="mb-3">{webinar.title}</h1>
                {webinar.subtitle && <p className="lead">{webinar.subtitle}</p>}
                {chip && (
                  <div className="pcn-webinar-hero__chip pcn-webinar-page-hero__chip">
                    <span className="icon-calendar" aria-hidden="true" /> {chip}, Google Meet
                  </div>
                )}
                {webinar.description && <p className="mt-4">{webinar.description}</p>}

                {webinar.faq?.some((f) => f.answer) && (
                  <div className="mt-5">
                    <h2 className="mb-3">Frequently asked questions</h2>
                    {[...webinar.faq]
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .filter((f) => f.answer)
                      .map((f) => (
                        <div className="pcn-webinar-speaker-card mb-3 text-left" key={f.question}>
                          <strong style={{ color: 'var(--blue)' }}>{f.question}</strong>
                          <p className="mb-0 mt-2">{f.answer}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <div className="col-lg-5">
                <div className="pcn-webinar-hero__card">
                  <h2 className="pcn-webinar-hero__card-heading">Register for this webinar</h2>
                  <WebinarRegistrationForm idPrefix="webinar-page" registrationOpen={webinar.registrationOpen} />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {webinar && !webinar.hasEnded && <SpeakersSection speakers={webinar.speakers} />}
    </>
  );
}
