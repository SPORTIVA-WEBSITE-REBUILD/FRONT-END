import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, mockApi } from './utils.jsx';
import { distinctExcerpt, BlogCard, TeamCard } from '../components/template/cards.jsx';
import HiringStrip from '../components/template/HiringStrip.jsx';

afterEach(() => vi.unstubAllGlobals());

const careers = {
  key: 'careers', subheading: 'Careers', heading: "We're hiring",
  cta: { label: 'View all roles', href: '/careers' }, labels: { viewRole: 'View role', closes: 'Closes' },
};

describe('previews of stored content', () => {
  it('shows category, date and reading time on one meta line, with a clamped excerpt', async () => {
    vi.stubGlobal('fetch', mockApi({}));
    renderWithProviders(<BlogCard article={{
      slug: 'a', title: 'Release clauses', excerpt: 'A long excerpt.', publishedAt: '2026-09-16',
      author: { name: 'Pius Ndubuokwu' }, category: { name: 'Analysis' }, readingMinutes: 4,
    }} />);
    await waitFor(() => expect(screen.getByText(/^Analysis · .*2026 · 4 min read$/)).toBeInTheDocument());
    expect(screen.getByText('A long excerpt.')).toHaveClass('pcn-clamp--3');
    expect(screen.getByRole('link', { name: /Read more/ })).toHaveAttribute('href', '/insights/a');
  });

  it('links a team card to the profile and previews the bio', async () => {
    vi.stubGlobal('fetch', mockApi({}));
    const { container } = renderWithProviders(<TeamCard lawyer={{ slug: 'pius', name: 'Pius', role: 'Managing Partner', bioPreview: 'An international sports lawyer.' }} />);
    await waitFor(() => expect(screen.getByRole('link', { name: /View profile/ })).toHaveAttribute('href', '/lawyers/pius'));
    expect(container.querySelector('.front .pcn-stretched-link')).toHaveAttribute('href', '/lawyers/pius');
    expect(screen.getByText('An international sports lawyer.')).toHaveClass('pcn-clamp--2');
  });

  it('lists open roles on the home page', async () => {
    vi.stubGlobal('fetch', mockApi({
      '/vacancies': { data: [{ slug: 'associate', title: 'Associate, Sports Disputes', employmentType: 'full_time', location: 'Lagos, Nigeria', closingDate: '2026-10-31', summary: 'Join the disputes team.' }] },
    }));
    renderWithProviders(<HiringStrip section={careers} />);
    expect(await screen.findByRole('heading', { name: "We're hiring" })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Associate, Sports Disputes' })).toHaveAttribute('href', '/careers/associate');
    expect(screen.getByText(/Full time · Lagos, Nigeria · Closes 31 October 2026/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View role' })).toHaveAttribute('href', '/careers/associate');
  });

  it('renders nothing while no role is open', async () => {
    const fetchMock = mockApi({ '/vacancies': { data: [] } });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderWithProviders(<HiringStrip section={careers} />);
    await waitFor(() => expect(fetchMock.mock.calls.some(([u]) => String(u).includes('/vacancies'))).toBe(true));
    await new Promise((r) => { setTimeout(r, 50); });
    expect(container.querySelector('section')).toBeNull();
  });
});

describe('insight card headline', () => {
  it('shows the headline once when the stored excerpt repeats it', async () => {
    vi.stubGlobal('fetch', mockApi({}));
    const title = 'PCN Sportiva LP attends The Football Law Annual Moot.';
    const { container } = renderWithProviders(<BlogCard article={{ slug: 'm', title, excerpt: title, publishedAt: '2026-09-16' }} />);
    await waitFor(() => expect(container.querySelector('.pcn-blog__title')).toBeTruthy());
    expect(container.textContent.split('Football Law Annual Moot').length - 1).toBe(1);
    expect(container.querySelector('.pcn-blog__excerpt')).toBeNull();
    expect(container.querySelector('.topper')).toBeNull();
  });

  it('keeps only what follows the headline when the excerpt opens with it', () => {
    expect(distinctExcerpt('Big win', 'Big win. The panel ordered payment.')).toBe('The panel ordered payment.');
    expect(distinctExcerpt('Big win', 'Different text.')).toBe('Different text.');
  });
});
