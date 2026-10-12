# 02 — Site Structure & Sections (order locked)

Do not reorder. Mobile-first, one focus per viewport.

## 1. Invitation hero
- Midnight-blue glitter bg + invitation card with animated gold border.
- Copy from `03-copy.md` § Front-page invitation.
- Acceptance: border shows moving light, readable on 360px, reduced-motion shows static gold.

## 2. Couple portrait intro
- Portrait image, “The wedding of”, “Harthwel & Khatrina”, “November 30, 2026 · Girasoles Farm”.
- Title + names in Cormorant Garamond.

## 3. RSVP (white)
- Heading “RSVP”, deadline “PLEASE RESPOND BY NOVEMBER 15, 2026”.
- Name field “Enter your name...”.
- Buttons: “YES I'M GOING TO ATTEND!” / “SORRY, I HAVE SOMETHING TO DO”.
- See `05-rsvp-admin-excel.md` for flow.

## 4. Additional-guests + curtain trigger
- Only for accepts. “Additional Guests”, “You can bring 1 or 2 companions”, “Guest 1:” / “Guest 2”, both “full name”, “Leave a message for the couple”, “Express your heartfelt message here...”, “Back” / “Send RSVP”.
- After submit → confirmation screen → curtain reveal.

## 5. Curtain reveal + music
- Curtain closed → 3s pause → opens center to sides → reveals portrait.
- “TWO HEARTS. ONE LOVE. ONE JOURNEY.”, “Join us as we say ‘I do.’”, “Harthwel / and / Khatrina”, “November 30, 2026 · 6:30 AM”, “Songs of love”, gramophone selector.
- Attempt autoplay on open, show play fallback if blocked.

## 6. Venues + maps
- “Wedding Ceremony Venue / Girasoles Farm Candelaria” + mirror-framed map.
- “Reception Venue / Bride's Residence Sittio Bibingkahan Concepcion Uno Sariaya Quezon” + mirror-framed map. Labels beneath maps. Medium-size mirrors.

## 7. Countdown + calendar
- Live Days/Hours/Minutes/Seconds to Nov 30, 2026 06:30 Asia/Manila. Post-date state: show celebration message.
- November 2026 calendar, Nov 30 gold-circled.

## 8. Entourage
- Full locked list in `04-entourage.md`. Headings “The Entourage”, “To assist us in our needs”, “PRINCIPAL SPONSORS”, “SECONDARY SPONSORS”. Paired columns for secondary.

## 9. Our story
- White film strip (left→right loop) + scrollable velvet navy card with gold frame, white text, sample story until real story arrives.

## 10. Wedding details (white floral frame)
- Floral frame: ≥4 flower varieties incl. chrysanthemums + lilacs, navy/midnight/white.
- ATTIRE GUIDE + placeholder image, WEDDING TIMELINE placeholder image, GIFT GUIDE + REMINDER copy from `03-copy.md`.

## 11. Final slideshow
- Slow dissolve/crossfade, auto-start at photo 1. Hashtag `#NaKHATitiyakNaKayHARTH` in white overlay, positioned to avoid faces.
