import { Link } from 'react-router-dom';
import { safeHref, isExternal } from '../../lib/links.js';

/**
 * A link whose destination is content. Internal paths use the router,
 * external ones open normally, and anything unsafe renders as plain text.
 */
export default function SmartLink({ href, className, children, ...rest }) {
  const url = safeHref(href);
  if (!url) return <span className={className}>{children}</span>;
  if (isExternal(url)) {
    const newTab = /^https?:/i.test(url);
    return (
      <a href={url} className={className} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return <Link to={url} className={className} {...rest}>{children}</Link>;
}
