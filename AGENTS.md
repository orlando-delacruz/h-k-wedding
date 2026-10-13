# AGENTS.md — Rules for AI Agents and Contributors

This file governs all changes in `h&k-wedding`. The master luxury-invitation
spec (Pinyon Script, Antique Gold, embedded Google Form, no backend) wins over
any older doc where they disagree.

## 1. Content immutability

- NEVER remove, rename, or silently reorder people in `docs/04-entourage.md`.
- NEVER reword verbatim copy in `docs/03-copy.md`. Copy exactly, including caps and
  punctuation.
- Secondary sponsors stay paired by position: groomsman #n with bridesmaid #n.
- Locked facts: `November 30, 2026 · 6:30 AM Asia/Manila`, `Girasoles Farm, Candelaria`,
  `Bride's Residence, Sitio Bibingkahan, Concepcion Uno, Sariaya, Quezon`,
  `#NaKHATitiyakNaKayHARTH`.
- Never invent couple history, photographs, coordinates, map links, or schedule
  details. The timeline beyond the 6:30 AM ceremony is unknown until the couple
  supplies it. Map links, story text, and photos stay placeholders until supplied.

## 2. Architecture constraints

- Frontend only: React + Vite static site, mobile-first. There is NO backend, NO
  API, NO database, NO workbook, and NO admin area. `vercel.json` serves static
  files only. Never reintroduce a submission endpoint, guest sessions, an admin
  login/dashboard, or any response storage. Google Forms owns RSVP collection.
- RSVP is one Google Form (`RSVP_FORM.linkUrl` in `src/config/site.js`), offered
  from the access gate and opened in a new tab. It is never embedded in the
  invitation page. Never rebuild its fields in HTML, never fake a
  submission confirmation, never scrape or embed response data.
- All page content is public. Never claim anything shipped to the browser is
  private or access-controlled.
- The access gate (`src/components/AccessGate.jsx`, code from `VITE_ACCESS_CODE`
  with a fallback in `ACCESS`) is a courtesy screen: guests answer the Form, the
  confirmation shares the code, and the code opens the invitation. It is NOT
  access control — the code ships in the bundle — so never describe it as
  private, secure or protected. A successful code is remembered in
  `localStorage` (`hk_access`) and re-checked against the configured code on every
  load, so rotating the code locks everyone out again.
- Do not add a UI framework or icon package without a clear need; icons and effects
  are hand-rolled in `src/components/`.
- Approved fonts only: Pinyon Script (romantic names), Cormorant Garamond
  (editorial/headings/body until Calluna files arrive). NEVER use Montserrat,
  Foglighten, or Foglihten No07. NEVER silently substitute another family: if a
  licensed file (Calluna) is unavailable, stop and ask.
- Palette anchors: Velvet Midnight Blue `#101D36`, Velvet Navy `#192A46`,
  Antique Gold `#8D6710`, highlight `#F5D76E`. Gold must stay metallic and
  dimensional — never flat yellow. The slow light-sweep on gold borders, frames,
  and dividers is mandatory and must survive every restyle.
- Animation: anime.js for choreography, CSS for ambient motion. Respect
  `prefers-reduced-motion`. Do not add animation that gates content. No envelope,
  no wax seal — the hero invitation card is the opening screen.

## 3. Security/privacy rules (do not weaken)

- No secrets exist: no `VITE_`-prefixed secret, no password, no session, no token
  anywhere. Never add one without explicit owner approval. The only `VITE_`
  variable is `VITE_ACCESS_CODE`, which is public by design (Vite inlines it into
  the bundle): a courtesy code, not a secret.
- Never bundle, expose, or link private Google Forms response data, spreadsheets,
  or account credentials.
- Never invent or hardcode map URLs, form IDs, or query parameters. Owner-supplied
  URLs live centralized in `src/config/` only.
- Placeholder imagery stays centralized in `src/config/` and drop-in
  swappable. The owner asked for no temporary labels in the UI, so the page
  presents the current photos plainly: they must be replaced with the couple's
  own shots before the invitation is shared (tracked in `docs/07`).
- Swap assets by path only; do not scatter new URLs through components.

## 4. Workflow

- Docs are the source of truth; update them before changing behaviour.
- Before declaring work complete, run:
  - `node scripts/verify-spec.mjs` (copy, tokens, fonts, no-backend wiring)
  - `npm run test:ui` (end-to-end in real Chrome at 360px + 390px, needs `npm run dev`)
  - `npm run build`
- Never commit workbooks, backups, audio files, or credentials — keep `.gitignore`
  that way.
- Report test results honestly, including failures and untested areas. Never claim
  the Form integration is verified without loading the real owner-provided Form URL.
