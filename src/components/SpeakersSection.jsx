/**
 * Plain text cards — no banner image required to read any of this, per the
 * brief: "A visitor must be able to read everything without the banner
 * image." Shown directly below the webinar hero while it is active, and on
 * the standalone /webinar page.
 */
export default function SpeakersSection({ speakers = [] }) {
  if (!speakers.length) return null;
  const sorted = [...speakers].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <section className="ftco-section ftco-no-pt pcn-webinar-speakers">
      <div className="container">
        <div className="row justify-content-center mb-4">
          <div className="col-md-7 text-center heading-section ftco-animate">
            <span className="subheading">Speakers</span>
            <h2>Meet your speakers</h2>
          </div>
        </div>
        <div className="row">
          {sorted.map((speaker) => (
            <div className="col-md-4 mb-4 ftco-animate" key={speaker.name}>
              <div className="pcn-webinar-speaker-card">
                {speaker.photoUrl ? (
                  <img
                    src={speaker.photoUrl}
                    alt={speaker.name}
                    width={96}
                    height={96}
                    className="pcn-webinar-speaker-card__photo"
                  />
                ) : (
                  <div className="pcn-webinar-speaker-card__photo pcn-webinar-speaker-card__photo--placeholder" aria-hidden="true" />
                )}
                <div className="pcn-webinar-speaker-card__role">{speaker.role}</div>
                <h3 className="pcn-webinar-speaker-card__name">{speaker.name}</h3>
                {(speaker.titleLines || []).filter(Boolean).map((line) => (
                  <div className="pcn-webinar-speaker-card__title" key={line}>{line}</div>
                ))}
                {speaker.shortBio && <p className="pcn-webinar-speaker-card__bio">{speaker.shortBio}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
