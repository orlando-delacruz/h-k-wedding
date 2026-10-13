# 02 — Site Structure & Sections (order locked)

Do not reorder. Mobile-first, one focus per viewport. Everything is public; the
access gate is a courtesy screen, not access control (see `05`).

## 0. Access gate (first view)

- “Kindly respond first”: a button that opens the RSVP Form in a new tab (the
  Form's confirmation shares the code), then the access-code field.
- Wrong code → inline error, invitation stays closed. A successful code first
  unveils a full-screen velvet curtain (see `06`): it holds, parts slowly while
  the default song starts, then reveals the hero. Shown once — never on refresh.
- A successful code is remembered on the device and re-checked on every load, so
  a refresh stays inside and rotating the code locks everyone out again.
- Copy and the code live in `ACCESS` (`src/config/site.js`).

## 1. Invitation hero (a card, never an envelope — unveiled by the entry curtain)

- Midnight-blue glitter bg + invitation card with animated gold border.
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

## 4. Venues + maps

- “Wedding Ceremony Venue / Girasoles Farm Candelaria” + mirror-framed map.
- “Reception Venue / Bride's Residence Sittio Bibingkahan Concepcion Uno Sariaya Quezon”
  + mirror-framed map. Map URLs provisional until the owner supplies official links.

## 5. Countdown + calendar

- Live Days/Hours/Minutes/Seconds to Nov 30, 2026 06:30 Asia/Manila, never negative.
  Post-date: celebration message.
- November 2026 calendar, Nov 30 gold-circled.

## 6. Announcement + music

- “TWO HEARTS. ONE LOVE. ONE JOURNEY.”, “Join us as we say ‘I do.’”,
  “Harthwel / and / Khatrina”, “November 30, 2026 · 6:30 AM”, “Songs of love”,
  gramophone selector. Curtain starts closed, tap to open (also unlocks audio).

## 7. Entourage

- Full locked list in `04-entourage.md`. Headings “The Entourage”,
  “To assist us in our needs”, “PRINCIPAL SPONSORS”, “SECONDARY SPONSORS”.
  Paired sponsor cards stay side by side on mobile.

## 8. Our story

- White film strip (left→right loop) + navy card, white text, clearly marked
  sample story until the real story arrives.

## 9. Wedding details (white floral frame)

- Floral frame: chrysanthemums + lilacs + 2 complementary types.
- “ATTIRE GUIDE:” + placeholder image, “WEDDING TIMELINE:” placeholder,
  “GIFT GUIDE:”, “REMINDER” / “With Respect” copy from `03-copy.md`.

## 10. Final slideshow

- Slow crossfade from photo 1. Hashtag `#NaKHATitiyakNaKayHARTH` as a decorative
  signature overlay, never covering faces.
