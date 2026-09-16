import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { useRevealAll } from '../hooks/useAnimations.jsx';

/**
 * Regression: the stylesheet hides .ftco-animate outright. Before this hook,
 * any element carrying that class outside the <Reveal> wrapper stayed invisible
 * while still occupying its full height, so whole sections rendered as blank
 * space on the page.
 */
let observed = [];
let triggerAll = () => {};

beforeEach(() => {
  observed = [];
  global.IntersectionObserver = class {
    constructor(cb) {
      this.cb = cb;
      triggerAll = () => this.cb(observed.map((target) => ({ target, isIntersecting: true })));
    }
    observe(el) { observed.push(el); }
    unobserve(el) { observed = observed.filter((o) => o !== el); }
    disconnect() { observed = []; }
  };
});

afterEach(() => { vi.useRealTimers(); });

/** The stagger uses setTimeout, so those assertions need fake timers. */
function flushReveal() {
  vi.runAllTimers();
}

function Harness({ children }) {
  useRevealAll();
  return <div>{children}</div>;
}

describe('global scroll reveal', () => {
  it('observes every hidden element on the page', () => {
    render(
      <Harness>
        <div className="ftco-animate" data-testid="a" />
        <div className="col-md-6 ftco-animate" data-testid="b" />
        <div className="not-animated" data-testid="c" />
      </Harness>,
    );
    expect(observed).toHaveLength(2);
  });

  it('reveals them when they scroll into view', async () => {
    vi.useFakeTimers();
    const { getByTestId } = render(
      <Harness><div className="ftco-animate" data-testid="a" /></Harness>,
    );
    triggerAll();
    flushReveal();

    const el = getByTestId('a');
    expect(el.classList.contains('ftco-animated')).toBe(true);
    expect(el.classList.contains('fadeInUp')).toBe(true);
  });

  it('honours a requested animation effect', () => {
    vi.useFakeTimers();
    const { getByTestId } = render(
      <Harness>
        <div className="ftco-animate" data-animate-effect="fadeInLeft" data-testid="a" />
      </Harness>,
    );
    triggerAll();
    flushReveal();
    expect(getByTestId('a').classList.contains('fadeInLeft')).toBe(true);
  });

  it('does not re-observe something already revealed', () => {
    render(
      <Harness><div className="ftco-animate ftco-animated" data-testid="a" /></Harness>,
    );
    expect(observed).toHaveLength(0);
  });

  // Most content arrives after a fetch resolves, so elements appear later.
  it('picks up elements added to the page after it mounts', async () => {
    const { rerender } = render(<Harness><div className="ftco-animate" /></Harness>);
    expect(observed).toHaveLength(1);

    rerender(
      <Harness>
        <div className="ftco-animate" />
        <div className="ftco-animate" />
        <div className="ftco-animate" />
      </Harness>,
    );

    await waitFor(() => expect(observed.length).toBe(3), { timeout: 2000 });
  });
});
