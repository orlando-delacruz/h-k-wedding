# AGENTS.md — Rules for AI Agents and Contributors

This file governs all changes in `h&k-wedding`.

## 1. Content immutability

- NEVER remove, rename, or silently reorder people in `docs/04-entourage.md`.
- NEVER reword verbatim copy in `docs/03-copy.md`. Copy exactly, including caps and
  punctuation.
- Secondary sponsors stay paired by position: groomsman #n with bridesmaid #n.
- Locked facts: `November 30, 2026 · 6:30 AM Asia/Manila`, `Girasoles Farm, Candelaria`,
  `Bride's Residence, Sitio Bibingkahan, Concepcion Uno, Sariaya, Quezon`,
  `#NaKHATitiyakNaKayHARTH`.
- Never invent couple history, photographs, coordinates, or schedule details. The
  timeline beyond the 6:30 AM ceremony is unknown until the couple supplies it.

## 2. Architecture constraints

- Frontend: React + Vite, mobile-first. Do not add a UI framework or icon package
  without a clear need; icons and effects are hand-rolled in `src/components/`.
- Animation: anime.js for choreography, CSS for ambient motion. Respect
  `prefers-reduced-motion`. Do not add animation that gates content.
- RSVP storage: one Excel workbook via ExcelJS, behind `server/storage.js`
  (Vercel Blob on Vercel, local disk elsewhere). No database service, no ORM.
  Never place the workbook in a served directory, never import it into the frontend,
  and never add a download endpoint for it.
- All workbook access goes through `server/workbook.js`. Never read or write the
  workbook from another module; the lock, conditional-write, and validation rules
  live there.

## 3. Security rules (do not weaken)

- Admin auth is intentionally simple: `ADMIN_EMAIL` + `ADMIN_PASSWORD` from server-side
  `.env`, compared in constant time. Do not reintroduce hashing layers or add
  self-service password reset. Never use a `VITE_`-prefixed secret, never return a
  password, never log it.
- Sessions are HMAC-signed HttpOnly cookies. Do not introduce localStorage as an
  authorization signal.
- Protected programme content belongs in `server/program.js` and is served only from
  `GET /api/program` behind `requireAttendingGuest`. Do not bundle it into `src/`.
- Declines must never receive a grant; a decline from a granted session must clear it.
- Admin endpoints require `requireAdmin`. Invalid status values are rejected.
- Keep the origin guard, rate limits, and constant-time credential compare intact.
- Corrupt workbooks are reported and backed up, never silently replaced.

## 4. Asset rules

- Placeholder imagery stays clearly labelled in the UI and centralized in
  `src/config/site.js` (public) or `server/program.js` (protected).
- Never present stock photography as an actual photo of the couple.
- Swap assets by path only; do not scatter new URLs through components.
- Audio files go to `data/audio/` and are streamed through the authorized endpoint.

## 5. Workflow

- Docs are the source of truth; update them before changing behaviour.
- Before declaring work complete, run:
  - `node scripts/verify-spec.mjs` (copy, tokens, security wiring)
  - `node scripts/qa.mjs` (end-to-end RSVP, access control, workbook safety)
  - `node --import ./scripts/mocks/blob-loader.mjs scripts/qa-blob.mjs` (Blob driver)
  - `npm run build`
- Never commit `.env`, workbooks, backups, or audio files — `.gitignore` covers them,
  keep it that way.
- Report test results honestly, including failures and untested areas.
