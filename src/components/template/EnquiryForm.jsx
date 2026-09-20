import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiPost } from '../../lib/api.js';

const EMPTY = { name: '', email: '', subject: '', message: '', website: '' };
const EMPTY_PANEL = { name: '', email: '', phone: '', subject: '', message: '', website: '' };

function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = true;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) errors.email = true;
  if (values.message.trim().length < 10) errors.message = true;
  return errors;
}

/**
 * The template's enquiry form, in two shapes. Every word (placeholders,
 * button, messages) comes from the section's labels. Submissions post to
 * Enquiries, tagged with the form they came from.
 *
 * `variant="panel"` is the "Free consultation" panel's Name / Email / Phone
 * / Subject / Message set. It maps onto the Enquiry model's own fields
 * directly, so nothing needs joining before it is posted — unlike an
 * earlier First Name / Last Name draft of this panel, which did. Each field
 * carries a caps label above a placeholder, on an underline rather than a
 * boxed input — a placeholder-only, boxed-white-field version of this panel
 * was tried in between and reverted; see "Free consultation" in
 * design-direction.md for the input styles this section has cycled through.
 * The default variant (name/email/subject/message) is the contact page's
 * form and is unchanged.
 */
export default function EnquiryForm({
  labels = {}, submitLabel, source, className, buttonClass, idPrefix, variant = 'default',
}) {
  const isPanel = variant === 'panel';
  const [values, setValues] = useState(isPanel ? EMPTY_PANEL : EMPTY);
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: (payload) => apiPost('/enquiries', payload),
    onSuccess: () => { setValues(isPanel ? EMPTY_PANEL : EMPTY); setErrors({}); },
  });

  const update = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    const { website, ...rest } = values;
    mutation.mutate({ ...rest, ...(website ? { website } : {}), source });
  };

  const field = (name, props = {}) => ({
    id: `${idPrefix}-${name}`,
    name,
    className: 'form-control',
    placeholder: labels[`${name}Placeholder`] || labels[name],
    'aria-label': labels[name],
    'aria-invalid': errors[name] ? true : undefined,
    value: values[name],
    onChange: update(name),
    ...props,
  });

  const labelled = (name, input) => (
    <div className="form-group">
      {isPanel && <label htmlFor={`${idPrefix}-${name}`} className="pcn-consultation__label">{labels[name]}</label>}
      {input}
    </div>
  );

  // The panel replaces itself with a full success view on submit — a
  // checkmark, a heading and a "send another" reset — rather than a small
  // banner above an emptied form. `mutation.reset()` clears isSuccess and
  // brings the form back exactly as EMPTY_PANEL left it.
  if (isPanel && mutation.isSuccess) {
    return (
      <div className="pcn-consultation__success" role="status">
        <span className="pcn-consultation__success-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <h3 className="pcn-consultation__success-heading">{labels.successHeading || 'Inquiry Submitted'}</h3>
        <p className="pcn-consultation__success-body">{labels.success}</p>
        <button type="button" className="pcn-consultation__reset" onClick={() => mutation.reset()}>
          {labels.resetLabel || 'Send another message'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={className} noValidate>
      {!isPanel && mutation.isSuccess && <div className="pcn-form-alert pcn-form-alert--success" role="status">{labels.success}</div>}
      {mutation.isError && (
        <div className="pcn-form-alert pcn-form-alert--error" role="alert">
          {mutation.error?.status === 429 ? labels.rateLimited : labels.error}
        </div>
      )}

      {isPanel ? (
        <div className="pcn-consultation__fields">
          {labelled('name', <input type="text" {...field('name')} />)}
          {labelled('email', <input type="email" {...field('email')} />)}
          {labelled('phone', <input type="tel" {...field('phone')} />)}
          {labelled('subject', <input type="text" {...field('subject')} />)}
          <div className="form-group pcn-consultation__field--wide">
            <label htmlFor={`${idPrefix}-message`} className="pcn-consultation__label">{labels.message}</label>
            <textarea cols="30" rows="3" {...field('message')} />
          </div>
        </div>
      ) : (
        <>
          <div className="form-group">
            <input type="text" {...field('name')} />
          </div>
          <div className="form-group">
            <input type="email" {...field('email')} />
          </div>
          <div className="form-group">
            <input type="text" {...field('subject')} />
          </div>
          <div className="form-group">
            <textarea cols="30" rows="7" {...field('message')} />
          </div>
        </>
      )}

      {/* Honeypot: hidden from people, irresistible to bots. */}
      <div className="pcn-honeypot" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={update('website')} />
      </div>

      <div className="form-group">
        <button type="submit" className={buttonClass} disabled={mutation.isPending}>
          {mutation.isPending ? labels.sending : submitLabel}
        </button>
      </div>
    </form>
  );
}
