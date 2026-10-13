# 01 — Vision & Design System

## Identity

Mobile-first luxury invitation. Velvet midnight/navy with metallic Antique Gold,
Pinyon Script names, white/ivory typography, floral decoration. No animation is
required to read any content.

## Colors

| Token | Value | Use |
|---|---|---|
| Velvet Midnight Blue | `#101D36` | page background, footer |
| Velvet Navy Blue | `#192A46` | cards, story, venue sections |
| Antique Gold | `#8D6710` | metallic depth, gradient anchor |
| Reflective Gold Highlight | `#F5D76E` | shine peak, focus ring |
| White | `#FFFFFF` | primary typography |

Declared as `--gold-1 … --gold-5` plus `--grad-gold` in `src/styles.css`.
Flat yellow borders are explicitly avoided.

## Metallic gold treatment

- `--grad-gold` layered antique/bronze/highlight gradient on borders, buttons,
  dividers, calendar highlight.
- `.shiny-text` sweeps a 220%-wide gradient across text (`@keyframes shine`).
- `.gold-frame` padding-box/border-box gradient border with corner brackets.
- `.mirror-shine` sweeps venue mirrors every 6.5 s; `.tilt-glare` follows pointer.
- All stop under `prefers-reduced-motion: reduce`.

## Typography (approved only)

- **Pinyon Script** — couple names, romantic displays (`--font-script`).
- **Cormorant Garamond Bold Italic** — section titles, entourage headings,
  RSVP, details headings.
- **Cormorant Garamond** — body/editorial until licensed **Calluna** files
  arrive (see `07-assets-todo.md`). Never Montserrat, Foglighten, Foglihten No07.

## Motion inventory

| Effect | Where | Implementation |
|---|---|---|
| Glitter | hero + background | `ParticleField` canvas |
| Illumination | player disc, CTA pulse | CSS keyframes |
| Fade / reveal | all sections | `[data-reveal]` + `useReveal` |
| Curtain (entry) | post-code reveal | midnight velvet + gold, 3D: ~1.4 s hold, ~3 s rotateY gather with parallax layers, music starts with it, tap to skip |
| Curtain (music) | announcement | anime.js slide after 3 s hold, tap to open |
| Film strip | Our Story | CSS marquee, pauses on hover |
| Shine | names, hashtag, borders | CSS gradient animation |

`useReveal()` runs once: all content mounts together, so one scan covers it.

## Accessibility and responsive rules

- `:focus-visible` rings on interactive elements; full keyboard operability.
- `prefers-reduced-motion: reduce` disables particles, marquee, curtain slide,
  reveals; curtain content stays readable.
- Mobile-first 640 px column, breakpoints 419/560/700/768 px, `svh` sizing,
  `env(safe-area-inset-*)` chrome padding. No horizontal overflow.

## Component map

```
src/components/
  Icons.jsx        hand-rolled stroke icons (no icon dependency)
  Floral.jsx       chrysanthemum, lilac, rose, delphinium corners
  effects.jsx      ParticleField, useReveal, Tilt, CountUp, burstAt, ShinyText
  ui.jsx           SectionHeading, Divider, GoldFrame, Ornament, Field
  chrome.jsx       BottomNav (all anchors), MusicBar (mini gramophone)
  AccessGate.jsx   first view: RSVP form hand-off + access-code field
  EntryCurtain.jsx full-screen velvet reveal after the code, starts the music
  ProgramStage.jsx announcement, venues with maps, programme outline
  ErrorBoundary.jsx section-level failure fallback
```
