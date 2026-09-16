import { Link } from 'react-router-dom';
import { backgroundStyle } from './SmartImage.jsx';

/**
 * The inner-page banner used by every non-home page in the template, kept
 * classname-for-classname so style.scss renders it unchanged.
 */
export default function PageHero({ title, image, crumbs = [] }) {
  return (
    <div
      className={`hero-wrap${image ? '' : ' pcn-banner-fallback'}`}
      style={backgroundStyle(image, null, 1920, { height: 1080, crop: 'fill', gravity: 'auto' })}
      data-stellar-background-ratio="0.5"
    >
      <div className="overlay" />
      <div className="container">
        <div className="row no-gutters slider-text align-items-end justify-content-center">
          <div className="col-md-9 ftco-animate pb-5 text-center">
            {crumbs.length > 0 && (
              <p className="breadcrumbs">
                {crumbs.map((c) => (
                  <span className="mr-2" key={c.href || c.label}>
                    {c.href ? <Link to={c.href}>{c.label}</Link> : c.label}
                    {c.href && <i className="ion-ios-arrow-forward" />}
                  </span>
                ))}
              </p>
            )}
            <h1 className="mb-0 bread">{title}</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
