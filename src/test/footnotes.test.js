import { describe, it, expect } from 'vitest';
import { buildFootnotes } from '../lib/footnotes.js';

describe('footnotes', () => {
  it('leaves text without footnotes alone', () => {
    expect(buildFootnotes('<p>Plain.</p>', 'x')).toBe('<p>Plain.</p>');
    expect(buildFootnotes('', 'x')).toBe('');
  });

  it('numbers markers in reading order and lists the sources with back-links', () => {
    const out = buildFootnotes(
      '<p>One<sup data-fn="Case A v B [2020]" class="fn"></sup> two<sup class="fn" data-fn="See https://example.com/x."></sup></p>',
      'u1',
    );
    expect(out).toContain('<a id="fnref-u1-1" href="#fn-u1-1"');
    expect(out).toContain('<a id="fnref-u1-2" href="#fn-u1-2"');
    expect(out).toContain('<li id="fn-u1-1">Case A v B [2020]');
    expect(out).toContain('href="#fnref-u1-2"');
    // a web address in the source becomes a link, without swallowing the full stop
    expect(out).toContain('<a href="https://example.com/x" target="_blank" rel="noopener noreferrer">https://example.com/x</a>.');
  });

  it('escapes markup inside a source so it cannot inject html', () => {
    const out = buildFootnotes('<p>x<sup data-fn="&lt;img src=x onerror=alert(1)&gt;"></sup></p>', 'u');
    expect(out).not.toContain('<img');
    expect(out).toContain('&lt;img');
  });
});
