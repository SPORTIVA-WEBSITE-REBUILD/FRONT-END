/**
 * Date and text formatting in the shapes the template prints. Month names come
 * from the browser's locale data, so no wording is hardcoded here.
 */
const LOCALE = 'en-GB';

const asDate = (value) => (value ? new Date(value) : null);

/** Blog card: "18" / "2019" / "October". */
export function dateParts(value) {
  const d = asDate(value);
  if (!d || Number.isNaN(d.getTime())) return null;
  return {
    day: d.getDate(),
    year: d.getFullYear(),
    month: d.toLocaleDateString(LOCALE, { month: 'long' }),
  };
}

/** Sidebar list: "Oct. 18, 2019". */
export function shortDate(value) {
  const d = asDate(value);
  if (!d || Number.isNaN(d.getTime())) return '';
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  return `${month}. ${d.getDate()}, ${d.getFullYear()}`;
}

/** Comment meta: "October 18, 2018 at 2:21pm". */
export function commentDate(value) {
  const d = asDate(value);
  if (!d || Number.isNaN(d.getTime())) return '';
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', '').toLowerCase();
  return `${date} at ${time}`;
}

/** Long date for detail pages: "18 October 2019". */
export function longDate(value) {
  const d = asDate(value);
  if (!d || Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Replaces {year} in administrator-written text. */
export function withYear(text = '') {
  return text.replace(/\{year\}/g, String(new Date().getFullYear()));
}

/** "40" → "40", "1200" → "1,200", as jQuery animateNumber's separator step does. */
export function commaNumber(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Maps a stored enum value to its term in the layout's term labels. */
export function term(labels, prefix, value) {
  if (!value) return '';
  const key = prefix + value.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join('');
  return labels[key] || labels[value.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] || value;
}
