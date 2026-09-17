import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiPost } from '../../lib/api.js';
import { useLayout } from '../../hooks/useContent.js';

/**
 * The newsletter strip above the footer. `light` adds the grey background the
 * template uses where the section above it is grey (Home and Blog).
 */
export default function NewsletterBand({ light = false }) {
  const layout = useLayout();
  const band = layout.section('newsletter');
  const labels = band.labels || {};
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [invalid, setInvalid] = useState(false);

  const mutation = useMutation({
    mutationFn: () => apiPost('/subscribers', { email, ...(company ? { company } : {}) }),
    onSuccess: () => setEmail(''),
  });

  if (!layout.ready || !band.heading) return null;

  const onSubmit = (e) => {
    e.preventDefault();
    const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    setInvalid(!ok);
    if (ok) mutation.mutate();
  };

  const message = invalid || mutation.isError ? labels.error : mutation.isSuccess ? labels.success : '';

  return (
    <section className={`ftco-section ftco-no-pt ftco-no-pb${light ? ' bg-light' : ''}`}>
      <div className="container">
        <div className="row d-flex justify-content-end">
          <div className="col-md-8 py-4 px-md-4 bg-primary">
            <div className="row">
              <div className="col-md-6 ftco-animate d-flex align-items-center">
                <h2 className="mb-0" style={{ color: 'white', fontSize: 24 }}>{band.heading}</h2>
              </div>
              <div className="col-md-6 d-flex align-items-center">
                <form onSubmit={onSubmit} className="subscribe-form" noValidate>
                  <div className="form-group d-flex">
                    <input
                      type="email"
                      className="form-control"
                      placeholder={labels.placeholder}
                      aria-label={labels.placeholder}
                      aria-invalid={invalid || undefined}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button type="submit" className="submit px-3" disabled={mutation.isPending}>{labels.submit}</button>
                  </div>
                  <div className="pcn-honeypot" aria-hidden="true">
                    <input type="text" name="company" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
                  </div>
                  {message && (
                    <p className="mb-0 mt-2" style={{ color: 'white', fontSize: 14 }} role="status">{message}</p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
