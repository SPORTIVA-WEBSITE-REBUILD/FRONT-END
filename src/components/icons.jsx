/**
 * Practice-area icons.
 *
 * One module so the grid and the stroke stay consistent: every icon is drawn on
 * a 24-unit grid with a 1.5 stroke, round caps and joins, no fill, and takes its
 * colour from `currentColor`. Add a new one by adding a path set to ICONS,
 * keyed on the service's slug — never by setting width or colour at the call
 * site.
 *
 * Deliberately not gavels, scales, handshakes or globes.
 */

const VIEW_BOX = 24;
const STROKE = 1.5;

/** The shared frame. Everything below supplies paths only. */
function Glyph({ children, size = 32, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${VIEW_BOX} ${VIEW_BOX}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/**
 * Keyed on service slug. The four the home page shows are first; the last two
 * exist because the Services page lists all six practice areas and a card
 * without a mark would look broken next to the others.
 */
const ICONS = {
  // A three-seat tribunal bench, the centre seat taller.
  'sports-dispute-resolution': (
    <>
      <path d="M2.5 15h19" />
      <path d="M5 15v4.5M19 15v4.5" />
      <path d="M7 15v-3.5M12 15v-4.5M17 15v-3.5" />
    </>
  ),
  // Two nodes joined by an arc.
  'contracts-and-transfers': (
    <>
      <circle cx="6" cy="16.5" r="2.5" />
      <circle cx="18" cy="16.5" r="2.5" />
      <path d="M7.2 14.2a7.5 7.5 0 0 1 9.6 0" />
    </>
  ),
  // Nested rings.
  'sports-governance': (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="9.5" />
    </>
  ),
  // One party, held on both sides: a node inside two embracing brackets.
  'player-representation': (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M7 5.5a8 8 0 0 0 0 13" />
      <path d="M17 5.5a8 8 0 0 1 0 13" />
    </>
  ),
  // A stand in section: a stepped terrace on a ground line.
  'sports-infrastructure-advisory': (
    <>
      <path d="M2.5 20.5h19" />
      <path d="M5 20.5V17h4v-3h4v-3h4V8h3" />
    </>
  ),
  // A test tube, half full: the sample every anti-doping case turns on.
  'anti-doping': (
    <>
      <path d="M9 3h6" />
      <path d="M10 3v6.5L5.7 18a2.4 2.4 0 0 0 2.1 3.5h8.4a2.4 2.4 0 0 0 2.1-3.5L14 9.5V3" />
      <path d="M7.6 15h8.8" />
    </>
  ),
  // A shield with a band across it.
  'data-protection-and-technology': (
    <>
      <path d="M12 2.8l7 2.8v5.1c0 4.4-2.9 7.7-7 8.9-4.1-1.2-7-4.5-7-8.9V5.6z" />
      <path d="M9 11.5h6" />
    </>
  ),
};

/**
 * The mark for a practice area. Renders nothing for a slug with no icon, so a
 * service added later shows a card without a mark rather than a broken one.
 */
export default function ServiceIcon({ slug, size = 32, className }) {
  const paths = ICONS[slug];
  if (!paths) return null;
  return <Glyph size={size} className={className}>{paths}</Glyph>;
}

export const ICON_SLUGS = Object.keys(ICONS);

/**
 * Contact-detail marks (phone, email, location) — not practice areas, so
 * they live outside the slug-keyed ICONS map, but share the same frame and
 * stroke so a row of them reads as part of the same icon family.
 */
export function PhoneIcon({ size = 20, className }) {
  return (
    <Glyph size={size} className={className}>
      <path d="M6 3.5c.6 0 1.1.4 1.3 1l1 2.6c.2.5 0 1-.3 1.4L6.8 9.8a12 12 0 0 0 5.4 5.4l1.3-1.2c.4-.3.9-.5 1.4-.3l2.6 1c.6.2 1 .7 1 1.3v2.2c0 1-.8 1.8-1.8 1.7C10.4 19.4 4.6 13.6 4.3 6.3 4.2 5.3 5 4.5 6 4.5z" />
    </Glyph>
  );
}

export function MailIcon({ size = 20, className }) {
  return (
    <Glyph size={size} className={className}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
    </Glyph>
  );
}

export function PinIcon({ size = 20, className }) {
  return (
    <Glyph size={size} className={className}>
      <path d="M12 21.5s7-6.6 7-12A7 7 0 0 0 5 9.5c0 5.4 7 12 7 12z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </Glyph>
  );
}
