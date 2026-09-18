import { describe, it, expect, vi, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import Home from '../pages/Home.jsx';
import { renderWithProviders, mockApi } from './utils.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const MAP_URL = 'https://res.cloudinary.com/pkesmajk/image/upload/v1/pcn-sportiva/hero-beyond.jpg';

/**
 * The home page as the seed leaves it: the firm's map artwork, then two
 * photographs. The map's rings are painted into the image, so the slide is a
 * background like the other two rather than anything drawn in code.
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
        items: [
          { title: 'the continent', image: { secureUrl: MAP_URL, alt: 'Map', width: 1920, height: 1080 } },
          { title: 'every forum', image: { secureUrl: '/hero/hero-forum.jpg', alt: 'Forum', width: 1920, height: 1080 } },
          { title: 'every border', image: { secureUrl: '/hero/hero-gift.jpg', alt: 'Gift', width: 1920, height: 1080 } },
        ],
      },
    ],
  },
};

afterEach(() => { vi.unstubAllGlobals(); });

describe('the hero shell', () => {
  it('renders the three seeded slides, the map among them', async () => {
    vi.stubGlobal('fetch', mockApi({ '/pages/home': HOME_PAGE }));
    const { container } = renderWithProviders(<Home />);

    await waitFor(() => expect(container.querySelectorAll('.pcn-hero-scene').length).toBe(3));

    const scenes = container.querySelectorAll('.pcn-hero-scene');
    expect(scenes[0].getAttribute('style')).toContain('hero-beyond.jpg');
    expect(scenes[1].getAttribute('style')).toContain('hero-forum.jpg');
    expect(scenes[2].getAttribute('style')).toContain('hero-gift.jpg');
  });

  it('marks the map slide so the light layers attach to the drifting layer', async () => {
    vi.stubGlobal('fetch', mockApi({ '/pages/home': HOME_PAGE }));
    const { container } = renderWithProviders(<Home />);

    await waitFor(() => expect(container.querySelector('.pcn-hero-scene--map')).toBeTruthy());
    const scenes = container.querySelectorAll('.pcn-hero-scene');
    // Only the first slide. The photographs carry their own scrim and get no
    // highlight, and the layers must ride the transformed layer, not the hero.
    expect(container.querySelectorAll('.pcn-hero-scene--map')).toHaveLength(1);
    expect(scenes[0].classList.contains('pcn-hero-scene--map')).toBe(true);
  });

  it('gives the hero its own background so the parallax hook has something to drift', async () => {
    vi.stubGlobal('fetch', mockApi({ '/pages/home': HOME_PAGE }));
    const { container } = renderWithProviders(<Home />);

    // .hero-wrap exists from the first render, so wait for a node that only
    // appears once the page data has arrived.
    await waitFor(() => expect(container.querySelector('.pcn-hero-scene--map')).toBeTruthy());
    // useParallax drifts backgroundPositionY, which needs a background image.
    expect(container.querySelector('.hero-wrap').style.backgroundImage).toContain('hero-beyond.jpg');
  });

  it('lays no second overlay over the slides', async () => {
    vi.stubGlobal('fetch', mockApi({ '/pages/home': HOME_PAGE }));
    const { container } = renderWithProviders(<Home />);

    await waitFor(() => expect(container.querySelector('.pcn-hero-scene--map')).toBeTruthy());
    // The map's scrim is the third light layer, inside the transformed layer;
    // the photographs already carry their own.
    expect(container.querySelectorAll('.hero-wrap > .overlay')).toHaveLength(0);
  });

  it('shows the active slide\'s phrase, with no typewriter left behind', async () => {
    vi.stubGlobal('fetch', mockApi({ '/pages/home': HOME_PAGE }));
    const { container } = renderWithProviders(<Home />);

    await waitFor(() => expect(container.querySelector('.pcn-hero-phrase')).toBeTruthy());

    const phrase = container.querySelector('.pcn-hero-phrase');
    // One phrase at a time — the first slide's, on load.
    expect(container.querySelectorAll('.pcn-hero-phrase')).toHaveLength(1);
    expect(phrase.textContent).toBe('the continent');
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
  it('serves three hero items, the first the firm\'s map artwork', async () => {
    let page;
    try {
      const res = await fetch(`${API}/public/pages/home`);
      if (!res.ok) return; // API not up; live checks are skipped, as in live-smoke.
      page = (await res.json()).data;
    } catch {
      return;
    }

    const hero = page.sections.find((s) => s.key === 'hero');
    expect(hero.items).toHaveLength(3);
    expect(hero.items.map((i) => i.title)).toEqual(['the continent', 'every forum', 'every border']);
    expect(hero.items[0].image.secureUrl).toContain('hero-beyond');
    expect(hero.items[1].image.secureUrl).toBe('/hero/hero-forum.jpg');
    expect(hero.items[2].image.secureUrl).toBe('/hero/hero-gift.jpg');
  });
});
