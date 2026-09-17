import { Children, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const MARGIN = 30;
const SPEED = 250; // Owl's default smartSpeed

/** Owl's `responsive` option: 1 item from 0px, 2 from 600px, 3 from 1000px. */
function itemsFor(width) {
  if (width >= 1000) return 3;
  if (width >= 600) return 2;
  return 1;
}

/**
 * Owl Carousel, as the template configures it (`center: true`, margin 30,
 * dots, no arrows), rendering Owl's own markup so owl.carousel.min.css and the
 * template's `.ftco-owl` rules style it.
 *
 * With `loop`, items are cloned either side, as Owl does, and the stage jumps
 * back to the real item after each move, so it can run in either direction
 * forever. Without it the first item starts centred with space to its left —
 * which is how the template's testimonial carousel looks.
 */
export default function Carousel({ className = '', loop = false, label, interval = 5000, children }) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const outer = useRef(null);
  const [width, setWidth] = useState(0);
  const [viewport, setViewport] = useState(typeof window === 'undefined' ? 1200 : window.innerWidth);
  const [index, setIndex] = useState(0); // position in the rendered list
  const [animate, setAnimate] = useState(true);
  const drag = useRef(null);
  const suppressClick = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);

  const clones = loop && count > 1 ? count : 0;
  const rendered = clones ? [...slides, ...slides, ...slides] : slides;

  useLayoutEffect(() => {
    const measure = () => {
      setViewport(window.innerWidth);
      if (outer.current) setWidth(outer.current.clientWidth);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Start on the first real item.
  useEffect(() => { setAnimate(false); setIndex(clones); }, [clones]);

  const perView = Math.min(itemsFor(viewport), Math.max(count, 1));
  const itemWidth = width ? (width + MARGIN) / perView - MARGIN : 0;
  const step = itemWidth + MARGIN;
  const translate = -(index * step) + (width - itemWidth) / 2 + dragOffset;


  const go = useCallback((next) => {
    setAnimate(true);
    if (clones) setIndex(next);
    else setIndex(Math.max(0, Math.min(count - 1, next)));
  }, [clones, count]);

  // No dots: the carousel moves on by itself, pausing while the visitor
  // hovers, focuses or drags it, and never for reduced motion.
  useEffect(() => {
    if (count < 2 || paused || dragging || !interval) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = window.setInterval(() => {
      setAnimate(true);
      setIndex((i) => (clones ? i + 1 : (i + 1) % count));
    }, interval);
    return () => window.clearInterval(id);
  }, [count, paused, dragging, interval, clones]);

  // After sliding onto a clone, jump without animation to its real twin.
  useEffect(() => {
    if (!clones) return undefined;
    if (index >= clones && index < clones * 2) return undefined;
    const id = window.setTimeout(() => {
      setAnimate(false);
      setIndex(clones + (((index - clones) % count) + count) % count);
    }, SPEED);
    return () => window.clearTimeout(id);
  }, [index, clones, count]);

  useEffect(() => {
    if (animate) return undefined;
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  const onPointerDown = (e) => {
    drag.current = { x: e.clientX, id: e.pointerId };
    setDragging(true);
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    setDragOffset(e.clientX - drag.current.x);
  };
  const onPointerUp = () => {
    if (!drag.current) return;
    const moved = dragOffset;
    suppressClick.current = Math.abs(moved) > 5;
    drag.current = null;
    setDragOffset(0);
    setDragging(false);
    if (Math.abs(moved) > 50) go(index + (moved < 0 ? 1 : -1));
  };

  if (!count) return null;

  return (
    <div
      className={`${className} owl-carousel ftco-owl owl-loaded owl-drag`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
      }}
    >
      <div
        className="owl-stage-outer"
        ref={outer}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(e) => { if (suppressClick.current) { e.preventDefault(); suppressClick.current = false; } }}
        onPointerLeave={onPointerUp}
        style={{ touchAction: 'pan-y' }}
      >
        <div
          className="owl-stage"
          style={{
            transform: `translate3d(${translate}px, 0px, 0px)`,
            transition: animate && !dragging ? `all ${SPEED / 1000}s ease 0s` : 'all 0s ease 0s',
            width: rendered.length * step || undefined,
          }}
        >
          {rendered.map((slide, i) => {
            const isClone = clones && (i < clones || i >= clones * 2);
            const visible = Math.abs(i - index) <= Math.floor(perView / 2);
            return (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className={`owl-item${isClone ? ' cloned' : ''}${visible ? ' active' : ''}${i === index ? ' center' : ''}`}
                style={{ width: itemWidth || undefined, marginRight: MARGIN }}
                aria-hidden={!visible || undefined}
              >
                {slide}
              </div>
            );
          })}
        </div>
      </div>
      <div className="owl-nav disabled" />
    </div>
  );
}
