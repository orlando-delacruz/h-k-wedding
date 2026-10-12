# 01 — Vision & Design System

## Identity

Mobile-first, responsive, elegant and cinematic. Velvet midnight/navy with metallic
gold, white typography, and refined floral decoration. Every animation degrades
gracefully, and no animation is required to read the content.

## Colors

| Token | Value | Use |
|---|---|---|
| Velvet Midnight Blue | `#10182B` | page background, curtain, footer |
| Velvet Navy Blue | `#172746` | cards, story, venue section |
| White | `#FFFFFF` | primary typography, RSVP and details sections |
| Champagne Gold | `#D6B46A` | borders, frames, mid-gradient stop |
| Deep Gold | `#A77A30` | gradient anchors, accents |
| Soft Gold Highlight | `#F4DF9A` | shine peak, calendar day, focus ring |
| Light Neutral | `#FAF9F6` | RSVP/details paper background |

Generated values are declared once in `src/styles.css` as `--gold-1 … --gold-5` and
`--grad-gold`, a multi-stop gradient animated with a moving highlight. A flat yellow
border is explicitly avoided.

## Metallic gold treatment

- `--grad-gold` layered champagne/bronze/gold gradient, used on borders, buttons,
  dividers, and the calendar highlight.
- `.shiny-text` sweeps a 220%-wide gradient across text (`@keyframes shine`).
- `.gold-frame` uses a padding-box/border-box gradient border with inner hairline and
  corner brackets; `.fc` corner ornaments are drawn with gradient pseudo-elements.
- Specular highlights: `.tilt-glare` follows the pointer; `.mirror-shine` sweeps the
  venue mirror glass every 6.5 s.
- All of the above stop under `prefers-reduced-motion: reduce` (see below).

## Typography

- **Cormorant Garamond** — couple names, elegant headings (`--font-serif`).
- **Montserrat** — body copy, labels, buttons, interface text (`--font-body`).
- **Allura** — limited decorative script; Great Vibes is the loaded alternative
  (`--font-script`).
- Playfair Display is used for the display tier (section titles, hero).

## Motion inventory

| Effect | Where | Implementation |
|---|---|---|
| Glitter | hero + global background | `ParticleField` canvas (`effects.jsx`) |
| Illumination | gramophone vinyl, seal glow, CTA pulse | CSS keyframes (`spin`, `sealGlow`, `ctaPulse`) |
| Fade / reveal | all sections | `[data-reveal]` + `useReveal` IntersectionObserver |
| Zoom | portrait tilt, Ken Burns slideshow, card focus | CSS transforms, `@keyframes kenburns` |
| Dust dissolve | RSVP decline | anime.js blur + fade, runs only after the save confirms |
| Curtain | programme entry | anime.js panel slide (center out) after a 3 s hold |
| Film strip | Our Story | CSS `filmScroll` marquee, pauses on hover |
| Spark burst | accept + curtain open | `burstAt()` DOM gold particles |
| Gold shine | names, hashtag, borders | CSS gradient animation |

Choreography uses anime.js; ambient and hover motion uses CSS. Particles are capped and
paused when off-screen; timers and observers are cleaned up on unmount.

## Accessibility and responsive rules

- `:focus-visible` rings in `--gold-4` on every interactive element; forms are fully
  keyboard operable (`Enter` advances the RSVP name step).
- `prefers-reduced-motion: reduce` disables particle canvases, the film marquee, curtain
  sliding, and reveal transitions; the curtain resolves instantly to the revealed state.
- Mobile-first layout: a 640 px content column, breakpoints at 560/700/768 px, `svh`
  sizing, and `env(safe-area-inset-*)` padding for the floating chrome.
- No horizontal overflow; long entourage names wrap inside their cards.
- Paired groomsmen/bridesmaids keep their number and stay side by side on mobile.

## Component map

```
src/components/
  Icons.jsx        24 hand-rolled stroke icons (no icon dependency)
  Floral.jsx       chrysanthemum, lilac, rose, delphinium — floral frame corners
  effects.jsx      ParticleField, useReveal, Tilt, CountUp, burstAt, ShinyText
  ui.jsx           SectionHeading, Divider, GoldFrame, Ornament, Field
  chrome.jsx       BottomNav (public + programme anchors), MusicBar
  Intro.jsx        sealed-envelope overlay with wax-seal monogram
  ProgramStage.jsx curtain reveal, gramophone, venues, programme outline
  Admin.jsx        private dashboard (#admin)
```
