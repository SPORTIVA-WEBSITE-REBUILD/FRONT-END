import { useCallback, useEffect } from 'react';
import SmartImage from './SmartImage.jsx';
import { useCommon } from '../hooks/useContent.js';

/**
 * Opens a gallery image with its title and description.
 *
 * Written rather than pulled in: the template's Magnific Popup was jQuery-based
 * and its stylesheet has been dropped as dead weight, and a lightbox is little
 * more than a dialog with two arrow keys. Keyboard and screen-reader behaviour
 * are handled here so it does not become a mouse-only feature.
 */
export default function Lightbox({ items = [], index, onClose, onNavigate }) {
  const common = useCommon();
  const open = index !== null && index !== undefined && items[index];

  const goPrevious = useCallback(() => {
    onNavigate((index - 1 + items.length) % items.length);
  }, [index, items.length, onNavigate]);

  const goNext = useCallback(() => {
    onNavigate((index + 1) % items.length);
  }, [index, items.length, onNavigate]);

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') goPrevious();
      else if (e.key === 'ArrowRight') goNext();
    };

    document.addEventListener('keydown', onKey);
    // Stop the page behind scrolling while the image is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, goPrevious, goNext]);

  if (!open) return null;

  const item = items[index];

  return (
    <div
      className="pcn-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button type="button" className="pcn-lightbox__close" onClick={onClose} aria-label={common.close}>
        &times;
      </button>

      {items.length > 1 && (
        <button type="button" className="pcn-lightbox__nav pcn-lightbox__nav--prev" onClick={goPrevious} aria-label={common.previous}>
          <span className="ion-ios-arrow-forward" style={{ transform: 'rotate(180deg)', display: 'inline-block' }} />
        </button>
      )}

      <figure className="pcn-lightbox__figure">
        <SmartImage
          media={item.image}
          width={1400}
          sizes="90vw"
          priority
          alt={item.image?.alt || item.title}
          className="pcn-lightbox__image"
        />
        <figcaption className="pcn-lightbox__caption">
          <h3>{item.title}</h3>
          {item.description && <p>{item.description}</p>}
          {(item.location || item.takenAt) && (
            <p className="pcn-lightbox__meta">
              {item.location}
              {item.location && item.takenAt ? ' · ' : ''}
              {item.takenAt && new Date(item.takenAt).toLocaleDateString('en-GB', {
                month: 'long', year: 'numeric',
              })}
            </p>
          )}
          {items.length > 1 && (
            <p className="pcn-lightbox__meta">{index + 1} {common.of} {items.length}</p>
          )}
        </figcaption>
      </figure>

      {items.length > 1 && (
        <button type="button" className="pcn-lightbox__nav pcn-lightbox__nav--next" onClick={goNext} aria-label={common.next}>
          <span className="ion-ios-arrow-forward" />
        </button>
      )}
    </div>
  );
}
