import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" seo={{ noIndex: true }} />
      <PageHero title="Page not found" crumbs={[{ label: 'Home', href: '/' }, { label: '404' }]} />

      <section className="ftco-section">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-md-8">
              <h2 className="mb-4">We could not find that page</h2>
              <p className="mb-5">
                The page may have been moved or removed. These links should help:
              </p>
              <p>
                <Link to="/" className="btn btn-primary py-3 px-4 mr-2">Home</Link>
                <Link to="/record" className="btn btn-primary py-3 px-4 mr-2">Case record</Link>
                <Link to="/insights" className="btn btn-primary py-3 px-4 mr-2">Insights</Link>
                <Link to="/contact" className="btn btn-primary py-3 px-4">Contact</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
