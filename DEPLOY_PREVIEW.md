# Deploy preview: `webinar-integration` — website

## Site
Deploys to the Netlify site named **pcnsportivalp-web**
(production `https://pcnsportivalp.com`). As with the API doc, this is from
local project files, not a live check in this session — confirm the site
name in Netlify if anything here looks stale.

**Branch deploys must be enabled** the same way as the API: Site settings →
Build & deploy → Deploy contexts. Once on, this branch is served at:
```
https://webinar-integration--pcnsportivalp-web.netlify.app
```

## Environment variables the branch build needs (NAMES only)

- `VITE_API_URL` — **this is the one that matters most for the preview to
  work at all.** It must point at the *API's* branch-deploy URL, not
  production:
  ```
  VITE_API_URL=https://webinar-integration--pcnsportivalp-api.netlify.app/api
  ```
  Vite inlines `VITE_*` variables into the built JS at build time, so this
  has to be set correctly **before** the branch build runs — changing it
  afterwards means triggering a new deploy, not just an env var edit.
- `VITE_SITE_URL` — set to this site's own branch-deploy URL
  (`https://webinar-integration--pcnsportivalp-web.netlify.app`), used for
  canonical/OG URLs. Getting this wrong only affects link-preview metadata
  on the preview, not functionality.

**Both must be set in the "Branch deploys" context**, not only Production —
same caveat as the API doc. If `VITE_API_URL` falls back to its
`.env.example` default (`http://localhost:4000/api`) because it wasn't set
for this context, the deployed preview will silently try to call
`localhost` from a visitor's browser and every API call will fail.

## CORS / cookies this preview depends on
This repo has no cookies of its own (it never logs in), so nothing to set
here — but the **API's** `CORS_ORIGIN` must include this site's exact
branch-deploy origin (`https://webinar-integration--pcnsportivalp-web.netlify.app`),
or every fetch from this preview to the API preview will be rejected by
CORS before it even reaches a route. See BACK-END/DEPLOY_PREVIEW.md.

## Link-preview (crawler HTML) note
The Netlify Edge Function that serves crawler-specific HTML
(`netlify/edge-functions/prerender.js`) reads `VITE_API_URL` and
`VITE_SITE_URL` from its **own** runtime env lookup (`Netlify.env.get` /
`Deno.env.get`), which is the same Branch-deploys-scoped variables above —
not a separate set. No extra configuration needed for the edge function
specifically once the two variables above are set correctly for this
context. (The webinar share-image/crawler-HTML work itself is still
pending — see the Stage 1 addendum report — this note is here so the
variables are set up correctly in advance of that landing.)

## Safety for this branch
This repo has no database or secrets of its own — nothing here can affect
live data. The only risk is pointing `VITE_API_URL` at the **production**
API by mistake, which would make this preview a second, untested front end
for real production data. Double-check the value points at the API's
`webinar-integration` branch deploy, not `pcnsportivalp-api.netlify.app`.
