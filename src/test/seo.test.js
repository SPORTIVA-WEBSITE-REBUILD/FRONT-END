import { describe, it, expect } from 'vitest';
import {
  organisation, webSite, article, person, service, breadcrumbs, graph, jobPosting,
} from '../lib/structuredData.js';
import { isKnownRoute, renderNotFound } from '../../lib/prerender.js';

const SETTINGS = {
  siteName: 'PCN Sportiva LP',
  tagline: 'Sports Law',
  contact: { email: 'enquiries@pcnsportivalp.com', phone: '+234 801 234 5678', address: 'Lagos, Nigeria' },
  socials: [{ platform: 'linkedin', url: 'https://linkedin.com/company/pcn' }],
  logo: { secureUrl: 'https://res.cloudinary.com/pkesmajk/image/upload/v1/logo.png' },
};

describe('structured data describes the firm to search engines', () => {
  it('marks the firm up as a legal service with its real contact details', () => {
    const node = organisation(SETTINGS);
    expect(node['@type']).toBe('LegalService');
    expect(node.name).toBe('PCN Sportiva LP');
    expect(node.telephone).toBe('+234 801 234 5678');
    expect(node.email).toBe('enquiries@pcnsportivalp.com');
    expect(node.address).toEqual({ '@type': 'PostalAddress', streetAddress: 'Lagos, Nigeria' });
    expect(node.sameAs).toContain('https://linkedin.com/company/pcn');
  });

  it('omits fields the administrator has not filled in rather than emitting empties', () => {
    const node = organisation({ siteName: 'X' });
    expect(node.telephone).toBeUndefined();
    expect(node.address).toBeUndefined();
    expect(node.sameAs).toBeUndefined();
  });

  it('credits an article to its author and links back to the firm', () => {
    const node = article({
      title: 'A note on eligibility',
      slug: 'a-note',
      excerpt: 'Short.',
      publishedAt: '2026-03-01T00:00:00Z',
      author: { name: 'Agu Richard', slug: 'agu-richard' },
    }, SETTINGS);

    expect(node['@type']).toBe('Article');
    expect(node.headline).toBe('A note on eligibility');
    expect(node.author).toMatchObject({ '@type': 'Person', name: 'Agu Richard' });
    expect(node.datePublished).toBe('2026-03-01T00:00:00.000Z');
    expect(node.mainEntityOfPage['@id']).toContain('/insights/a-note');
  });

  it('falls back to the firm as author when an article has none', () => {
    const node = article({ title: 't', slug: 's' }, SETTINGS);
    expect(node.author['@id']).toContain('#organisation');
  });

  it('uses the record path for a case, not the insights path', () => {
    const node = article({ title: 'A case', slug: 'a-case', summary: 'x' }, SETTINGS, '/record');
    expect(node.mainEntityOfPage['@id']).toContain('/record/a-case');
  });

  it('describes a lawyer as a person employed by the firm', () => {
    const node = person({ name: 'Agu Richard', slug: 'agu-richard', role: 'Managing Partner' });
    expect(node['@type']).toBe('Person');
    expect(node.jobTitle).toBe('Managing Partner');
    expect(node.worksFor['@id']).toContain('#organisation');
  });

  it('describes a practice area as a service the firm provides', () => {
    const node = service({ title: 'Disputes', slug: 'disputes', summary: 'x' });
    expect(node['@type']).toBe('Service');
    expect(node.provider['@id']).toContain('#organisation');
  });

  it('numbers breadcrumb positions from one and links every level but the last', () => {
    const node = breadcrumbs([
      { label: 'Home', href: '/' },
      { label: 'Insights', href: '/insights' },
      { label: 'An article' },
    ]);
    expect(node['@type']).toBe('BreadcrumbList');
    expect(node.itemListElement).toHaveLength(3);
    expect(node.itemListElement[0].position).toBe(1);
    expect(node.itemListElement[2].item).toBeUndefined();
  });

  it('emits no breadcrumb trail for a top-level page', () => {
    expect(breadcrumbs([{ label: 'Home', href: '/' }])).toBeNull();
  });

  it('wraps nodes in a single valid @graph', () => {
    const g = graph(organisation(SETTINGS), webSite(SETTINGS), null);
    expect(g['@context']).toBe('https://schema.org');
    expect(g['@graph']).toHaveLength(2);
    // Must survive serialisation into a <script> tag.
    expect(() => JSON.parse(JSON.stringify(g))).not.toThrow();
  });

  it('produces nothing when there is nothing to describe', () => {
    expect(graph(null, undefined)).toBeNull();
  });
});

describe('soft 404s', () => {
  it('recognises the paths the app really serves', () => {
    for (const p of ['/', '/services', '/record', '/insights', '/careers', '/about', '/contact',
      '/privacy-policy', '/insights/a-slug', '/record/a-case', '/services/x', '/lawyers/y',
      '/careers/associate-role', '/record/']) {
      expect(isKnownRoute(p), p).toBe(true);
    }
  });

  it('treats a path that maps to no route as a genuine 404', () => {
    for (const p of ['/no-such-page', '/wp-admin', '/a/b/c', '/admin.php', '/.env']) {
      expect(isKnownRoute(p), p).toBe(false);
    }
  });

  it('the 404 document tells crawlers not to index it', () => {
    const html = renderNotFound({ siteName: 'PCN Sportiva LP', url: 'https://pcnsportivalp.com/nope' });
    expect(html).toContain('noindex');
    expect(html).toContain('Page not found');
  });
});

describe('JobPosting markup for Google Jobs', () => {
  const VACANCY = {
    title: 'Associate, Sports Disputes',
    slug: 'associate-sports-disputes',
    summary: 'Join the disputes team.',
    description: '<p>Advise athletes and clubs.</p>',
    location: 'Lagos, Nigeria',
    employmentType: 'full_time',
    workplaceType: 'on_site',
    department: 'Disputes',
    publishedAt: '2026-09-01T00:00:00Z',
    closingDate: '2026-10-01T00:00:00Z',
  };

  it('emits the fields Google Jobs requires', () => {
    const node = jobPosting(VACANCY, SETTINGS);
    expect(node['@type']).toBe('JobPosting');
    expect(node.title).toBe('Associate, Sports Disputes');
    expect(node.description).toContain('Advise athletes');
    expect(node.datePosted).toBe('2026-09-01T00:00:00.000Z');
    expect(node.hiringOrganization.name).toBe('PCN Sportiva LP');
    expect(node.jobLocation.address.addressLocality).toBe('Lagos, Nigeria');
  });

  it('sets validThrough so a closed role is not shown as open', () => {
    expect(jobPosting(VACANCY, SETTINGS).validThrough).toBe('2026-10-01T00:00:00.000Z');
  });

  it('maps the firm vocabulary onto schema.org employment types', () => {
    const map = {
      full_time: 'FULL_TIME', part_time: 'PART_TIME', contract: 'CONTRACTOR',
      internship: 'INTERN', pupillage: 'INTERN', nysc: 'INTERN',
    };
    for (const [ours, theirs] of Object.entries(map)) {
      expect(jobPosting({ ...VACANCY, employmentType: ours }, SETTINGS).employmentType, ours).toBe(theirs);
    }
  });

  it('flags a remote role the way Google expects', () => {
    expect(jobPosting({ ...VACANCY, workplaceType: 'remote' }, SETTINGS).jobLocationType).toBe('TELECOMMUTE');
    expect(jobPosting(VACANCY, SETTINGS).jobLocationType).toBeUndefined();
  });

  it('reports directApply correctly for an external recruiter link', () => {
    expect(jobPosting(VACANCY, SETTINGS).directApply).toBe(true);
    expect(jobPosting({ ...VACANCY, applyUrl: 'https://jobs.example.com/1' }, SETTINGS).directApply).toBe(false);
  });

  it('omits an absent closing date rather than emitting an invalid value', () => {
    const node = jobPosting({ ...VACANCY, closingDate: undefined }, SETTINGS);
    expect(node.validThrough).toBeUndefined();
    expect(() => JSON.parse(JSON.stringify(node))).not.toThrow();
  });
});
