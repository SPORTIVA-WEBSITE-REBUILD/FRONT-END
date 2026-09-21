import EnquiryForm from './EnquiryForm.jsx';
import { SectionHeading } from './cards.jsx';
import { PhoneIcon, MailIcon, PinIcon } from '../icons.jsx';
import { useLayout } from '../../hooks/useContent.js';
import { phonesOf, telHref } from '../../lib/contact.js';

/**
 * The two-panel card: a light column with the firm's own words and real
 * contact details, beside a dark navy enquiry form, in one 16px-rounded box
 * with a straight seam between them. Shared by the home/about consultation
 * section and the standalone Contact page, so the two cannot drift apart.
 * See "Free consultation" in docs/design-direction.md for the earlier layouts
 * this replaced and why.
 *
 * `section` supplies `heading`, `value` (optional pull quote), `cta` and
 * `labels`; `source` tags the enquiry with the form it came from.
 */
export function ContactPanels({ section, source }) {
  const { settings } = useLayout();
  const contact = settings.contact || {};
  const labels = section.labels || {};
  const phones = phonesOf(contact);

  return (
    <div className="pcn-consultation__grid">
      <div className="pcn-consultation__panel pcn-consultation__panel--light">
        {section.heading && <h2 className="pcn-consultation__heading">{section.heading}</h2>}

        {section.value && <blockquote className="pcn-consultation__quote">{section.value}</blockquote>}

        {(phones.length > 0 || contact.email || contact.address) && (
          <div className="pcn-consultation__contact">
            {phones.length > 0 && (
              <p className="pcn-consultation__contact-row">
                <span className="pcn-consultation__contact-icon"><PhoneIcon /></span>
                <span>
                  <span className="pcn-consultation__contact-label">{labels.callUs || 'Call Us'}</span>
                  {phones.map((n) => <a key={n} href={telHref(n)}>{n}</a>)}
                </span>
              </p>
            )}
            {contact.email && (
              <p className="pcn-consultation__contact-row">
                <span className="pcn-consultation__contact-icon"><MailIcon /></span>
                <span>
                  <span className="pcn-consultation__contact-label">{labels.emailUs || 'Email Us'}</span>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </span>
              </p>
            )}
            {contact.address && (
              <p className="pcn-consultation__contact-row">
                <span className="pcn-consultation__contact-icon"><PinIcon /></span>
                <span>
                  <span className="pcn-consultation__contact-label">{labels.headquarters || 'Headquarters'}</span>
                  <span className="pcn-consultation__address">{contact.address}</span>
                </span>
              </p>
            )}
          </div>
        )}
        {labels.availability && <p className="pcn-consultation__availability">{labels.availability}</p>}
      </div>

      <div className="pcn-consultation__panel pcn-consultation__panel--dark">
        <EnquiryForm
          labels={labels}
          submitLabel={section.cta?.label}
          source={source}
          variant="panel"
          className="pcn-consultation__form"
          buttonClass="btn btn-primary py-3 px-4"
          idPrefix={source}
        />
      </div>
    </div>
  );
}

/**
 * The "talk to a lawyer" section on Home and About: a centred section heading
 * (matching "Our Team") above the shared panels. `section.subheading` is the
 * section-level eyebrow, not a second one inside the left column.
 */
export default function Consultation({ section }) {
  const labels = section.labels || {};

  return (
    <section className="ftco-section ftco-no-pt ftco-no-pb pcn-consultation">
      <div className="container">
        <SectionHeading
          section={{ subheading: section.subheading, heading: labels.sectionHeading }}
          rowClass="mb-5 pb-3"
        />
        <ContactPanels section={section} source="consultation" />
      </div>
    </section>
  );
}
