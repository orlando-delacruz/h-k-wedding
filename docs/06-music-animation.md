# 06 — Music & Animation

## Songs (locked)
- Default: Pahintulot
- Choices: Paninindigan Kita, Feeling Good
- Label: “Songs of love”
- Files: `public/audio/pahintulot.mp3`, `paninindigan-kita.mp3`, `feeling-good.mp3` (to be supplied, see 07).

## Gramophone
- Illuminated gramophone music selector in Section 5.
- Subtle animated gold illumination/pulse to indicate clickable.
- Controls: song switch + play/pause. Show current song name.
- Implementation: React `<audio>` + custom buttons, preload default, change `src` on select.

## Autoplay policy
- Attempt playback when curtain opens (after RSVP confirmation).
- Mobile browsers often block autoplay → MUST provide clear play fallback button (“Tap to play Songs of love”).
- Never autoplay with sound before user gesture if blocked; catch `play()` rejection and show fallback.

## Curtain reveal
- Starts closed, pauses 3s, opens center → sides to reveal couple portrait.
- CSS transforms (scaleX / clip-path) + opacity, GPU-friendly.
- Reduced-motion: skip 3s + slide, use simple fade.
- Copy in reveal: “TWO HEARTS. ONE LOVE. ONE JOURNEY.”, “Join us as we say ‘I do.’”, “Harthwel / and / Khatrina”, “November 30, 2026 · 6:30 AM”.

## Other motion
- Dust-dissolve on decline (after save), glitter hero, film-strip loop, slideshow crossfade, scroll fade/zoom via IntersectionObserver.
- Pause offscreen, disable particles on `prefers-reduced-motion` and low-end.

## Verify
- Desktop + 360px mobile: curtain timing, gramophone pulse visible, song switch works, blocked-autoplay fallback appears, reduced-motion emulation shows static.
