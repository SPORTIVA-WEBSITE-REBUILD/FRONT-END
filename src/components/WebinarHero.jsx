import { webinarDateChip } from '../lib/format.js';
import WebinarRegistrationForm from './WebinarRegistrationForm.jsx';

/**
 * Full-width header (eyebrow, title, date pill), all centred, above a
 * two-column row of equal-height cards (banner left, registration form
 * right) — see .pcn-webinar-hero in app.css. Below 1024px the two cards
 * stack via a grid-area reorder (form card first, banner second), per the
 * brief's explicit mobile/tablet order; CSS handles that reordering so this
 * component's DOM order does not need to change per breakpoint.
 *
 * The Meet link is never rendered here or anywhere else on the public
 * site — see getWebinar()/the API's publicFields(), which never includes
 * it at all, so there is nothing to accidentally leak even by mistake.
 */
export default function WebinarHero({ webinar }) {
  const chip = webinarDateChip(webinar.startsAt, webinar.endsAt, webinar.timezone);

  return (
    <section className="pcn-webinar-hero">
      <div className="container">
        <div className="pcn-webinar-hero__intro">
          <span className="pcn-webinar-hero__eyebrow">Free webinar</span>
          <h1 className="pcn-webinar-hero__title">{webinar.title}</h1>
          {chip && (
            <div className="pcn-webinar-hero__chip">
              <span className="icon-calendar" aria-hidden="true" /> {chip}, Google Meet
            </div>
          )}
        </div>

        <div className="pcn-webinar-hero__grid">
          <div className="pcn-webinar-hero__banner-card">
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

          <div className="pcn-webinar-hero__card">
            <h2 className="pcn-webinar-hero__card-heading">Register for this webinar</h2>
            <WebinarRegistrationForm idPrefix="webinar-hero" registrationOpen={webinar.registrationOpen} webinar={webinar} />
          </div>
        </div>
      </div>
    </section>
  );
}
