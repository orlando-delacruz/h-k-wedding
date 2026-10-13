# 06 — Music & Animation

## Songs

- Default (plays first): Pahintulot
- Second choice: Paninindigan Kita
- Files ship with the site in `public/music/` (see 07). The player streams them
  from `/music/<file>` — no demo streams anywhere.

## The player

- The floating player (`MusicBar` in `chrome.jsx`) is the **only** music
  UI: no player section, no “Songs of love” card.
- Vinyl disc = play/pause. Nameplate = the song list (both tracks, current one
  ticked). Choosing a track plays it immediately.
- **Scrolling down folds it to just the disc** (a CD); scrolling back up or
  tapping the disc brings the nameplate back.
- **Autoplay next:** when a track ends the player rolls into the other one, so
  music continues hands-free; manual selection always wins.
- Playback only ever starts from a guest gesture (disc tap or picking a track):
  browsers block sound before one. The player never autoplays on load.

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
- The announcement copy that used to sit above the curtain was removed by the
  owner, along with the “Songs of love” card.

## Other motion

- Hero glitter, film-strip loop, slideshow crossfade, scroll fade/zoom via
  IntersectionObserver. Pause offscreen; honor `prefers-reduced-motion`.

## Verify

- Desktop + 360px mobile: entry curtain timing (hold → slow open → gone),
  the player's collapse-on-scroll and tap-to-expand, song switching between the
  2 tracks, autoplay-next when a track ends, reduced-motion shows static content.
