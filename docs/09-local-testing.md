# 09 — Local Testing Guide

```bash
npm run dev
```

Open **http://localhost:5173**.

## 1. Full page (public, no login anywhere)

Scroll hero → footer. Every section renders with content: invitation card,
portrait, RSVP form, venues, countdown + calendar, announcement + gramophone,
story, entourage, details, slideshow, footer.

## 2. RSVP embed

1. Go to **http://localhost:5173/#rsvp**
2. The Google Form loads inside the page.
3. “Open RSVP Form” opens the same form in a new tab.
4. Submit a test response from the live Form and confirm it lands in the
   owner's Responses tab (needs Form access — otherwise check loading only).

## 3. Curtain + music

Tap “Pull the curtain”: 3 s hold, opens center → sides, portrait + names appear.
Tap the vinyl: song plays or the tap-to-play fallback shows.

## 4. Automated suites

```bash
node scripts/verify-spec.mjs   # spec strings, no-backend guards
npm run test:ui                # real Chrome at 360px + 390px
npm run build
```

## Troubleshooting

### Form shows a Google sign-in wall

The Form is configured to require sign-in. Change it in the Form's settings
(Responses → no sign-in required). Not fixable from this repo.

### Port 5173 busy

Kill the leftover Vite process and rerun `npm run dev`.

### Fonts look wrong offline

Pinyon Script + Cormorant Garamond load from Google Fonts CDN and need network.
