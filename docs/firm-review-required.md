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

Two photographs ship in the hero rotation, seeded as media records
`hero-forum` and `hero-gift`:

| File | Alt text as seeded | Cleared for use? |
|---|---|---|
| `public/hero/hero-forum.jpg` | "Pius Ndubuokwu speaking to Nigerian broadcast media at the Football Law Annual Moot." | ☐ |
| `public/hero/hero-gift.jpg` | "A certificate of appreciation presented at the Football Law Annual Moot." | ☐ |

Both show identifiable people. `hero-gift.jpg` also shows a named individual's
certificate at close range. The firm should confirm it holds the right to
publish both images, and whether anyone pictured should be credited, named, or
asked first.

`public/hero/hero-border.jpg` is still in the repository but is no longer used
by any slide. It can be deleted once the firm confirms it is not wanted.

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
