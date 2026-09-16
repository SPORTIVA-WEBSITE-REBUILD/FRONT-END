import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, mockApi } from './utils.jsx';
import Navbar from '../layout/Navbar.jsx';
import Footer from '../layout/Footer.jsx';
import Record from '../pages/Record.jsx';
import Insights from '../pages/Insights.jsx';

const SETTINGS = {
  data: {
    settings: {
      siteName: 'PCN Sportiva LP',
      tagline: 'Sports Law',
      contact: { email: 'enquiries@pcnsportivalp.com', phone: '+234 801 234 5678', address: 'Lagos, Nigeria' },
      socials: [{ platform: 'linkedin', url: 'https://linkedin.com/company/x' }],
      copyrightText: '© 2026 PCN Sportiva LP',
      seoDefaults: {},
    },
    navigation: {
      header: [
        { label: 'Home', href: '/' },
        { label: 'Record', href: '/record' },
      ],
      footer: [{ label: 'Privacy Policy', href: '/privacy-policy' }],
    },
  },
};

const CASES = {
  data: [{
    _id: '1',
    slug: 'appeal-against-a-sanction',
    title: 'Appeal against a sanction',
    forum: 'CAS',
    year: 2026,
    partyRepresented: 'athlete',
    outcome: 'won',
    summary: 'Sanction set aside on appeal.',
  }],
  meta: { page: 1, limit: 12, total: 1, pages: 1 },
};

beforeEach(() => { vi.restoreAllMocks(); });
afterEach(() => { vi.unstubAllGlobals(); });

describe('the site renders content from the API, not from hardcoded copy', () => {
  it('builds the navigation from what the administrator saved', async () => {
    vi.stubGlobal('fetch', mockApi({ '/settings': SETTINGS }));
    renderWithProviders(<Navbar />);

    await waitFor(() => expect(screen.getByText('PCN Sportiva LP')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'Record' })).toHaveAttribute('href', '/record');
    expect(screen.getByText('Sports Law')).toBeInTheDocument();
  });

  it('shows the firm contact details from settings in the footer', async () => {
    vi.stubGlobal('fetch', mockApi({
      '/settings': SETTINGS,
      '/services': { data: [{ slug: 'disputes', title: 'Disputes' }] },
    }));
    renderWithProviders(<Footer />);

    await waitFor(() => {
      expect(screen.getByText('enquiries@pcnsportivalp.com')).toBeInTheDocument();
    });
    expect(screen.getByText('Lagos, Nigeria')).toBeInTheDocument();
    expect(screen.getByText('© 2026 PCN Sportiva LP')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Disputes/ })).toBeInTheDocument();
  });

  it('renders the case archive from the API', async () => {
    vi.stubGlobal('fetch', mockApi({
      '/settings': SETTINGS,
      '/cases/filters': { data: { forums: ['CAS'], years: [2026], parties: ['athlete'], outcomes: ['won'] } },
      '/cases': CASES,
      '/pages/': { data: { sections: [], seo: {} } },
    }));
    renderWithProviders(<Record />, { route: '/record' });

    await waitFor(() => {
      expect(screen.getByText('Appeal against a sanction')).toBeInTheDocument();
    });
    expect(screen.getByText('Sanction set aside on appeal.')).toBeInTheDocument();
    // "CAS" appears both as a filter option and as the badge on the result,
    // so assert on the badge specifically.
    expect(screen.getByText('CAS', { selector: '.pcn-badge' })).toBeInTheDocument();
  });

  it('populates the archive filters from the API rather than a hardcoded list', async () => {
    vi.stubGlobal('fetch', mockApi({
      '/settings': SETTINGS,
      '/cases/filters': { data: { forums: ['CAS', 'NFF'], years: [2026, 2024], parties: ['athlete', 'club'], outcomes: ['won'] } },
      '/cases': CASES,
      '/pages/': { data: { sections: [], seo: {} } },
    }));
    renderWithProviders(<Record />, { route: '/record' });

    const forum = await screen.findByLabelText('Forum');
    await waitFor(() => {
      expect(forum.querySelectorAll('option')).toHaveLength(3); // "All forums" + 2
    });
    expect(screen.getByLabelText('Year').querySelectorAll('option')).toHaveLength(3);
  });

  it('reads the filters out of the URL so a filtered view can be shared', async () => {
    const fetchMock = mockApi({
      '/settings': SETTINGS,
      '/cases/filters': { data: { forums: ['CAS'], years: [2026], parties: ['athlete'], outcomes: ['won'] } },
      '/cases': CASES,
      '/pages/': { data: { sections: [], seo: {} } },
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<Record />, { route: '/record?forum=CAS&year=2026' });

    await waitFor(() => {
      const called = fetchMock.mock.calls.map(([u]) => String(u));
      expect(called.some((u) => u.includes('forum=CAS') && u.includes('year=2026'))).toBe(true);
    });
  });

  it('shows an empty state rather than a blank page when nothing matches', async () => {
    vi.stubGlobal('fetch', mockApi({
      '/settings': SETTINGS,
      '/cases/filters': { data: { forums: [], years: [], parties: [], outcomes: [] } },
      '/cases': { data: [], meta: { page: 1, limit: 12, total: 0, pages: 1 } },
      '/pages/': { data: { sections: [], seo: {} } },
    }));
    renderWithProviders(<Record />, { route: '/record' });

    await waitFor(() => {
      expect(screen.getByText(/No matters match those filters/i)).toBeInTheDocument();
    });
  });

  it('shows an empty state on the Insights page when nothing is published', async () => {
    vi.stubGlobal('fetch', mockApi({
      '/settings': SETTINGS,
      '/articles': { data: [], meta: { page: 1, limit: 9, total: 0, pages: 1 } },
      '/pages/': { data: { sections: [], seo: {} } },
    }));
    renderWithProviders(<Insights />, { route: '/insights' });

    await waitFor(() => {
      expect(screen.getByText(/No articles yet/i)).toBeInTheDocument();
    });
  });

  it('surfaces an error state when the API is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network down'))));
    renderWithProviders(<Record />, { route: '/record' });

    // The content hooks retry once before giving up, so allow for that.
    await waitFor(() => {
      expect(screen.getByText(/We could not load this content/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});

describe('malicious navigation data cannot reach the DOM', () => {
  it('drops a nav item whose link cannot be vetted', async () => {
    vi.stubGlobal('fetch', mockApi({
      '/settings': {
        data: {
          settings: { siteName: 'PCN Sportiva LP', seoDefaults: {} },
          navigation: {
            header: [
              { label: 'Safe', href: '/record' },
              { label: 'Evil', href: 'javascript:alert(1)' },
              { label: 'Redirect', href: '/\\evil.example' },
            ],
            footer: [],
          },
        },
      },
    }));
    renderWithProviders(<Navbar />);

    await waitFor(() => expect(screen.getByRole('link', { name: 'Safe' })).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: 'Evil' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Redirect' })).not.toBeInTheDocument();
  });
});

describe('structured data reaches the document head', () => {
  it('emits a LegalService graph on the home page', async () => {
    vi.stubGlobal('fetch', mockApi({
      '/settings': SETTINGS,
      '/pages/home': { data: { title: 'Home', sections: [{ key: 'hero', heading: 'Sports law' }], seo: {} } },
      '/services': { data: [] },
      '/cases': { data: [], meta: { page: 1, limit: 3, total: 0, pages: 1 } },
      '/articles': { data: [], meta: { page: 1, limit: 3, total: 0, pages: 1 } },
    }));

    const Home = (await import('../pages/Home.jsx')).default;
    renderWithProviders(<Home />, { route: '/' });

    await waitFor(() => {
      const tag = document.querySelector('script[type="application/ld+json"]');
      expect(tag).toBeTruthy();
      const data = JSON.parse(tag.textContent);
      expect(data['@context']).toBe('https://schema.org');
      const types = data['@graph'].map((n) => n['@type']);
      expect(types).toContain('LegalService');
      expect(types).toContain('WebSite');
    }, { timeout: 4000 });
  });
});
