import EnquiryForm from './EnquiryForm.jsx';
import { backgroundStyle } from '../SmartImage.jsx';

/** The free consultation block (`.ftco-consultation`) on Home and About. */
export default function Consultation({ section }) {
  return (
    <section
      className={`ftco-consultation ftco-section ftco-no-pt ftco-no-pb img${section.image ? '' : ' pcn-banner-fallback'}`}
      style={backgroundStyle(section.image, null, 1920, { height: 1080, crop: 'fill', gravity: 'auto' })}
    >
      <div className="overlay" />
      <div className="container">
        <div className="row d-md-flex justify-content-end">
          <div className="col-md-6 half p-3 py-5 pl-md-5 ftco-animate heading-section heading-section-white">
            {section.subheading && <span className="subheading">{section.subheading}</span>}
            {section.heading && <h2 className="mb-4">{section.heading}</h2>}
            <EnquiryForm
              labels={section.labels}
              submitLabel={section.cta?.label}
              source="consultation"
              className="consultation"
              buttonClass="btn btn-dark py-3 px-4"
              idPrefix="consultation"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
