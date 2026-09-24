import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useLayout, useServices, useSiteSettings } from '../hooks/useContent.js';
import { safeHref, isExternal } from '../lib/links.js';
import { withYear } from '../lib/format.js';
import { phonesOf, telHref } from '../lib/contact.js';
import SocialIcon, { hasIcon, platformLabel } from '../components/SocialIcon.jsx';

/**
 * The template's four-column footer: brand, about text and social icons;
 * practice areas; contact details; business hours; then the copyright line
 * and footer menu links.
 */
export default function Footer() {
  const { data } = useSiteSettings();
  const layout = useLayout();
  const { data: services } = useServices();

  const settings = layout.settings;
  const contact = settings.contact || {};
  const footer = layout.section('footer');
  const labels = footer.labels || {};
  const hours = layout.section('hours');

  const socials = (settings.socials || [])
    .map((s) => ({ ...s, url: safeHref(s.url) }))
    .filter((s) => s.url && s.platform && hasIcon(s.platform));

  const footerNav = (data?.navigation?.footer || [])
    .map((item) => ({ ...item, href: safeHref(item.href) }))
    .filter((item) => item.href);

  return (
    <footer className="ftco-footer ftco-bg-dark ftco-section">
      <div className="container">
        <div className="row mb-5">
          <div className="col-md">
            <div className="ftco-footer-widget mb-4">
              <h2 className="logo">
                <Link to="/">{settings.siteName} {settings.tagline && <span>{settings.tagline}</span>}</Link>
              </h2>
              {footer.body && <p>{footer.body}</p>}
              {socials.length > 0 && (
                <ul className="ftco-footer-social list-unstyled float-md-left float-lft mt-5">
                  {socials.map((s) => (
                    <li className="ftco-animate" key={`${s.platform}-${s.url}`}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${settings.siteName || ''} ${platformLabel(s.platform)}`.trim()}
                      >
                        <SocialIcon platform={s.platform} size={20} />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="col-md">
            <div className="ftco-footer-widget mb-4 ml-md-5">
              <h2 className="ftco-heading-2">{labels.servicesHeading}</h2>
              <ul className="list-unstyled">
                {(services || []).map((s) => (
                  <li key={s.slug}>
                    <Link to={`/services/${s.slug}`} className="py-1 d-block">
                      <span className="ion-ios-arrow-forward mr-3" />{s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-md">
            <div className="ftco-footer-widget mb-4">
              <h2 className="ftco-heading-2">{labels.contactHeading}</h2>
              <div className="block-23 mb-3">
                <ul>
                  {contact.address && (
                    <li><span className="icon icon-map-marker" /><span className="text">{contact.address}</span></li>
                  )}
                  {phonesOf(contact).map((n) => (
                    <li key={n}>
                      <a href={telHref(n)}>
                        <span className="icon icon-phone" /><span className="text">{n}</span>
                      </a>
                    </li>
                  ))}
                  {contact.email && (
                    <li>
                      <a href={`mailto:${contact.email}`}>
                        <span className="icon icon-envelope" /><span className="text">{contact.email}</span>
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md">
            <div className="ftco-footer-widget mb-4">
              <h2 className="ftco-heading-2">{hours.heading}</h2>
              <div className="opening-hours">
                {(hours.items || []).filter((g) => g.title || g.text).map((g, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Fragment key={i}>
                    {g.title && <h4>{g.title}</h4>}
                    <p className="pl-3">
                      {(g.text || '').split('\n').map((line) => line.trim()).filter(Boolean).map((line) => (
                        <Fragment key={line}><span>{line}</span>{' '}</Fragment>
                      ))}
                    </p>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 text-center">
            <p>
              {withYear(labels.copyright || '')}
              {footerNav.map((item) => (
                <span key={`${item.href}-${item.label}`}>
                  {labels.copyright ? ' | ' : ''}
                  {isExternal(item.href)
                    ? <a href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a>
                    : <Link to={item.href}>{item.label}</Link>}
                </span>
              ))}
            </p>
            <p className="pcn-footer-credit">
              Website by{" "}
              <a href="mailto:agurichard3@gmail.com">AG &amp; Co.</a>
              {" | "}
              <a href="tel:+447831005329">07831 005329</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
