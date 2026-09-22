import { useState } from 'react';
import { Link } from 'react-router-dom';
import SmartImage from './SmartImage.jsx';
import Lightbox from './Lightbox.jsx';
import { LoadingCards, ErrorState } from './states.jsx';
import { useGallery } from '../hooks/useContent.js';

/**
 * The gallery block on the home page. Its heading and copy come from the page's
 * `gallery` section, the images from their own collection — the same split used
 * by the services and record blocks.
 */
export default function GallerySection({
  heading, subheading, body, limit = 3, col = 'col-md-6 col-lg-4', viewAllHref, viewAllLabel = 'View all',
}) {
  const { data: items, isLoading, isError, error, refetch } = useGallery({ limit });
  const [openIndex, setOpenIndex] = useState(null);

  // Nothing published yet: render nothing at all rather than an empty heading
  // sitting on the home page.
  if (!isLoading && !isError && (!items || items.length === 0)) return null;

  return (
    <section className="ftco-section">
      <div className="container">
        <div className="row justify-content-center mb-5 pb-3">
          <div className="col-md-7 heading-section text-center ftco-animate">
            {subheading && <span className="subheading">{subheading}</span>}
            {heading && <h2 className="mb-4">{heading}</h2>}
            {body && <p>{body}</p>}
          </div>
        </div>

        {isError && <ErrorState error={error} onRetry={refetch} />}
        {isLoading && <LoadingCards count={limit} col={col} />}

        <div className="row">
          {(items || []).map((item, i) => (
            <div className={`${col} mb-4`} key={item._id}>
              <div className="pcn-gallery-item ftco-animate">
                <button
                  type="button"
                  className="pcn-gallery-item__button"
                  onClick={() => setOpenIndex(i)}
                  aria-label={`Open image: ${item.title}`}
                >
                  <SmartImage
                    media={item.image}
                    width={600}
                    height={450}
                    crop="fill"
                    sizes="(max-width: 768px) 100vw, (max-width: 992px) 50vw, 33vw"
                    alt={item.image?.alt || item.title}
                    className="pcn-gallery-item__image"
                  />
                  <span className="pcn-gallery-item__overlay">
                    <span className="pcn-gallery-item__title">{item.title}</span>
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {viewAllHref && (
          <div className="pcn-cta-row">
            <Link to={viewAllHref} className="btn btn-primary pcn-cta">{viewAllLabel}</Link>
          </div>
        )}
      </div>

      <Lightbox
        items={items || []}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </section>
  );
}
