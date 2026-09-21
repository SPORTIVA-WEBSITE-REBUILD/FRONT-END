import { Link } from 'react-router-dom';
import ServiceIcon from '../icons.jsx';
import { backgroundStyle } from '../SmartImage.jsx';
import { mediaUrl } from '../../lib/media.js';
import { dateParts, shortDate, term } from '../../lib/format.js';
import { useCommon, useLayout } from '../../hooks/useContent.js';

const bg = (media, width, height) => backgroundStyle(media, null, width, height
  ? { height, crop: 'fill', gravity: 'auto' }
  : {});

/**
 * The whole image fitted into a 4:3 box, the spare space filled with the
 * image's own edge colour (Cloudinary `b_auto`). Case and
 * article images are mostly portrait graphics with a headline along the
 * bottom; cropping them to a wide box cut that headline differently at every
 * screen width. The box keeps its 4:3 shape as it resizes (see app.css), so the
 * image always fits exactly.
 */
const fitted = (media) => backgroundStyle(media, null, 800, { height: 600, crop: 'pad', background: 'auto' });

/**
 * A service card: a line icon, the title, a short summary, and — when the firm
 * has published cases against that practice area — a count of them. The whole
 * card is the link. Used on the home page (four across, two by two) and on the
 * services page.
 */
function ServiceTile({ service }) {
  // Counted from the case collection at request time; see listServices.
  const matters = Number(service.caseCount) || 0;
  return (
    // The whole card is the link, so there is no separate "read more" to click.
    <Link to={`/services/${service.slug}`} className="pcn-service ftco-animate">
      <ServiceIcon slug={service.slug} className="pcn-service__icon" />
      <h3 className="pcn-service__title">{service.title}</h3>
      {service.summary && <p className="pcn-service__summary pcn-clamp pcn-clamp--3">{service.summary}</p>}
      {/* Omitted entirely at zero rather than printing "0 matters". */}
      {matters > 0 && (
        <p className="pcn-service__evidence">
          {matters} {matters === 1 ? 'matter' : 'matters'} in the record
        </p>
      )}
    </Link>
  );
}

/** Home services block card. */
export function ServiceCard({ service }) {
  return (
    <div className="col-md-6 d-flex align-items-stretch mb-4">
      <ServiceTile service={service} />
    </div>
  );
}

/** Services page card. */
export function PracticeCard({ service }) {
  return (
    <div className="col-lg-4 col-md-6 d-flex align-items-stretch mb-4">
      <ServiceTile service={service} />
    </div>
  );
}

/**
 * The card's "acting for" phrase, keyed on the category `partyRepresented`
 * already carries. Deliberately its own short, casual wording rather than
 * the caseTerms labels the filter dropdown uses ("Athlete") — this line
 * reads as a sentence, not a form field.
 */
const ROLE_PHRASE = {
  athlete: 'player',
  club: 'club',
  federation: 'federation',
  agent: 'agent',
  sponsor: 'sponsor',
  other: 'party',
};

/**
 * A case record, rebuilt onto structured fields rather than the social-media
 * graphics and press-release prose it used to lead with: a forum/year
 * metadata line, the matter itself, who the firm acted for and the outcome,
 * and one plain sentence of what was decided. No image — see
 * docs/design-direction.md, "Record cards".
 *
 * The whole card is the link, so there is no separate "read more".
 *
 * An anonymised case shows no name: the title falls back to a generic label
 * rather than the real "X v Y". `holding` is written without naming either
 * party in the first place (see the seed), so it needs no equivalent
 * fallback — the same sentence is safe to show either way.
 */
export function CaseCard({ item }) {
  const terms = useLayout().labels('caseTerms');
  const role = ROLE_PHRASE[item.partyRepresented] || ROLE_PHRASE.other;
  const title = item.anonymised ? 'Anonymised matter' : item.title;
  // Legacy cases migrated from the old site have not all been restructured
  // yet, so summary stands in for any that have no holding of their own.
  const holding = item.holding || item.summary;

  return (
    <Link to={`/record/${item.slug}`} className="pcn-case">
      {(item.forum || item.year) && (
        <p className="pcn-case__meta">{[item.forum, item.year].filter(Boolean).join(' · ')}</p>
      )}
      <h3 className="pcn-case__title pcn-clamp pcn-clamp--3">{title}</h3>
      <p className="pcn-case__party">
        Acting for the {role}
        {item.outcome && (
          <span className={`pcn-outcome pcn-outcome--${item.outcome}`}> · {term(terms, 'outcome', item.outcome)}</span>
        )}
      </p>
      {holding && <p className="pcn-case__holding pcn-clamp pcn-clamp--2">{holding}</p>}
    </Link>
  );
}

/**
 * Attorney flip card (`.block-2`): photo, name and role on the front; quote,
 * avatar, name and role on the back. `compact` is the practice-single variant,
 * which spaces the avatar differently.
 */
export function FlipCard({ lawyer, compact = false }) {
  const photo = lawyer.photo ? mediaUrl(lawyer.photo, { width: 150, height: 150, crop: 'fill', gravity: 'faces' }) : '';
  const quote = lawyer.quote?.trim();
  // The back exists to show the quote. Without one it would be an empty panel,
  // so the card stays on the photo until a quote is added in the dashboard.
  return (
    <div className={`block-2 ftco-animate${quote ? '' : ' pcn-no-flip'}`}>
      <div className="flipper">
        <div
          className={`front${lawyer.photo ? '' : ' pcn-banner-fallback'}`}
          style={bg(lawyer.photo, 700, 900)}
        >
          <div className="box">
            <h2>{lawyer.name}</h2>
            <p>{lawyer.role}</p>
          </div>
          <Link to={`/lawyers/${lawyer.slug}`} className="pcn-stretched-link" aria-label={lawyer.name} />
        </div>
        {quote && (
        <div className="back">
          <blockquote>
            <p>&ldquo;{quote}&rdquo;</p>
          </blockquote>
          <div className="author d-flex">
            <div className={`image${compact ? ' mr-3' : ''} align-self-center`}>
              {photo && <img src={photo} alt="" />}
            </div>
            <div className={`name align-self-center${compact ? '' : ' ml-3'}`}>
              <Link to={`/lawyers/${lawyer.slug}`} style={{ color: 'inherit' }}>{lawyer.name}</Link>{' '}
              <span className="position">{lawyer.role}</span>
            </div>
          </div>
          <Link to={`/lawyers/${lawyer.slug}`} className="pcn-stretched-link" aria-label={lawyer.name} tabIndex={-1} />
        </div>
        )}
      </div>
    </div>
  );
}

/** A flip card with a two-line bio preview and a link to the profile underneath. */
export function TeamCard({ lawyer, compact }) {
  const common = useCommon();
  return (
    <div className="pcn-team">
      <FlipCard lawyer={lawyer} compact={compact} />
      {lawyer.bioPreview && <p className="pcn-team__bio pcn-clamp pcn-clamp--2">{lawyer.bioPreview}</p>}
      <p className="pcn-team__more">
        <Link to={`/lawyers/${lawyer.slug}`} className="btn btn-primary pcn-cta">{common.viewProfile}<span aria-hidden="true" className="ml-2">→</span></Link>
      </p>
    </div>
  );
}

/** Testimonial slide (`.testimony-wrap`). */
export function TestimonyCard({ item }) {
  return (
    <div className="testimony-wrap py-4">
      <div className="text">
        <p className="mb-4">{item.quote}</p>
        <div className="d-flex align-items-center">
          <div className="user-img" style={bg(item.photo, 160, 160)} />
          <div className="pl-3">
            <p className="name">{item.name}</p>
            <span className="position">{item.position}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The excerpt with any repeat of the headline removed. News items often store
 * the headline as their excerpt, which printed it twice; if the excerpt opens
 * with the title, only what follows is kept, and if nothing follows, nothing
 * is shown.
 */
export function distinctExcerpt(title, excerpt) {
  const norm = (t) => (t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const t = norm(title);
  const e = (excerpt || '').trim();
  if (!e) return '';
  if (!t || !norm(e).startsWith(t)) return e;
  const rest = e.slice(Math.min(e.length, title.trim().length)).replace(/^[\s.,;:–—-]+/, '');
  return norm(rest) ? rest : '';
}

/**
 * Insight card (`.blog-entry`): image, one meta line (category, date, reading
 * time), the headline once, a short excerpt that does not repeat it, and a
 * text "Read more" link. Same shadow, border and hover lift as the Record cards.
 */
export function BlogCard({ article, readMore, col = 'col-md-4' }) {
  const href = `/insights/${article.slug}`;
  const common = useCommon();
  const excerpt = distinctExcerpt(article.title, article.excerpt);
  const meta = [
    article.category?.name,
    shortDate(article.publishedAt),
    article.readingMinutes ? `${article.readingMinutes} ${common.minRead}` : null,
  ].filter(Boolean);
  return (
    <div className={`${col} d-flex ftco-animate`}>
      <div className="blog-entry pcn-blog">
        <Link
          to={href}
          className={`block-20 pcn-fit pcn-blog__image${article.featuredImage ? '' : ' pcn-banner-fallback'}`}
          style={fitted(article.featuredImage)}
          aria-label={article.title}
          tabIndex={-1}
        />
        <div className="pcn-blog__body">
          {meta.length > 0 && <p className="pcn-blog-meta">{meta.join(' · ')}</p>}
          <h3 className="pcn-blog__title pcn-clamp pcn-clamp--3"><Link to={href}>{article.title}</Link></h3>
          {excerpt && <p className="pcn-blog__excerpt pcn-clamp pcn-clamp--3">{excerpt}</p>}
          <Link to={href} className="pcn-blog__more">{readMore || common.readMore}<span aria-hidden="true"> →</span></Link>
        </div>
      </div>
    </div>
  );
}

/** A centred section heading (`.heading-section`). */
export function SectionHeading({ section, col = 'col-md-7', rowClass = 'mb-5', h2Class = 'mb-4' }) {
  if (!section.heading && !section.subheading) return null;
  return (
    <div className={`row justify-content-center ${rowClass}`}>
      <div className={`${col} text-center heading-section ftco-animate`}>
        {section.subheading && <span className="subheading">{section.subheading}</span>}
        {section.heading && <h2 className={h2Class || undefined}>{section.heading}</h2>}
      </div>
    </div>
  );
}
