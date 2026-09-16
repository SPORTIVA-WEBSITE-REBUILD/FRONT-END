import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import { apiPost } from '../lib/api.js';
import { usePage, useSiteSettings, section } from '../hooks/useContent.js';

const EMPTY = { name: '', email: '', phone: '', subject: '', message: '', website: '' };

/**
 * The template shipped this form with action="#", no field names and no
 * handler, so nothing a visitor typed ever reached the firm. It now validates
 * client-side for immediate feedback and posts to the API, which validates
 * again and is the only authority on what is accepted.
 */
function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Please tell us your name';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) errors.email = 'Please enter a valid email address';
  if (values.message.trim().length < 10) errors.message = 'Please give us a little more detail';
  return errors;
}

export default function Contact() {
  const { data: page } = usePage('contact');
  const { data: siteData } = useSiteSettings();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);

  const contact = siteData?.settings?.contact || {};
  const intro = section(page, 'intro');

  const mutation = useMutation({
    mutationFn: (payload) => apiPost('/enquiries', payload),
    onSuccess: () => {
      setValues(EMPTY);
      setErrors({});
      setTouched(false);
    },
  });

  const update = (field) => (e) => {
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    if (touched) setErrors(validate(next));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const { website, ...payload } = values;
    mutation.mutate(website ? values : payload);
  };

  return (
    <>
      <Seo seo={page?.seo} title={page?.title || 'Contact'} path="/contact" />
      <PageHero
        title={intro.heading || 'Contact'}
        image={intro.image}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      <section className="ftco-section contact-section">
        <div className="container">
          <div className="row d-flex mb-5 contact-info">
            <div className="col-md-12 mb-4">
              <h2 className="h4">Contact Information</h2>
            </div>
            {contact.address && (
              <div className="w-100" />
            )}
            {contact.address && (
              <div className="col-md-4">
                <p><span>Address:</span> {contact.address}</p>
              </div>
            )}
            {contact.phone && (
              <div className="col-md-4">
                <p>
                  <span>Phone:</span>{' '}
                  <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
                </p>
              </div>
            )}
            {contact.email && (
              <div className="col-md-4">
                <p>
                  <span>Email:</span>{' '}
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </p>
              </div>
            )}
          </div>

          <div className="row block-9">
            <div className="col-md-6 pr-md-5">
              {mutation.isSuccess && (
                <div className="pcn-form-alert pcn-form-alert--success" role="status">
                  Thank you — your enquiry has reached the firm. We will respond as soon as we can.
                </div>
              )}
              {mutation.isError && (
                <div className="pcn-form-alert pcn-form-alert--error" role="alert">
                  {mutation.error?.status === 429
                    ? 'You have sent several enquiries already. Please try again later.'
                    : 'We could not send your enquiry. Please try again, or email us directly.'}
                </div>
              )}

              <form onSubmit={onSubmit} className="bg-light p-5 contact-form" noValidate>
                <div className="form-group">
                  <label htmlFor="name" className="sr-only">Your name</label>
                  <input
                    id="name" name="name" type="text" className="form-control"
                    placeholder="Your Name" value={values.name} onChange={update('name')}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && <span className="pcn-field-error" id="name-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="sr-only">Your email</label>
                  <input
                    id="email" name="email" type="email" className="form-control"
                    placeholder="Your Email" value={values.email} onChange={update('email')}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && <span className="pcn-field-error" id="email-error">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="sr-only">Your phone number</label>
                  <input
                    id="phone" name="phone" type="tel" className="form-control"
                    placeholder="Phone (optional)" value={values.phone} onChange={update('phone')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject" className="sr-only">Subject</label>
                  <input
                    id="subject" name="subject" type="text" className="form-control"
                    placeholder="Subject" value={values.subject} onChange={update('subject')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="sr-only">Your message</label>
                  <textarea
                    id="message" name="message" cols="30" rows="7" className="form-control"
                    placeholder="Message" value={values.message} onChange={update('message')}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                  />
                  {errors.message && <span className="pcn-field-error" id="message-error">{errors.message}</span>}
                </div>

                {/* Honeypot: hidden from people, irresistible to bots. */}
                <div className="pcn-honeypot" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website" name="website" type="text" tabIndex={-1}
                    autoComplete="off" value={values.website} onChange={update('website')}
                  />
                </div>

                <div className="form-group">
                  <button
                    type="submit"
                    className="btn btn-primary py-3 px-5"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? 'Sending…' : 'Send Message'}
                  </button>
                </div>

                <p className="text-muted mt-3">
                  <small>
                    Sending an enquiry does not create a lawyer–client relationship,
                    and nothing sent through this form should be treated as confidential
                    until the firm confirms it can act for you.
                  </small>
                </p>
              </form>
            </div>

            <div className="col-md-6">
              {contact.mapUrl && (
                <div id="map" className="bg-white" style={{ minHeight: 400 }}>
                  <iframe
                    title="Office location"
                    src={contact.mapUrl}
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
