import { useEffect, useState } from 'react';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * ?previewWebinar=1 renders the webinar hero for THIS VISITOR ONLY, without
 * ever reading or writing webinarHeroEnabled in the database — the stored
 * toggle stays whatever an administrator last set it to. Used only to gate
 * this one client-side rendering decision; nothing else reads this value.
 *
 * Two cases where it is honoured, both checked client-side only:
 *  1. A deploy preview / branch deploy host (anything on *.netlify.app —
 *     production is always pcnsportivalp.com, never that domain), where
 *     anyone with the link may as well see it; or
 *  2. The real production site, but only for a signed-in administrator.
 *     There is no session shared between the public site and the admin
 *     dashboard, so "signed in" is verified for real rather than assumed:
 *     a request to the existing admin-only GET /api/admin/webinar, with
 *     credentials, succeeds only if the browser is already carrying a
 *     valid admin session cookie (set by logging into the dashboard against
 *     the same API host) — reusing the real auth check rather than
 *     inventing a second one.
 *
 * Any other visitor, on production, without that param: completely
 * unaffected — no extra request is made at all unless the param is present.
 */
export function useWebinarPreview() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('previewWebinar') !== '1') return undefined;

    const isPreviewHost = window.location.hostname.endsWith('.netlify.app');
    if (isPreviewHost) {
      setActive(true);
      return undefined;
    }

    let cancelled = false;
    fetch(`${BASE}/admin/webinar`, { credentials: 'include' })
      .then((res) => { if (!cancelled && res.ok) setActive(true); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return active;
}
