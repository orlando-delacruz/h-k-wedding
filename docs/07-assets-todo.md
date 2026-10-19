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

- [x] Couple portrait beside the hero (`PHOTOS.heroPortrait`) —
      `public/images/main.jpg`
- [x] Photoshoot (7 files) feeding both the story film strip and the closing
      slideshow (`program.photos.strip` / `.slideshow`) —
      `public/images/photoshoot/*.jpg`
- [x] Real story text for `src/config/program.js` — the couple's own words, in
      the `story` key and reproduced verbatim (docs/03), never paraphrased
- [x] Attire-guide image (`program.photos.attireGuide`) — the couple's own sheet
      at `public/images/attire/attire.jpg`, shown whole (`contain`). Replace the
      file (or point the path elsewhere) if it changes.
- [x] Timeline image (`program.photos.timeline`) — the couple's own strip at
      `public/images/wedding-timeline.jpg`, 2048×683 (3:1), shown whole and
      never cropped. It sits in section 2, under the portrait, and is not
      repeated in the Wedding Details section.
- [ ] Programme photo (`program.photos.programme`, `''` — the gold frame that
      closes the Programme section appears only once a URL exists; no stock
      substitute is shown)
- [x] Three gift QR-code images — `public/images/gift-qr/gcash.jpg`,
      `chinabank.jpg`, `maribank.jpg`, listed with their labels in
      `program.photos.giftQr`. Add or remove an entry there; the row, the labels
      and the full-size preview all follow the list. Codes must be the couple's
      real accounts — never generate one by hand.
- No temporary labels appear in the UI (owner decision): the page presents the
  current photos plainly.

### Originals vs web copies (important)

- **Web copies** live in `public/images/` and are what the site ships:
  `main.jpg` at 1200px, each photoshoot frame at 1400px, JPEG q82 — ~2.9 MB in
  total. Originals were 8K files, 128 MB, which no phone should download.
- **Originals** are in `assets-originals/` (git-ignored, never deployed). Keep
  them there; if the site ever needs a new crop or size, resize from the
  originals rather than re-exporting from `public/`.
- To replace a photo, drop the web-sized file in `public/images/` (or point the
  config at a different path). Keep the frame ratio in mind: the slideshow and
  the film strip are both 4:5 portrait frames, so portrait photos sit in them
  best; landscape frames are centre-cropped.

## 6. Soft copies + printed cards (downloadable)

- [x] Program leaves (2 files) — `public/images/program/wedding-ceremony.jpg`
      and `public/images/program/wedding-reception.jpg`, listed in
      `DOWNLOADS.programs`.
- [x] Printed invitation set (8 files) — `public/images/invitation/image-1.jpg`
      through `image-8.jpg`: cover, main card, entourage + principal sponsors,
      secondary sponsors + bearers, entourage attire, guest attire + timeline,
      gift guide + reminder, venue-map QR back. Listed in
      `DOWNLOADS.invitations`.
- All ten files are downloadable from the last section of the page:
      “Download Wedding Programs” saves the two program leaves and
      “Download Invitation Cards” saves the eight cards. The browser may ask
      once for permission to download multiple files.

## Drop-in checklist

- [ ] Swap photos without code change
- [ ] Swap audio without code change
- [ ] Paste map URLs in config only
- [ ] Replace story string only
