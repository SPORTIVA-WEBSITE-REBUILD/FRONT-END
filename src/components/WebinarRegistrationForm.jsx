import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { registerForWebinar } from '../lib/webinarApi.js';
import { COUNTRIES } from '../lib/countries.js';

export const WEBINAR_ROLES = [
  'Athlete (Professional)',
  'Athlete (Recreational)',
  'Sports Management and Administration',
  'Lawyer',
  'Law Student',
  'Other',
];

const COUNTRY_SET = new Set(COUNTRIES);

const EMPTY = {
  name: '', email: '', role: '', roleOther: '', nationality: '', phone: '',
  consent: false, website: '',
};

function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Enter your name.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) errors.email = 'Enter a valid email address.';
  if (!WEBINAR_ROLES.includes(values.role)) errors.role = 'Select your role.';
  if (values.role === 'Other' && !values.roleOther.trim()) errors.roleOther = 'Tell us your role.';
  if (!COUNTRY_SET.has(values.nationality)) errors.nationality = 'Select your nationality from the list.';
  if (values.phone && !/^[0-9+()\-.\s]{7,30}$/.test(values.phone)) errors.phone = 'Enter a valid phone number.';
  if (!values.consent) errors.consent = 'Please accept to continue.';
  return errors;
}

/**
 * Same shape as EnquiryForm.jsx's "panel" variant (role="status"/"alert"
 * live regions, an off-screen honeypot, a full success swap-out) so this
 * form feels native to the site rather than a bolted-on widget, per the
 * brief.
 */
export default function WebinarRegistrationForm({ idPrefix = 'webinar-register', registrationOpen }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: () => registerForWebinar(values),
  });

  const update = (field) => (e) => {
    const v = field === 'consent' ? e.target.checked : e.target.value;
    setValues((old) => ({ ...old, [field]: v }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    mutation.mutate();
  };

  if (!registrationOpen) {
    return (
      <div className="pcn-webinar-register__closed" role="status">
        Registration for this webinar is now closed.
      </div>
    );
  }

  const result = mutation.data; // { ok, code?, message } once the request completes
  const succeeded = mutation.isSuccess && result?.ok;
  const alreadyRegistered = succeeded && result?.code === 'ALREADY_REGISTERED';

  if (succeeded) {
    return (
      <div className="pcn-webinar-register__success" role="status" aria-live="polite">
        <span className="pcn-webinar-register__success-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <h3 className="pcn-webinar-register__success-heading">
          {alreadyRegistered ? "You're already registered" : "You're registered"}
        </h3>
        <p className="pcn-webinar-register__success-body">{result.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="pcn-webinar-register" noValidate aria-busy={mutation.isPending}>
      <div aria-live="polite">
        {mutation.data && !mutation.data.ok && (
          <div className="pcn-form-alert pcn-form-alert--error" role="alert">{mutation.data.message}</div>
        )}
        {mutation.isError && (
          <div className="pcn-form-alert pcn-form-alert--error" role="alert">
            {mutation.error?.status === 429
              ? 'Too many attempts. Please try again shortly.'
              : (mutation.error?.message || 'Something went wrong. Please try again.')}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor={`${idPrefix}-name`} className="pcn-consultation__label">Name</label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          className="form-control"
          value={values.name}
          onChange={update('name')}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${idPrefix}-name-error` : undefined}
          required
        />
        {errors.name && <span id={`${idPrefix}-name-error`} className="pcn-field-error" role="alert">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor={`${idPrefix}-email`} className="pcn-consultation__label">Email</label>
        <input
          id={`${idPrefix}-email`}
          type="email"
          className="form-control"
          value={values.email}
          onChange={update('email')}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${idPrefix}-email-error` : undefined}
          required
        />
        {errors.email && <span id={`${idPrefix}-email-error`} className="pcn-field-error" role="alert">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor={`${idPrefix}-role`} className="pcn-consultation__label">Role</label>
        <select
          id={`${idPrefix}-role`}
          className="form-control"
          value={values.role}
          onChange={update('role')}
          aria-invalid={Boolean(errors.role)}
          aria-describedby={errors.role ? `${idPrefix}-role-error` : undefined}
          required
        >
          <option value="" disabled>Select your role</option>
          {WEBINAR_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        {errors.role && <span id={`${idPrefix}-role-error`} className="pcn-field-error" role="alert">{errors.role}</span>}
      </div>

      {values.role === 'Other' && (
        <div className="form-group">
          <label htmlFor={`${idPrefix}-role-other`} className="pcn-consultation__label">Tell us your role</label>
          <input
            id={`${idPrefix}-role-other`}
            type="text"
            className="form-control"
            maxLength={100}
            value={values.roleOther}
            onChange={update('roleOther')}
            aria-invalid={Boolean(errors.roleOther)}
            aria-describedby={errors.roleOther ? `${idPrefix}-role-other-error` : undefined}
            required
          />
          {errors.roleOther && <span id={`${idPrefix}-role-other-error`} className="pcn-field-error" role="alert">{errors.roleOther}</span>}
        </div>
      )}

      <div className="form-group">
        <label htmlFor={`${idPrefix}-nationality`} className="pcn-consultation__label">Nationality</label>
        <input
          id={`${idPrefix}-nationality`}
          type="text"
          className="form-control"
          list={`${idPrefix}-countries`}
          autoComplete="off"
          value={values.nationality}
          onChange={update('nationality')}
          aria-invalid={Boolean(errors.nationality)}
          aria-describedby={errors.nationality ? `${idPrefix}-nationality-error` : undefined}
          placeholder="Start typing to search…"
          required
        />
        <datalist id={`${idPrefix}-countries`}>
          {COUNTRIES.map((c) => <option key={c} value={c} />)}
        </datalist>
        {errors.nationality && <span id={`${idPrefix}-nationality-error`} className="pcn-field-error" role="alert">{errors.nationality}</span>}
      </div>

      <div className="form-group">
        <label htmlFor={`${idPrefix}-phone`} className="pcn-consultation__label">Phone number <span className="muted">(optional)</span></label>
        <input
          id={`${idPrefix}-phone`}
          type="tel"
          className="form-control"
          value={values.phone}
          onChange={update('phone')}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? `${idPrefix}-phone-error` : undefined}
        />
        {errors.phone && <span id={`${idPrefix}-phone-error`} className="pcn-field-error" role="alert">{errors.phone}</span>}
      </div>

      <div className="form-group pcn-webinar-register__consent">
        <label htmlFor={`${idPrefix}-consent`}>
          <input
            id={`${idPrefix}-consent`}
            type="checkbox"
            checked={values.consent}
            onChange={update('consent')}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? `${idPrefix}-consent-error` : undefined}
            required
          />
          {' '}I agree to the <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer">privacy policy</Link>.
        </label>
        {errors.consent && <span id={`${idPrefix}-consent-error`} className="pcn-field-error" role="alert">{errors.consent}</span>}
        <p className="pcn-webinar-register__note muted" style={{ fontSize: 12, marginTop: 4 }}>
          Role and nationality are used for event reporting only.
        </p>
      </div>

      {/* Honeypot: off-screen, not display:none — some bots skip display:none. */}
      <div className="pcn-honeypot" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={update('website')} />
      </div>

      <button type="submit" className="btn btn-primary pcn-cta" disabled={mutation.isPending}>
        {mutation.isPending ? 'Registering…' : 'Register'}
      </button>
    </form>
  );
}
