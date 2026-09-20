import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { mediaUrl } from '../../lib/media.js';
import VideoPopup from './VideoPopup.jsx';
import Tabs from './Tabs.jsx';
import { useCommon } from '../../hooks/useContent.js';

/** The tab the live case count hangs off, matched on the CMS's own title. */
const RECORD_TAB = 'Our Record';

/**
 * The firm's own photograph, shipped with the site rather than uploaded, so
 * this section has something real to fall back on instead of the stock
 * stadium shot it used to carry. 3:2 at source, so `object-fit: cover` has
 * nothing to crop unless the row forces the column a different height.
 */
const PHOTO = {
  src: '/about/why-the-firm.jpg',
  alt: 'The PCN Sportiva team at the Football Law Annual Moot.',
  width: 1200,
  height: 800,
};

/**
 * Below this width the columns are narrower (a smaller Bootstrap container)
 * and the bottom-edge match is dropped — only the top-edge alignment, which
 * .pcn-why__grid's align-items: start gives for free, is asked to hold there.
 * Matches docs/design-direction.md, "Why the firm".
 */
const BOTTOM_ALIGN_MIN_WIDTH = 1200;

/**
 * Bottom-aligns the tab panel set to the photograph: the panel's shared
 * min-height (all three tabs already share one height — see .pcn-tabs__panels
 * in app.css) is set so the copy column's bottom edge lands on the image's.
 *
 * Derived from `panelsTop` (the panels host's own top edge) and the image's
 * bottom edge, not from measuring "everything above the panel" as a separate
 * quantity — the panels host's top position already accounts for the heading,
 * the body copy and the tab row above it, whatever their sizes. That also
 * makes the result tab-independent: switching tabs changes content inside the
 * shared panel height, not panelsTop, so this never needs to recompute on a
 * tab click, only on resize or layout change.
 *
 * When the copy column is already taller than the image (a long tab's own
 * text exceeds the space available), the computed target is at or below the
 * panel's natural height and this is a no-op — .pcn-why__media's own
 * align-self: stretch is what closes that gap, by growing the photograph
 * instead. The two mechanisms are deliberately independent: this hook only
 * ever grows the panel, and only when the image is the taller column.
 */
function useBottomAlignedPanel(mediaRef, copyRef, panelsRef) {
  const [minHeight, setMinHeight] = useState(undefined);

  useEffect(() => {
    const media = mediaRef.current;
    const copy = copyRef.current;
    const panels = panelsRef.current;
    if (!media || !copy || !panels) return undefined;

    const recalc = () => {
      if (window.innerWidth < BOTTOM_ALIGN_MIN_WIDTH) { setMinHeight(undefined); return; }
      const imageBottom = media.getBoundingClientRect().bottom;
      const panelsTop = panels.getBoundingClientRect().top;
      const target = imageBottom - panelsTop;
      setMinHeight(target > 0 ? target : undefined);
    };

    recalc();
    // The copy column, not the panels host itself: a change to the panel's
    // own height (from setting minHeight below) never moves panelsTop, so
    // observing panels here would only cost a harmless extra no-op pass.
    // Observing copy catches the heading, the body copy or the tab row
    // changing size — a font swap, a tab wrapping to a second line.
    const ro = new ResizeObserver(recalc);
    ro.observe(media);
    ro.observe(copy);
    window.addEventListener('resize', recalc);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recalc);
    };
  }, [mediaRef, copyRef, panelsRef]);

  return minHeight;
}

/**
 * The "Why the firm" block: a photograph beside the firm's own copy and the
 * mission / who-we-advise / record tabs.
 *
 * Laid out on the page grid — the same container the Services and Record
 * sections use — so the image's left edge lines up with everything above and
 * below it. The template's version sat in a stretched flex row with a blue
 * counter straddling the column gutter, which is what made it read as though
 * it had escaped the grid.
 *
 * The years-of-experience counter is gone: it claimed a figure the firm has
 * not evidenced. See docs/firm-review-required.md.
 */
export default function AboutBlock({ intro, recordCount = 0 }) {
  const common = useCommon();
  const mediaRef = useRef(null);
  const copyRef = useRef(null);
  const panelsRef = useRef(null);
  const panelMinHeight = useBottomAlignedPanel(mediaRef, copyRef, panelsRef);

  /*
   * The record tab's live count, appended to whatever the CMS holds for that
   * tab rather than written into the copy — so the number cannot drift from
   * the case collection the way the "over 150 disputes" claim it replaced did.
   * Omitted at zero rather than printed as "0 matters".
   */
  const items = (intro.items || [])
    .filter((t) => t.title)
    .map((t) => (t.title === RECORD_TAB && recordCount > 0
      ? {
        ...t,
        extra: (
          <Link className="pcn-tabs__count" to="/record">
            {recordCount} {recordCount === 1 ? 'matter' : 'matters'} published in the record
          </Link>
        ),
      }
      : t));

  return (
    <section className="pcn-why">
      <div className="container">
        <div className="pcn-why__grid">
          <figure className="pcn-why__media" ref={mediaRef}>
            <img
              className="pcn-why__image"
              src={mediaUrl(intro.image) || PHOTO.src}
              alt={intro.image?.alt || PHOTO.alt}
              width={PHOTO.width}
              height={PHOTO.height}
              loading="lazy"
            />
            {/* Renders nothing unless the firm has set a video on the section. */}
            <VideoPopup href={intro.video} closeLabel={common.close} playLabel={common.playVideo} />
          </figure>

          <div className="pcn-why__copy" ref={copyRef}>
            <div className="heading-section">
              {intro.subheading && <span className="subheading">{intro.subheading}</span>}
              {intro.heading && <h2 className="mb-4">{intro.heading}</h2>}
            </div>
            {intro.body && <p className="pcn-why__body">{intro.body}</p>}
            <Tabs items={items} panelsRef={panelsRef} panelMinHeight={panelMinHeight} />
          </div>
        </div>
      </div>
    </section>
  );
}
