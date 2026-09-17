import { Link } from 'react-router-dom';
import { backgroundStyle } from '../SmartImage.jsx';
import { useCommon } from '../../hooks/useContent.js';
import { useParallax } from '../../hooks/useAnimations.jsx';

/**
 * The inner-page banner (`section.hero-wrap.hero-wrap-2`): title, then a
 * breadcrumb trail of Home › [listing] › current page, every crumb followed
 * by an arrow, as the template writes it.
 */
export default function PageBanner({ title, crumb, image, parent }) {
  const common = useCommon();
  const ref = useParallax(0.5);

  return (
    <section
      ref={ref}
      className={`hero-wrap hero-wrap-2${image ? '' : ' pcn-banner-fallback'}`}
      style={backgroundStyle(image, null, 1920, { height: 1080, crop: 'fill', gravity: 'auto' })}
      data-stellar-background-ratio="0.5"
    >
      <div className="overlay" />
      <div className="container">
        <div className="row no-gutters slider-text align-items-end justify-content-center">
          <div className="col-md-9 ftco-animate pb-5 text-center">
            <h1 className="mb-3 bread">{title}</h1>
            <p className="breadcrumbs">
              <span className="mr-2"><Link to="/">{common.breadcrumbHome} <i className="ion-ios-arrow-forward" /></Link></span>{' '}
              {parent?.label && (
                <>
                  <span className="mr-2"><Link to={parent.href}>{parent.label} <i className="ion-ios-arrow-forward" /></Link></span>{' '}
                </>
              )}
              <span>{crumb || title} <i className="ion-ios-arrow-forward" /></span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
