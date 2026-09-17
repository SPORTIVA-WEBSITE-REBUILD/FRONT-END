import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLayout, useSiteSettings } from '../hooks/useContent.js';
import { useNavbarScroll } from '../hooks/useAnimations.jsx';
import { safeHref, isExternal } from '../lib/links.js';
import SmartLink from '../components/template/SmartLink.jsx';

function isActive(href, pathname) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The template's navbar. Menu items come from Navigation; the brand from
 * Settings; the highlighted button and the mobile "Menu" word from the layout
 * page. Scroll classes follow main.js exactly.
 */
export default function Navbar() {
  const { data } = useSiteSettings();
  const layout = useLayout();
  const scrollClasses = useNavbarScroll();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const items = (data?.navigation?.header || [])
    .map((item) => ({ ...item, href: safeHref(item.href) }))
    .filter((item) => item.href);
  const { siteName, tagline } = layout.settings;
  const navCta = layout.section('navCta');

  useEffect(() => setOpen(false), [pathname]);

  return (
    <nav
      className={`navbar px-md-0 navbar-expand-lg navbar-dark ftco_navbar bg-dark ftco-navbar-light${scrollClasses ? ` ${scrollClasses}` : ''}`}
      id="ftco-navbar"
    >
      <div className="container">
        <Link className="navbar-brand" to="/">
          {siteName} {tagline && <span>{tagline}</span>}
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-controls="ftco-nav"
          aria-expanded={open}
          aria-label={navCta.labels?.menuToggle}
        >
          {/* Icon only; the word stays available to screen readers via aria-label. */}
          <span className="oi oi-menu" aria-hidden="true" />
        </button>

        <div className={`collapse navbar-collapse${open ? ' show' : ''}`} id="ftco-nav">
          <ul className="navbar-nav ml-auto">
            {items.map((item) => (
              <li
                className={`nav-item${!isExternal(item.href) && isActive(item.href, pathname) ? ' active' : ''}`}
                key={`${item.href}-${item.label}`}
              >
                {item.external || isExternal(item.href)
                  ? <a href={item.href} className="nav-link" target="_blank" rel="noopener noreferrer">{item.label}</a>
                  : <Link to={item.href} className="nav-link">{item.label}</Link>}
              </li>
            ))}
            {navCta.cta?.label && (
              <li className="nav-item cta">
                <SmartLink href={navCta.cta.href} className="nav-link">{navCta.cta.label}</SmartLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
