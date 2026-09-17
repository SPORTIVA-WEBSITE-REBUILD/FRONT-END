import { Link, useLocation } from 'react-router-dom';
import { useCommon } from '../hooks/useContent.js';

/**
 * The template's numbered pagination (`.block-27`): links for other pages, a
 * plain span for the current one. Pages are part of the URL so a page of
 * results can be linked and crawled.
 */
export default function Pagination({ page, pages }) {
  const { search, pathname } = useLocation();
  const common = useCommon();
  if (!pages || pages <= 1) return null;

  const hrefFor = (p) => {
    const params = new URLSearchParams(search);
    if (p > 1) params.set('page', p); else params.delete('page');
    const s = params.toString();
    return `${pathname}${s ? `?${s}` : ''}`;
  };

  const numbers = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i += 1) numbers.push(i);

  return (
    <div className="row mt-5">
      <div className="col text-center">
        <div className="block-27">
          <ul>
            <li>
              {page > 1
                ? <Link to={hrefFor(page - 1)} aria-label={common.previous}>&lt;</Link>
                : <span aria-hidden="true">&lt;</span>}
            </li>
            {numbers.map((p) => (
              <li key={p} className={p === page ? 'active' : undefined}>
                {p === page ? <span aria-current="page">{p}</span> : <Link to={hrefFor(p)}>{p}</Link>}
              </li>
            ))}
            <li>
              {page < pages
                ? <Link to={hrefFor(page + 1)} aria-label={common.next}>&gt;</Link>
                : <span aria-hidden="true">&gt;</span>}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
