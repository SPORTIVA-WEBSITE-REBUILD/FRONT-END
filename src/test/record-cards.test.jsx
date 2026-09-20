import { describe, it, expect, vi, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import Home from '../pages/Home.jsx';
import { CaseCard } from '../components/template/cards.jsx';
import { renderWithProviders, mockApi } from './utils.jsx';

/**
 * Three real matters, the shape the seed and public API produce once
 * restructured onto fields — see docs/design-direction.md, "Record cards".
 */
const CASE = (over = {}) => ({
  _id: '1',
  slug: 'case-one',
  title: 'Karim Abubakar v Al Qasim',
  forum: 'FIFA DRC',
  year: 2026,
  partyRepresented: 'athlete',
  outcome: 'won',
  summary: 'A press-release sentence about the matter.',
  holding: 'The chamber found in favour of the player and ordered the club to pay outstanding remuneration.',
  anonymised: false,
  ...over,
});

const HOME_PAGE = {
  data: {
    slug: 'home',
    seo: {},
    sections: [
      { key: 'hero', heading: 'Sports law', items: [] },
      { key: 'record', subheading: 'Outcomes', heading: 'Our record', cta: { label: 'See the full record', href: '/record' } },
    ],
  },
};

const cases = (n) => ({
  data: Array.from({ length: n }, (_, i) => CASE({
    _id: String(i + 1),
    slug: `case-${i + 1}`,
    title: `Matter ${i + 1}`,
    year: 2026 - i,
  })),
  meta: { page: 1, limit: 3, total: n, pages: 1 },
});

afterEach(() => { vi.unstubAllGlobals(); });

describe('the record section on the home page', () => {
  it('renders exactly three cards, however many cases the API returns', async () => {
    vi.stubGlobal('fetch', mockApi({ '/pages/home': HOME_PAGE, '/cases': cases(3) }));
    const { container } = renderWithProviders(<Home />);

    await waitFor(() => expect(container.querySelectorAll('.pcn-case').length).toBe(3));
  });

  it('renders no image on any case card', async () => {
    vi.stubGlobal('fetch', mockApi({ '/pages/home': HOME_PAGE, '/cases': cases(3) }));
    const { container } = renderWithProviders(<Home />);

    await waitFor(() => expect(container.querySelectorAll('.pcn-case').length).toBe(3));
    for (const card of container.querySelectorAll('.pcn-case')) {
      expect(card.querySelector('img')).toBeNull();
      expect(card.querySelector('[style*="background-image"]')).toBeNull();
    }
  });
});

describe('the case card', () => {
  it('clamps the title with normal word-wrapping, never a mid-word break', () => {
    const { container } = renderWithProviders(<CaseCard item={CASE()} />);
    const title = container.querySelector('.pcn-case__title');
    expect(title).toBeTruthy();
    // The clamp utility only cuts between words when nothing forces a
    // mid-word split — asserting the class is present and that no inline
    // or utility class sets word-break/overflow-wrap on the title.
    expect(title.className).toContain('pcn-clamp');
    expect(title.style.wordBreak).toBe('');
    expect(title.style.overflowWrap).toBe('');
  });

  it('renders an anonymised case with no party names', () => {
    const { container } = renderWithProviders(<CaseCard item={CASE({
      title: 'Karim Abubakar v Al Qasim',
      anonymised: true,
      holding: 'The chamber found in favour of the player and ordered the club to pay outstanding remuneration.',
    })} />);

    expect(container.textContent).not.toContain('Karim Abubakar');
    expect(container.textContent).not.toContain('Al Qasim');
    expect(container.querySelector('.pcn-case__title').textContent).toBe('Anonymised matter');
  });
});
