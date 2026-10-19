# 02 — Site Structure & Sections

Mobile-first, one focus per viewport. Everything is public; the access gate is a
courtesy screen, not access control (see `05`). This is the order the page
renders in — the source of truth is `src/App.jsx`.

## 0. Access gate (view 0)

- One open column, no numbering and no frames: the RSVP Form in a new tab (the
  Form's confirmation shares the code), then the code field. The deadline sits
  under the Form step.
- Wrong code → inline error, invitation stays closed. A successful code first
  opens the velvet envelope (see `06`), whose front page is placed on the hero as
  the default song starts. Shown once — never on refresh.
- A successful code is remembered on the device and re-checked on every load, so
  a refresh stays inside and rotating the code locks everyone out again.
- Copy and the code live in `ACCESS` (`src/config/site.js`).

## 1. Invitation hero (a card, drawn out of the envelope — see `06`)

- Midnight-blue glitter bg; the invitation copy sits on the background itself.
- Copy from `03-copy.md` § Front-page invitation. Couple names in Pinyon Script.
- The date is bold; the scroll cue reads “Scroll down”.
- Readable on 360px; reduced-motion shows static gold.

## 2. Couple portrait intro

- Portrait image, “The wedding of”, “Harthwel & Khatrina”,
  “November 30, 2026 · Girasoles Farm”. Names in Pinyon Script.
- The portrait is the couple's own (`PHOTOS.heroPortrait`,
  `public/images/main.jpg`); the date and venue above it are bold.

## 3. RSVP (gate only — no in-page section)

- The Google Form is reached from the access gate (view 0), which shows the
  deadline “Please Respond before November 15, 2026” and the new-tab button.
- It is deliberately not embedded inside the invitation: guests answer it once,
  before the code opens the page.
- The Form owns fields, validation, submission, confirmation. See `05`.

## 4. Countdown + calendar

- Live Days/Hours/Minutes/Seconds to Nov 30, 2026 06:30 Asia/Manila, never negative.
  Post-date: celebration message.
- November 2026 calendar, Nov 30 gold-circled.

## 5. Venues + maps

- “Wedding Ceremony Venue / Girasoles Farm Candelaria” + a map in a gold frame.
- “Reception Venue / Bride's Residence Sittio Bibingkahan Concepcion Uno Sariaya Quezon”
  + a map in a gold frame. Map URLs provisional until the owner supplies official links.
- Rendered once, from `PROGRAM.venues` in `program.js`; `id="venue"`.
- The announcement lines (“TWO HEARTS. ONE LOVE. ONE JOURNEY.”, “Join us as we
  say ‘I do.’”) were removed by the owner; music lives in the floating player
  only (see `06`).

## 6. Programme

- “Order of the day”: only the 6:30 AM ceremony is confirmed, so the outline
  stays deliberately short.
- A photo of the programme closes the section, in the same gold frame as every
  other plate (`program.photos.programme`, empty until the couple supply it —
  docs/07).

## 8. Our story

- White film strip (left→right loop) + navy card, white text. The couple's own
  pre-wedding photoshoot fills the strip (portrait 4:5 tiles, matching the
  slideshow frame) and the story text is theirs to replace (docs/07).

## 9. Entourage

- Full locked list in `04-entourage.md`. Headings “The Entourage”,
  “To assist us in our needs”, “PRINCIPAL SPONSORS”, “SECONDARY SPONSORS”.
- One antique gold frame surrounds the whole section. No name carries a border
  or a card of its own: roles, sponsors and pairs are set as type, separated by
  hairlines and space, and every line is centred on the phone. No pair numbers.
  Paired sponsors stay side by side on mobile.

## 9. Wedding details (white floral frame)

- Floral frame: chrysanthemums + lilacs + 2 complementary types.
- “ATTIRE GUIDE:” + the couple's own guide sheet, shown whole (`contain`, never
  cropped) so all eight looks stay visible, “GIFT GUIDE:”, “REMINDER” /
  “With Respect” copy from `03-copy.md`. The timeline block appears only once the
  couple supplies its image (`program.photos.timeline`).
- Three gift QR codes (`program.photos.giftQr`) sit under the Gift Guide copy, one
  per row on a phone and three across from 560px, each on the white ground a
  scanner needs and labelled with the account it belongs to. Tapping one opens the
  whole code full size in a modal (`QrLightbox`) — closes on the backdrop, the
  close button or Escape, and returns focus. The frame's light sweep is confined
  to its margin so nothing ever moves over the modules.

## 10. Final slideshow

- Slow crossfade from photo 1, 4:5 frame, ken-burns drift. Shows the couple's
  photoshoot (`program.photos.slideshow`). Hashtag `#NaKHATitiyakNaKayHARTH` as a
  decorative signature overlay, never covering faces. The heading is bare — no
  camera icon and no hashtag line above the photographs, since the hashtag rides
  on them.
