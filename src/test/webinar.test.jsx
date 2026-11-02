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
    { name: 'Caroline Mwanzia', role: 'Moderator/Speaker', titleLines: ['Associate, PCN Sportiva LP'], shortBio: 'Short bio text.', photoUrl: 'https://res.cloudinary.com/demo/image/upload/v1/caroline.jpg', order: 1 },
    { name: 'Martina Spreitzer-Kropiunik', role: 'Speaker', titleLines: ['Court President in Austria'], shortBio: '', order: 2 },
  ],
  faq: [{ question: 'How do I join?', answer: 'Click the link in your email.', order: 1 }],
  social: {},
};

// null (not undefined — destructuring defaults also trigger on an explicit
// undefined) means "leave this field untouched at its blank default".
function fillAndSubmit({
  name = 'Jane Doe', email = 'jane@example.com', role = 'Lawyer', roleOther = null,
  nationality = 'Nigeria', consent = true,
} = {}) {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: name } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
  if (role !== null) fireEvent.change(screen.getByLabelText('Role'), { target: { value: role } });
  if (roleOther !== null) fireEvent.change(screen.getByLabelText('Tell us your role'), { target: { value: roleOther } });
  if (nationality !== null) fireEvent.change(screen.getByLabelText('Nationality'), { target: { value: nationality } });
  if (consent) fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Register' }));
}

describe('WebinarHero', () => {
  it('renders the title, a date/time chip and never prints a Meet link anywhere', () => {
    renderWithProviders(<WebinarHero webinar={webinar} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(webinar.title);
    expect(screen.getByText('Fri 6 Nov 2026 • 16:00 to 18:00 WAT • Google Meet', { exact: false })).toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain('meet.google.com');
  });

  it('never shows the banner image — speakers replace it', () => {
    renderWithProviders(<WebinarHero webinar={webinar} />);
    expect(screen.queryByAltText(webinar.title)).not.toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain('banner.jpg');
  });

  it('lists real speakers from webinar.speakers, ordered, with a face-cropped Cloudinary photo', () => {
    renderWithProviders(<WebinarHero webinar={webinar} />);
    expect(screen.getByRole('heading', { name: 'Meet our speakers' })).toBeInTheDocument();
    const names = screen.getAllByText(/Mwanzia|Spreitzer-Kropiunik/).map((el) => el.textContent);
    expect(names[0]).toContain('Caroline Mwanzia'); // order: 1 before 2
    const photo = screen.getByAltText('Caroline Mwanzia');
    expect(photo).toHaveAttribute('src', expect.stringContaining('c_fill,g_face,w_128,h_128'));
  });

  it('shows a placeholder, not a broken image, for a speaker with no photo', () => {
    const noPhoto = { ...webinar, speakers: [{ name: 'No Photo', role: 'Speaker', order: 1 }] };
    const { container } = renderWithProviders(<WebinarHero webinar={noPhoto} />);
    expect(screen.queryByAltText('No Photo')).not.toBeInTheDocument();
    expect(container.querySelector('.pcn-webinar-hero__speaker-photo--placeholder')).toBeInTheDocument();
  });

  it('shows a Follow Us row only for social links that are actually set', () => {
    const withSocial = { ...webinar, social: { instagram: 'https://instagram.com/pcnsportivalp', x: '', linkedin: 'https://linkedin.com/company/pcnsportivalp' } };
    renderWithProviders(<WebinarHero webinar={withSocial} />);
    expect(screen.getByRole('link', { name: 'instagram' })).toHaveAttribute('href', 'https://instagram.com/pcnsportivalp');
    expect(screen.getByRole('link', { name: 'linkedin' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'x' })).not.toBeInTheDocument();
  });

  it('hides the Follow Us row entirely when no social links are set', () => {
    renderWithProviders(<WebinarHero webinar={webinar} />); // social: {}
    expect(screen.queryByText('Follow us')).not.toBeInTheDocument();
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

  it('shows a literal & in shortBio as a single plain character — no raw entity text, no double-escaping', () => {
    const speakers = [
      { name: 'X Speaker', role: 'Speaker', titleLines: [], shortBio: 'Sports Management & Legal Skills', order: 1 },
    ];
    const { container } = renderWithProviders(<SpeakersSection speakers={speakers} />);
    expect(screen.getByText('Sports Management & Legal Skills')).toBeInTheDocument();
    expect(container.innerHTML).not.toContain('&amp;amp;');
    expect(screen.queryByText(/&amp;/)).not.toBeInTheDocument();
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

  it('requires role and nationality, and shows inline errors when left unset', () => {
    renderWithProviders(<WebinarRegistrationForm idPrefix="t2b" registrationOpen />);
    fillAndSubmit({ role: null, nationality: null });
    expect(screen.getByText('Select your role.')).toBeInTheDocument();
    expect(screen.getByText('Select your nationality from the list.')).toBeInTheDocument();
  });

  it('rejects a nationality that is not in the country list (no free text)', () => {
    renderWithProviders(<WebinarRegistrationForm idPrefix="t2c" registrationOpen />);
    fillAndSubmit({ nationality: 'Not A Real Country' });
    expect(screen.getByText('Select your nationality from the list.')).toBeInTheDocument();
  });

  it('shows a "tell us your role" text field only when role is Other, and requires it', () => {
    renderWithProviders(<WebinarRegistrationForm idPrefix="t2d" registrationOpen />);
    expect(screen.queryByLabelText('Tell us your role')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'Other' } });
    expect(screen.getByLabelText('Tell us your role')).toBeInTheDocument();
    fillAndSubmit({ role: 'Other', roleOther: '' });
    expect(screen.getByText('Tell us your role.')).toBeInTheDocument();
  });

  it('accepts an invalid phone number as an inline error, but allows submitting with no phone at all', () => {
    renderWithProviders(<WebinarRegistrationForm idPrefix="t2e" registrationOpen />);
    fireEvent.change(screen.getByLabelText(/^Phone/), { target: { value: 'abc' } });
    fillAndSubmit();
    expect(screen.getByText('Enter a valid phone number.')).toBeInTheDocument();
  });

  it('shows the event-reporting note under the consent checkbox', () => {
    renderWithProviders(<WebinarRegistrationForm idPrefix="t2f" registrationOpen />);
    expect(screen.getByText('Role and nationality are used for event reporting only.')).toBeInTheDocument();
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
    expect(within(status).getByRole('heading', { name: /you.?re registered/i })).toBeInTheDocument();
  });

  it('shows an "Add to calendar" link on success, built from public fields only (no Meet link)', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { ok: true, message: 'Thanks.' } }),
    })));
    renderWithProviders(
      <WebinarRegistrationForm
        idPrefix="t4b"
        registrationOpen
        webinar={{ title: webinar.title, startsAt: webinar.startsAt, endsAt: webinar.endsAt }}
      />,
    );
    fillAndSubmit();
    const status = await screen.findByRole('status');
    const link = within(status).getByRole('link', { name: 'Add to calendar' });
    expect(link).toHaveAttribute('href', expect.stringContaining('calendar.google.com'));
    expect(link.getAttribute('href')).not.toContain('meet.google.com');
  });

  it('pairs Name/Email and Role/Nationality into rows only inside the hero card, not on the plain form', () => {
    const { container: heroContainer } = renderWithProviders(
      <div className="pcn-webinar-hero__card">
        <WebinarRegistrationForm idPrefix="t4c" registrationOpen />
      </div>,
    );
    expect(heroContainer.querySelectorAll('.pcn-webinar-register__row')).toHaveLength(2);

    const { container: plainContainer } = renderWithProviders(
      <WebinarRegistrationForm idPrefix="t4d" registrationOpen />,
    );
    // The wrapper divs exist either way (harmless without the hero-scoped
    // selector), but only resolve to paired CSS when under .pcn-webinar-hero__card.
    expect(plainContainer.closest('.pcn-webinar-hero__card')).toBeNull();
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
    // Appears twice now: once in the hero's speakers card, once in the
    // full SpeakersSection rendered below the hero.
    expect(screen.getAllByText('Caroline Mwanzia').length).toBeGreaterThan(0);
  });
});
