# Firm review required

Items on this list are **published on the public site but have not been
confirmed by the firm**. Each needs a decision from someone at PCN Sportiva LP
before launch.

## Locations marked on the home hero map

**Nothing here needs clearance any more, and this section is kept only to
record why.**

The hero map is the firm's own artwork (`pcn-sportiva/hero-continent`). It
marks one location — Nigeria — with concentric rings painted into the image.
No club is named, plotted or implied anywhere on the site.

An earlier build replaced that artwork with a map drawn in code, carrying seven
markers for six football clubs. That version was removed. If it is ever
revisited, these are the names it used and each would need the firm's sign-off
before going near the public site:

| Location | Club | Cleared to name? |
|---|---|---|
| Ikenne, Ogun State | Remo Stars FC, Beyond Limits FA | ☐ |
| Aba, Abia State | Enyimba FC | ☐ |
| Bauchi, Bauchi State | Wikki Tourists FC | ☐ |
| Warri, Delta State | Warri Wolves FC | ☐ |
| Yerevan, Armenia | FC Alashkert | ☐ |

Lagos and Abuja are the firm's own offices and would need no clearance.

## Hero photography

The hero rotates four event photographs, seeded as media records `hero-acfta`,
`hero-table`, `hero-crowd` and `hero-podium` (files in `public/hero/`). Each
shows identifiable people at an industry event, with their own eyebrow and
paragraph. The firm should confirm it holds the right to publish all four, and
whether anyone pictured should be credited, named, or asked first. The
earlier stadium, forum and certificate images and the map slide are retired.

## Rewritten copy

Two blocks were rewritten and are **live on the site now**. Both keep the
substance of the firm's original wording at roughly half the length. The firm
should confirm each, or edit it in the dashboard — the seed will not overwrite
an edit made there.

### Services intro — home page

**This block is the firm's own wording, supplied directly.** It needs no
sign-off; it is recorded here only so the trail is complete.

**Now reads:**

> **Protecting Your Rights With Expertise,**
>
> We act for players, coaches, clubs and federations from the first contract
> through to the tribunal, and we appear before the bodies that decide these
> matters rather than referring them out.

**Previously:** "We also represent clients before relevant international sports
tribunals and decision making bodies on matters relating to our service areas.
Our team members lead the development of Sports law practice in Africa, pushing
the envelope towards the pacific and Europe." — under the heading "What we do".

Two problems with that text: it opened on "We **also** represent…" with no
preceding clause, because it had been lifted out of a longer passage; and
"pushing the envelope towards the pacific" is a claim about reach the firm may
not want to make in that form. Both are gone.

**One thing to check:** the heading ends in a comma — "Protecting Your Rights
With Expertise," — which is how it was supplied. It is set as given. If that
comma was not intended, it is a one-character change.

**A count question this wording settled.** An interim draft opened "Four
practice areas, one firm", which sat awkwardly against the six practice areas
the firm publishes: Sports Dispute Resolution, Contracts and Transfers, Sports
Governance, Player Representation, Sports Infrastructure Advisory, and Data
Protection and Technology. The new wording claims no number, so nothing on the
page contradicts the Services listing. The home page still shows four cards by
design; all six remain on the Services page.

### About block

**Intro now reads:**

> A boutique sports law practice. We act for players, coaches, clubs and
> federations across Africa, on every legal question the sports industry raises.

**The team paragraph now reads:**

> Our lawyers work across all of the firm's practice areas, advising
> international federations, national associations, football and basketball
> clubs, licensed coaches, intermediaries and athletes.

Cleared? ☐

Removed from the About block:

- **"masterful range of clients"** — an unsupported superlative
- **"pushing the envelope towards the pacific"** — as above
- **The "Our Mission" paragraph**, which restated the intro at length. The
  "Who We Advise" and "Our Record" tabs remain, both of them concrete.

The mission paragraph was deleted, not archived. If the firm wants it back, it
is in this file and in the git history of `scripts/seed-content.js`:

> PCN SPORTIVA LP's ultimate mission is to provide comprehensive and integrated
> sports legal advice and representation to clients, who want optimal levels of
> skill and expertise to match their resources.

## Three figures removed as unsupported

The home page's "Why the firm" tabs and its years-of-experience badge carried
three numbers with nothing behind them. All three are **removed from the site
now**, not merely flagged. If the firm can evidence any of them, they can go
back in — as a fixed line if the firm is confident in the number, or as
something counted live from the database the way the record tab's case count
now is. Until then they stay off.

| Figure | Where it was | Status |
|---|---|---|
| "over 50 clubs, academies and players" | Home, "Our Record" tab | Removed |
| "over 150 disputes" before CAS, the FIFA Clearing House and the FIFA Football Tribunal | Home, "Our Record" tab | Removed |
| "7 Years of Experience" | Home, badge over the "Why the firm" photograph | Removed — the badge itself is gone, not just the figure |

**What replaced the tab text** — the firm's own wording, supplied directly, so
this line needs no sign-off:

> Counsel before the FIFA Football Tribunal, the FIFA Dispute Resolution
> Chamber and the Court of Arbitration for Sport, acting for players, coaches,
> clubs and federations across Africa and Europe.

Beneath it, the site now prints a live count of published cases — "N MATTERS
PUBLISHED IN THE RECORD", linking to `/record` — read from the case
collection at request time rather than typed into the copy. It cannot go
stale the way "over 150" did, and it disappears on its own if the count is
ever zero.

**The badge has no replacement.** If the firm wants a figure highlighted
here, the request that removed it was explicit that it belongs inside the
copy column on the grid, not floating across the image/copy boundary the way
the badge did.

## Mission tab, rewritten

Not a factual claim needing evidence — a rewrite for content, done without a
figure to check. Listed here because it changed at the same time as the two
items above and the firm has not seen the new wording yet.

**Now reads:**

> We work a matter end to end — from the first contract to a tribunal hearing
> — so the firm advising you throughout is the same firm representing you
> when it counts.

**Previously:** "PCN SPORTIVA LP's ultimate mission is to provide
comprehensive and integrated sports legal advice and representation to
clients, who want optimal levels of skill and expertise to match their
resources." — thirty words that said nothing a competitor's site could not
say unedited.

Cleared? ☐

## Named parties in the three restructured case records

The Record section was rebuilt onto structured fields — forum, year, the
parties, the outcome, a plain holding sentence — replacing the social-media
graphics and press-release prose the cards used to lead with (see
`docs/design-direction.md`, "Record cards"). Restructuring did not change
whether these matters name real people and clubs: they already did, on the
live site, before this rebuild.

Six names appear across the three matters. Each needs the firm's sign-off,
matter by matter, on whether it may stay named:

| Matter | Represented | Opposing party | Cleared to name both? |
|---|---|---|---|
| Karim Abubakar v Al Qasim | Karim Abubakar (Ghana) | Al Qasim (Iraq) | ☐ |
| Anthony Uchenna Nwadioha v Bigman FC | Anthony Uchenna Nwadioha (Nigeria) | Bigman FC (Tanzania) | ☐ |
| Wisdom Uda Kanu v Kabuscorp Sport Clube do Palanca | Wisdom Uda Kanu (Nigeria) | Kabuscorp Sport Clube do Palanca (Angola) | ☐ |

**If a matter is not cleared**, set that case's `anonymised` field to `true`
from the dashboard. The card already handles this: an anonymised case's title
renders as "Anonymised matter" instead of the real names, and the holding
sentence — written without naming either party for exactly this reason —
needs no change either way.

All three are currently `anonymised: false`, matching how they were already
published (named) before this rebuild. That is the pre-existing state, not a
decision made here; it stays that way only until the firm confirms it, or
says otherwise for any one of them.

## Social media graphics removed from the case cards

The three matters above previously used social-media graphics (headline,
watermark and follow bar burned into the image) as their `featuredImage`.
Those references are cleared from the case records; the case cards no longer
render an image at all, for any case. The graphics themselves are untouched
in the media library, and remain available for whichever Insights article
carries the same announcement, where a promotional card is the right context
for them.
