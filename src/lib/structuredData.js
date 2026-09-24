/**
 * Schema.org JSON-LD.
 *
 * Search engines use this to show a law firm as a business with an address and
 * phone number, articles with an author and date, and a breadcrumb trail under
 * the result. The visible page never changes.
 *
 * Everything is built from content the administrator already maintains, so
 * there is no second set of facts to keep in step.
 */
const SITE = (import.meta.env.VITE_SITE_URL || 'https://pcnsportivalp.com').replace(/\/$/, '');

const abs = (path = '/') => `${SITE}${path.startsWith('/') ? path : `/${path}`}`;

function imageUrl(media, width = 1200) {
  const src = media?.secureUrl;
  if (!src || !src.includes('/upload/')) return undefined;
  return src.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
}

/** The firm itself. Emitted once, on the home page. */
export function organisation(settings = {}) {
  const contact = settings.contact || {};
  const socials = (settings.socials || []).map((s) => s.url).filter(Boolean);

  const node = {
    '@type': 'LegalService',
    '@id': `${SITE}/#organisation`,
    name: settings.siteName || 'PCN Sportiva LP',
    url: SITE,
    ...(settings.tagline ? { description: settings.tagline } : {}),
    ...(imageUrl(settings.logo, 600) ? { logo: imageUrl(settings.logo, 600) } : {}),
    ...(contact.email ? { email: contact.email } : {}),
    ...(contact.phone ? { telephone: contact.phone2 ? [contact.phone, contact.phone2] : contact.phone } : {}),
    ...(socials.length ? { sameAs: socials } : {}),
  };

  if (contact.address) {
    node.address = { '@type': 'PostalAddress', streetAddress: contact.address };
  }
  return node;
}

export function webSite(settings = {}) {
  return {
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    url: SITE,
    name: settings.siteName || 'PCN Sportiva LP',
    publisher: { '@id': `${SITE}/#organisation` },
  };
}

export function article(entry = {}, settings = {}, pathPrefix = '/articles') {
  return {
    '@type': 'Article',
    headline: entry.title,
    ...(entry.excerpt || entry.summary ? { description: entry.excerpt || entry.summary } : {}),
    ...(imageUrl(entry.featuredImage) ? { image: imageUrl(entry.featuredImage) } : {}),
    ...(entry.publishedAt ? { datePublished: new Date(entry.publishedAt).toISOString() } : {}),
    ...(entry.updatedAt ? { dateModified: new Date(entry.updatedAt).toISOString() } : {}),
    author: (() => {
      const people = (entry.authors?.length ? entry.authors : entry.author ? [entry.author] : []).filter((p) => p?.name);
      const list = people.map((p) => ({ '@type': 'Person', name: p.name, url: abs(`/lawyers/${p.slug}`) }));
      if (!list.length) return { '@id': `${SITE}/#organisation` };
      return list.length === 1 ? list[0] : list;
    })(),
    publisher: { '@id': `${SITE}/#organisation` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(`${pathPrefix}/${entry.slug}`) },
  };
}

export function person(lawyer = {}) {
  return {
    '@type': 'Person',
    name: lawyer.name,
    ...(lawyer.role ? { jobTitle: lawyer.role } : {}),
    url: abs(`/lawyers/${lawyer.slug}`),
    ...(imageUrl(lawyer.photo, 600) ? { image: imageUrl(lawyer.photo, 600) } : {}),
    ...(lawyer.email ? { email: lawyer.email } : {}),
    ...(lawyer.socials?.length ? { sameAs: lawyer.socials.map((s) => s.url).filter(Boolean) } : {}),
    worksFor: { '@id': `${SITE}/#organisation` },
  };
}

export function service(entry = {}) {
  return {
    '@type': 'Service',
    name: entry.title,
    ...(entry.summary ? { description: entry.summary } : {}),
    url: abs(`/services/${entry.slug}`),
    provider: { '@id': `${SITE}/#organisation` },
    serviceType: 'Legal service',
  };
}

/**
 * Maps the firm's own employment vocabulary onto the values Google Jobs
 * understands. Pupillage and NYSC have no direct equivalent, so they are
 * reported as the closest match rather than omitted.
 */
const EMPLOYMENT_TYPE_SCHEMA = {
  full_time: 'FULL_TIME',
  part_time: 'PART_TIME',
  contract: 'CONTRACTOR',
  internship: 'INTERN',
  pupillage: 'INTERN',
  nysc: 'INTERN',
};

/**
 * JobPosting is what puts a role into Google Jobs. `validThrough` matters: a
 * listing with no expiry is treated as stale, and an expired one is dropped
 * rather than shown as open.
 */
export function jobPosting(vacancy = {}, settings = {}) {
  const node = {
    '@type': 'JobPosting',
    title: vacancy.title,
    description: vacancy.description || vacancy.summary,
    ...(vacancy.publishedAt ? { datePosted: new Date(vacancy.publishedAt).toISOString() } : {}),
    ...(vacancy.closingDate ? { validThrough: new Date(vacancy.closingDate).toISOString() } : {}),
    ...(EMPLOYMENT_TYPE_SCHEMA[vacancy.employmentType]
      ? { employmentType: EMPLOYMENT_TYPE_SCHEMA[vacancy.employmentType] }
      : {}),
    hiringOrganization: {
      '@type': 'Organization',
      name: settings.siteName || 'PCN Sportiva LP',
      sameAs: SITE,
      ...(imageUrl(settings.logo, 600) ? { logo: imageUrl(settings.logo, 600) } : {}),
    },
    ...(vacancy.department ? { industry: vacancy.department } : {}),
    directApply: !vacancy.applyUrl,
  };

  if (vacancy.location) {
    node.jobLocation = {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: vacancy.location },
    };
  }
  // Google requires this flag for roles that are not tied to an office.
  if (vacancy.workplaceType === 'remote') {
    node.jobLocationType = 'TELECOMMUTE';
  }

  return node;
}

/** Mirrors the breadcrumb trail the page already shows. */
export function breadcrumbs(items = []) {
  const valid = items.filter((c) => c.label);
  if (valid.length < 2) return null;

  return {
    '@type': 'BreadcrumbList',
    itemListElement: valid.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.label,
      ...(crumb.href ? { item: abs(crumb.href) } : {}),
    })),
  };
}

/** Wraps nodes into one @graph, which is the tidiest way to emit several. */
export function graph(...nodes) {
  const filtered = nodes.filter(Boolean);
  if (!filtered.length) return null;
  return { '@context': 'https://schema.org', '@graph': filtered };
}
