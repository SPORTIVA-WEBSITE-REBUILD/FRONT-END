import { useEffect, useRef, useState } from 'react';

/**
 * The template's entrance animations came from jQuery Waypoints. An
 * IntersectionObserver reproduces them with no jQuery and no layout thrash.
 */
export function useReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return undefined;

    // Respect a visitor who has asked for reduced motion.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, ...options },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, options]);

  return [ref, visible];
}

/** Reproduces the template's animated statistic counters. */
export function useCountUp(target, { duration = 1500 } = {}) {
  const [ref, visible] = useReveal();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!visible) return undefined;
    const end = Number(String(target).replace(/[^0-9.]/g, '')) || 0;

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(end);
      return undefined;
    }

    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.floor(end * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, target, duration]);

  return [ref, value];
}

/** The rotating headline word from the template's hero. */
export function useTextRotate(words = [], period = 2000) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), period);
    return () => clearInterval(id);
  }, [words.length, period]);

  return words[index] || '';
}

/**
 * Reveals every `.ftco-animate` element on the page as it scrolls into view.
 *
 * The stylesheet hides them outright — `opacity: 0; visibility: hidden` — and
 * the template's main.js added `ftco-animated` on scroll via jQuery Waypoints
 * to bring them back. Dropping jQuery removed that, so any element carrying the
 * class without the <Reveal> wrapper stayed invisible forever while still
 * taking up its full height: entire sections rendered as blank space.
 *
 * One observer covers the whole document, and a MutationObserver picks up
 * elements added later, which matters because most content arrives after a
 * fetch resolves.
 */
export function useRevealAll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const reveal = (el, delay = 0) => {
      // Defensive: an observer entry without a target would otherwise throw
      // inside an effect, which unmounts the whole tree and blanks the page.
      if (!el || !el.classList) return;
      const effect = el.dataset?.animateEffect || 'fadeInUp';
      window.setTimeout(() => {
        el.classList.add(effect, 'ftco-animated');
      }, reduceMotion ? 0 : delay);
    };

    if (reduceMotion) {
      // No observer at all: show everything immediately, now and as it arrives.
      const showAll = () => document.querySelectorAll('.ftco-animate:not(.ftco-animated)')
        .forEach((el) => reveal(el));
      showAll();
      const mo = new MutationObserver(showAll);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    let batch = 0;
    let batchTimer = null;

    const observer = new IntersectionObserver((entries) => {
      const arrived = entries.filter((e) => e.isIntersecting && e.target);
      arrived.forEach((entry) => {
        // A small stagger between neighbours, as the original did.
        reveal(entry.target, batch * 50);
        batch += 1;
        observer.unobserve(entry.target);
      });
      if (arrived.length) {
        window.clearTimeout(batchTimer);
        batchTimer = window.setTimeout(() => { batch = 0; }, 300);
      }
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    const observeAll = () => {
      // Marked as we go: the MutationObserver fires on every DOM change, and
      // re-observing the same nodes each time is pure churn on a long page.
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
      window.clearTimeout(batchTimer);
    };
  }, []);
}

/** A section wrapper that applies the template's reveal class. */
export function Reveal({ children, className = '', as: Tag = 'div', ...rest }) {
  const [ref, visible] = useReveal();
  return (
    <Tag ref={ref} className={`ftco-animate${visible ? ' fadeInUp ftco-animated' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
