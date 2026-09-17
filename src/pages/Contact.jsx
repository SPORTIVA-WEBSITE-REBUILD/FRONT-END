import Seo from '../components/Seo.jsx';
import PageBanner from '../components/template/PageBanner.jsx';
import EnquiryForm from '../components/template/EnquiryForm.jsx';
import { useLayout, usePage, section } from '../hooks/useContent.js';
import { safeHref } from '../lib/links.js';
import { graph, breadcrumbs } from '../lib/structuredData.js';

/** contact.html */
export default function Contact() {
  const { data: page } = usePage('contact');
  const { settings } = useLayout();
  const contact = settings.contact || {};
  const hero = section(page, 'hero');
  const intro = section(page, 'intro');
  const form = section(page, 'form');
  const labels = intro.labels || {};
  const website = contact.website
    ? safeHref(/^https?:\/\//i.test(contact.website) ? contact.website : `https://${contact.website}`)
    : null;
  const mapUrl = safeHref(contact.mapUrl);

  return (
    <>
      <Seo
        seo={page?.seo}
        title={page?.title}
        path="/contact"
        jsonLd={graph(breadcrumbs([{ label: 'Home', href: '/' }, { label: hero.heading || page?.title }]))}
      />
      <PageBanner title={hero.heading} crumb={hero.subheading} image={hero.image} />

      <section className="ftco-section contact-section">
        <div className="container">
          <div className="row d-flex mb-5 contact-info">
            <div className="col-md-12 mb-4">
              <h2 className="h3">{intro.heading}</h2>
              {intro.body && <p>{intro.body}</p>}
            </div>
            <div className="w-100" />
            <div className="col-md-3">
              <p><span>{labels.address}</span> {contact.address}</p>
            </div>
            <div className="col-md-3">
              <p>
                <span>{labels.phone}</span>{' '}
                {contact.phone && <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}>{contact.phone}</a>}
              </p>
            </div>
            <div className="col-md-3">
              <p>
                <span>{labels.email}</span>{' '}
                {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
              </p>
            </div>
            <div className="col-md-3">
              <p>
                <span>{labels.website}</span>{' '}
                {website && <a href={website} target="_blank" rel="noopener noreferrer">{contact.website}</a>}
              </p>
            </div>
          </div>

          <div className="row block-9 no-gutters">
            <div className="col-lg-6 order-md-last d-flex">
              <EnquiryForm
                labels={form.labels}
                submitLabel={form.cta?.label}
                source="contact"
                className="bg-light p-5 contact-form"
                buttonClass="btn btn-primary py-3 px-5"
                idPrefix="contact"
              />
            </div>
            <div className="col-lg-6 d-flex">
              <div id="map" className="bg-white">
                {mapUrl && (
                  <iframe
                    title={intro.heading || 'Map'}
                    src={mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: 400 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                )}
              </div>
            </div>
          </div>
          {form.body && (
            <div className="row mt-4"><div className="col-md-12"><p className="text-muted"><small>{form.body}</small></p></div></div>
          )}
        </div>
      </section>
    </>
  );
}
