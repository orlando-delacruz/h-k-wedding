# 07 — Assets TODO (provide later)

All placeholders allowed until real assets arrive. Keep paths stable so swap is drop-in.

## 1. Fonts (blocking for final typography)

- [ ] **Calluna** files + license for body/editorial. Verify source before embedding.
      Until then body uses Cormorant Garamond — never Montserrat/Foglighten.
- [x] Pinyon Script (Google Fonts, loaded in `index.html`)
- [x] Cormorant Garamond incl. Bold Italic (Google Fonts)

## 2. Google Maps links

- [ ] Ceremony: Girasoles Farm, Candelaria — exact share/embed URL
- [ ] Reception: Bride's Residence, Sitio Bibingkahan, Concepcion Uno, Sariaya, Quezon — exact URL
- Swap in `src/config/program.js` only.

## 3. Google Form

- [x] Embed + short URL configured in `src/config/site.js` `RSVP_FORM`
- [ ] Form set to public: no sign-in required, responses collected, notifications on
- [ ] **Access code** — set `VITE_ACCESS_CODE` (`.env` locally, Vercel for
      production, see `.env.example`) and put the same code in the Form's
      confirmation text (docs/05). The fallback in `src/config/site.js` is a
      placeholder. Gate wording in `ACCESS` is temporary too: the couple confirms
      the final sentences.

## 4. Audio (couple-supplied, ships with the site)

- [x] `pahintulot.mp3` (default), `paninindigan-kita.mp3` in `public/music/`
- Only these 2 tracks: the player lists exactly `SONGS` from
  `src/config/site.js`. Adding a track means adding the file + one entry.
- Confirm licensing for both recordings; keep each file <8MB if possible.

## 5. Couple photos + story

- [ ] Hero portrait, curtain portrait, story strip (3–6), slideshow (3–6)
- [ ] Real story text for `src/config/program.js`
- [ ] Attire-guide image, timeline image
- No temporary labels appear in the UI (owner decision): the page presents the
  current photos plainly, so the real shots must land before sharing.

## Drop-in checklist

- [ ] Swap photos without code change
- [ ] Swap audio without code change
- [ ] Paste map URLs in config only
- [ ] Replace story string only
