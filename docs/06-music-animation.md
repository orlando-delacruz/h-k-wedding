# 06 — Music & Animation

## Songs

- Default: Pahintulot
- Second choice: Paninindigan Kita
- Label: “Songs of love”
- Files ship with the site in `public/music/` (see 07). The gramophone and the
  entry curtain both play from these local files — no demo streams anywhere.

## Gramophone

- Gramophone-inspired selector in the announcement section.
- Floating mini-gramophone bar (`MusicBar` in `chrome.jsx`): spinning vinyl deck,
  tonearm that drops on play, uppercase track nameplate, gold rim with light-sweep.
  Same play/pause + open-player actions as before.
- Subtle gold glow indicates it is tappable.
- Controls: song switch + play/pause + clear status text.

## Autoplay policy

- The access-code submit is the gesture: when the entry curtain starts opening,
  the default song starts with it. If playback is rejected, a “Tap to play”
  fallback appears in the announcement section.
- The mid-page curtain CTA also attempts playback on tap.
- Never autoplay loudly or unexpectedly: music only ever starts from a guest
  gesture (code submit, curtain tap, vinyl tap).

## Entry curtain (post-code reveal)

- Shown once, right after the code matches — never on refresh or return visits
  (the unlock is remembered, so the curtain would only delay a guest who is
  already inside).
- Palette-locked: velvet midnight/navy drapes (#101D36 / #192A46) with metallic
  antique gold hardware — rod with finials, gold-banded scalloped swag, gold
  braid on each leading edge, crest and tie-backs. The couple's floral line art
  (`FloralCorner`) is ghosted on the velvet as a damask. No other hues.
- The crest on the meeting stile carries the ornament, the names in Pinyon
  Script and the date; it drops away as the seam opens.
- Opening: ~1.4 s hold, then ~3.2 s of cloth motion under a 1200px perspective.
  The travel is keyframed the way fabric behaves — a slow take-up of the slack,
  the pull, then a settle back — and the drape pivots at the **rod-end top
  corner**, so the hem swings through a wider arc than the header (skewY about
  that origin) while the whole panel swings back into the room (rotateY) and the
  folds compress toward the rod end (scaleX). A soft light wave runs from the
  leading edge to the rod end so the cloth looks disturbed rather than moved;
  the fabric dims as it leaves the light and the gold tie-backs appear and ride
  outward with the bunch. The two panels are not in lockstep. The default song
  starts with the opening.
- Known ceiling: the drapes are still flat panels driven by transforms, not a
  cloth simulation. Going further (folds that re-form, per-vertex motion) needs
  WebGL or an SVG mesh, which this static build does not carry.
- “Tap to unveil” skips the hold for impatient guests and for tests.
- Reduced-motion: no hold, no slide — straight to the hero, music still attempts
  from the submit gesture.

## Curtain reveal

- Starts closed, pauses 3s, opens center → sides to reveal the portrait.
- Reduced-motion: skip slide, keep content readable.
- Copy: “TWO HEARTS. ONE LOVE. ONE JOURNEY.”, “Join us as we say ‘I do.’”,
  “Harthwel / and / Khatrina”, “November 30, 2026 · 6:30 AM”.

## Other motion

- Hero glitter, film-strip loop, slideshow crossfade, scroll fade/zoom via
  IntersectionObserver. Pause offscreen; honor `prefers-reduced-motion`.

## Verify

- Desktop + 360px mobile: entry curtain timing (hold → slow open → gone),
  gramophone glow visible, song switch works between the 2 tracks,
  blocked-autoplay fallback appears, reduced-motion shows static content.
