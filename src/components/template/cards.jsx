import { Link } from 'react-router-dom';
import ServiceIcon from '../icons.jsx';
import { backgroundStyle } from '../SmartImage.jsx';
import { mediaUrl } from '../../lib/media.js';
import { dateParts, term } from '../../lib/format.js';
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

/** Case study tile (`.case.img`): the image, with title and category on hover. */
export function CaseTile({ item }) {
  return (
    <div
      className={`case img pcn-fit d-flex align-items-center justify-content-center${item.featuredImage ? '' : ' pcn-banner-fallback'}`}
      style={fitted(item.featuredImage)}
    >
      <div className="text text-center">
        <h3><Link to={`/record/${item.slug}`}>{item.title}</Link></h3>
        <span>{item.practiceArea?.title || item.forum}</span>
      </div>
    </div>
  );
}

/**
 * A case tile with a preview caption: forum, year and outcome, two lines of
 * summary and a link to the full matter. The tile itself is the template's.
 */
export function CaseCard({ item }) {
  const common = useCommon();
  const terms = useLayout().labels('caseTerms');
  return (
    <div className="pcn-case">
      <CaseTile item={item} />
      <div className="pcn-case__body">
        <h3 className="pcn-case__title pcn-clamp pcn-clamp--2">
          <Link to={`/record/${item.slug}`}>{item.title}</Link>
        </h3>
        <p className="pcn-case__meta">
          {[item.forum, item.year].filter(Boolean).join(' · ')}
          {item.outcome && (
            <span className={`pcn-outcome pcn-outcome--${item.outcome}`}>{term(terms, 'outcome', item.outcome)}</span>
          )}
        </p>
        {item.summary && <p className="pcn-clamp pcn-clamp--2">{item.summary}</p>}
        <p className="mb-0">
          <Link to={`/record/${item.slug}`} className="btn btn-primary btn-sm px-3">{common.readMore}</Link>
        </p>
      </div>
    </div>
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
        <Link to={`/lawyers/${lawyer.slug}`}>{common.viewProfile} <span className="ion-ios-arrow-forward" /></Link>
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

/** Blog card (`.blog-entry`): title, image, date block, excerpt, Read more. */
export function BlogCard({ article, readMore, col = 'col-md-4' }) {
  const date = dateParts(article.publishedAt);
  const href = `/insights/${article.slug}`;
  const common = useCommon();
  const meta = [
    article.author?.name,
    article.category?.name,
    article.readingMinutes ? `${article.readingMinutes} ${common.minRead}` : null,
  ].filter(Boolean);
  return (
    <div className={`${col} d-flex ftco-animate`}>
      <div className="blog-entry justify-content-end">
        <div className="text px-4 py-4">
          <h3 className="heading mb-0 pcn-clamp pcn-clamp--3"><Link to={href}>{article.title}</Link></h3>
        </div>
        <Link
          to={href}
          className={`block-20 pcn-fit${article.featuredImage ? '' : ' pcn-banner-fallback'}`}
          style={fitted(article.featuredImage)}
          aria-label={article.title}
        />
        <div className="text p-4 float-right d-block">
          {date && (
            <div className="topper d-flex align-items-center">
              <div className="one py-2 pl-3 pr-1 align-self-stretch">
                <span className="day">{date.day}</span>
              </div>
              <div className="two pl-0 pr-3 py-2 align-self-stretch">
                <span className="yr">{date.year}</span>
                <span className="mos">{date.month}</span>
              </div>
            </div>
          )}
          {meta.length > 0 && <p className="pcn-blog-meta">{meta.join(' · ')}</p>}
          <p className="pcn-clamp pcn-clamp--3">{article.excerpt}</p>
          <p><Link to={href} className="btn btn-primary">{readMore || common.readMore}</Link></p>
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
