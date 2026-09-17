import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { safeHref } from '../../lib/links.js';

/** A YouTube or Vimeo page address, as its embeddable player address. */
export function embedUrl(href = '') {
  const vimeo = href.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  const yt = href.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  return null;
}

/**
 * The play button and Magnific Popup iframe (main.js: `.popup-vimeo`,
 * disableOn 700, mainClass mfp-fade, removalDelay 160). Below 700px wide the
 * link simply opens the video, as Magnific did. The overlay uses Magnific's
 * own markup so magnific-popup.css styles it.
 */
export default function VideoPopup({ href, closeLabel = 'Close', playLabel = 'Play video' }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const url = safeHref(href);
  const embed = url ? embedUrl(url) : null;

  const close = () => {
    setClosing(true);
    window.setTimeout(() => { setOpen(false); setClosing(false); }, 160);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!url) return null;

  const state = closing ? 'mfp-removing' : 'mfp-ready';

  return (
    <>
      <a
        href={url}
        className="icon-video popup-vimeo d-flex justify-content-center align-items-center"
        aria-label={playLabel}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (!embed || window.innerWidth < 700) return;
          e.preventDefault();
          setOpen(true);
        }}
      >
        <span className="icon-play" />
      </a>

      {open && createPortal(
        <>
          <div className={`mfp-bg mfp-fade ${state}`} />
          <div
            className={`mfp-wrap mfp-close-btn-in mfp-auto-cursor mfp-fade ${state}`}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            style={{ overflowX: 'hidden', overflowY: 'auto', position: 'fixed' }}
            onClick={(e) => { if (e.target === e.currentTarget || e.target.classList.contains('mfp-container')) close(); }}
          >
            <div className="mfp-container mfp-s-ready mfp-iframe-holder">
              <div className="mfp-content">
                <div className="mfp-iframe-scaler">
                  <button title={closeLabel} type="button" className="mfp-close" onClick={close}>×</button>
                  <iframe
                    className="mfp-iframe"
                    src={embed}
                    title={playLabel}
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body,
      )}
    </>
  );
}
