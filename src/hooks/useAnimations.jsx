import { useEffect, useRef, useState } from 'react';
import { commaNumber } from '../lib/format.js';

/**
 * The template's interactions, rebuilt without jQuery. Each one reproduces the
 * timing of the plugin it replaces in legacy-template/js/main.js and emits the
 * same classes, so the template's stylesheet styles it unchanged.
 */

const reducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

/**
 * Scroll reveal (jQuery Waypoints, offset 95%).
 *
 * main.js: when an `.ftco-animate` element reaches 95% of the viewport it is
 * marked `item-animate`; 100ms later every marked element is revealed in turn,
 * 50ms apart, with `data-animate-effect` (default fadeInUp) plus
 * `ftco-animated`. One observer covers the whole document, and a
 * MutationObserver picks up elements that arrive after a fetch resolves.
 */
export function useRevealAll() {
  useEffect(() => {
    // Elements already revealed. React owns the className attribute, so a
    // re-render that changes it drops the classes added here; they are put
    // back rather than leaving the element hidden for good.
    const revealed = new WeakSet();
    const reveal = (el) => {
      if (!el?.classList) return;
      el.classList.add(el.dataset?.animateEffect || 'fadeInUp', 'ftco-animated');
      el.classList.remove('item-animate');
      revealed.add(el);
    };
    const restore = new MutationObserver((mutations) => {
      mutations.forEach(({ target }) => {
        if (revealed.has(target) && !target.classList.contains('ftco-animated')) reveal(target);
      });
    });
    restore.observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });

    if (reducedMotion() || typeof IntersectionObserver === 'undefined') {
      const showAll = () => document.querySelectorAll('.ftco-animate:not(.ftco-animated)').forEach(reveal);
      showAll();
      const mo = new MutationObserver(showAll);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => { mo.disconnect(); restore.disconnect(); };
    }

    const timers = new Set();
    const later = (fn, ms) => {
      const id = window.setTimeout(() => { timers.delete(id); fn(); }, ms);
      timers.add(id);
    };

    const observer = new IntersectionObserver((entries) => {
      let marked = false;
      entries.forEach((entry) => {
        if (!entry.isIntersecting || !entry.target) return;
        entry.target.classList.add('item-animate');
        observer.unobserve(entry.target);
        marked = true;
      });
      if (!marked) return;
      later(() => {
        document.querySelectorAll('.ftco-animate.item-animate').forEach((el, k) => {
          later(() => reveal(el), k * 50);
        });
      }, 100);
    }, { rootMargin: '0px 0px -5% 0px' });

    const observeAll = () => {
      document.querySelectorAll('.ftco-animate:not(.ftco-animated):not([data-reveal-watched])')
        .forEach((el) => {
          el.dataset.revealWatched = 'true';
          observer.observe(el);
        });
    };

    observeAll();
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
      restore.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
      // Let a remount (React StrictMode mounts effects twice) watch them again.
      document.querySelectorAll('.ftco-animate[data-reveal-watched]:not(.ftco-animated)')
        .forEach((el) => { delete el.dataset.revealWatched; el.classList.remove('item-animate'); });
    };
  }, []);
}

/**
 * Navbar scroll states (main.js scrollWindow): `scrolled` past 150px, `awake`
 * past 350px, and `sleep` when scrolling back above 350px, cleared again
 * above 150px.
 */
export function useNavbarScroll() {
  const [classes, setClasses] = useState('');

  useEffect(() => {
    const state = { scrolled: false, awake: false, sleep: false };
    const apply = () => setClasses(['scrolled', 'awake', 'sleep'].filter((c) => state[c]).join(' '));

    const onScroll = () => {
      const st = window.scrollY;
      if (st > 150 && !state.scrolled) state.scrolled = true;
      if (st < 150 && state.scrolled) { state.scrolled = false; state.sleep = false; }
      if (st > 350 && !state.awake) state.awake = true;
      if (st < 350 && state.awake) { state.awake = false; state.sleep = true; }
      apply();
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return classes;
}

/**
 * Stellar.js background parallax, `data-stellar-background-ratio="0.5"`:
 * the background moves at half the scroll speed. Skipped on touch screens,
 * where Stellar also misbehaved, and for reduced motion.
 */
export function useParallax(ratio = 0.5) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion() || window.matchMedia?.('(hover: none)').matches) return undefined;

    let frame = 0;
    // Shift from wherever the stylesheet places the image (usually centred),
    // as Stellar does, rather than pinning it to the top.
    node.style.backgroundPositionY = '';
    const origin = window.getComputedStyle(node).backgroundPositionY || '50%';
    const update = () => {
      frame = 0;
      const top = node.getBoundingClientRect().top + window.scrollY;
      const offset = Math.round((window.scrollY - top) * (1 - ratio));
      node.style.backgroundPositionY = offset ? `calc(${origin} + ${offset}px)` : origin;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ratio]);

  return ref;
}

/**
 * jQuery animateNumber, 7000ms with jQuery's default "swing" easing and a
 * comma separator. The template triggers every counter from the banner's
 * waypoint, which fires on load, so the count starts on mount.
 */
export function CountUp({ value, className = 'number mr-2', duration = 7000 }) {
  const end = Number(String(value ?? '').replace(/[^0-9.]/g, '')) || 0;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reducedMotion()) { setShown(end); return undefined; }
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const swing = 0.5 - Math.cos(p * Math.PI) / 2;
      setShown(end * swing);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [end, duration]);

  return <span className={className} data-number={end}>{commaNumber(shown)}</span>;
}

/*
 * The template's TxtRotate typewriter used to live here. It is gone: the hero
 * now holds each slide's own phrase and slides it in, so nothing types, and
 * the blinking cursor that clipped wrapped phrases went with it. Home.jsx
 * advances the slides on a plain interval.
 */
