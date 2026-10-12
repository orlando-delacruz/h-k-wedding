# 08 — Deployment, Storage & Operations

## Storage model

RSVP records live in a single Excel workbook. No database service is used. The
**storage backend is chosen automatically** by `server/storage.js`:

| Backend | When it is used | Where the workbook lives |
|---|---|---|
| **Vercel Blob** | Blob credentials are present (any Vercel deployment) | `rsvp/rsvps.xlsx` in a **private** blob store |
| **Local disk** | Everywhere else (development, VPS, container with a volume) | `data/rsvps.xlsx` |

Set `STORAGE_DRIVER=blob` or `STORAGE_DRIVER=file` to force one.

Two hard rules:

1. **On Vercel the workbook must be in Blob.** Vercel functions have a read-only
   filesystem with only ephemeral `/tmp`. Writing the workbook to disk there loses data
   on the next cold start — silently. This is exactly why the Blob backend exists.
2. **On a non-Vercel host, use a persistent disk.** Do not deploy the disk backend to a
   serverless or ephemeral platform.

## Vercel Hobby deployment

1. **Import the project.** Push to GitHub, import in Vercel. `vercel.json` builds the
   frontend (`dist/`) and routes every `/api/*` request to `api/index.js`, a single
   serverless function running the same Express app used locally.
2. **Create a Blob store.** Storage → Blob → access **Private** → connect it to the
   project for Production, Preview, and Development. Vercel injects the credentials
   (`BLOB_STORE_ID` + `VERCEL_OIDC_TOKEN`, or `BLOB_READ_WRITE_TOKEN`).
3. **Set environment variables** for Production and Preview:

   ```
   ADMIN_EMAIL=you@example.com
   ADMIN_PASSWORD=<your admin password>
   SESSION_SECRET=<64 hex chars>
   COOKIE_SECURE=true
   SITE_ORIGIN=https://<your-domain>
   ```

   Locally, fetch the same values with `vercel env pull`.
4. **Deploy**, then verify with a real submission:

   ```bash
   node scripts/migrate-workbook.mjs info       # does the blob exist?
   node scripts/migrate-workbook.mjs download   # save a copy and open it in Excel
   ```

5. **Confirm the health endpoint** reports a workbook after the first RSVP:
   `GET /api/health` → `{"ok":true,"workbook":true}`.

### Plan facts worth knowing

- Hobby's filesystem is read-only, which is what forces the Blob backend.
- Hobby is restricted to **non-commercial, personal use** — a wedding site qualifies.
- Blob free tier: 1 GB storage, ~2,000 write operations and ~10,000 reads per month,
  10 GB transfer. A 150-guest wedding uses a few hundred writes at most.
- Function limit is 300 s per invocation on Hobby; a workbook write takes well under a
  second, so this is not a concern.

### Session secret on serverless

`SESSION_SECRET` is mandatory in production. If it changes, every admin and guest
session is invalidated (including access grants), so keep it stable across deploys and
store it in Vercel's environment variables rather than only locally.

## Local development

```bash
npm install
cp .env.example .env
npm run dev:all        # API (:3001) + Vite dev server (:5173)
npm run build          # production bundle in dist/
npm run verify         # all three test suites
```

Without `npm run server`, every `/api` request fails with **500** through the Vite
proxy — the most common local setup mistake.

## Backups

**From Vercel Blob (recommended, works from any machine with credentials):**

```bash
node scripts/migrate-workbook.mjs download     # -> backups/rsvps-blob-<timestamp>.xlsx
```

**Scheduled copy on a host with a disk:**

```cron
0 22 * * * cp /srv/hk-wedding/data/rsvps.xlsx /srv/hk-wedding/backups/rsvps-$(date +\%Y\%m\%d).xlsx
```

**Before any risky change** (config edits, redeploys, DNS moves), download a copy first
and store it off the platform.

## Recovery

1. Download the current blob copy (`migrate-workbook.mjs download`). If it is corrupt,
   the server will already have written a backup to `rsvp/backups/` (or
   `data/rsvps.xlsx.corrupt-<ts>.bak` on disk) — keep it.
2. Restore a known-good workbook:
   - Blob: `node scripts/migrate-workbook.mjs upload` after placing the good file at
     `data/rsvps.xlsx`, or re-upload through the Vercel dashboard.
   - Disk: copy the backup over `data/rsvps.xlsx`.
3. Confirm `GET /api/health` reports `"workbook": true`, then submit one test RSVP and
   verify the row appears.

The server never silently recreates an empty workbook over a damaged one — it returns
HTTP 503 with an explanation and preserves the original.

## Known limitations (open RSVP)

- RSVP is **open by design**: anyone can submit without an invitation code. The system
  cannot prove that a submitted name belongs to a real invited guest.
- Access grants are session-based. Someone who declines can open a different browser and
  submit a new attending RSVP. That is inherent to the agreed policy; only invitation
  codes or a guest list would change it.
- A decline from the same browser revokes the session immediately, and the workbook is
  re-checked on every protected request, so a stale grant cannot outlive a decline.
- Conditional writes protect against lost updates between function instances by
  retrying. Two guests submitting in the same instant may both succeed on separate
  retries; a rare conflict still surfaces as a clear error asking the guest to press the
  button again, never as a silent overwrite. Rows are never lost.
- Excel is a file, not a query engine. This is sized for one wedding.

## Verification commands

```bash
node scripts/verify-spec.mjs                                              # copy, tokens, security wiring
node scripts/qa.mjs                                                       # end-to-end, local disk driver
node --import ./scripts/mocks/blob-loader.mjs scripts/qa-blob.mjs         # end-to-end, Blob driver (mocked)
npm run build
```

Run all of them before every deploy.
