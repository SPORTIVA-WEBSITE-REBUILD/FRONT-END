/**
 * Builds a Cloudinary delivery URL with transformations injected.
 *
 * `f_auto` serves AVIF or WebP where the browser supports it, `q_auto` picks a
 * quality target per image, and `dpr_auto` handles retina screens — so the
 * heavy lifting happens on Cloudinary's CDN rather than in the browser or on
 * our own server.
 */
/** Crops that discard part of the image, and so need to know what to keep. */
const CROPPING = new Set(['fill', 'thumb', 'lfill', 'fill_pad']);

export function mediaUrl(media, { width, height, crop = 'fill', gravity } = {}) {
  const src = typeof media === 'string' ? media : media?.secureUrl;
  if (!src) return '';
  if (!src.includes('/upload/')) return src;

  const parts = ['f_auto', 'q_auto', 'dpr_auto'];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (width || height) {
    parts.push(`c_${crop}`);
    // Cloudinary crops from the centre unless told otherwise, which decapitates
    // anyone in a portrait photo shown in a landscape tile. `g_auto` picks the
    // subject, and prefers faces when it finds them.
    if (CROPPING.has(crop)) parts.push(`g_${gravity || 'auto'}`);
  }

  return src.replace('/upload/', `/upload/${parts.join(',')}/`);
}

const WIDTHS = [480, 768, 1200, 1920];

export function mediaSrcSet(media, { width, height, crop, gravity } = {}) {
  const src = typeof media === 'string' ? media : media?.secureUrl;
  if (!src || !src.includes('/upload/')) return undefined;

  // Height has to scale with width. Holding it fixed gives every candidate a
  // different aspect ratio, so the browser picks one shape and the layout gets
  // another — the image jumps or crops differently depending on screen size.
  const ratio = width && height ? height / width : null;

  return WIDTHS
    .map((w) => {
      const h = ratio ? Math.round(w * ratio) : undefined;
      return `${mediaUrl(media, { width: w, height: h, crop, gravity })} ${w}w`;
    })
    .join(', ');
}

/** Falls back to a bundled placeholder so a missing image never breaks layout. */
export function imageProps(media, { width, height, crop, gravity, sizes = '100vw', fallback } = {}) {
  if (!media) return fallback ? { src: fallback, alt: '' } : null;
  return {
    src: mediaUrl(media, { width, height, crop, gravity }),
    srcSet: mediaSrcSet(media, { width, height, crop, gravity }),
    sizes,
    alt: media?.alt || '',
    width: media?.width,
    height: media?.height,
  };
}
