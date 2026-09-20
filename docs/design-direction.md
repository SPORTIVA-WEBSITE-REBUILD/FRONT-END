# Design direction

Decisions that apply across the front end, and the reasoning behind them, so
later changes argue with the reasoning rather than rediscovering it.

## Typography

Modelled on Bird & Bird (twobirds.com), read from their stylesheet rather than
identified by eye — `base.min.css` serves `PublicoHeadline-Roman-Web.woff2` and
`OpenSans-Regular.woff`, with `font-family:Publico Roman,serif` on headings and
`Open Sans` on everything else.

| Role | Bird & Bird | Here |
|---|---|---|
| Headings | Publico Headline | **Source Serif 4** |
| Body, sub-headings, buttons, menus, meta | Open Sans | **Open Sans** |

**Open Sans is the same family they use**, so the body text matches exactly.

**Publico Headline is a commercial licence** from Commercial Type and cannot
simply be dropped in. Source Serif 4 stands in: the same sturdy transitional
serif built for reading, with an optical size axis (`opsz 8..60`) so display
sizes sharpen rather than looking like blown-up body text. It is a much closer
match than the Playfair Display it replaced, which is far higher contrast and
reads as fashion rather than as a law firm.

`--font-display` lists `'Publico Headline'` second. If the firm licences it,
add the `@font-face` block and move that name to the front — nothing else in
the stylesheet needs to change.

Five weights are loaded in total (Open Sans 400/600/700, Source Serif 4
600/700), down from the seven the previous pairing needed.

## Corners

**Rounded where a surface reads as a panel or a pill control; square for a
plain button or a form field.**

| Surface | Radius |
|---|---|
| Home hero | 12px (8px below 768px) |
| Every card (see "Card elevation" below) | 16px |
| "Why the firm" image and tab panel | 16px |
| "Why the firm" tabs (glass pills) | 999px (full pill) |
| The liquid-glass CTAs (`.btn.btn-primary`, `.btn.btn-dark`) | 3px |
| Everything else — form controls, plain buttons, media | square |

This has drifted from a single rule to two coexisting radii on rounded
surfaces (12 / 16) plus one pill family, and it is being recorded exactly
as it stands rather than smoothed into a tidier story the build does not back
up. Three things are true at once, and the next surface that needs a radius
should pick from what already exists rather than inventing a fourth:

1. **A bordered surface with its own state reads as a panel**, and gets 16px.
   Every card on the site (practice-area, case/record, article, team, gallery)
   and "Why the firm"'s image and tab panel are all 16px now — see "Card
   elevation" below for how cards got there; they used to sit at 10px with no
   shadow, on the reasoning that a document should not look like a button.
   That reasoning held until the rest of the page grew a shadow vocabulary of
   its own (the glass tabs, the liquid-glass CTAs) that the flat cards then
   sat outside of. 12px stays reserved for the home hero, which is inset from
   the page edge rather than bordered like a card, so it is not pulled onto
   16px along with everything else.
2. **A control the reader operates — a tab, a button — reads as a pill or
   stays flat**, not something in between. The "Why the firm" tabs are full
   pill (999px) in both states; their *selected* state borrows the liquid-glass
   CTAs' finish (frosted, blurred, an inset top highlight) without matching
   their radius — the CTAs are still 3px, not pill. That gap is real, not an
   oversight — unifying the two is a legitimate next step, but it changes
   every CTA on the site and was out of scope for a section-level rebuild.
3. **Plain buttons, form controls and media stay square**, as before. That
   part of the original rule held.

The home hero:

| Breakpoint | Radius | Side gutter | Top gap |
|---|---|---|---|
| Desktop and tablet | 12px | 16px | 12px |
| Below 768px | 8px | 8px | 12px |

The hero is the one element that reads as a panel rather than as the page
itself: it is inset from the edges on all sides, and it clips three different
backgrounds (the map artwork, two photographs) plus a scrim behind live text. The
radius is what makes that inset read as deliberate rather than as a broken
full-bleed. At phone width the gutter drops to 8px so the hero runs closer to
full bleed, and the radius drops with it so the proportion holds.

`overflow: hidden` on the hero is load-bearing — without it the map, the photo
scenes and the scrim all escape the corners.

## Practice-area cards

Four on the home page, two by two; all six on the Services page.

- **Mark**: an inline SVG icon at 32px in `--blue`, 20px above the title. The
  repeated stadium photograph that used to head every card is gone — it was the
  same picture four times and said nothing about the practice area.
- **Border and elevation**: 1px `--line`, 16px radius, the site's standard
  card shadow — see "Card elevation" below. Used to be flat with no shadow;
  see that section for why it moved.
- **Hover**: border to `--blue`, the blue-to-white wash behind the copy (this
  card's own effect, kept alongside the shadow rather than replaced by it),
  the shadow deepens, and the card lifts 2px — it is the whole card that is
  the link, so it takes the navigational treatment.
- **Link**: the whole card is the anchor, so there is no "read more"
- **Height**: equal across the row, from the grid stretching the column, never
  a fixed value

### Icons

All in `src/components/icons.jsx`, keyed on service slug, so the grid and the
stroke cannot drift apart. 24-unit grid, 1.5 stroke, round caps and joins,
`currentColor`, no fill. No gavels, scales, handshakes or globes.

A slug with no icon renders no mark rather than a broken one, so adding a
practice area never breaks the row.

### The evidence line

Under the summary, the count of published cases linked to that practice area —
"12 MATTERS IN THE RECORD". Counted server-side in `listServices` with one
grouped aggregation, not by shipping the case collection to the browser.

**Omitted entirely at zero**, never printed as "0 matters". Today only Sports
Dispute Resolution has published cases, so only that card carries the line.
This is what separates the cards from a brochure: every claim on them is
backed by something the firm has published.

## Card elevation

Every card on the site — practice-area, case/record, article, team and
gallery — shares one resting and hover treatment. The card cross-reference
came from the Record rebuild: the case cards were first drawn flat (1px
`--line` border, no shadow), following the site's old "cards are documents,
not buttons" rule taken from Gibson Dunn and White & Case reference sites.
By the time that rule was written the rest of the page had already grown a
shadow vocabulary of its own — the glass tabs, the liquid-glass CTAs — and a
flat card sitting next to them read as the odd one out rather than as
restraint. The shadow below replaces the old no-shadow rule everywhere, not
just on the cards it was first written for.

- **Radius**: 16px, same as every other panel — see "Corners" above.
- **Resting shadow**: two layers, not one — a tight first layer gives the
  card a contact edge so it sits on the page, and a wider second gives it
  depth. A single large blur is what makes a card look like it is hovering
  for no reason.
  ```css
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(11, 27, 43, .04), 0 4px 12px rgba(11, 27, 43, .06);
  ```
- **Hover**: the border tints to `--blue` and the shadow both deepens and
  tints toward blue, so it reads as belonging to the same family as the
  liquid-glass buttons' blue-tinted shadows, not as an unrelated effect.
  ```css
  border-color: var(--blue);
  box-shadow: 0 2px 4px rgba(11, 27, 43, .06), 0 12px 28px rgba(18, 70, 126, .14);
  ```

**The lift is not universal.** Whether a card also moves on hover depends on
what it does when you click it:

- **Navigational cards** — the whole card (or its dominant elements) is a
  link to another page: practice-area cards, case/record cards, article
  cards, team cards (the photo links to the lawyer's bio). These get
  `transform: translateY(-2px)` on hover, 2px and no more — enough to
  register as lifted, not enough to feel like it left the page.
- **Static cards** — nothing on the card navigates; it does something in
  place instead. Gallery thumbnails open a lightbox rather than a page, so
  they take the shadow and border change only, with no lift. A card that
  starts static but later grows a link (a team card whose photo starts
  linking to a bio, say) moves into the navigational group at that point —
  the split is about behaviour, not about which component it happens to be.

**Reduced motion**: every navigational card disables the lift but keeps the
shadow and border-color change, so the hover state still registers without
any movement.
```css
@media (prefers-reduced-motion: reduce) {
  .card:hover, .card:focus-visible { transform: none; }
}
```
Static cards need no equivalent rule — they never had a `transform` on hover
to remove.

**Not yet on this standard**: the dashboard's media library (a separate admin
app with its own Bootstrap-based styling, not this design system's tokens) —
flagged rather than silently touched, since `--blue`/`--line`/`--surface`
don't exist there to apply.

## Record cards

Case records rebuilt onto structured fields rather than the social-media
graphics and press-release prose they used to lead with. No image — see
"Card elevation" above for the border, shadow and hover lift, which this
card uses unchanged.

- **Structure, top to bottom**: a forum·year meta line (uppercase,
  letter-spaced, 14px, `--ink-3`); the matter itself, in `--font-display` at
  21px/600, `--ink-1`, clamped to 3 lines (`pcn-clamp--3` — plain word-wrap,
  nothing forces a mid-word split, so the clamp only ever cuts between
  words); who the firm acted for and the outcome on one line, 16px `--ink-2`
  with the outcome in an uppercase metadata style tinted `--success` for a
  win; one sentence of the holding, 16px `--ink-2`, clamped to 2 lines.
- **The whole card is the link** (`<Link className="pcn-case">`), so there is
  no separate "Read more".
- **Fields**: `forum`, `year`, `partyRepresented` (an enum — "the player",
  "the club", …, from `ROLE_PHRASE` in `cards.jsx`), `opposingParty` and
  `country` (structured, not shown on the compact card — for the case detail
  page and future filtering), `outcome`, `holding` (one plain sentence of
  what the chamber decided, written without naming either party so it is
  safe to show whether or not the case is anonymised), `anonymised`.
- **Anonymisation**: `item.anonymised` swaps the title for "Anonymised
  matter" rather than the real party names; `holding` needs no equivalent
  fallback because it is written name-free from the start. The public API
  must select `anonymised` explicitly in every case projection
  (`publicController.js`) — it was missing from `listCases` and
  `getService`'s case preview for a while, which meant an anonymised case's
  real title could still leak through the list views regardless of the flag.
- **Grid** (`.pcn-case-grid`): CSS grid, 3 columns above 992px, 2 from
  768–991px, 1 below, 24px gap, inside the same `.container` as every other
  section. Equal heights come from the grid itself, the same pattern as the
  practice cards' row.
- **Home section**: exactly 3 cards, the 3 most recent published matters
  (`useCases({ limit: 3 })`, sorted `-year -publishedAt` server-side). Header
  uses the shared, centred `SectionHeading` component, matching
  Team/Testimonials/Insights rather than the bespoke left-aligned
  `.heading-section` Services and "Why the firm" use. The "See the full
  record" CTA below the grid is centred too.
- **`/record`**: every published case, same card, filterable by forum, year
  and party represented (`useCaseFilters`).
- **Social graphics**: removed from case records entirely. They stay in the
  media library for Insights, where a promotional graphic is the right
  context; a case record is not a promotional post.

## "Why the firm"

The firm's own photograph beside its own words: the mission / who-we-advise /
record tabs, on the page grid.

- **Grid**: `.container` — the same one Services and Record use — holding a
  two-column `grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)`, image
  left, copy right, 48px gap, `align-items: start`. Below 992px it collapses
  to one column, image first because it is first in the DOM. `minmax(0, 1fr)`
  rather than a bare `1fr`: a grid track's automatic minimum width is its
  content's min-content size, and without the explicit floor a wide child can
  force its track past its fair share and push the other column onto its own
  line — a real failure mode here, not a defensive footnote. The real
  Bootstrap container this sits in caps at 1140px, not the 1200/1320px a
  couple of drafts of this section assumed; the alignment rules below hold at
  whatever width the container actually is.
- **Section padding**: 96px top and bottom, dropping to 64px below 768px — a
  breakpoint deliberately separate from the 992px the grid collapses at. The
  first version of this section tied the two together and got neither value
  right at 768–991px.
- **Image**: 3:2 at rest, `object-fit: cover`, 16px radius. Ships as a local
  file (`public/about/why-the-firm.jpg`) rather than through Cloudinary, the
  same pattern as the hero's local photographs.

### Bottom-aligned, not just top-aligned

Both columns start on the same line for free — `align-items: start` on the
grid, plus an explicit reset of every margin-top in the copy column, since a
default heading margin is exactly the kind of thing that pushes a column down
by a few pixels without anything looking obviously wrong. The eyebrow needed
one more step: matching its *cap height*, not its line box, to the image's top
edge meant giving it `line-height: 1` and adding the 16px to the heading as an
explicit `margin-bottom` afterward, rather than borrowing it from whatever
leading the browser happened to leave above the ink.

The bottom edge is harder, because the two columns' natural heights are
whatever their content demands, and there are two ways they can disagree:

- **Copy shorter than the image** — `useBottomAlignedPanel` in
  `AboutBlock.jsx` measures the gap and sets it as a `min-height` on the panel
  host, so the panel absorbs the difference. It reads the panel host's own top
  edge against the image's bottom edge, not "everything above the panel" as a
  separate quantity — the top edge already accounts for the heading, the body
  copy and the tab row above it, whatever their sizes, which is also why this
  never needs to recompute when the tab changes: the panel host's top position
  doesn't move when the tab does, only what fills the shared height beneath it
  (see the panel-stacking note below). Gated to 1200px and up; below that the
  columns are narrower and only the top edge is asked to hold.
- **Copy taller than the image** (a tab whose own text is long) — handled in
  plain CSS, not JS: `.pcn-why__media` opts into `align-self: stretch` against
  the grid's own `align-items: start`, so when the copy column ends up taller,
  the image grows to match rather than leaving empty space beside it.
  `object-fit: cover` crops the extra rather than distorting it.

  These two mechanisms don't fight each other: the JS one only ever grows the
  panel, and only takes effect when the image is already the taller column: if
  the panel-host measurement comes out at or below the panel's own natural
  height, `useBottomAlignedPanel` returns nothing and the CSS stretch is what's
  actually doing the work.
- **Tabs**: glass-adjacent pills — see Corners above for the radius. Solid
  `--blue` at rest (matching the "Free Consultation" CTA), liquid-glass navy
  when selected — see the colour note below for why that ended up the reverse
  of what "glass at rest, solid when selected" would suggest.
- **Panel**: 16px radius, `--surface` background, sized to the tallest of the
  three tab panels so switching tabs never moves the page below it. All three
  panels occupy the same CSS Grid cell (`grid-area: 1 / 1`) at once; the
  inactive two are marked `hidden` for the accessibility tree and taken out of
  the tab order, but must still be laid out for the grid to size against them,
  so `visibility: hidden` does the actual hiding instead of `display: none`.

  **This one has a trap.** Bootstrap's reboot sets
  `[hidden] { display: none !important; }` site-wide, which beats any override
  of `[hidden]` regardless of specificity. The fix is one narrowly-scoped
  `!important` on `.pcn-tabs__panel[hidden]` — without it, every panel
  silently collapses to the height of whichever one is active, and the
  "fixed height" requirement fails invisibly (no error, no warning, just a
  panel that resizes every time the tab changes).
- **The record count**: read live from the case archive's own paginated
  query (`useCases({ limit: 8 })`, which the record section already runs —
  its `meta.total` is the number, not a fetch of its own), appended to the
  record tab as a link to `/record`. Omitted entirely at zero.
- **No years-of-experience badge.** It asserted a figure ("7 Years of
  Experience") the firm has not evidenced, in the same way the record tab's
  old "over 50 clubs" and "over 150 disputes" did. All three are listed in
  `firm-review-required.md` — restorable if the firm can back them, gone if it
  cannot.

### Three colour passes on the selected pill

The tabs went through three. The first put a light, translucent navy glass at
rest and solid white on selection. The second reversed it — solid `--blue` at
rest, liquid-glass navy on selection — to read as one brand-coloured control
rather than three separate light chips; that version passed contrast at 78%
opacity, but a navy dense enough to pass read in practice as a flat grey-blue
blob with a dark halo rather than glass. The third, current version keeps
solid `--blue` at rest and puts white glass on the selected pill instead of
navy: `rgba(255,255,255,.72)`, blurred, with a bright top-rim inset shadow and
a faint blue-tinted bottom one — the same two-inset-shadow technique, just
inverted in colour.

**White glass over a white page cannot fail contrast by being too
transparent, and cannot pass it by being made more opaque either** — both
claims sound like they should depend on the opacity, and neither does. This
pill sits on the plain white section background — there is nothing else to
composite against — and blending white with white in any ratio is still
white:

```
alpha·255 + (1 − alpha)·255 = 255, for every value of alpha
```

So `var(--blue)` text over this pill measures **4.28:1** at 72% opacity, at
85%, at 92%, at 100% — identically, because the background it is being
measured against never changes. This is worth stating plainly rather than
quietly picking a higher opacity and calling it fixed: raising the opacity
toward 85%, the instinctive fix, does nothing here.

4.28:1 is also, not coincidentally, the exact number the *resting* pill's
white-on-`var(--blue)` pairing already carries (contrast is symmetric in the
two colours, and both pairings are the same two colours in the same
relationship to the page). Neither pairing is new, worse, or better than the
other — both are a hair under the 4.5:1 floor for 15px semibold text, and both
trace back to the same token, requested for parity with the "Free
Consultation" CTA. Fixing it site-wide means revisiting `--blue` itself, or
choosing a text/background pair for these pills that isn't literally `--blue`
on white — either is a real option, but a bigger decision than a section
rebuild should make unilaterally.

`--blue-deep` (`#035a9a`, `--blue` darkened to roughly 72%) is the hover and
focus colour for the resting pill: white on it is 7.16:1, comfortably clear.

### The selected pill's doubled edge

The white-glass version above shipped with a border at 85% opacity and an
outer shadow at `0 6px 18px rgba(18,70,126,.22)`. Together they read as two
rings: a visible border, and outside it a soft glow wide and diffuse enough to
look like a second, fainter edge rather than a shadow. The border dropped to
`rgba(255,255,255,.55)` — light enough that it stops reading as its own
stroke — and the outer shadow tightened to `0 2px 8px rgba(18,70,126,.14)`,
hugging the pill instead of glowing around it. The second inset shadow (a
faint line along the bottom edge) is gone entirely; one inset rim along the
top plus one tight outer shadow is the whole effect now.

A second, less obvious source of the same symptom: this component's keyboard
handling always focuses the tab it selects (automatic activation — there is
no way to move keyboard focus onto a tab without also making it `.is-active`),
so a keyboard-selected tab was picking up the resting pill's
`:focus-visible` outline *on top of* its own glass border and shadow — an
actual second ring, not just a visual one. Every selector in the shared hover
recipe that touches `.pcn-tabs__tab` now explicitly excludes `.is-active`,
including the outline rule, so the selected pill's own styling is the only
thing that ever draws its edge.

### White glass hover, site-wide

Every solid CTA on the site — the two liquid-glass button variants, the
navbar CTA, the newsletter submit, and the tab pills' resting state — shares
one hover/focus-visible recipe now, defined once as the `--glass-hover-*`
tokens rather than repeated per selector: `rgba(255,255,255,.72)`, blurred,
with the same inset-rim-plus-tight-shadow technique the selected tab uses.

**The text colour is `--ink-1`, not `--blue`**, and this one is not a
close call the way the selected pill's `--blue`-on-white shortfall was.
`--blue` text on this glass has the same hard ceiling documented above —
4.28:1 at best, on a plain white page, at any opacity — but two of these
buttons do not sit on a plain white page. The hero's "Speak to us" sits on the
hero's navy (`#0B1426`); "Free Consultation" sits on the consultation
section's blue overlay. Measured, `--blue` text on this glass over those two
backgrounds is **2.28:1** and **2.94:1** — not a hair under AA, roughly half
of it. `--ink-1` clears 4.5:1 on every background this recipe is actually
used against (9.5:1 or better in each case checked), so it is the one text
colour that does not need a different value per button.

Split into two rules rather than one: `:focus-visible` is unconditional, so a
keyboard user reaches the same state a mouse user gets on hover; `:hover`
only applies inside `@media (hover: hover) and (pointer: fine)`, so a tap on
a touchscreen cannot leave a button showing its hover state after the finger
lifts, which is what a plain `:hover` rule does on touch. Checked directly
with `hasTouch: true` in a real browser: tapping one tab selects it (a real
state change) without leaving any *other* tab showing the hover glass.

The blue-tinted edge-light pseudo-element the buttons already carried at rest
is switched off during hover/focus-visible rather than left running under the
new border — left on, it produced the exact doubled-edge effect the selected
tab had, for the same reason: two things drawing an edge on the same element.

## Colour tokens

Defined on `:root` in `app.css`. They name colours the site was already using
literally in a dozen places; nothing changed on screen when they landed.

| Token | Value | Use |
|---|---|---|
| `--blue` | `#047dd6` | links, CTAs, focus, icon marks |
| `--blue-deep` | `#035a9a` | the resting tab's keyboard-focus outline — see "Why the firm" |
| `--glass-hover-bg` | `rgba(255,255,255,.72)` | every solid CTA's shared hover/focus-visible background |
| `--glass-hover-border` | `rgba(255,255,255,.55)` | — its border |
| `--glass-hover-shadow` | inset rim + tight outer shadow | — its box-shadow, see "White glass hover, site-wide" |
| `--glass-hover-text` | `var(--ink-1)`, not `--blue` | — its text colour; `--blue` fails badly on two of the real backgrounds this is used against |
| `--line` | `#e6e6e6` | hairline borders |
| `--surface` | `#f8f9fa` | quiet ground |
| `--ink-1` | `#0f172a` | headings |
| `--ink-2` | `#666` | body copy |
| `--ink-3` | `#999` | metadata |

## Spacing tokens

An 8px base; every value is a whole multiple of it, so section padding and the
gaps inside a section land on one rhythm instead of each component inventing
its own.

| Token | Value | Use |
|---|---|---|
| `--space-md` | `3rem` (48px) | the gap between columns inside a section |
| `--space-lg` | `4rem` (64px) | section padding below the lg/md breakpoints |
| `--space-xl` | `6rem` (96px) | section padding on desktop |

## Hero height

The hero was full-viewport (`.js-fullheight`, `100vh`). It is now capped:

| Breakpoint | Height | Floor |
|---|---|---|
| Desktop | `min(78vh, 760px)` | 560px |
| Below 768px | `68vh` | 460px |

The floor exists so the subheading, headline, body and button never crowd on a
short window. The hero markup no longer carries `.js-fullheight` at all —
leaving the class on the element while overriding its height meant two rules
fighting over the same property. `.slider-text` inside the hero tracks the
hero's height rather than the viewport for the same reason.

`.js-fullheight` still exists for the inner-page banners, which remain
viewport-sized.

## The hero map

The first hero slide is **the firm's own artwork**, not a map drawn in code:
the media record `pcn-sportiva/hero-beyond`, served from Cloudinary. A world
map with Africa picked out in blue, rings over Nigeria, and arcs running to
London, Paris, Madrid, Rome, the Gulf and the Americas.

The concentric rings over Nigeria are **painted into the image**. They are not
produced in CSS, which is why they hold their place on the landmass and never
change size. An earlier attempt redrew the map as inline SVG with CSS-animated
markers; it was removed. Do not redraw it.

### Why this asset and not `hero-continent`

The hero is 2.48:1 and every map asset is 1.78:1, so `background-size: cover`
crops **28% of the height** — 154px off the top and 153px off the bottom of a
1080px image. On `pcn-sportiva/hero-continent` that ate the Mediterranean and
what little of Europe the artwork held, while Africa filled the frame.

`contain` would have shown the whole of that artwork, but at the cost of
269px of navy down each side, and it still would not have shown Europe —
`hero-continent` barely contains any. `hero-beyond` is framed wide enough that
the 28% crop costs nothing (it takes northern Canada and Antarctica), so it
fills the hero, keeps the rings, and puts Europe clearly in frame.

The other two assets, `pcn-sportiva/hero-africa` and `pcn-sportiva/hero-nigeria`,
remain in the media library and are not used by any slide.

### The motion is the drift, not the rings

There is no ring animation anywhere in this codebase, and there never was. The
hero's movement is two things, both from commit `97d98df`:

```css
.hero-wrap .pcn-hero-scene {
  opacity: 0;
  transform: scale(1.04);
  transition: opacity 1.2s ease, transform 6s ease;
}
.hero-wrap .pcn-hero-scene.is-active { opacity: 1; transform: scale(1); }
```

plus `useParallax(0.5)` on the hero, which drifts `backgroundPositionY` on
scroll. The hero therefore needs its own background image — the map artwork
doubles as it — or the parallax hook has nothing to move.

### The three light layers

Navy artwork alone reads as one flat block, so three layers of light sit over
it on `.pcn-hero-scene--map::after`, listed in CSS reverse order (background
layers paint first-on-top):

1. **Light source**, upper right — `radial-gradient(ellipse 64% 48% at 74% 16%)`,
   white 14% to 6% to transparent
2. **Horizon band** — `linear-gradient(180deg)`, white 5% at the top, 3% at the
   bottom, clear through the middle
3. **Reading scrim** — `linear-gradient(90deg)`, neutral black 72% to 55% to
   26% to transparent. No navy, no blue multiply, no duotone.

They live on the `::after` of the scene, which is the layer the
`scale(1.04) → scale(1)` drift transforms. That is deliberate: fixed over the
hero instead, the artwork would drift beneath a stationary highlight and smear.

**Below 768px** the copy stops being a half-width column and runs the full
frame, so the scrim carries all the way across (74% → 58% → 52%) and the
highlight moves further up and right.

### Verified, not eyeballed

`scripts/check-hero-layers.cjs` decodes the artwork and composites the layers
per-pixel. It needs `npm i --no-save jpeg-js` and a copy of the map at
`./_map.jpg`. Results as committed:

| Check | Result |
|---|---|
| White copy at 1920 / 1280 / 768 | 5.42:1, 5.56:1, 5.56:1 |
| White copy at 700 / 390 | 4.99:1, 4.99:1 |
| Rings vs land, artwork alone | 7.80:1 |
| Rings vs land, with the highlight | 7.80:1 (no overlap) |
| Highlight at 390px, upper right vs behind copy | 13.5% vs 0% |

Two numbers in the brief did not survive that check and were changed:

- The scrim's **0.30 at 45%** gave **2.75:1**, well under AA. The copy column
  crosses bright blue landmass around 40–50% across, which needs about 44%
  black. The stops are heavier as a result.
- The light source at **70% 55% at 72% 18%** reached the rings and cost them
  11% of their separation from the land beneath. Tightening it to
  `64% 48% at 74% 16%` fixed that; on `hero-beyond`, where the rings sit lower
  in the frame, the highlight now misses them entirely.

Re-run the script after touching any of these numbers, or after replacing the
artwork.

## Motion

Under `prefers-reduced-motion: reduce` the hero shows its first slide only:
no drift, no cross-fade, and the two photographs are never requested.

## Free consultation

The `consultation` section (`Consultation.jsx`, `.pcn-consultation`) on Home
and About, in its current, fourth form. Earlier drafts, in order: a
background photograph with a blue overlay (empty left half, white-on-blue
inputs with no contrast); a white-card form with First Name/Last Name split
fields; an underline-only navy form with both a caps label and a placeholder
stacked on every field. Each got replaced rather than patched once the next
requirement made its problem concrete — recorded here so a future pass does
not re-try one of them expecting a different result.

- **Section heading**: a centred `SectionHeading`, matching "Our Team" —
  `section.subheading` ("GET IN TOUCH") as the eyebrow, `labels.sectionHeading`
  ("Contact Us") as the heading. This used to be two eyebrows reading "GET IN
  TOUCH" twice — once here, once again inside the left column — before the
  section-level one existed.
- **Grid**: two flush panels in one 16px-rounded, `overflow: hidden` box,
  the site's standard card shadow (see "Card elevation"). Plain divs, not
  Bootstrap's `row`/`col-lg-6` — those still applied `max-width: 50%` under
  the CSS Grid parent (a `max-width` isn't a flexbox-only property, so it
  kept effect even though the row was no longer flex), which was the source
  of a hairline width mismatch between the two panels.
- **Left panel** (`--surface`): `section.heading` only (no eyebrow — see
  above), the optional pull quote (`section.value`, no default: a slogan
  the firm has not actually said does not belong on its own site), then
  three icon-circle rows (Call Us / Email Us / Headquarters) reading real
  phone/email/address from Settings, never placeholder text, then an
  optional availability line.
- **Right panel** (`--navy`, `#124b89`): the enquiry form
  (`EnquiryForm variant="panel"`), Name/Email/Phone/Subject/Message. No
  heading of its own — a form-panel eyebrow+heading pair was tried and
  dropped once the section-level heading above made it redundant. Not
  vertically centred: a shorter form centred inside a taller cell is what
  left a blank gap above the fields in an earlier draft; block layout
  starts the fields at the same top line as the left panel's own content.
- **Fields**: a caps label over a placeholder, on a thin
  `rgba(255,255,255,.35)` underline — no fill, no radius, no box border. A
  bordered white-box version (matching the site's other forms) was tried in
  between: it read as heavier and more spaced out than this panel calls
  for, on a background none of the site's other forms sit on. Focus
  brightens the underline to solid white. Two columns for Name/Email and
  Phone/Subject, Message full width, tight even spacing between every
  field — the boxed version's larger gaps were part of what it got wrong.
- **Submit button**: the standard glass-hover CTA (white at rest, since it
  sits on navy rather than on the page background; the shared
  `--glass-hover-*` tokens on hover, unmodified).
- **Success**: the form panel replaces itself with a checkmark, a heading
  and a "send another message" reset, rather than a small banner above an
  emptied form.
- **The gallery strip directly below**: on Home, whatever renders right
  after this section depends on whether Testimonials has any published
  entries — it is hidden entirely when empty (`testimonials?.length > 0`).
  With none published, the section immediately below Consultation is
  Gallery ("The firm at work"), a real, deliberate section of the firm's
  own photographs, not stray or leftover content — it only reads as
  unrelated because Testimonials, which would normally sit between them,
  has nothing to show yet.
