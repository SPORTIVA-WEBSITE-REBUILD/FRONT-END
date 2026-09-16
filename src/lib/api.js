const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * The public site never sends credentials — every endpoint it touches is an
 * unauthenticated GET, which is what lets the edge cache do its job.
 */
export async function apiGet(path, { signal } = {}) {
  const res = await fetch(`${BASE}/public${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  });

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

export async function apiPost(path, body) {
  const res = await fetch(`${BASE}/public${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload.success === false) {
    const err = payload.error || {};
    throw new ApiError(res.status, err.code || 'SERVER_ERROR', err.message || 'Request failed', err.details);
  }
  return payload;
}

/** Serialises only the params that carry a value, so URLs stay cache-friendly. */
export function qs(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  }
  const str = search.toString();
  return str ? `?${str}` : '';
}
