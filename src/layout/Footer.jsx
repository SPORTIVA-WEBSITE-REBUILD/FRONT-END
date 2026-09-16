import { Link } from 'react-router-dom';
import { useSiteSettings, useServices } from '../hooks/useContent.js';
import { safeHref, isExternal } from '../lib/links.js';
import SocialIcon, { hasIcon, platformLabel } from '../components/SocialIcon.jsx';

export default function Footer() {
  const { data } = useSiteSettings();
  const { data: services } = useServices();

  const settings = data?.settings || {};
  const footerNav = (data?.navigation?.footer || [])
    .map((item) => ({ ...item, href: safeHref(item.href) }))
    .filter((item) => item.href);
  const contact = settings.contact || {};
  const hours = contact.businessHours || [];

  // A row with no URL, an unsafe URL, or a platform we cannot draw is dropped
  // rather than rendered as an empty or broken icon.
  const socials = (settings.socials || [])
    .map((s) => ({ ...s, url: safeHref(s.url) }))
    .filter((s) => s.url && s.platform && hasIcon(s.platform));

  return (
    <footer className="ftco-footer ftco-bg-dark ftco-section">
      <div className="container">
        <div className="row mb-5">
          <div className="col-md">
            <div className="ftco-footer-widget mb-4">
              <h2 className="logo">
                <Link to="/">
                  {settings.siteName || 'PCN Sportiva'}{' '}
                  {settings.tagline && <span>{settings.tagline}</span>}
                </Link>
              </h2>
              {settings.seoDefaults?.metaDescription && (
                <p>{settings.seoDefaults.metaDescription}</p>
              )}
              {socials.length > 0 && (
                <ul className="ftco-footer-social list-unstyled float-md-left float-lft mt-5">
                  {socials.map((s) => (
                    <li key={`${s.platform}-${s.url}`}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${settings.siteName || 'The firm'} on ${platformLabel(s.platform)}`}
                      >
                        <SocialIcon platform={s.platform} />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="col-md">
            <div className="ftco-footer-widget mb-4 ml-md-5">
              <h2 className="ftco-heading-2">Services</h2>
              <ul className="list-unstyled">
                {(services || []).slice(0, 8).map((s) => (
                  <li key={s.slug}>
                    <Link to={`/services/${s.slug}`} className="py-1 d-block">
                      <span className="ion-ios-arrow-forward mr-3" />
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-md">
            <div className="ftco-footer-widget mb-4">
              <h2 className="ftco-heading-2">Get in touch</h2>
              <div className="block-23 mb-3">
                <ul>
                  {contact.address && (
                    <li>
                      <span className="icon icon-map-marker" />
                      <span className="text">{contact.address}</span>
                    </li>
                  )}
                  {contact.phone && (
                    <li>
                      <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>
                        <span className="icon icon-phone" />
                        <span className="text">{contact.phone}</span>
                      </a>
                    </li>
                  )}
                  {contact.email && (
                    <li>
                      <a href={`mailto:${contact.email}`}>
                        <span className="icon icon-envelope" />
                        <span className="text">{contact.email}</span>
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md">
            <div className="ftco-footer-widget mb-4">
              <h2 className="ftco-heading-2">Office Hours</h2>
              <div className="opening-hours">
                {hours.map((h) => (
                  <div key={h.label}>
                    <h4>{h.label}</h4>
                    <p className="pl-3"><span>{h.value}</span></p>
                  </div>
                ))}
              </div>
              {footerNav.length > 0 && (
                <ul className="list-unstyled mt-3">
                  {footerNav.map((item) => (
                    <li key={item.href}>
                      {isExternal(item.href)
                        ? <a href={item.href} className="py-1 d-block" target="_blank" rel="noopener noreferrer">{item.label}</a>
                        : <Link to={item.href} className="py-1 d-block">{item.label}</Link>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 text-center">
            <p>{settings.copyrightText || `© ${new Date().getFullYear()} ${settings.siteName || ''}`}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
