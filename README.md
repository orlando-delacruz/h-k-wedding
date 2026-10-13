# Harthwel & Khatrina — Luxury Wedding Invitation

> November 30, 2026 · 6:30 AM · Girasoles Farm, Candelaria
> Reception: Bride's Residence, Sitio Bibingkahan, Concepcion Uno, Sariaya, Quezon

Mobile-first static invitation site: velvet midnight blue, metallic Antique Gold
with animated light reflection, Pinyon Script names, and an embedded Google Form
for RSVP. No backend, no database, no admin — the Form owns all responses.

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
- **Animation:** anime.js choreography (curtain), CSS ambient motion + gold
  light-sweep. Respects `prefers-reduced-motion`.
- **RSVP:** embedded Google Form (`RSVP_FORM` in `src/config/site.js`) plus a
  new-tab fallback button. No custom submission code anywhere.

## Quick start

```bash
npm install
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
- `docs/05-rsvp-admin-excel.md` — RSVP via Google Form (legacy filename kept)
- `docs/06-music-animation.md` — songs, gramophone, curtain
- `docs/07-assets-todo.md` — assets the couple still needs to supply
- `docs/08-deployment.md` — static hosting notes

## Source map

```
src/
  App.jsx                    page sections, no gate
  config/site.js             public facts, song catalogue, form URLs
  config/program.js          public programme (venues, story, photos)
  config/entourage.js        locked entourage data
  components/                Icons, Floral, effects, ui, chrome,
                             ProgramStage, ErrorBoundary
scripts/
  qa-browser.mjs             end-to-end suite (real Chrome)
  verify-spec.mjs            spec string checks
public/
  favicon.svg
vercel.json                  static build only
vite.config.js               Vite + React, no API proxy
```
