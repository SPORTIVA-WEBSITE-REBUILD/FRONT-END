const escapeHtml = (v = '') => String(v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Escaped source text, with any web address turned into a link. */
function sourceHtml(text) {
  return escapeHtml(text).replace(
    /\bhttps?:\/\/[^\s<]+[^\s<.,;:!?)\]'"]/gi,
    (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`,
  );
}

/**
 * Turns `<sup data-fn="source"></sup>` markers into numbered, linked
 * superscripts and appends a Notes list. `uid` keeps the anchors unique when
 * more than one rich text block is on the same page.
 *
 * Returns the html untouched when there are no footnotes.
 */
export function buildFootnotes(html, uid = '') {
  if (!html || !html.includes('data-fn')) return html || '';

  let count = 0;
  const notes = [];
  const body = html.replace(/<sup\b[^>]*\bdata-fn="([^"]*)"[^>]*>\s*<\/sup>/gi, (match, raw) => {
    // The attribute value comes back through the sanitiser HTML-escaped.
    const text = raw.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    count += 1;
    notes.push(text);
    return `<sup class="pcn-fn"><a id="fnref-${uid}-${count}" href="#fn-${uid}-${count}" aria-label="Footnote ${count}">${count}</a></sup>`;
  });

  if (!notes.length) return html;

  const items = notes.map((text, i) => (
    `<li id="fn-${uid}-${i + 1}">${sourceHtml(text)} `
    + `<a class="pcn-fn__back" href="#fnref-${uid}-${i + 1}" aria-label="Back to the text">Back to text</a></li>`
  )).join('');

  return `${body}<section class="pcn-footnotes" aria-label="Notes"><h2>Notes</h2><ol>${items}</ol></section>`;
}
