import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Loader from '../components/template/Loader.jsx';
import NewsletterBand from '../components/template/NewsletterBand.jsx';
import ArticlesPopup from '../components/ArticlesPopup.jsx';
import { LoadingSection } from '../components/states.jsx';
import { useRevealAll } from '../hooks/useAnimations.jsx';

/** A single-page app does not reset scroll on navigation the way a document does. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}

/**
 * Where the template shows the newsletter band. Contact has none; Home and the
 * Blog list sit it on grey, because the section above them is grey.
 */
function bandFor(pathname) {
  if (pathname === '/contact') return null;
  return { light: pathname === '/' || pathname === '/articles' };
}

export default function Layout() {
  useRevealAll();
  const { pathname } = useLocation();
  const band = bandFor(pathname);

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main id="content">
        <Suspense fallback={<div className="container py-5"><LoadingSection rows={5} /></div>}>
          <Outlet />
        </Suspense>
        {band && <NewsletterBand key={pathname} light={band.light} />}
      </main>
      <Footer />
      <Loader />
      <ArticlesPopup />
    </>
  );
}
