import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiPost } from '../../lib/api.js';

const EMPTY = { name: '', email: '', subject: '', message: '', website: '' };

function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = true;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) errors.email = true;
  if (values.message.trim().length < 10) errors.message = true;
  return errors;
}

/**
 * The template's enquiry form — four fields and a submit input — used by both
 * the free consultation block and the contact page. Every word (placeholders,
 * button, messages) comes from the section's labels. Submissions post to
 * Enquiries, tagged with the form they came from.
 */
export default function EnquiryForm({ labels = {}, submitLabel, source, className, buttonClass, idPrefix }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: (payload) => apiPost('/enquiries', payload),
    onSuccess: () => { setValues(EMPTY); setErrors({}); },
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
    placeholder: labels[name],
    'aria-label': labels[name],
    'aria-invalid': errors[name] ? true : undefined,
    value: values[name],
    onChange: update(name),
    ...props,
  });

  return (
    <form onSubmit={onSubmit} className={className} noValidate>
      {mutation.isSuccess && <div className="pcn-form-alert pcn-form-alert--success" role="status">{labels.success}</div>}
      {mutation.isError && (
        <div className="pcn-form-alert pcn-form-alert--error" role="alert">
          {mutation.error?.status === 429 ? labels.rateLimited : labels.error}
        </div>
      )}

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
