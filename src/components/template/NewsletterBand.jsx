import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiPost } from "../../lib/api.js";
import { useLayout } from "../../hooks/useContent.js";

/**
 * The newsletter strip above the footer. `light` adds the grey background the
 * template uses where the section above it is grey (Home and Blog).
 */
export default function NewsletterBand({ light = false }) {
  const layout = useLayout();
  const band = layout.section("newsletter");
  const labels = band.labels || {};
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [invalid, setInvalid] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      apiPost("/subscribers", { email, ...(company ? { company } : {}) }),
    onSuccess: () => setEmail(""),
  });

  if (!layout.ready || !band.heading) return null;

  const onSubmit = (e) => {
    e.preventDefault();
    const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    setInvalid(!ok);
    if (ok) mutation.mutate();
  };

  const message =
    invalid || mutation.isError
      ? labels.error
      : mutation.isSuccess
        ? labels.success
        : "";

  return (
    <section className={`ftco-section ftco-no-pt ftco-no-pb pcn-newsletter${light ? " bg-light" : ""}`}>
      <div className="container">
        <div className="pcn-newsletter-card">
          <div className="pcn-newsletter-card__copy ftco-animate">
            {band.subheading && (
              <span className="pcn-newsletter-card__eyebrow">{band.subheading}</span>
            )}
            <h2 className="pcn-newsletter-card__heading">{band.heading}</h2>
          </div>
          <form onSubmit={onSubmit} className="subscribe-form pcn-newsletter-card__form" noValidate>
            <div className="pcn-newsletter-card__row">
              <div className="pcn-newsletter-card__field">
                <input
                  id="newsletter-email"
                  type="email"
                  className="form-control"
                  placeholder={labels.placeholder}
                  aria-label={labels.emailLabel || "Email"}
                  aria-invalid={invalid || undefined}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="submit" disabled={mutation.isPending}>
                {labels.submit}
              </button>
            </div>
            <div className="pcn-honeypot" aria-hidden="true">
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            {message && (
              <p className="pcn-newsletter-card__message" role="status">{message}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
