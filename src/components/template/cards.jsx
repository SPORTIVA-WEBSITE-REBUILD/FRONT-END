import { Link } from 'react-router-dom';
import { backgroundStyle } from '../SmartImage.jsx';
import { mediaUrl } from '../../lib/media.js';
import { dateParts } from '../../lib/format.js';

const bg = (media, width, height) => backgroundStyle(media, null, width, height
  ? { height, crop: 'fill', gravity: 'auto' }
  : {});

/** Home "Why Select Us" card (`.services`). */
export function ServiceCard({ service }) {
  return (
    <div className="col-md-4 d-flex align-items-stretch">
      <div className="services text-center">
        <div className="icon d-flex justify-content-center align-items-center">
          <span className={service.icon || 'flaticon-lawyer'} />
        </div>
        <div className="text">
          <h3>{service.title}</h3>
          <p>{service.summary}</p>
        </div>
        <Link
          to={`/services/${service.slug}`}
          className="btn-custom d-flex align-items-center justify-content-center"
          aria-label={service.title}
        >
          <span className="ion-ios-arrow-round-forward" />
        </Link>
      </div>
    </div>
  );
}

/** Practice Areas page card (`.practice-area`). */
export function PracticeCard({ service }) {
  return (
    <div className="col-md-3 text-center">
      <div className="practice-area ftco-animate">
        <div className="icon d-flex justify-content-center align-items-center">
          <span className={service.icon || 'flaticon-lawyer'} />
        </div>
        <h3><Link to={`/services/${service.slug}`}>{service.title}</Link></h3>
        <p>{service.summary}</p>
        <Link
          to={`/services/${service.slug}`}
          className="btn-custom d-flex align-items-center justify-content-center"
          aria-label={service.title}
        >
          <span className="ion-ios-arrow-round-forward" />
        </Link>
      </div>
    </div>
  );
}

/** Case study tile (`.case.img`): background image, title and category. */
export function CaseTile({ item }) {
  return (
    <div
      className={`case img d-flex align-items-center justify-content-center${item.featuredImage ? '' : ' pcn-banner-fallback'}`}
      style={bg(item.featuredImage, 800, 800)}
    >
      <div className="text text-center">
        <h3><Link to={`/record/${item.slug}`}>{item.title}</Link></h3>
        <span>{item.practiceArea?.title || item.forum}</span>
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
        </div>
        )}
      </div>
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
export function BlogCard({ article, readMore }) {
  const date = dateParts(article.publishedAt);
  const href = `/insights/${article.slug}`;
  return (
    <div className="col-md-4 d-flex ftco-animate">
      <div className="blog-entry justify-content-end">
        <div className="text px-4 py-4">
          <h3 className="heading mb-0"><Link to={href}>{article.title}</Link></h3>
        </div>
        <Link
          to={href}
          className={`block-20${article.featuredImage ? '' : ' pcn-banner-fallback'}`}
          style={bg(article.featuredImage, 800, 600)}
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
          <p>{article.excerpt}</p>
          <p><Link to={href} className="btn btn-primary">{readMore}</Link></p>
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
