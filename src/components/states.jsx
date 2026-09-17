import { Link } from 'react-router-dom';
import { useCommon } from '../hooks/useContent.js';

/**
 * Skeletons reserve the same space the real content will occupy, so loading
 * does not shift the layout underneath the reader.
 */
export function Skeleton({ height = 20, width = '100%', className = '' }) {
  return (
    <span
      className={`pcn-skeleton ${className}`}
      style={{ height, width, display: 'block' }}
      aria-hidden="true"
    />
  );
}

export function LoadingSection({ rows = 3 }) {
  const common = useCommon();
  return (
    <div className="py-4" role="status" aria-label={common.loading}>
      {Array.from({ length: rows }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Skeleton key={i} height={16} width={i === rows - 1 ? '60%' : '100%'} className="mb-3" />
      ))}
    </div>
  );
}

export function LoadingCards({ count = 3, col = 'col-md-4' }) {
  const common = useCommon();
  return (
    <div className="row" role="status" aria-label={common.loading}>
      {Array.from({ length: count }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className={`${col} mb-4`} key={i}>
          <Skeleton height={200} className="mb-3" />
          <Skeleton height={18} width="80%" className="mb-2" />
          <Skeleton height={14} width="95%" />
        </div>
      ))}
    </div>
  );
}

/**
 * When the API itself is unreachable there is no interface text to show, so
 * the error state alone keeps plain English fallbacks. Everywhere else the
 * words come from the layout page.
 */
const OFFLINE = {
  errorTitle: 'We could not load this content',
  errorText: 'Please check your connection and try again.',
  notFoundText: 'The page you are looking for is not available.',
  retry: 'Try again',
  backHome: 'Back to home',
};

export function ErrorState({ error, onRetry }) {
  const common = { ...OFFLINE, ...useCommon() };
  return (
    <div className="text-center py-5">
      <h3 className="mb-3">{common.errorTitle}</h3>
      <p className="mb-4 text-muted">{error?.status === 404 ? common.notFoundText : common.errorText}</p>
      {onRetry
        ? <button type="button" className="btn btn-primary py-2 px-4" onClick={onRetry}>{common.retry}</button>
        : <Link to="/" className="btn btn-primary py-2 px-4">{common.backHome}</Link>}
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="text-center py-5">
      {title && <h3 className="mb-3">{title}</h3>}
      {message && <p className="text-muted mb-4">{message}</p>}
      {action}
    </div>
  );
}
