import { ApiError } from './api.js';

/**
 * A separate client from apiGet() in api.js: that helper hardcodes a
 * `/public` prefix onto every path (`${BASE}/public${path}`), but the
 * webinar routes are mounted at /api/webinar and /api/webinar/register
 * directly — not /api/public/webinar — per the integration brief. Using
 * apiGet() here would silently 404 against a path that was never built.
 * Same response shape and error handling as apiGet(), just without that
 * prefix.
 */
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function parse(res) {
  let payload;
  try {
    payload = await res.json();
  } catch {
    throw new ApiError(res.status, 'SERVER_ERROR', 'The server returned an unexpected response');
  }
  if (!res.ok || payload.success === false) {
    const err = payload.error || {};
    throw new ApiError(res.status, err.code || 'SERVER_ERROR', err.message || 'Request failed', err.details);
  }
  return payload;
}

export async function getWebinar({ signal } = {}) {
  const res = await fetch(`${BASE}/webinar`, { signal, headers: { Accept: 'application/json' } });
  return parse(res).then((p) => p.data);
}

export async function registerForWebinar({ name, email, role, roleOther, nationality, phone, consent, website }) {
  const res = await fetch(`${BASE}/webinar/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ name, email, role, roleOther, nationality, phone, consent, website }),
  });
  const payload = await parse(res);
  return payload.data; // { ok, message } or { ok, code, message }
}
