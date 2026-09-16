import { imageProps } from '../lib/media.js';

/**
 * One image component for the whole site so responsive sizes, lazy loading and
 * Cloudinary transformations are applied consistently rather than remembered
 * case by case.
 */
export default function SmartImage({
  media, width, height, crop, gravity, sizes = '100vw',
  className, alt, priority = false, fallback = null, style,
}) {
  const props = imageProps(media, { width, height, crop, gravity, sizes, fallback });
  if (!props) return null;

  return (
    <img
      {...props}
      alt={alt ?? props.alt ?? ''}
      className={className}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchpriority={priority ? 'high' : undefined}
    />
  );
}

/**
 * The template expresses hero images as CSS background-image, so they cannot be
 * responsive <img> tags without changing the design. A single generously sized
 * transformation keeps the visual result identical while still going through
 * Cloudinary's optimiser.
 */
export function backgroundStyle(media, fallbackUrl, width = 1920, options = {}) {
  const url = media ? imageProps(media, { width, ...options })?.src : fallbackUrl;
  return url ? { backgroundImage: `url('${url}')` } : undefined;
}
