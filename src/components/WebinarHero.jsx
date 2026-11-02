import { webinarDateChip } from '../lib/format.js';
import WebinarRegistrationForm from './WebinarRegistrationForm.jsx';

/**
 * Replaces the sliding hero on the home page while GET /api/webinar reports
 * isHeroActive. Three pieces laid out with CSS Grid named areas (see
 * .pcn-webinar-hero in app.css): on desktop, title+chip and the banner
 * stack in a left column beside the registration card; on mobile the order
 * is title+chip, then the card, then the banner — the brief's explicit
 * order. Grid areas do this cleanly where nested Bootstrap columns could
 * not reorder two pieces of one "column" independently of each other.
 *
 * The Meet link is never rendered here or anywhere else on the public
 * site — see getWebinar()/the API's publicFields(), which never includes
 * it at all, so there is nothing to accidentally leak even by mistake.
 */
export default function WebinarHero({ webinar }) {
  const chip = webinarDateChip(webinar.startsAt, webinar.endsAt, webinar.timezone);

  return (
    <section className="pcn-webinar-hero">
      <div className="container pcn-webinar-hero__grid">
        <div className="pcn-webinar-hero__banner-col">
          {webinar.bannerUrl && (
            <img
              src={webinar.bannerUrl}
              alt={webinar.title}
              width={480}
              height={600}
              className="pcn-webinar-hero__banner"
            />
          )}
        </div>

        <div className="pcn-webinar-hero__intro">
          <span className="pcn-webinar-hero__eyebrow">Free webinar</span>
          {chip && (
            <div className="pcn-webinar-hero__chip">
              <span className="icon-calendar" aria-hidden="true" /> {chip}, Google Meet
            </div>
          )}
          <h1 className="pcn-webinar-hero__title">{webinar.title}</h1>
        </div>

        <div className="pcn-webinar-hero__card">
          <h2 className="pcn-webinar-hero__card-heading">Register for this webinar</h2>
          <WebinarRegistrationForm idPrefix="webinar-hero" registrationOpen={webinar.registrationOpen} webinar={webinar} />
        </div>
      </div>
    </section>
  );
}
