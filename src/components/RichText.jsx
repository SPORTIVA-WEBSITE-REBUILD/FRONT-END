/**
 * Article and service bodies are sanitised by the backend on write, against a
 * strict allowlist, so what reaches here is already safe to render. Sanitising
 * again in the browser would duplicate the work without adding a guarantee.
 */
export default function RichText({ html, className = '' }) {
  if (!html) return null;
  return (
    <div
      className={`pcn-richtext ${className}`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
