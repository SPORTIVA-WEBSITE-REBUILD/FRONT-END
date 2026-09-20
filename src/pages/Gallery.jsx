import Seo from '../components/Seo.jsx';
import PageBanner from '../components/template/PageBanner.jsx';
import GallerySection from '../components/GallerySection.jsx';
import { usePage, section } from '../hooks/useContent.js';
import { graph, breadcrumbs } from '../lib/structuredData.js';

/** The full gallery: every published image, behind the home page's "View all". */
export default function Gallery() {
  const { data: home } = usePage('home');
  const gallery = section(home, 'gallery');

  return (
    <>
      <Seo
        title={gallery.heading || 'Gallery'}
        path="/gallery"
        jsonLd={graph(breadcrumbs([{ label: 'Home', href: '/' }, { label: gallery.heading || 'Gallery' }]))}
      />
      <PageBanner title={gallery.heading || 'Gallery'} crumb={gallery.subheading} />
      <GallerySection limit={48} col="col-md-6 col-lg-3" />
    </>
  );
}
