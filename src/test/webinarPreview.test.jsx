import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWebinarPreview } from '../hooks/useWebinarPreview.js';

const setLocation = (hostname, search = '') => {
  Object.defineProperty(window, 'location', {
    value: { hostname, search, href: `https://${hostname}/${search}` },
    writable: true,
    configurable: true,
  });
};

afterEach(() => {
  vi.unstubAllGlobals();
  setLocation('pcnsportivalp.com', '');
});

describe('useWebinarPreview', () => {
  it('is inactive with no query parameter at all, on any host, and makes no network request', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    setLocation('pcnsportivalp.com', '');
    const { result } = renderHook(() => useWebinarPreview());
    expect(result.current).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('is active immediately on a deploy-preview host (*.netlify.app) with the param, no admin check needed', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    setLocation('webinar-preview--pcnsportivalp-web.netlify.app', '?previewWebinar=1');
    const { result } = renderHook(() => useWebinarPreview());
    expect(result.current).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('on the real production host, only becomes active once the admin-auth check succeeds', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true })));
    setLocation('pcnsportivalp.com', '?previewWebinar=1');
    const { result } = renderHook(() => useWebinarPreview());
    expect(result.current).toBe(false); // not yet — the check is async
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('on the real production host, stays inactive when the visitor is not a signed-in admin', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 401 })));
    setLocation('pcnsportivalp.com', '?previewWebinar=1');
    const { result } = renderHook(() => useWebinarPreview());
    await new Promise((r) => { setTimeout(r, 20); });
    expect(result.current).toBe(false);
  });

  it('ignores any value of the param other than exactly "1"', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    setLocation('pcnsportivalp.com', '?previewWebinar=true');
    const { result } = renderHook(() => useWebinarPreview());
    expect(result.current).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
