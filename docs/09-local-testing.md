# 09 — Local Testing Guide

```bash
npm run dev
```

Open **http://localhost:5173**.

## 1. Access gate → full page

1. Open **http://localhost:5173** — the access gate is the first view.
2. “Open the RSVP form” opens the Google Form in a new tab; the Form's
   confirmation shares the access code (docs/05).
3. Enter a wrong code: inline error, the invitation stays closed.
4. Enter the code from `VITE_ACCESS_CODE` (`.env`, see `.env.example`): the
   invitation mounts and stays unlocked across refreshes and return visits
   (`localStorage` key `hk_access`). Changing the configured code locks every
   guest out again.

Then scroll hero → footer. Every section renders with content: invitation card,
portrait, RSVP form, venues, countdown + calendar, announcement + gramophone,
story, entourage, details, slideshow, footer.

## 2. RSVP form

1. On the gate, “Open the RSVP form” opens the Google Form in a new tab.
2. There is no in-page RSVP section: the form is only offered from the gate.
3. Submit a test response from the live Form and confirm it lands in the
   owner's Responses tab (needs Form access — otherwise check the link only).

## 3. Entry curtain + music

Enter the code: full-screen velvet drapes hold ~1.4 s, then part slowly while
Pahintulot (the default song, from `public/music/`) starts. “Tap to unveil”
skips the hold. The gramophone lists exactly 2 tracks; switching plays the
other local file, or the tap-to-play fallback shows if the browser refused.

## 4. Automated suites

```bash
node scripts/verify-spec.mjs   # spec strings, no-backend guards
npm run test:ui                # real Chrome at 360px + 390px
npm run build
```

## Troubleshooting

### The access code is refused

The code comes from `VITE_ACCESS_CODE` (`.env` locally, Vercel for production)
and is compared case-insensitively. If the couple changed the code, the Form's
confirmation text must be updated to match (docs/05).

### Form shows a Google sign-in wall

The Form is configured to require sign-in. Change it in the Form's settings
(Responses → no sign-in required). Not fixable from this repo.

### Port 5173 busy

Kill the leftover Vite process and rerun `npm run dev`.

### Fonts look wrong offline

Pinyon Script + Cormorant Garamond load from Google Fonts CDN and need network.
