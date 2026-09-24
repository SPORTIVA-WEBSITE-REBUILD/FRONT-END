import { useId, useMemo } from 'react';
import { buildFootnotes } from '../lib/footnotes.js';

/**
 * Article and service bodies are sanitised by the backend on write, against a
 * strict allowlist, so what reaches here is already safe to render. Sanitising
 * again in the browser would duplicate the work without adding a guarantee.
 *
 * Footnotes are the one thing done here: markers are numbered in reading order
 * and their sources collected into a "Notes" list at the foot, each linking
 * back to the place it was cited from.
 */
export default function RichText({ html, className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const output = useMemo(() => buildFootnotes(html, uid), [html, uid]);
  if (!output) return null;
  return (
    <div
      className={`pcn-richtext ${className}`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: output }}
    />
  );
}
