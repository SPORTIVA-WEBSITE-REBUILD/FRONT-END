# Frontend Redesign — What the CMS Already Powers

**Purpose:** a complete inventory of everything the admin dashboard controls, so a
redesign can be planned around content that is already dynamic rather than
rediscovering it mid-build.

**Read this as:** a contract. Every field below is already stored, editable and
served by the API. A redesign may lay it out however it likes, but if a design
introduces a text or image slot that is not in this document, that slot needs a
backend change — and that is the expensive kind of surprise.

---

## 1. The rule that governs everything

| The database owns | React owns |
|---|---|
| Words, images, links, structured records | Layout, grid, spacing, type scale |
| Which items exist and their order | Which component renders each item |
| Publish / unpublish state | Colour, animation, interaction, breakpoints |
| SEO text per page | Markup, classnames, styling system |

A redesign is free to change **everything in the right-hand column** without
touching the backend. Changing anything in the left-hand column is a data model
change.

---

## 2. Pages and their section keys

A page is a list of **sections**, each identified by a stable `key`. React looks
a section up by key and decides how to draw it. **The keys are the contract.**

Rename a key in the design and the content disappears; keep the key and you can
render it as anything.

| Route | Page slug | Section keys available |
|---|---|---|
| `/` | `home` | `hero`, `intro`, `services`, `record`, `gallery`, `insights`, `cta` |
| `/about` | `about` | `intro`, `team` |
| `/services` | `services` | `intro` |
| `/contact` | `contact` | `intro` |
| `/careers` | `careers` | `intro` |
| `/record` and `/insights` | `record-insights` | `intro` |
| `/privacy-policy` | `privacy-policy` | `body` |

### What every section can hold

Each section — regardless of key — supports the same shape:

| Field | Type | Typical use |
|---|---|---|
| `heading` | text | Section title |
| `subheading` | text | The small eyebrow line above it |
| `body` | text / rich text | Paragraph, or full rich text on `privacy-policy` |
| `image` | media | Background or feature image |
| `cta.label` + `cta.href` | text | Button |
| `items[]` | repeater | `title`, `text`, `icon`, `value`, `href`, `image` |

`items[]` is the flexible one. It currently backs statistics (`value` + `title`)
and is available on any section for feature lists, cards or highlights.

**Adding a new section to a page is free** — the administrator adds it in Pages,
and the redesign renders it by key. No backend change.

---

## 3. Content collections

Everything below is created, edited, ordered, published and unpublished from the
dashboard. Counts are what is currently live.

### 3.1 Case Record — 12 live

The distinctive entity. A filterable archive at `/record`.

| Field | Type | Notes |
|---|---|---|
| `title` | text | required |
| `slug` | text | URL; renaming keeps the old URL working via a 301 |
| `forum` | text | free text — currently "FIFA DRC"; also "CAS", "NFF", courts |
| `year` | number | required, drives the year filter |
| `partyRepresented` | choice | `athlete` · `club` · `federation` · `agent` · `sponsor` · `other` |
| `outcome` | choice | `won` · `settled` · `dismissed` · `ongoing` · `withdrawn` |
| `summary` | text | card text, ≤600 chars |
| `body` | rich text | full account |
| `anonymised` | yes/no | defaults to yes; the dashboard warns before publishing named parties |
| `practiceArea` | → Service | links a matter to a service page |
| `featuredImage` | media | |
| `publishedAt` | date | |
| `seo` | block | see §5 |

**Filtering is server-side** and already built: `/record?forum=&year=&party=&outcome=&q=&page=`.
A `/cases/filters` endpoint returns the distinct forums, years, parties and
outcomes actually in use, so filter controls populate themselves — a redesign
should never hardcode these lists.

### 3.2 Insights (articles) — 14 live

| Field | Type | Notes |
|---|---|---|
| `title`, `slug` | text | |
| `excerpt` | text | listing card text; auto-derived from the body if left blank |
| `body` | rich text | written in a WYSIWYG editor, sanitised server-side |
| `author` | → Team member | byline links to the profile |
| `category` | → Category | currently "News" and "Analysis" |
| `tags[]` | text list | |
| `featuredImage` | media | |
| `publishedAt` | date | |
| `readingMinutes` | number | calculated automatically on save |
| `seo` | block | |

Detail responses also carry **3 related articles**, already fetched — a redesign
can show a "related" block with no extra request.

### 3.3 Services — 6 live

`title`, `slug`, `icon`, `summary`, `body` (rich text), `image`, `order`, `seo`.

`icon` is chosen from **12 bundled glyphs** in a dropdown. A redesign that wants
different iconography should plan to replace this set deliberately — the
dashboard list and the font must stay in step, and there is a test enforcing it.

### 3.4 Team — 2 live

`name`, `slug`, `role`, `bio` (rich text), `photo`, `qualifications[]`,
`practiceAreas[]` (→ Services), `email`, `phone`, `socials[]`, `order`, `seo`.

Team members double as **article authors**, so a profile design should assume it
may be linked from a byline.

### 3.5 Gallery — 8 live

`title` (required), `description`, `image` (required), `location`, `takenAt`,
`order`.

Currently rendered on the home page with a lightbox. The collection supports far
more than the home page shows — `/gallery?limit=` caps at 60, so a dedicated
gallery page needs no backend work.

### 3.6 Careers — 1 live

`title`, `slug`, `department`, `location`, `workplaceType` (`on_site` ·
`hybrid` · `remote`), `employmentType` (`full_time` · `part_time` · `contract` ·
`internship` · `pupillage` · `nysc`), `summary`, `description` (rich text),
`responsibilities[]`, `requirements[]`, `salaryRange`, `closingDate`,
`applyEmail`, `applyUrl`, `order`, `seo`.

A role past its `closingDate` **drops off the listing automatically** but keeps
its own page. A redesign must keep a visible "applications closed" state.

### 3.7 Categories

`name`, `slug`, `description`. Groups articles. Managed inline in the dashboard.

### 3.8 Enquiries (inbound, read-only on the site)

The contact form posts `name`, `email`, `phone`, `subject`, `message`. A hidden
honeypot field must be preserved in any redesigned form — it is what keeps spam
out. Submissions are rate limited to 3/hour per address.

---

## 4. Global chrome

### 4.1 Site Settings

| Field | Drives |
|---|---|
| `siteName`, `tagline` | Header brand and footer |
| `logo`, `favicon` | Brand marks |
| `contact.address`, `.phone`, `.email` | Footer and contact page |
| `contact.mapUrl` | Map embed; blank hides the map entirely |
| `contact.businessHours[]` | Footer "Office Hours" — `label` + `value` pairs, any number |
| `socials[]` | Footer icons |
| `copyrightText` | Footer line |
| `seoDefaults` | Fallback meta for any page without its own |
| `enquiryRecipient` | Where contact form mail goes |
| `careersEmail` | Where applications go |

### 4.2 Navigation

Two independent, fully editable menus: **header** and **footer**. Each item has
`label`, `href`, `external`, and order (set by drag-free up/down controls).

**A redesign must not hardcode nav items.** The current 7 header links are data,
not markup. Sub-menu children are supported in the model but not currently
rendered — available if a redesign wants dropdowns.

### 4.3 Social platforms

`facebook` · `instagram` · `tiktok` · `linkedin` · `twitter` · `x` · `youtube` ·
`whatsapp`. Rendered as inline SVG, not an icon font. **A link with no URL is not
displayed** — a redesign must not assume a fixed number of icons.

### 4.4 Media library

Every image is a Cloudinary reference with `alt`, `caption`, and real
`width`/`height`. Delivery URLs are built at render time, so a redesign chooses
its own dimensions and crops:

- `f_auto,q_auto,dpr_auto` — format, quality and retina handled automatically
- `c_fill` + `g_auto` / `g_faces:auto` — subject-aware cropping
- `srcset` at 480/768/1200/1920, aspect ratio held constant

**Any crop or aspect ratio a redesign wants is free.** Ask for the size you need;
no re-upload.

---

## 5. SEO — on every content type

Every page, case, article, service, team member and vacancy carries:
`metaTitle`, `metaDescription`, `canonicalUrl`, `ogImage`, `noIndex`.

Also already handled, and worth not breaking:

- **Structured data** — `LegalService`, `Article`, `Person`, `Service`,
  `JobPosting`, `BreadcrumbList`
- **Live sitemap** at `/sitemap.xml`, regenerating as content is published
- **Real 404s** and **301 redirects** on renamed slugs
- **Link previews** for social crawlers via edge middleware

A redesign that changes URL structure must keep slugs, or plan redirects.

---

## 6. What is NOT in the CMS

Be deliberate here — these are code changes, not content edits:

| Not editable | Where it lives |
|---|---|
| Colour palette, type scale, spacing | `src/styles/style.scss` |
| Page layouts and component structure | `src/pages/`, `src/components/` |
| Route paths (`/record`, `/insights`, …) | `src/App.jsx` |
| Which section key renders where | the page components |
| Case filter *mechanics* | `Record.jsx` + the API |
| Form validation rules | frontend + Zod on the backend |
| The 12 service icon choices | dashboard list + bundled font |
| Animation and scroll reveal | `useAnimations.jsx` |

---

## 7. Constraints a redesign must respect

1. **Section keys are fixed.** Design around `hero`, `intro`, `services`,
   `record`, `gallery`, `insights`, `cta` — or budget a backend change.
2. **Every list can be empty.** Empty states exist and must survive. The gallery
   section removes itself entirely when nothing is published; that behaviour
   should be kept, not replaced with a blank heading.
3. **Every list can be long.** 12 cases today, hundreds later. Pagination exists
   server-side; a design must accommodate it.
4. **Counts are not fixed.** 6 services, 2 team members, 7 nav links today. Do
   not design a layout that only works at those numbers.
5. **List payloads are deliberately lean.** Listings carry no rich-text bodies.
   A card design wanting body text needs an API change.
6. **Images have unknown aspect ratios.** Real uploads are portrait and
   landscape both. Use explicit crops.
7. **Rich text renders as HTML.** `body` and `bio` produce `p`, `h2`–`h4`,
   lists, blockquote, links, images, tables. The redesign's stylesheet must
   style all of them.
8. **Drafts must stay invisible.** Never surface `status: 'draft'` publicly.

---

## 8. Free wins — supported, not currently used

No backend work required:

- **A dedicated `/gallery` page** — collection supports up to 60 per request
- **A team index page** — `/lawyers` list endpoint exists; only detail pages are routed
- **Navigation dropdowns** — `children[]` is in the model, unrendered
- **Article tag pages** — `/articles?tag=` is live
- **Category filtering on Insights** — `/articles?category=` is live
- **Case search** — `/cases?q=` is live
- **Related articles** — already returned with every article
- **Statistics blocks** — `items[]` with `value` + `title` on any section
- **Any new page** — create it in Pages and render it by slug

---

## 9. Suggested sequence

1. **Audit against this document.** For each proposed screen, name the collection
   and fields behind every piece of text and every image. Anything unaccounted
   for is new backend scope — decide before design is signed off.
2. **Redesign the styling layer first** (`style.scss`), since it changes no data flow.
3. **Rework components page by page**, keeping section keys and the API hooks in
   `useContent.js` untouched.
4. **Keep the tests.** The live smoke suite renders real pages against the real
   API — it will tell you immediately if a redesign stops displaying content.
5. **Re-check the fragile things last:** empty states, long lists, portrait
   images, draft visibility, and the enquiry honeypot.

---

## 10. Where to look in the code

| To understand | Read |
|---|---|
| Every field and rule | `backend/src/models/` |
| What the public site can request | `backend/src/routes/public.js` |
| What each page fetches | `frontend/src/hooks/useContent.js` |
| How a section key becomes markup | `frontend/src/pages/Home.jsx` |
| Image URL construction | `frontend/src/lib/media.js` |
| What an administrator sees | `dashboard/src/pages/` |
| Architecture and reasoning | `Implementation_Plan.md`, `README.md` |
