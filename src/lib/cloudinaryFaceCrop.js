/**
 * Inserts a face-cropped, square Cloudinary transform right after
 * `/upload/` so a speaker photo always renders as a tight circular headshot
 * regardless of the original image's framing. Any URL that doesn't match
 * Cloudinary's `/upload/` delivery shape (e.g. a non-Cloudinary photo, or
 * none at all) is returned unchanged — object-fit: cover on the <img>
 * still keeps it circular, just without the face-aware crop.
 */
export function cloudinaryFaceCrop(url, size = 128) {
  if (!url) return url;
  const marker = '/upload/';
  const i = url.indexOf(marker);
  if (i === -1) return url;
  const transform = `c_fill,g_face,w_${size},h_${size},q_auto,f_auto`;
  return `${url.slice(0, i + marker.length)}${transform}/${url.slice(i + marker.length)}`;
}
