import Seo from "../components/Seo.jsx";
import PageBanner from "../components/template/PageBanner.jsx";
import { ContactPanels } from "../components/template/Consultation.jsx";
import { useLayout, usePage, section } from "../hooks/useContent.js";
import { safeHref } from "../lib/links.js";
import { phonesOf, telHref } from "../lib/contact.js";
import { graph, breadcrumbs } from "../lib/structuredData.js";

/** contact.html */
export default function Contact() {
  const { data: page } = usePage("contact");
  const { settings } = useLayout();
  const contact = settings.contact || {};
  const hero = section(page, "hero");
  const intro = section(page, "intro");
  const form = section(page, "form");
  const labels = intro.labels || {};
  const website = contact.website
    ? safeHref(
        /^https?:\/\//i.test(contact.website)
          ? contact.website
          : `https://${contact.website}`,
      )
    : null;
  const mapUrl = safeHref(contact.mapUrl);

  return (
    <>
      <Seo
        seo={page?.seo}
        title={page?.title}
        path="/contact"
        jsonLd={graph(
          breadcrumbs([
            { label: "Home", href: "/" },
            { label: hero.heading || page?.title },
          ]),
        )}
      />
      <PageBanner
        title={hero.heading}
        crumb={hero.subheading}
        image={hero.image}
      />

      <section className="ftco-section contact-section">
        <div className="container">
          <div className="row d-flex contact-info">
            <div className="col-md-12 mb-4 text-center">
              {intro.heading && (
                <h2
                  className="mb-3"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "2.2rem",
                    fontWeight: 600,
                  }}
                >
                  {intro.heading}
                </h2>
              )}
              {intro.body && (
                <p
                  className="lead mx-auto"
                  style={{ maxWidth: "650px", color: "var(--ink-2)" }}
                >
                  {intro.body}
                </p>
              )}
            </div>
            <div className="col-md-12">
              <div className="pcn-contact-info-grid">
                {contact.address && (
                  <div className="pcn-contact-card">
                    <div className="pcn-contact-card__icon">
                      <span className="icon icon-map-marker" />
                    </div>
                    <div>
                      <div className="pcn-contact-card__label">
                        {labels.address}
                      </div>
                      <p className="pcn-contact-card__val">{contact.address}</p>
                    </div>
                  </div>
                )}
                {phonesOf(contact).length > 0 && (
                  <div className="pcn-contact-card">
                    <div className="pcn-contact-card__icon">
                      <span className="icon icon-phone" />
                    </div>
                    <div>
                      <div className="pcn-contact-card__label">
                        {labels.phone}
                      </div>
                      <p className="pcn-contact-card__val">
                        {phonesOf(contact).map((n) => (
                          <a key={n} href={telHref(n)} className="d-block">{n}</a>
                        ))}
                      </p>
                    </div>
                  </div>
                )}
                {contact.email && (
                  <div className="pcn-contact-card">
                    <div className="pcn-contact-card__icon">
                      <span className="icon icon-envelope" />
                    </div>
                    <div>
                      <div className="pcn-contact-card__label">
                        {labels.email}
                      </div>
                      <p className="pcn-contact-card__val">
                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                      </p>
                    </div>
                  </div>
                )}
                {website && (
                  <div className="pcn-contact-card">
                    <div className="pcn-contact-card__icon">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    </div>
                    <div>
                      <div className="pcn-contact-card__label">
                        {labels.website}
                      </div>
                      <p className="pcn-contact-card__val">
                        <a
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {contact.website}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <ContactPanels section={form} source="contact" />
          {mapUrl && (
            <iframe
              title={intro.heading || "Map"}
              src={mapUrl}
              width="100%"
              className="pcn-contact-map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
          {form.body && (
            <div className="row mt-4">
              <div className="col-md-12">
                <p className="text-muted">
                  <small>{form.body}</small>
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
