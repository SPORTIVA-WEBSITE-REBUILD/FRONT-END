import { describe, it, expect } from 'vitest';
import { safeHref, safeInternalPath, isExternal } from '../lib/links.js';

describe('link hardening', () => {
  it('allows the links an administrator legitimately writes', () => {
    for (const href of ['/record', '/insights/a-case', '#top', 'https://example.com', 'http://example.com', 'mailto:a@b.com', 'tel:+2348012345678']) {
      expect(safeHref(href), href).toBe(href);
    }
  });

  it('rejects script-bearing schemes', () => {
    for (const href of [
      'javascript:alert(1)',
      'JaVaScRiPt:alert(1)',
      '  javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox(1)',
    ]) {
      expect(safeHref(href), href).toBeNull();
    }
  });

  it('rejects the backslash and protocol-relative forms that redirect off-site', () => {
    // The React Router advisory: browsers normalise these to //evil.example.
    for (const href of ['/\\evil.example', '\\\\evil.example', '//evil.example', '/\\/evil.example', 'https://a.com\\@evil.com']) {
      expect(safeHref(href), href).toBeNull();
    }
  });

  it('rejects anything that is neither a path nor an absolute URL', () => {
    for (const href of ['evil.example', '', '   ', null, undefined, 42, {}]) {
      expect(safeHref(href)).toBeNull();
    }
  });

  it('identifies external links so they get target/rel treatment', () => {
    expect(isExternal('https://example.com')).toBe(true);
    expect(isExternal('mailto:a@b.com')).toBe(true);
    expect(isExternal('/record')).toBe(false);
  });

  it('keeps a post-login redirect inside the app', () => {
    expect(safeInternalPath('/cases')).toBe('/cases');
    expect(safeInternalPath('//evil.example')).toBe('/');
    expect(safeInternalPath('/\\evil.example')).toBe('/');
    expect(safeInternalPath('https://evil.example')).toBe('/');
    expect(safeInternalPath(undefined)).toBe('/');
    expect(safeInternalPath('/x', '/fallback')).toBe('/x');
    expect(safeInternalPath('nope', '/fallback')).toBe('/fallback');
  });
});
