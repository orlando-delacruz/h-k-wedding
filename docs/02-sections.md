# 02 — Site Structure & Sections

Mobile-first, one focus per viewport. Everything is public; the access gate is a
courtesy screen, not access control (see `05`). This is the order the page
renders in — the source of truth is `src/App.jsx`.

## 0. Access gate (view 0)

- Two numbered steps, because guests kept missing the order: **1** answer the
  RSVP Form in a new tab (the Form's confirmation shares the code), **2** enter
  that code. The deadline sits under step 1.
- Wrong code → inline error, invitation stays closed. A successful code first
  unveils the velvet entry curtain (see `06`), which opens while the default song
  starts. Shown once — never on refresh.
- A successful code is remembered on the device and re-checked on every load, so
  a refresh stays inside and rotating the code locks everyone out again.
- Copy and the code live in `ACCESS` (`src/config/site.js`).

## 1. Invitation hero (a card, never an envelope — unveiled by the entry curtain)

- Midnight-blue glitter bg; the invitation copy sits on the background itself.
- Copy from `03-copy.md` § Front-page invitation. Couple names in Pinyon Script.
- Readable on 360px; reduced-motion shows static gold.

## 2. Couple portrait intro

- Portrait image, “The wedding of”, “Harthwel & Khatrina”,
  “November 30, 2026 · Girasoles Farm”. Names in Pinyon Script.

## 3. RSVP (gate only — no in-page section)

- The Google Form is reached from the access gate (view 0), which shows the
  deadline “PLEASE RESPOND BY NOVEMBER 15, 2026” and the new-tab button.
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

## 7. Entourage

- Full locked list in `04-entourage.md`. Headings “The Entourage”,
  “To assist us in our needs”, “PRINCIPAL SPONSORS”, “SECONDARY SPONSORS”.
  Paired sponsor cards stay side by side on mobile.

## 8. Our story

- White film strip (left→right loop) + navy card, white text. The couple's own
  story text and photos replace the current ones (docs/07).

## 9. Wedding details (white floral frame)

- Floral frame: chrysanthemums + lilacs + 2 complementary types.
- “ATTIRE GUIDE:” + image, “GIFT GUIDE:”, “REMINDER” / “With Respect” copy from
  `03-copy.md`. The timeline block appears only once the couple supplies its
  image (`program.photos.timeline`).

## 10. Final slideshow

- Slow crossfade from photo 1. Hashtag `#NaKHATitiyakNaKayHARTH` as a decorative
  signature overlay, never covering faces.
