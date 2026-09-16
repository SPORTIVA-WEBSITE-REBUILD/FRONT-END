# PCN Sportiva LP — Public Website

React 18 + Vite. All content is served by the API; nothing is hardcoded.

**Related repositories**
- API — `SPORTIVA-WEBSITE-REBUILD/BACK-END`
- Admin dashboard — `SPORTIVA-WEBSITE-REBUILD/DASHBOARD`

---

## Running locally

Requires the API running (see the BACK-END repository).

```bash
npm install
cp .env.example .env
npm run dev                   # http://localhost:5173
```

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build, plus a fallback sitemap |
| `npm test` | 109 tests |
| `node scripts/subset-icons.js` | Regenerate the icon-font subsets |

## Notes for anyone working on the design

- `legacy-template/` is the original Colorlib template this design derives from,
  kept for reference. It is not built or served.
- `src/styles/style.scss` is the design source. Bootstrap is trimmed to the
  components actually used — see `src/styles/bootstrap/_pcn-bootstrap.scss`.
- Icon fonts are **subset** to the glyphs in use. Adding an icon means
  regenerating them; `npm test` fails and names any glyph that is missing.
- `frontend_redesign_plan.md` in this repo lists everything the CMS controls.
  Read it before changing layouts — section keys are a contract with the content.
