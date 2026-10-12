# Harthwel & Khatrina — Wedding Invitation Website

> November 30, 2026 · 6:30 AM · Girasoles Farm, Candelaria
> Reception: Bride's Residence, Sitio Bibingkahan, Concepcion Uno, Sariaya, Quezon

Mobile-first React wedding invitation with cinematic animation, RSVP records stored in
an Excel workbook, and a server-enforced access gate for the full wedding programme.

## Identity

- **Couple:** Harthwel & Khatrina
- **Ceremony:** 6:30 AM, Girasoles Farm, Candelaria, Quezon
- **Reception:** Bride's Residence, Sitio Bibingkahan, Concepcion Uno, Sariaya, Quezon
- **Hashtag:** `#NaKHATitiyakNaKayHARTH` — **RSVP deadline:** November 15, 2026
- **Timezone:** Asia/Manila

## Stack

- **Frontend:** React 18 + Vite, mobile-first, hand-authored CSS design tokens.
- **Animation:** anime.js for choreography (curtain, dust dissolve, seal); local
  React Bits–style effect components (`ParticleField`, `Tilt`, `CountUp`, `burstAt`).
- **Backend:** Express + ExcelJS. RSVP rows are appended to a single `.xlsx` workbook.
  No database service, by requirement.
- **Workbook storage:** automatic. **Vercel Blob** when blob credentials are present
  (required on Vercel — its functions have a read-only filesystem), local disk
  everywhere else. Conditional writes (ETag) prevent lost updates when two guests
  submit at the same moment. See `server/storage.js`.
- **Access control:** signed HttpOnly cookies. Accepting issues a guest grant bound to
  the submission ID; declining revokes it. Protected content is fetched from
  `GET /api/program` only after the server verifies the workbook still says `accepted`.
- **Admin:** one email and one password from `.env`, simple login form at `#admin`.

Windows note: this folder name contains `&`, which breaks `npx`/bin shims on cmd.
The npm scripts call Vite through `node ./node_modules/vite/bin/vite.js` for that reason.
Renaming the folder to `hk-wedding` is recommended but not required.

## Quick start

```bash
npm install
cp .env.example .env      # then fill in the values (see below)
npm run dev               # starts the RSVP API (:3001) and the site (:5173) together
```

Open http://localhost:5173.

`npm run dev` is the only command you need: it launches the API and the Vite dev server,
pauses the API if one is already running, and stops both with Ctrl+C. Running Vite alone
(`npm run dev:web`) leaves the API down and every `/api` request fails with
`500` / `ECONNREFUSED` through the Vite proxy — that error means the API is not running.

The launcher refuses to start when `.env` is missing, and warns when `SESSION_SECRET`
is empty (sessions would reset on every server restart).

Minimum `.env` for local work:

```
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=your-password
SESSION_SECRET=<64 hex chars>   # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SITE_ORIGIN=http://localhost:5173
```

`SESSION_SECRET` is mandatory in production.

## Vercel deployment (Hobby plan)

1. Push the repository to GitHub and import it in Vercel.
2. Create a **Blob store** (Storage → Blob, access **Private**) and connect it to the
   project. Vercel adds the credentials automatically (OIDC, or a read-write token).
3. Add environment variables for Production and Preview:
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `COOKIE_SECURE=true`,
   `SITE_ORIGIN=https://<your-domain>`.
4. Deploy. `vercel.json` builds the site and routes `/api/*` to `api/index.js`.
5. Verify: submit a test RSVP from the live site, then download the workbook to confirm
   the row landed:
   ```bash
   node scripts/migrate-workbook.mjs download
   ```

Hobby plan notes: Vercel's filesystem is read-only, which is why the workbook lives in
Blob; Hobby is limited to non-commercial personal projects, which a wedding site is;
Blob's free tier is 1 GB storage with roughly 2,000 writes per month, far more than a
wedding needs (about 150 guests ≈ 300 writes including status changes).

## Public vs protected

**Public:** opening invitation, couple introduction, date and time, RSVP deadline, basic
venue names and addresses, countdown and November 2026 calendar.

**Protected (attending guests only):** curtain reveal and portrait, gramophone and
songs, detailed venue maps, programme outline, complete entourage, Our Story, Wedding
Details (attire, timeline, gift guide, reminders), and the final slideshow.

A declined RSVP never receives a grant, and the workbook is re-checked on every
protected request, so access cannot be restored by editing the URL or browser storage.

## Verification

```bash
npm run verify        # all three suites below
```

- `node scripts/verify-spec.mjs` — locked copy, design tokens, security wiring
- `node scripts/qa.mjs` — end-to-end RSVP, access control, workbook safety (local disk)
- `node --import ./scripts/mocks/blob-loader.mjs scripts/qa-blob.mjs` — same behaviour
  through the Vercel Blob driver, using an in-memory mock so no credentials are needed

All exit non-zero on failure. Each suite uses its own throwaway workbook, so real RSVP
data is never touched.

## Workbook utilities

```bash
node scripts/migrate-workbook.mjs info       # describe the blob copy
node scripts/migrate-workbook.mjs upload     # local data/rsvps.xlsx  -> Blob
node scripts/migrate-workbook.mjs download   # Blob -> backups/rsvps-blob-<date>.xlsx
```

Use `download` to review or archive live RSVPs, and to verify a deployment is writing
correctly.

## Documentation

- `AGENTS.md` — rules for contributors and AI agents
- `docs/01-vision-design-system.md` — palette, typography, motion, components
- `docs/02-sections.md` — page structure and acceptance criteria
- `docs/03-copy.md` — locked invitation copy
- `docs/04-entourage.md` — locked entourage list
- `docs/05-rsvp-admin-excel.md` — RSVP flow, workbook schema, access control, admin
- `docs/06-music-animation.md` — songs, gramophone, curtain
- `docs/07-assets-todo.md` — assets the couple still needs to supply
- `docs/08-deployment.md` — persistent storage, backups, recovery, limitations

## Source map

```
src/
  App.jsx                    public page + protected wrapper + gate
  api.js                     cookie-based fetch helpers
  styles.css                 design tokens, components, keyframes
  config/site.js             public facts, song catalogue, limits
  config/entourage.js        locked entourage data
  components/                Icons, Floral, effects, ui, chrome, Intro,
                             ProgramStage, Admin
server/
  app.js                     the Express app (routes, config validation)
  index.js                   local entry point that listens on a port
  workbook.js                workbook read/write, locking, conditional writes
  storage.js                 local disk or Vercel Blob, chosen automatically
  middleware.js              cookies, origin guard, rate limits, guards
  sessions.js                HMAC tokens, constant-time compare
  program.js                 protected programme content
api/
  index.js                   Vercel serverless entry point
scripts/
  qa.mjs                     end-to-end suite (local disk driver)
  qa-blob.mjs                end-to-end suite (Vercel Blob driver, mocked)
  verify-spec.mjs            spec string checks
  dev.mjs                    runs API + Vite together
  migrate-workbook.mjs       upload/download/inspect the blob workbook
vercel.json                  build, function, and rewrite configuration
data/
  rsvps.xlsx                 local development workbook (never committed)
  audio/                     guest-only audio files (never committed)
```
