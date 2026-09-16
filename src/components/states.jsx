import { Link } from 'react-router-dom';

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
  return (
    <div className="py-4" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={16} width={i === rows - 1 ? '60%' : '100%'} className="mb-3" />
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function LoadingCards({ count = 3, col = 'col-md-4' }) {
  return (
    <div className="row" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div className={`${col} mb-4`} key={i}>
          <Skeleton height={200} className="mb-3" />
          <Skeleton height={18} width="80%" className="mb-2" />
          <Skeleton height={14} width="95%" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ error, onRetry, title = 'We could not load this content' }) {
  return (
    <div className="text-center py-5">
      <h3 className="mb-3">{title}</h3>
      <p className="mb-4 text-muted">
        {error?.status === 404
          ? 'The page you are looking for is not available.'
          : 'Please check your connection and try again.'}
      </p>
      {onRetry && (
        <button type="button" className="btn btn-primary py-2 px-4" onClick={onRetry}>
          Try again
        </button>
      )}
      {!onRetry && <Link to="/" className="btn btn-primary py-2 px-4">Back to home</Link>}
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="text-center py-5">
      <h3 className="mb-3">{title}</h3>
      {message && <p className="text-muted mb-4">{message}</p>}
      {action}
    </div>
  );
}
