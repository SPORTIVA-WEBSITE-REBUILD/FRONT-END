import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { LoadingSection } from '../components/states.jsx';
import { useRevealAll } from '../hooks/useAnimations.jsx';

/** A single-page app does not reset scroll on navigation the way a document does. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function Layout() {
  // Brings back the scroll reveal the template did in jQuery. Without it every
  // .ftco-animate element stays hidden but still occupies its space.
  useRevealAll();

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main id="content">
        <Suspense fallback={<div className="container py-5"><LoadingSection rows={5} /></div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
