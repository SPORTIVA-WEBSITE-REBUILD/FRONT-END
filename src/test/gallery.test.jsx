import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders, mockApi } from './utils.jsx';
import GallerySection from '../components/GallerySection.jsx';

afterEach(() => vi.unstubAllGlobals());

const img = (n) => ({
  secureUrl: `https://res.cloudinary.com/pkesmajk/image/upload/v1/g${n}.jpg`,
  width: 1600, height: 1200, alt: `Alt text ${n}`,
});

const ITEMS = [
  { _id: '1', title: 'Signing ceremony', description: 'At the federation offices.', location: 'Abuja', takenAt: '2026-03-01T00:00:00Z', image: img(1) },
  { _id: '2', title: 'CAS hearing', description: 'Lausanne.', image: img(2) },
  { _id: '3', title: 'Team photograph', image: img(3) },
];

const withGallery = (data) => mockApi({ '/gallery': { data } });

describe('gallery section', () => {
  it('renders a tile per published image', async () => {
    vi.stubGlobal('fetch', withGallery(ITEMS));
    renderWithProviders(<GallerySection heading="Gallery" subheading="The firm at work" />);

    // Wait on a tile, not the heading: the heading renders during loading too,
    // so waiting on it would race the fetch.
    await screen.findByLabelText('Open image: Signing ceremony');
    expect(screen.getByRole('heading', { name: 'Gallery' })).toBeInTheDocument();
    expect(screen.getByText('The firm at work')).toBeInTheDocument();
    for (const item of ITEMS) {
      expect(screen.getByLabelText(`Open image: ${item.title}`)).toBeInTheDocument();
    }
  });

  it('asks for only the limit it was given and links to the full gallery', async () => {
    const f = withGallery(ITEMS);
    vi.stubGlobal('fetch', f);
    renderWithProviders(<GallerySection heading="Gallery" limit={3} viewAllHref="/gallery" />);

    const link = await screen.findByRole('link', { name: 'View all' });
    expect(link.getAttribute('href')).toBe('/gallery');
    expect(f.mock.calls.some(([u]) => String(u).includes('limit=3'))).toBe(true);
  });

  it('uses the image alt text rather than repeating the title', async () => {
    vi.stubGlobal('fetch', withGallery(ITEMS));
    const { container } = renderWithProviders(<GallerySection heading="Gallery" />);

    await waitFor(() => expect(container.querySelectorAll('img').length).toBeGreaterThan(0));
    expect(container.querySelector('img').getAttribute('alt')).toBe('Alt text 1');
  });

  it('requests responsive sizes rather than full-resolution originals', async () => {
    vi.stubGlobal('fetch', withGallery(ITEMS));
    const { container } = renderWithProviders(<GallerySection heading="Gallery" />);

    await waitFor(() => expect(container.querySelector('img')).toBeTruthy());
    const img0 = container.querySelector('img');
    expect(img0.getAttribute('src')).toContain('f_auto');
    expect(img0.getAttribute('srcset')).toContain('480w');
  });

  // An empty gallery must not leave a stray heading sitting on the home page.
  it('renders nothing at all when no images are published', async () => {
    vi.stubGlobal('fetch', withGallery([]));
    const { container } = renderWithProviders(<GallerySection heading="Gallery" />);

    // The loading skeleton uses .pcn-skeleton; wait for it to clear so this
    // asserts the settled empty state rather than the loading one.
    await waitFor(() => expect(container.querySelector('.pcn-skeleton')).toBeNull());
    await waitFor(() => expect(container.querySelector('section')).toBeNull());
    expect(screen.queryByRole('heading', { name: 'Gallery' })).not.toBeInTheDocument();
  });

  it('surfaces an error state rather than failing silently', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))));
    renderWithProviders(<GallerySection heading="Gallery" />);

    await waitFor(
      () => expect(screen.getByText(/We could not load this content/i)).toBeInTheDocument(),
      { timeout: 5000 },
    );
  });
});

describe('lightbox', () => {
  async function openFirst() {
    vi.stubGlobal('fetch', withGallery(ITEMS));
    const view = renderWithProviders(<GallerySection heading="Gallery" />);
    const button = await screen.findByLabelText('Open image: Signing ceremony');
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    return view;
  }

  it('opens the image with its title and description', async () => {
    await openFirst();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('heading', { name: 'Signing ceremony' })).toBeInTheDocument();
    expect(screen.getByText('At the federation offices.')).toBeInTheDocument();
  });

  it('shows the optional location and date when present', async () => {
    await openFirst();
    expect(screen.getByText(/Abuja/)).toBeInTheDocument();
    expect(screen.getByText(/March 2026/)).toBeInTheDocument();
  });

  it('shows the position within the set', async () => {
    await openFirst();
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
  });

  it('moves to the next and previous image', async () => {
    await openFirst();

    fireEvent.click(screen.getByLabelText('Next'));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'CAS hearing' })).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Previous'));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Signing ceremony' })).toBeInTheDocument());
  });

  it('wraps around at both ends', async () => {
    await openFirst();
    fireEvent.click(screen.getByLabelText('Previous'));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Team photograph' })).toBeInTheDocument());
  });

  it('navigates with the arrow keys', async () => {
    await openFirst();
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    await waitFor(() => expect(screen.getByRole('heading', { name: 'CAS hearing' })).toBeInTheDocument());
  });

  it('closes on Escape', async () => {
    await openFirst();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes on the close button', async () => {
    await openFirst();
    fireEvent.click(screen.getByLabelText('Close'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('locks the page behind it from scrolling, and restores it on close', async () => {
    await openFirst();
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(document.body.style.overflow).not.toBe('hidden'));
  });
});
