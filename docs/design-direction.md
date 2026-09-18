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

**Rounded where a surface reads as a panel; square everywhere else.**

| Surface | Radius |
|---|---|
| Home hero | 12px (8px below 768px) |
| Practice-area cards | 10px |
| Everything else — buttons, form controls, media | square |

This replaces an earlier "square by default, hero excepted" rule. Practice-area
cards were briefed square to 2px and then rounded on review: a bordered card
with a hover state reads as a panel in the same way the hero does, and at 2px
the border looked like a rendering error rather than a decision.

The test is whether the surface has its own edge. A card with a 1px border and
a hover state does; a button filled with brand blue does not, and stays square.

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
- **Border**: 1px `--line`, no shadow, 10px radius
- **Hover**: border to `--blue`, and a blue-to-white wash behind the copy.
  Nothing scales and nothing moves; the card is a document, not a button.
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

## Colour tokens

Defined on `:root` in `app.css`. They name colours the site was already using
literally in a dozen places; nothing changed on screen when they landed.

| Token | Value | Use |
|---|---|---|
| `--blue` | `#047dd6` | links, CTAs, focus, icon marks |
| `--line` | `#e6e6e6` | hairline borders |
| `--surface` | `#f8f9fa` | quiet ground |
| `--ink-1` | `#0f172a` | headings |
| `--ink-2` | `#666` | body copy |
| `--ink-3` | `#999` | metadata |

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
