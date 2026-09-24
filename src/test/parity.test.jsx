import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { waitFor } from '@testing-library/react';
import { renderWithProviders, mockApi, LAYOUT } from './utils.jsx';
import App from '../App.jsx';

/**
 * Template parity, structurally: for each template page, the React page must
 * render the same top-level blocks, in the same order, with the same classes,
 * as the HTML file in legacy-template/. Content is mocked so every block has
 * something to show.
 */
const TEMPLATE = path.resolve(__dirname, '../../legacy-template');

/** "section.ftco-section.ftco-no-pt" for each block between the nav and the footer. */
function templateBlocks(file) {
  const html = fs.readFileSync(path.join(TEMPLATE, file), 'utf8');
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return [...doc.body.children]
    .filter((el) => !['NAV', 'FOOTER', 'SCRIPT'].includes(el.tagName) && el.id !== 'ftco-loader')
    .map(signature);
}

function signature(el) {
  const classes = [...el.classList].filter((c) => !c.startsWith('pcn-')).sort();
  return [el.tagName.toLowerCase(), ...classes].join('.');
}

const img = { secureUrl: 'https://res.cloudinary.com/x/image/upload/v1/a.jpg', width: 800, height: 600 };
const section = (key, extra = {}) => ({ key, heading: `${key} heading`, subheading: `${key} sub`, ...extra });

const PAGES = {
  home: [
    section('hero', { items: [{ title: 'Rights.' }], value: '2000', cta: { label: 'Go', href: '/contact' } }),
    section('services', { body: 'x', cta: { label: 'Talk to a Lawyer', href: '/contact' } }),
    section('intro', { video: 'https://vimeo.com/45830194', items: [{ title: 'Mission', text: 'x' }] }),
    { key: 'experience', value: '40', heading: 'Years' },
    section('record', { cta: { label: 'See all', href: '/record' } }),
    section('team'),
    section('consultation', { cta: { label: 'Send message' }, labels: { name: 'Your Name' } }),
    section('testimonials'),
    section('gallery'),
    section('insights'),
  ],
  about: [
    section('hero'), section('intro'), { key: 'experience', value: '40', heading: 'Years' },
    section('consultation', { cta: { label: 'Send message' } }), section('testimonials'),
  ],
};

function api() {
  const page = (slug) => ({ data: { slug, title: slug, sections: PAGES[slug] || [section('hero'), section('intro')], seo: {} } });
  return mockApi({
    '/settings': {
      data: {
        settings: { siteName: 'Legalcare', tagline: 'A Law Firm Agency', contact: { address: 'x' }, socials: [], seoDefaults: {}, showCaseFilters: false },
        navigation: { header: [{ label: 'Home', href: '/' }], footer: [] },
        layout: LAYOUT,
      },
    },
    '/pages/home': page('home'),
    '/pages/': page('other'),
    '/services': { data: [{ slug: 's', title: 'Family Law', summary: 'x', icon: 'flaticon-family' }] },
    '/cases/filters': { data: { forums: [], years: [], parties: [] } },
    '/cases': { data: [{ slug: 'c', title: 'Legal Separation', forum: 'Corporate', featuredImage: img }], meta: { page: 1, pages: 1, total: 1 } },
    '/articles/tags': { data: [] },
    '/articles': { data: [{ slug: 'a', title: 'Industrial laws', excerpt: 'x', publishedAt: '2019-10-18', featuredImage: img }], meta: { page: 1, pages: 1, total: 1 } },
    '/categories': { data: [] },
    '/lawyers': { data: [{ slug: 'l', name: 'Ryan Anderson', role: 'Civil Lawyer', quote: 'x', photo: img }] },
    '/testimonials': { data: [{ _id: 't', quote: 'x', name: 'Roger Scott', position: 'Manager', photo: img }] },
    '/gallery': { data: [] },
    '/vacancies': { data: [] },
  });
}

afterEach(() => vi.unstubAllGlobals());

/**
 * Where the site intentionally departs from the template, with the reason.
 * Keeping these explicit means parity stays a real assertion everywhere else.
 *
 * The home hero is no longer viewport-height, so it no longer carries
 * .js-fullheight — leaving the class on while overriding its height meant two
 * rules fighting over the same property. See docs/design-direction.md.
 */
const DIVERGENCES = {
  'index.html': {
    'div.hero-wrap.js-fullheight': 'div.hero-wrap',
    // "Why the firm" was rebuilt onto its own grid (.pcn-why) rather than the
    // template's ftco-section/ftco-no-pt/ftco-no-pb classes, so it could take
    // an explicit padding scale and a two-column layout the template's
    // section-level utility classes could not express. See
    // docs/design-direction.md.
    'section.ftco-no-pb.ftco-no-pt.ftco-section': 'section',
    // The free consultation panel dropped its background photograph (and the
    // .ftco-consultation/.img classes that carried it) for a flat two-tone
    // navy/white layout — see "Free consultation" in design-direction.md.
    'section.ftco-consultation.ftco-no-pb.ftco-no-pt.ftco-section.img': 'section.ftco-no-pb.ftco-no-pt.ftco-section',
  },
};

const CASES = [
  ['index.html', '/'],
  ['attorneys.html', '/lawyers'],
  ['practice-areas.html', '/services'],
  ['case.html', '/record'],
  ['blog.html', '/articles'],
  ['contact.html', '/contact'],
];

describe('each page renders the template\'s blocks in the template\'s order', () => {
  it.each(CASES)('%s → %s', async (file, route) => {
    vi.stubGlobal('fetch', api());
    const { container } = renderWithProviders(<App />, { route });
    const expected = templateBlocks(file).map((s) => DIVERGENCES[file]?.[s] ?? s);

    await waitFor(() => {
      const main = container.querySelector('main');
      const actual = [...main.children].map(signature);
      expect(actual).toEqual(expected);
    }, { timeout: 5000 });
  });
});
