import { describe, it, expect, vi, afterEach } from 'vitest';
import { waitFor, act } from '@testing-library/react';
import Home from '../pages/Home.jsx';
import { renderWithProviders, mockApi } from './utils.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const photo = (name) => ({ secureUrl: `/hero/${name}.jpg`, alt: name, width: 1920, height: 1080 });

/**
 * The home page as the seed leaves it: four event photographs, each with its
 * own phrase, small heading and paragraph.
 */
const HOME_PAGE = {
  data: {
    slug: 'home',
    seo: {},
    sections: [
      {
        key: 'hero',
        heading: 'Sports law, across',
        subheading: 'PCN Sportiva LP',
        body: 'A boutique sports law practice.',
        cta: { label: 'Speak to us', href: '/contact' },
        value: '100',
        items: [
          { title: 'every event', value: 'Recognition', text: 'Recognised at events.', image: photo('hero-acfta') },
          { title: 'the table', value: 'Client Relationships', text: 'Close relationships.', image: photo('hero-table') },
          { title: 'the room', value: 'Industry Presence', text: 'Present where decisions are made.', image: photo('hero-crowd') },
          { title: 'the stage', value: 'Thought Leadership', text: 'Contributing to the discussion.', image: photo('hero-podium') },
        ],
      },
    ],
  },
};

afterEach(() => { vi.unstubAllGlobals(); });

describe('the hero shell', () => {
  it('renders the four event photographs, in order, and nothing else', async () => {
    vi.stubGlobal('fetch', mockApi({ '/pages/home': HOME_PAGE }));
    const { container } = renderWithProviders(<Home />);

    await waitFor(() => expect(container.querySelectorAll('.pcn-hero-scene').length).toBe(4));

    const scenes = [...container.querySelectorAll('.pcn-hero-scene')].map((s) => s.getAttribute('style'));
    ['hero-acfta', 'hero-table', 'hero-crowd', 'hero-podium'].forEach((name, i) => {
      expect(scenes[i]).toContain(`${name}.jpg`);
    });
    // The retired map and stock slides leave nothing behind.
    expect(container.querySelector('.pcn-hero-scene--map')).toBeNull();
    expect(scenes.join('')).not.toMatch(/hero-(forum|gift|border|beyond)/);
  });

  it('gives the hero its own background so the parallax hook has something to drift', async () => {
    vi.stubGlobal('fetch', mockApi({ '/pages/home': HOME_PAGE }));
    const { container } = renderWithProviders(<Home />);

    await waitFor(() => expect(container.querySelector('.pcn-hero-scene')).toBeTruthy());
    // useParallax drifts backgroundPositionY, which needs a background image.
    expect(container.querySelector('.hero-wrap').style.backgroundImage).toContain('hero-acfta.jpg');
  });

  it('lays no second overlay over the slides', async () => {
    vi.stubGlobal('fetch', mockApi({ '/pages/home': HOME_PAGE }));
    const { container } = renderWithProviders(<Home />);

    await waitFor(() => expect(container.querySelector('.pcn-hero-scene')).toBeTruthy());
    expect(container.querySelectorAll('.hero-wrap > .overlay')).toHaveLength(0);
  });

  it('shows the first slide\'s own eyebrow and paragraph on load', async () => {
    vi.stubGlobal('fetch', mockApi({ '/pages/home': HOME_PAGE }));
    const { container } = renderWithProviders(<Home />);

    await waitFor(() => expect(container.querySelector('.pcn-hero-phrase')).toBeTruthy());
    expect(container.querySelector('.pcn-hero .subheading').textContent).toBe('Recognition');
    expect(container.querySelector('.pcn-hero p.mb-4').textContent).toBe('Recognised at events.');
  });

  it('cycles through all four slides and loops back to the first', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      vi.stubGlobal('fetch', mockApi({ '/pages/home': HOME_PAGE }));
      const { container } = renderWithProviders(<Home />);
      await waitFor(() => expect(container.querySelector('.pcn-hero-phrase')).toBeTruthy());

      const phrase = () => container.querySelector('.pcn-hero-phrase').textContent;
      const seen = [phrase()];
      // Step the clock in small increments until the phrase changes, so the
      // test does not depend on the exact length of a slide.
      for (let guard = 0; seen.length < 5 && guard < 400; guard += 1) {
        await act(async () => { vi.advanceTimersByTime(250); });
        if (phrase() !== seen[seen.length - 1]) seen.push(phrase());
      }
      expect(seen).toEqual(['every event', 'the table', 'the room', 'the stage', 'every event']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows the active slide\'s phrase, with no typewriter left behind', async () => {
    vi.stubGlobal('fetch', mockApi({ '/pages/home': HOME_PAGE }));
    const { container } = renderWithProviders(<Home />);

    await waitFor(() => expect(container.querySelector('.pcn-hero-phrase')).toBeTruthy());

    const phrase = container.querySelector('.pcn-hero-phrase');
    // One phrase at a time — the first slide's, on load.
    expect(container.querySelectorAll('.pcn-hero-phrase')).toHaveLength(1);
    expect(phrase.textContent).toBe('every event');
    // The heading keeps its fixed half.
    expect(container.querySelector('h1').textContent).toContain('Sports law, across');
    // Nothing of the typewriter or its blinking cursor survives.
    expect(container.querySelector('.txt-rotate')).toBeNull();
    expect(container.querySelector('.wrap')).toBeNull();
  });

  it('is no longer full-viewport height', async () => {
    vi.stubGlobal('fetch', mockApi({ '/pages/home': HOME_PAGE }));
    const { container } = renderWithProviders(<Home />);

    await waitFor(() => expect(container.querySelector('.hero-wrap')).toBeTruthy());
    const hero = container.querySelector('.hero-wrap');

    // .js-fullheight is 100vh. The hero carries the capped class instead, and
    // must not carry both — that was the point of replacing it.
    expect(hero.classList.contains('js-fullheight')).toBe(false);
    expect(hero.classList.contains('pcn-hero')).toBe(true);
    expect(container.querySelector('.slider-text.js-fullheight')).toBeNull();
  });
});

describe('the seeded hero, against the running API', () => {
  it('serves four hero items, all event photographs', async () => {
    let page;
    try {
      const res = await fetch(`${API}/public/pages/home`);
      if (!res.ok) return; // API not up; live checks are skipped, as in live-smoke.
      page = (await res.json()).data;
    } catch {
      return;
    }

    const hero = page.sections.find((s) => s.key === 'hero');
    expect(hero.items).toHaveLength(4);
    expect(hero.items.map((i) => i.image.secureUrl)).toEqual([
      '/hero/hero-acfta.jpg', '/hero/hero-table.jpg', '/hero/hero-crowd.jpg', '/hero/hero-podium.jpg',
    ]);
  });
});
