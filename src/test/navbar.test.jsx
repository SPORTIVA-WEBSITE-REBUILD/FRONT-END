import { describe, it, expect, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, mockApi, LAYOUT } from './utils.jsx';
import Navbar from '../layout/Navbar.jsx';

const SETTINGS = {
  data: {
    settings: { siteName: 'PCN Sportiva LP', seoDefaults: {}, contact: {}, socials: [] },
    navigation: { header: [{ label: 'Home', href: '/' }, { label: 'Contact', href: '/contact' }], footer: [] },
    layout: LAYOUT,
  },
};

const ACTIVE_WEBINAR = { data: { isHeroActive: true, registrationOpen: true } };

afterEach(() => vi.unstubAllGlobals());

describe('Navbar: webinar "Register" link and the CTA pill it must not crowd out', () => {
  it('shows the extra "Register for the webinar" link on an unrelated page while the hero is active', async () => {
    vi.stubGlobal('fetch', mockApi({ '/settings': SETTINGS, '/webinar': ACTIVE_WEBINAR }));
    renderWithProviders(<Navbar />, { route: '/contact' });
    await waitFor(() => expect(screen.getByText('PCN Sportiva LP')).toBeInTheDocument());
    expect(await screen.findByRole('link', { name: 'Register for the webinar' })).toBeInTheDocument();
    // The CTA pill is always present too, and never crowded out by this item.
    expect(screen.getByRole('link', { name: 'Talk to a Lawyer' })).toBeInTheDocument();
  });

  it('omits the extra link on the home page, where the hero already shows its own registration form', async () => {
    vi.stubGlobal('fetch', mockApi({ '/settings': SETTINGS, '/webinar': ACTIVE_WEBINAR }));
    renderWithProviders(<Navbar />, { route: '/' });
    await waitFor(() => expect(screen.getByText('PCN Sportiva LP')).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: 'Register for the webinar' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Talk to a Lawyer' })).toBeInTheDocument();
  });

  it('omits the extra link on the /webinar page itself', async () => {
    vi.stubGlobal('fetch', mockApi({ '/settings': SETTINGS, '/webinar': ACTIVE_WEBINAR }));
    renderWithProviders(<Navbar />, { route: '/webinar' });
    await waitFor(() => expect(screen.getByText('PCN Sportiva LP')).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: 'Register for the webinar' })).not.toBeInTheDocument();
  });
});
