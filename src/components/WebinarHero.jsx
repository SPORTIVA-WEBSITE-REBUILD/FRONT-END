import { webinarDateChip } from '../lib/format.js';
import { cloudinaryFaceCrop } from '../lib/cloudinaryFaceCrop.js';
import SocialIcon, { hasIcon } from './SocialIcon.jsx';
import WebinarRegistrationForm from './WebinarRegistrationForm.jsx';

/**
 * Full-width header (eyebrow pill, full untruncated title, date pill), all
 * centred, above a two-column row of equal-height areas: speakers left,
 * registration form right — see .pcn-webinar-hero in app.css. Below
 * 1024px they stack via a grid-area reorder (form card first, speakers
 * second), per the brief's mobile/tablet order; CSS handles that
 * reordering so this component's DOM order does not need to change per
 * breakpoint.
 *
 * Speakers come from the same webinar.speakers data as SpeakersSection
 * below the hero — real names/roles/photos pulled from the admin, never
 * hard-coded. The banner image is deliberately never shown here any more
 * (it still exists as the OG/link-preview asset — see Webinar.jsx/the
 * edge function — this component just no longer renders it).
 *
 * "Instagram" stands in for the mockup's "Facebook" icon: the webinar's
 * social links (Webinar.social in the backend) only ever had
 * instagram/x/linkedin fields — there's no facebook field to read a URL
 * from, and adding one would be a backend change, which this task is
 * explicitly scoped to avoid.
 *
 * The Meet link is never rendered here or anywhere else on the public
 * site — see getWebinar()/the API's publicFields(), which never includes
 * it at all, so there is nothing to accidentally leak even by mistake.
 */
export default function WebinarHero({ webinar }) {
  const rawChip = webinarDateChip(webinar.startsAt, webinar.endsAt, webinar.timezone);
  // Cosmetic only, for this hero's display — the shared webinarDateChip()
  // format itself is untouched (and explicitly tested elsewhere with no
  // comma after the weekday), so this just re-separates its one comma with
  // a bullet to match the mockup, nothing more.
  const chip = rawChip ? rawChip.split(', ').join(' • ') : '';
  const speakers = [...(webinar.speakers || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  const socialLinks = ['instagram', 'x', 'linkedin']
    .map((platform) => ({ platform, url: webinar.social?.[platform] }))
    .filter((s) => s.url && hasIcon(s.platform));

  return (
    <section className="pcn-webinar-hero">
      <div className="container">
        <div className="pcn-webinar-hero__intro">
          <span className="pcn-webinar-hero__eyebrow">Free webinar</span>
          {webinar.collaborationLine && (
            <p className="pcn-webinar-hero__kicker">
              {webinar.collaborationLogoUrl && (
                <img src={webinar.collaborationLogoUrl} alt="" width={20} height={20} className="pcn-webinar-hero__kicker-logo" />
              )}
              {webinar.collaborationLine}
            </p>
          )}
          <h1 className="pcn-webinar-hero__title">{webinar.title}</h1>
          {chip && (
            <div className="pcn-webinar-hero__chip">
              <span className="icon-calendar" aria-hidden="true" /> {chip} • Google Meet
            </div>
          )}
        </div>

        <div className="pcn-webinar-hero__grid">
          {speakers.length > 0 && (
            <div className="pcn-webinar-hero__speakers-card">
              <h2 className="pcn-webinar-hero__speakers-heading">Meet our speakers</h2>
              <p className="pcn-webinar-hero__speakers-subheading">Learn from our distinguished panel</p>
              <ul className="pcn-webinar-hero__speakers-list">
                {speakers.map((speaker) => (
                  <li className="pcn-webinar-hero__speaker" key={speaker.name}>
                    {speaker.photoUrl ? (
                      // Requested at 2x the largest on-screen size (180px desktop) so it
                      // stays sharp on retina screens — the CSS width/height clamp down
                      // from there per breakpoint, never up.
                      <img
                        src={cloudinaryFaceCrop(speaker.photoUrl, 360)}
                        alt={speaker.name}
                        width={180}
                        height={180}
                        className="pcn-webinar-hero__speaker-photo"
                      />
                    ) : (
                      <div className="pcn-webinar-hero__speaker-photo pcn-webinar-hero__speaker-photo--placeholder" aria-hidden="true" />
                    )}
                    <div className="pcn-webinar-hero__speaker-name">{speaker.name}</div>
                    {speaker.role && <div className="pcn-webinar-hero__speaker-role">{speaker.role}</div>}
                  </li>
                ))}
              </ul>

              {socialLinks.length > 0 && (
                <div className="pcn-webinar-hero__follow">
                  <span className="pcn-webinar-hero__follow-label">Follow us</span>
                  {socialLinks.map(({ platform, url }) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pcn-webinar-hero__follow-icon"
                      aria-label={platform}
                    >
                      <SocialIcon platform={platform} size={16} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="pcn-webinar-hero__card">
            <h2 className="pcn-webinar-hero__card-heading">Register for this webinar</h2>
            <WebinarRegistrationForm idPrefix="webinar-hero" registrationOpen={webinar.registrationOpen} webinar={webinar} />
          </div>
        </div>
      </div>
    </section>
  );
}
