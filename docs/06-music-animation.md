# 06 — Music & Animation

## Songs

- Default: Pahintulot
- Choices: Paninindigan Kita, Feeling Good
- Label: “Songs of love”
- Files to be supplied (see 07). Until then the gramophone streams clearly
  marked demo audio. Never download replacement audio without approval.

## Gramophone

- Gramophone-inspired selector in the announcement section.
- Subtle gold glow indicates it is tappable.
- Controls: song switch + play/pause + clear status text.

## Autoplay policy

- Browsers block sound before a gesture: tapping the curtain CTA attempts
  playback; if rejected, a “Tap to play” fallback appears.
- Never autoplay loudly or unexpectedly.

## Curtain reveal

- Starts closed, pauses 3s, opens center → sides to reveal the portrait.
- Reduced-motion: skip slide, keep content readable.
- Copy: “TWO HEARTS. ONE LOVE. ONE JOURNEY.”, “Join us as we say ‘I do.’”,
  “Harthwel / and / Khatrina”, “November 30, 2026 · 6:30 AM”.

## Other motion

- Hero glitter, film-strip loop, slideshow crossfade, scroll fade/zoom via
  IntersectionObserver. Pause offscreen; honor `prefers-reduced-motion`.

## Verify

- Desktop + 360px mobile: curtain timing, gramophone glow visible, song switch
  works, blocked-autoplay fallback appears, reduced-motion shows static content.
