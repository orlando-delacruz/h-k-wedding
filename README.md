# Harthwel & Khatrina — Luxury Wedding Invitation

> November 30, 2026 · 6:30 AM · Girasoles Farm, Candelaria
> Reception: Bride's Residence, Sitio Bibingkahan, Concepcion Uno, Sariaya, Quezon

Mobile-first static invitation site: velvet midnight blue, metallic Antique Gold
with animated light reflection, Pinyon Script names, and a Google Form for RSVP
(opened from the gate). No backend, no database, no admin — the Form owns all
responses. An access gate sits in front of the invitation: the Form's
confirmation shares the code, and the code opens the page (a courtesy screen, not
access control).

## Identity

- **Couple:** Harthwel & Khatrina
- **Ceremony:** 6:30 AM, Girasoles Farm, Candelaria, Quezon
- **Reception:** Bride's Residence, Sitio Bibingkahan, Concepcion Uno, Sariaya, Quezon
- **Hashtag:** `#NaKHATitiyakNaKayHARTH` — **RSVP deadline:** November 15, 2026
- **Timezone:** Asia/Manila

## Stack

- **Frontend only:** React 18 + Vite static build (`dist/`). No server, no API routes.
- **Fonts:** Pinyon Script + Cormorant Garamond via Google Fonts. Body uses
  Cormorant Garamond until licensed Calluna files arrive (see `docs/07-assets-todo.md`).
- **Animation:** anime.js choreography (entry curtain), CSS ambient motion + gold
  light-sweep. Respects `prefers-reduced-motion`.
- **RSVP:** one Google Form (`RSVP_FORM.linkUrl` in `src/config/site.js`), opened
  from the gate in a new tab. No in-page section, no custom submission code.
- **Access gate:** `AccessGate.jsx` + `ACCESS` in `src/config/site.js`. The code
  comes from `VITE_ACCESS_CODE` (see `.env.example`) and is public in the bundle
  by design. A successful code is remembered in `localStorage` (`hk_access`) and
  re-checked on every load, so refreshes stay inside while a rotated code locks
  everyone out again.

## Quick start

```bash
npm install
cp .env.example .env   # then set VITE_ACCESS_CODE (the code guests receive)
npm run dev    # Vite only, http://localhost:5173
```

Open http://localhost:5173.

## Vercel deployment

Static site. Push to GitHub, import in Vercel (Vite preset). No environment
variables, no Blob store, no functions. `vercel.json` builds `dist/` only.

## Verification

```bash
node scripts/verify-spec.mjs   # copy, tokens, fonts, no-backend wiring
npm run test:ui                # real Chrome, 360px + 390px (needs npm run dev)
npm run build
```

All exit non-zero on failure.

## Documentation

- `AGENTS.md` — rules for contributors and AI agents
- `docs/01-vision-design-system.md` — palette, typography, motion, components
- `docs/02-sections.md` — page structure
- `docs/03-copy.md` — locked invitation copy
- `docs/04-entourage.md` — locked entourage list
- `docs/05-rsvp-google-form.md` — RSVP via Google Form + the access gate
- `docs/06-music-animation.md` — songs, gramophone, curtain
- `docs/07-assets-todo.md` — assets the couple still needs to supply
- `docs/08-deployment.md` — static hosting notes

## Source map

```
src/
  App.jsx                    gate state + page sections, no admin
  config/site.js             public facts, song catalogue, form URLs, access code
  config/program.js          public programme (venues, story, photos)
  config/entourage.js        locked entourage data
  components/                Icons, Floral, effects, ui, chrome,
                             AccessGate, EntryCurtain, ProgramStage, ErrorBoundaryscripts/
  qa-browser.mjs             end-to-end suite (real Chrome)
  verify-spec.mjs            spec string checks
public/
  favicon.svg
vercel.json                  static build only
vite.config.js               Vite + React, no API proxy
```
