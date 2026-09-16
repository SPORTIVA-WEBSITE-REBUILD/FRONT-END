import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useContent.js';
import { safeHref, isExternal } from '../lib/links.js';

/**
 * Replaces the nav that was copy-pasted into all nine template pages. The
 * classnames are unchanged, so style.scss styles it exactly as before; only the
 * content source and the scroll behaviour have moved into React.
 */
export default function Navbar() {
  const { data } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // A link that cannot be vetted is dropped rather than rendered.
  const items = (data?.navigation?.header || [])
    .map((item) => ({ ...item, href: safeHref(item.href) }))
    .filter((item) => item.href);
  const siteName = data?.settings?.siteName || 'PCN Sportiva';
  const tagline = data?.settings?.tagline || '';

  // The original template toggled these classes from main.js on scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 150);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <nav
      className={`navbar px-md-0 navbar-expand-lg navbar-dark ftco_navbar bg-dark ftco-navbar-light${
        scrolled ? ' scrolled awake' : ''
      }`}
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
          aria-label="Toggle navigation"
        >
          <span className="oi oi-menu" /> Menu
        </button>

        <div className={`collapse navbar-collapse${open ? ' show' : ''}`} id="ftco-nav">
          <ul className="navbar-nav ml-auto">
            {items.map((item) => (
              <li className="nav-item" key={`${item.href}-${item.label}`}>
                {item.external || isExternal(item.href) ? (
                  <a href={item.href} className="nav-link" target="_blank" rel="noopener noreferrer">
                    {item.label}
                  </a>
                ) : (
                  <NavLink
                    to={item.href}
                    end={item.href === '/'}
                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  >
                    {item.label}
                  </NavLink>
                )}
              </li>
            ))}
            <li className="nav-item cta">
              <Link to="/contact" className="nav-link">Make an Enquiry</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
