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

## Envelope opening (post-code reveal)

- Shown once, right after the code matches — never on refresh or return visits
  (the unlock is remembered, so the opening would only delay a guest who is
  already inside). This replaced the velvet entry curtain at the owner's request.
- Palette-locked: a velvet midnight-blue envelope (#1d2f53 → #0b1226, no other
  hues) with metallic antique gold on the flap — a 2px foil rim around the flap
  and a heavier gold wedge at its tip, plus one slow light sweep across the closed
  face while it is held.
- Real 3D, not a flat cross-fade: the stage carries a 1500px perspective and the
  envelope carries `transform-style: preserve-3d`, so the flap is a real plane
  that turns on its fold line (`rotateX` 0 → −152°, about its top edge) and the
  envelope itself squares up to the camera (`rotateX` 7° → 0, `rotateZ` −1.2° → 0).
  Two faces on the flap (`backface-visibility: hidden`) so the lining shows as it
  swings past vertical.
- The front page is the hero card itself — same classes, same copy, width measured
  from the live `#top .hero-card` — so it can be placed on the hero pixel for
  pixel. It is tucked in the pocket with its top edge peeking into the mouth
  (scale 0.22), drawn up and out of the pocket (scale 0.62, ending a set margin
  below the top of the viewport so the set-down never starts off-frame), then
  lifted above the envelope (`z-index` swap) and set down on the hero card, where
  the measured transform lands it within ~1px of the live card.
- Order of events: hold 0.9 s → flap 1.15 s → front page out at 1.85 s → set down
  at 3.15 s, envelope pieces dissolving behind it (staggered) → overlay crossfade
  0.65 s → music starts with the set-down, inside the submit gesture, so browsers
  allow it. The overlay locks the page behind it (`body.no-scroll`) while it plays.
- “Tap to unveil” skips ahead for impatient guests and for tests.
- Reduced-motion: no hold, no 3D — straight to the hero, music still attempts from
  the submit gesture.

## Other motion

- Hero glitter, film-strip loop, slideshow crossfade, scroll fade/zoom via
  IntersectionObserver. Pause offscreen; honor `prefers-reduced-motion`.

## Verify

- Desktop + 360px mobile: envelope timing (hold → flap → page out → page set down
  → envelope gone), the player's collapse-on-scroll and tap-to-expand, song
  switching between the 2 tracks, autoplay-next when a track ends, reduced-motion
  shows static content.
