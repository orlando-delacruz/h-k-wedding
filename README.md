# Harthwel & Khatrina — Wedding Invitation

> November 30, 2026 · 6:30 AM · Girasoles Farm, Candelaria
> Reception: Bride's Residence, Sitio Bibingkahan, Concepcion Uno, Sariaya, Quezon

Mobile-first static invitation site: velvet midnight blue, metallic Antique Gold
with animated light reflection, Pinyon Script names, and a Google Form for RSVP.
No backend, no database, no admin — the Form owns every response.

An access gate sits in front of the invitation. Guests answer the Form, its
confirmation shares the code, and the code opens the page — a courtesy screen,
not access control (`docs/05`). A successful code unveils the velvet entry
curtain while the music starts, and is remembered on the device while it still
matches the configured code.

## Identity

- **Couple:** Harthwel & Khatrina
- **Ceremony:** 6:30 AM, Girasoles Farm, Candelaria, Quezon
- **Reception:** Bride's Residence, Sitio Bibingkahan, Concepcion Uno, Sariaya, Quezon
- **Hashtag:** `#NaKHATitiyakNaKayHARTH` — **RSVP deadline:** November 15, 2026
- **Timezone:** Asia/Manila

## Stack

- **Frontend only:** React 18 + Vite static build (`dist/`). No server, no API routes.
- **Fonts:** Pinyon Script + Cormorant Garamond via Google Fonts. Body uses
  Cormorant Garamond until licensed Calluna files arrive (`docs/07`).
- **Animation:** anime.js choreography (the entry curtain), CSS ambient motion and
  the gold light-sweep. Respects `prefers-reduced-motion`.
- **Music:** the couple's two tracks in `public/music/`, played by the floating
  player — disc for play/pause, nameplate for the song list, and the next track
  rolls on automatically (`docs/06`).
- **RSVP:** one Google Form (`RSVP_FORM.linkUrl`), opened from the gate in a new
  tab. No in-page form, no custom submission code.
- **Access gate:** `AccessGate.jsx` + `ACCESS`. The code comes from
  `VITE_ACCESS_CODE` (`.env.example`); it is public in the bundle by design.

## Quick start

```bash
npm install
cp .env.example .env    # then set VITE_ACCESS_CODE (the code guests receive)
npm run dev             # http://localhost:5173
```

## Vercel deployment

Static site: push to GitHub, import in Vercel (Vite preset), set
`VITE_ACCESS_CODE` in Project → Settings → Environment Variables, deploy.
`vercel.json` builds `dist/` only — no functions, no Blob store. Details in
`docs/08`.

## Verification

```bash
node scripts/verify-spec.mjs   # copy, tokens, fonts, no-backend wiring
npm run test:ui                # real Chrome, 360px + 390px (needs npm run dev)
npm run build
```

All three exit non-zero on failure.

## Documentation

- `AGENTS.md` — rules for contributors and AI agents
- `docs/01-vision-design-system.md` — palette, typography, motion, components
- `docs/02-sections.md` — page structure, in render order
- `docs/03-copy.md` — locked invitation copy
- `docs/04-entourage.md` — locked entourage list
- `docs/05-rsvp-google-form.md` — RSVP via Google Form + the access gate
- `docs/06-music-animation.md` — songs, the player, the entry curtain
- `docs/07-assets-todo.md` — assets the couple still needs to supply
- `docs/08-deployment.md` — static hosting notes
- `docs/09-local-testing.md` — manual walkthrough

## Source map

```
src/
  App.jsx                    gate state, page sections, music state
  config/site.js             public facts, songs, RSVP link, access code
  config/program.js          venues + maps, programme, story, photos
  config/entourage.js        locked entourage data
  components/                Icons, Floral, effects (particles, tilt, reveal),
                             ui (headings, frames, ornament), chrome (nav,
                             player), AccessGate, EntryCurtain, ProgramStage,
                             ErrorBoundary
  styles.css                 design tokens + every component style
scripts/
  verify-spec.mjs            spec string checks
  qa-browser.mjs             end-to-end suite in real Chrome
public/
  favicon.svg
  music/                     the couple's two tracks
vercel.json                  static build only
vite.config.js               Vite + React, no API proxy
```
