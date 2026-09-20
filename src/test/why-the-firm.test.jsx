import { describe, it, expect, vi, afterEach } from 'vitest';
import { waitFor, fireEvent } from '@testing-library/react';
import AboutBlock from '../components/template/AboutBlock.jsx';
import Home from '../pages/Home.jsx';
import { renderWithProviders, mockApi } from './utils.jsx';

const STOCK = 'https://res.cloudinary.com/pkesmajk/image/upload/v1/pcn-sportiva/placeholders/neutral-placeholder.jpg';

const intro = (over = {}) => ({
  key: 'intro',
  subheading: 'About',
  heading: 'Why the firm',
  body: 'Our lawyers work across all of the firm\'s practice areas.',
  items: [
    { title: 'Our Mission', text: 'The mission.' },
    { title: 'Who We Advise', text: 'Federations, clubs, athletes.' },
    { title: 'Our Record', text: 'Counsel before the FIFA Football Tribunal.' },
  ],
  ...over,
});

afterEach(() => { vi.unstubAllGlobals(); });

describe('the "Why the firm" section', () => {
  it('renders the firm\'s own photograph and no stock image', () => {
    const { container } = renderWithProviders(<AboutBlock intro={intro()} recordCount={9} />);

    const images = [...container.querySelectorAll('img')];
    expect(images).toHaveLength(1);
    expect(images[0].getAttribute('src')).toBe('/about/why-the-firm.jpg');
    expect(images[0].getAttribute('alt')).toBe('The PCN Sportiva team at the Football Law Annual Moot.');

    // The stadium placeholder must not reach the page by any route — as an
    // <img>, as a CSS background, or as a stray stock URL in the markup.
    expect(container.innerHTML).not.toContain('neutral-placeholder');
    expect(container.innerHTML).not.toContain('placeholders/');
    expect(container.querySelector('[style*="background-image"]')).toBeNull();
  });

  it('declares the photograph at its real 3:2 size so the space is reserved', () => {
    const { container } = renderWithProviders(<AboutBlock intro={intro()} recordCount={9} />);
    const img = container.querySelector('img');
    expect(img.getAttribute('width')).toBe('1200');
    expect(img.getAttribute('height')).toBe('800');
  });

  it('drops the years-of-experience badge', () => {
    const { container } = renderWithProviders(<AboutBlock intro={intro()} recordCount={9} />);
    expect(container.querySelector('.years')).toBeNull();
    expect(container.textContent).not.toMatch(/years of experience/i);
  });

  it('gives the heading the same eyebrow the Services section uses', () => {
    const { container } = renderWithProviders(<AboutBlock intro={intro()} recordCount={9} />);
    const eyebrow = container.querySelector('.heading-section .subheading');
    expect(eyebrow.textContent).toBe('About');
    expect(container.querySelector('h2').textContent).toBe('Why the firm');
  });
});

describe('the record tab\'s count', () => {
  it('comes from the case collection, not from a figure in the copy', () => {
    const { container } = renderWithProviders(<AboutBlock intro={intro()} recordCount={9} />);
    const count = container.querySelector('.pcn-tabs__count');

    // The number rendered is whatever was counted, not a literal in the copy.
    expect(count.textContent).toBe('9 matters published in the record');
    expect(count.getAttribute('href')).toBe('/record');

    // A different count renders a different number from the same CMS text.
    const other = renderWithProviders(<AboutBlock intro={intro()} recordCount={1} />);
    expect(other.container.querySelector('.pcn-tabs__count').textContent)
      .toBe('1 matter published in the record');

    // And none of the unsupported figures survive anywhere in the section.
    expect(container.textContent).not.toMatch(/over 50|over 150/);
  });

  it('omits the line entirely when nothing is published', () => {
    const { container } = renderWithProviders(<AboutBlock intro={intro()} recordCount={0} />);
    expect(container.querySelector('.pcn-tabs__count')).toBeNull();
    expect(container.textContent).not.toMatch(/0 matters/);
  });

  it('hangs the count off the record tab only', () => {
    const { container } = renderWithProviders(<AboutBlock intro={intro()} recordCount={9} />);
    expect(container.querySelectorAll('.pcn-tabs__count')).toHaveLength(1);
    const panels = [...container.querySelectorAll('[role="tabpanel"]')];
    const recordPanel = panels[2];
    expect(recordPanel.querySelector('.pcn-tabs__count')).toBeTruthy();
  });
});

describe('the tabs', () => {
  it('follows the ARIA tabs pattern', () => {
    const { container } = renderWithProviders(<AboutBlock intro={intro()} recordCount={9} />);
    const tabs = [...container.querySelectorAll('[role="tab"]')];
    const panels = [...container.querySelectorAll('[role="tabpanel"]')];

    expect(container.querySelector('[role="tablist"]')).toBeTruthy();
    expect(tabs).toHaveLength(3);
    expect(panels).toHaveLength(3);

    // The selected tab is the only one in the tab order, and each tab points
    // at the panel it controls.
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('tabindex')).toBe('0');
    expect(tabs[1].getAttribute('tabindex')).toBe('-1');
    tabs.forEach((tab, i) => {
      expect(tab.getAttribute('aria-controls')).toBe(panels[i].id);
      expect(panels[i].getAttribute('aria-labelledby')).toBe(tab.id);
    });
  });

  it('moves between tabs with the arrow keys, wrapping at both ends', () => {
    const { container } = renderWithProviders(<AboutBlock intro={intro()} recordCount={9} />);
    const list = container.querySelector('[role="tablist"]');
    const tabs = () => [...container.querySelectorAll('[role="tab"]')];

    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(tabs()[1].getAttribute('aria-selected')).toBe('true');

    fireEvent.keyDown(list, { key: 'ArrowLeft' });
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');

    // Wraps backwards off the first tab to the last.
    fireEvent.keyDown(list, { key: 'ArrowLeft' });
    expect(tabs()[2].getAttribute('aria-selected')).toBe('true');

    fireEvent.keyDown(list, { key: 'Home' });
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');

    fireEvent.keyDown(list, { key: 'End' });
    expect(tabs()[2].getAttribute('aria-selected')).toBe('true');
  });

  it('keeps every panel in the layout so the page below cannot jump', () => {
    const { container } = renderWithProviders(<AboutBlock intro={intro()} recordCount={9} />);
    const panels = [...container.querySelectorAll('[role="tabpanel"]')];

    // Inactive panels carry `hidden` for the accessibility tree, but app.css
    // overrides the display:none it implies so they still size the grid.
    expect(panels[0].hasAttribute('hidden')).toBe(false);
    expect(panels[1].hasAttribute('hidden')).toBe(true);
    expect(panels[2].hasAttribute('hidden')).toBe(true);
  });
});

describe('the section on the home page', () => {
  it('takes its count from the archive query rather than a hard-coded number', async () => {
    const HOME = {
      data: {
        slug: 'home',
        seo: {},
        sections: [intro()],
      },
    };
    vi.stubGlobal('fetch', mockApi({
      '/pages/home': HOME,
      // Seven published cases in the archive; seven is what the tab must show.
      '/cases': { data: [], meta: { page: 1, limit: 8, total: 7, pages: 1 } },
    }));

    const { container } = renderWithProviders(<Home />);
    await waitFor(() => expect(container.querySelector('.pcn-tabs__count')).toBeTruthy());
    expect(container.querySelector('.pcn-tabs__count').textContent)
      .toBe('7 matters published in the record');
  });

  it('renders no stock image anywhere on the page', async () => {
    const HOME = { data: { slug: 'home', seo: {}, sections: [intro()] } };
    vi.stubGlobal('fetch', mockApi({
      '/pages/home': HOME,
      '/cases': { data: [], meta: { page: 1, limit: 8, total: 0, pages: 1 } },
    }));

    const { container } = renderWithProviders(<Home />);
    await waitFor(() => expect(container.querySelector('.pcn-why')).toBeTruthy());
    expect(container.innerHTML).not.toContain('neutral-placeholder');
    expect(container.innerHTML).not.toContain(STOCK);
  });
});

/*
 * The tab colours' WCAG contrast, checked as plain arithmetic rather than by
 * rendering — jsdom has no layout engine and cannot report a real computed
 * colour, and a browser screenshot cannot be asserted on in CI. These mirror
 * the literal values in app.css by hand; if either changes, this must be
 * updated by hand too, which is the trade-off for not needing a browser here.
 */
describe('the tabs\' colour contrast, computed against the values in app.css', () => {
  const channel = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  const contrast = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const over = (fg, alpha, bg) => fg.map((c, i) => (alpha * c) + ((1 - alpha) * bg[i]));

  const WHITE = [255, 255, 255];
  const BLUE = [4, 125, 214]; // --blue
  const BLUE_DEEP = [3, 90, 154]; // --blue-deep

  it('clears 4.5:1 for --blue-deep, the resting pill\'s hover and focus colour', () => {
    expect(contrast(WHITE, BLUE_DEEP)).toBeGreaterThanOrEqual(4.5);
  });

  it('records the resting pill\'s own shortfall rather than hiding it', () => {
    // White on solid --blue is a hair under AA at this text size (15px
    // semibold needs 4.5:1, not the 3:1 "large text" floor). --blue is used
    // here exactly because it is the literal colour requested for parity with
    // the "Free Consultation" CTA; fixing this means revisiting that token
    // site-wide, which is out of scope for this section. This test exists so
    // the shortfall stays visible instead of silently drifting further.
    const restingContrast = contrast(WHITE, BLUE);
    expect(restingContrast).toBeGreaterThan(4.0);
    expect(restingContrast).toBeLessThan(4.5);
  });

  it(
    'shows the selected pill\'s white glass at every shipped opacity, over the '
    + 'white page it actually sits on, composites to plain white',
    () => {
      // White blended with white is white regardless of the mix ratio — the
      // formula is alpha*255 + (1-alpha)*255 = 255 for every alpha. This
      // matters because "raise the opacity if contrast is short" is the
      // obvious first fix to reach for, and it is a no-op here: there is
      // nothing else behind this pill to composite against.
      for (const alpha of [0.72, 0.85, 0.92, 1.0]) {
        expect(over(WHITE, alpha, WHITE)).toEqual(WHITE);
      }
    },
  );

  it('carries the same known shortfall as the resting pill, not a worse one', () => {
    // --blue text over the selected pill's white glass, composited over the
    // white page behind it, is contrast(--blue, white) — identical to the
    // resting pill's white-on-`--blue`, since contrast is symmetric in its
    // two colours and both pairings reduce to the same two colours.
    const selectedContrast = contrast(BLUE, over(WHITE, 0.72, WHITE));
    const restingContrast = contrast(WHITE, BLUE);
    expect(selectedContrast).toBeCloseTo(restingContrast, 5);
    expect(selectedContrast).toBeGreaterThan(4.0);
    expect(selectedContrast).toBeLessThan(4.5);
  });
});
