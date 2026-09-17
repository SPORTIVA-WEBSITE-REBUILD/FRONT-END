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

describe('scroll reveal survives a remount', () => {
  it('still reveals elements after the effect is torn down and run again (StrictMode)', async () => {
    const { StrictMode } = await import('react');
    const { render } = await import('@testing-library/react');
    const { useRevealAll } = await import('../hooks/useAnimations.jsx');
    const observed = [];
    vi.stubGlobal('IntersectionObserver', class {
      constructor(cb) { this.cb = cb; }
      observe(el) { observed.push([this, el]); }
      unobserve() {}
      disconnect() { this.dead = true; }
    });
    function Page() { useRevealAll(); return <div className="ftco-animate" data-testid="block">x</div>; }
    const { getByTestId } = render(<StrictMode><Page /></StrictMode>);
    const el = getByTestId('block');
    const live = observed.filter(([o, node]) => !o.dead && node === el);
    expect(live.length).toBeGreaterThan(0);
    vi.useFakeTimers();
    live[0][0].cb([{ isIntersecting: true, target: el }]);
    vi.advanceTimersByTime(200);
    expect(el.classList.contains('ftco-animated')).toBe(true);
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
});

describe('the reveal stylesheet', () => {
  // The template hides .ftco-animate and relies on animate.css to bring it
  // back. Without `.ftco-animated { animation-fill-mode: both }` the entrance
  // animation plays and every revealed block snaps back to invisible.
  it('keeps revealed blocks visible once their animation ends', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const css = fs.readFileSync(path.resolve(__dirname, '../../public/css/animate-subset.css'), 'utf8');
    expect(css).toMatch(/\.ftco-animated\s*\{[^}]*animation-fill-mode:\s*both/);
    for (const effect of ['fadeIn', 'fadeInUp', 'fadeInLeft', 'fadeInRight']) {
      expect(css, effect).toMatch(new RegExp(`@keyframes ${effect} \\{`));
    }
  });
});

describe('scroll reveal and React re-renders', () => {
  it('puts the reveal classes back when a re-render replaces the className', async () => {
    const { useState } = await import('react');
    const { render, act } = await import('@testing-library/react');
    const { useRevealAll } = await import('../hooks/useAnimations.jsx');
    let callback;
    vi.stubGlobal('IntersectionObserver', class {
      constructor(cb) { callback = cb; }
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    let setExtra;
    function Page() {
      useRevealAll();
      const [extra, set] = useState('');
      setExtra = set;
      return <div className={`block-2 ftco-animate${extra}`} data-testid="card">x</div>;
    }
    vi.useFakeTimers();
    const { getByTestId } = render(<Page />);
    const el = getByTestId('card');
    callback([{ isIntersecting: true, target: el }]);
    vi.advanceTimersByTime(200);
    expect(el).toHaveClass('ftco-animated');

    act(() => setExtra(' pcn-no-flip'));
    await vi.runAllTimersAsync();
    expect(el).toHaveClass('pcn-no-flip');
    expect(el).toHaveClass('ftco-animated');
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
});
