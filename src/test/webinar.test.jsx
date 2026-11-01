import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, waitFor, within, fireEvent } from '@testing-library/react';
import { renderWithProviders, mockApi } from './utils.jsx';
import WebinarHero from '../components/WebinarHero.jsx';
import SpeakersSection from '../components/SpeakersSection.jsx';
import WebinarRegistrationForm from '../components/WebinarRegistrationForm.jsx';
import Home from '../pages/Home.jsx';

afterEach(() => vi.unstubAllGlobals());

const webinar = {
  title: 'Promoting Clean Sport: Strengthening Anti-Doping and Integrity Across the Sports Ecosystem.',
  startsAt: '2026-11-06T15:00:00Z',
  endsAt: '2026-11-06T17:00:00Z',
  timezone: 'Africa/Lagos',
  bannerUrl: 'https://res.cloudinary.com/demo/banner.jpg',
  registrationOpen: true,
  isHeroActive: true,
  hasEnded: false,
  speakers: [
    { name: 'Caroline Mwanzia', role: 'Moderator/Speaker', titleLines: ['Associate, PCN Sportiva LP'], shortBio: 'Short bio text.', order: 1 },
    { name: 'Martina Spreitzer-Kropiunik', role: 'Speaker', titleLines: ['Court President in Austria'], shortBio: '', order: 2 },
  ],
  faq: [{ question: 'How do I join?', answer: 'Click the link in your email.', order: 1 }],
  social: {},
};

function fillAndSubmit({ name = 'Jane Doe', email = 'jane@example.com', consent = true } = {}) {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: name } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
  if (consent) fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Register' }));
}

describe('WebinarHero', () => {
  it('renders the title, a date/time chip and never prints a Meet link anywhere', () => {
    renderWithProviders(<WebinarHero webinar={webinar} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(webinar.title);
    expect(screen.getByText('Fri 6 Nov 2026, 16:00 to 18:00 WAT, Google Meet', { exact: false })).toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain('meet.google.com');
  });

  it('gives the banner explicit width/height attributes (no layout shift)', () => {
    renderWithProviders(<WebinarHero webinar={webinar} />);
    const img = screen.getByAltText(webinar.title);
    expect(img).toHaveAttribute('width');
    expect(img).toHaveAttribute('height');
  });
});

describe('SpeakersSection', () => {
  it('renders every speaker, with shortBio shown only when present and no "undefined" leaking through for one with none', () => {
    renderWithProviders(<SpeakersSection speakers={webinar.speakers} />);
    expect(screen.getByText('Caroline Mwanzia')).toBeInTheDocument();
    expect(screen.getByText('Martina Spreitzer-Kropiunik')).toBeInTheDocument();
    expect(screen.getByText('Short bio text.')).toBeInTheDocument();
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  });

  it('renders nothing when there are no speakers', () => {
    const { container } = renderWithProviders(<SpeakersSection speakers={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('WebinarRegistrationForm', () => {
  it('shows inline validation and does not submit with an invalid email', () => {
    renderWithProviders(<WebinarRegistrationForm idPrefix="t" registrationOpen />);
    fillAndSubmit({ name: 'A', email: 'not-an-email' });
    expect(screen.getByText('Enter your name.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
  });

  it('requires the consent checkbox', () => {
    renderWithProviders(<WebinarRegistrationForm idPrefix="t2" registrationOpen />);
    fillAndSubmit({ consent: false });
    expect(screen.getByText('Please accept to continue.')).toBeInTheDocument();
  });

  it('includes an off-screen honeypot field', () => {
    const { container } = renderWithProviders(<WebinarRegistrationForm idPrefix="t3" registrationOpen />);
    const honeypot = container.querySelector('input[name="website"]');
    expect(honeypot).toBeInTheDocument();
    expect(honeypot.closest('.pcn-honeypot')).toBeInTheDocument();
    expect(honeypot).toHaveAttribute('tabindex', '-1');
  });

  it('submits successfully and shows the success state, with a live region', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { ok: true, message: 'Thanks — you are registered.' } }),
    })));
    renderWithProviders(<WebinarRegistrationForm idPrefix="t4" registrationOpen />);
    fillAndSubmit();
    const status = await screen.findByRole('status');
    expect(within(status).getByText(/you.?re registered/i)).toBeInTheDocument();
  });

  it('shows the closed message and no form fields when registrationOpen is false', () => {
    renderWithProviders(<WebinarRegistrationForm idPrefix="t5" registrationOpen={false} />);
    expect(screen.getByText(/registration .* is now closed/i)).toBeInTheDocument();
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });
});

describe('Home: webinar hero replaces the slider, and fails safe', () => {
  it('shows the normal sliding hero when the webinar fetch has not resolved as active', async () => {
    vi.stubGlobal('fetch', mockApi({
      '/webinar': { data: { isHeroActive: false } },
      '/pages/home': { data: { slug: 'home', title: 'Home', sections: [{ key: 'hero', items: [{ title: 'x' }] }] } },
    }));
    renderWithProviders(<Home />);
    await waitFor(() => expect(document.querySelector('.hero-wrap.pcn-hero')).toBeInTheDocument());
    expect(screen.queryByText(/Register for this webinar/)).not.toBeInTheDocument();
  });

  it('shows the normal sliding hero (fails safe) when the webinar API call errors', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (String(url).includes('/webinar') && !String(url).includes('/pages')) {
        return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({ success: false }) });
      }
      return mockApi({ '/pages/home': { data: { slug: 'home', title: 'Home', sections: [{ key: 'hero', items: [{ title: 'x' }] }] } } })(url);
    }));
    renderWithProviders(<Home />);
    await waitFor(() => expect(document.querySelector('.hero-wrap.pcn-hero')).toBeInTheDocument());
  });

  it('shows the webinar hero and speakers section, and NOT the slider, when isHeroActive is true', async () => {
    vi.stubGlobal('fetch', mockApi({
      '/webinar': { data: webinar },
      '/pages/home': { data: { slug: 'home', title: 'Home', sections: [{ key: 'hero', items: [{ title: 'x' }] }] } },
    }));
    renderWithProviders(<Home />);
    await waitFor(() => expect(screen.getByText(/Register for this webinar/)).toBeInTheDocument());
    expect(document.querySelector('.hero-wrap.pcn-hero')).not.toBeInTheDocument();
    expect(screen.getByText('Caroline Mwanzia')).toBeInTheDocument();
  });
});
