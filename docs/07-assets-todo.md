# 07 — Assets TODO (provide later)

All placeholders allowed until real assets arrive. Keep paths stable so swap is drop-in.

## 1. Google Maps links (public)
- [ ] Ceremony: Girasoles Farm, Candelaria — exact share/embed URL
- [ ] Reception: Bride's Residence, Sitio Bibingkahan, Concepcion Uno, Sariaya, Quezon — exact URL
- Use: `<iframe>` embeds in mirror frames, labels beneath. Store in `src/config/venues.js`.

## 2. Audio (3 files)
- [ ] `public/audio/pahintulot.mp3` (default)
- [ ] `public/audio/paninindigan-kita.mp3`
- [ ] `public/audio/feeling-good.mp3`
- Check licensing for web use, normalize volume, <5MB each if possible.

## 3. Couple photos
- [ ] `public/img/hero-portrait.jpg` (Sec 2 intro)
- [ ] `public/img/curtain-portrait.jpg` (Sec 5 reveal)
- [ ] `public/img/story-strip-*.jpg` (3-6 for film strip, white strip)
- [ ] `public/img/slideshow-*.jpg` (3-6 for final dissolve)
- Temp: internet wedding photos OK (owner approved). Prefer compressed WebP/JPG, portrait crop safe for hashtag overlay (keep faces top-third, hashtag bottom).

## 4. Story
- [ ] Real story text to replace sample in scrollable navy/gold card (`src/config/story.js`).
- Current: short generic romantic sample, white text on velvet navy.

## 5. Attire + timeline images
- [ ] `public/img/attire-guide.jpg` (replace placeholder)
- [ ] `public/img/timeline.jpg` (temporary placeholder until final)

## 6. Env / admin seed
- [ ] `.env` with `ADMIN_EMAIL`, `ADMIN_HASH`, `SESSION_SECRET`, `SITE_ORIGIN`
- [ ] `data/` gitignored except `.gitkeep` (Excel created at runtime)

## Drop-in checklist
- [ ] Swap photos without code change
- [ ] Swap audio without code change
- [ ] Paste maps URLs in config only
- [ ] Replace story string only
