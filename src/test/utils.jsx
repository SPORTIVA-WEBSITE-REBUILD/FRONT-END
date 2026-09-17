import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/** Renders a component with the same providers main.jsx installs. */
export function renderWithProviders(ui, { route = '/' } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

/**
 * The layout page as the API serves it: every interface label already filled
 * with the template's wording.
 */
export const LAYOUT = {
  slug: 'layout',
  sections: [
    { key: 'navCta', cta: { label: 'Free Consultation', href: '/contact' }, labels: { menuToggle: 'Menu' } },
    { key: 'newsletter', heading: 'Subscribe to our Newsletter', labels: { placeholder: 'Enter email address', submit: 'Subscribe', success: 'Thank you for subscribing.', error: 'Please enter a valid email address.' } },
    { key: 'footer', body: 'About the firm.', labels: { servicesHeading: 'Practice Areas', contactHeading: 'Have a Questions?', copyright: 'Copyright ©{year} All rights reserved' } },
    { key: 'hours', heading: 'Business Hours', items: [{ title: 'Opening Days:', text: 'Monday – Friday : 9am to 5pm\nSaturday : closed' }] },
    { key: 'common', labels: { breadcrumbHome: 'Home', readMore: 'Read more', minRead: 'min read', loading: 'Loading', errorTitle: 'We could not load this content', errorText: 'Please check your connection and try again.', notFoundText: 'The page you are looking for is not available.', retry: 'Try again', backHome: 'Back to home', close: 'Close', previous: 'Previous', next: 'Next', of: 'of', playVideo: 'Play video' } },
    { key: 'caseTerms', labels: { partyAthlete: 'Athlete', partyClub: 'Club', outcomeWon: 'Won' } },
    { key: 'jobTerms', labels: { fullTime: 'Full time', onSite: 'On site' } },
  ],
};

export const SETTINGS = {
  data: {
    settings: { siteName: 'PCN Sportiva LP', seoDefaults: {}, contact: {}, socials: [] },
    navigation: { header: [], footer: [] },
    layout: LAYOUT,
  },
};

/**
 * Stubs fetch with a map of "path fragment" -> response body. The site shell's
 * settings are served by default, so a component under test has its labels.
 */
export function mockApi(given) {
  const routes = { ...given };
  if (!Object.keys(routes).some((k) => k.includes('/settings'))) routes['/settings'] = SETTINGS;
  else {
    for (const k of Object.keys(routes)) {
      if (k.includes('/settings') && !routes[k].data.layout) routes[k] = { data: { ...routes[k].data, layout: LAYOUT } };
    }
  }
  return vi.fn((url) => {
    const match = Object.keys(routes).find((key) => String(url).includes(key));
    if (!match) {
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } }),
      });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, ...routes[match] }),
    });
  });
}
