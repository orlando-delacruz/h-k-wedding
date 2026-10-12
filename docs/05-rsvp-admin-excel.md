# 05 — RSVP, Access Control & Admin

## Storage: Excel workbook, no database service

- One `.xlsx` workbook, built with **ExcelJS**. No Supabase/Firebase/Postgres/Mongo.
- **Backend is chosen automatically** by `server/storage.js`:
  - **Vercel Blob** when blob credentials exist (required on Vercel — its functions have a
    read-only filesystem, so the workbook cannot live on disk there).
  - **Local disk** otherwise (development, or a VPS/render/railway container with a volume).
- Worksheets:
  - `RSVP Responses` — one row per submission.
  - `Settings` — non-secret notes only (never credentials or session secrets).

### `RSVP Responses` columns

| Column | Purpose |
|---|---|
| Submission ID | Stable id (`RSVP-<time>-<rand>`), used by access grants |
| Primary Guest Name | Validated, trimmed, max 100 chars |
| Attendance Response | `accepted` or `declined` |
| Companion 1 / Companion 2 | Optional, max 100 chars each |
| Message | Optional, max 500 chars, stored as plain text |
| Party Size | 1 + companions for accepts, 0 for declines |
| Submission Timestamp | ISO with `+08:00` (Asia/Manila) |
| Review Status | `New`, `Reviewed`, `Duplicate`, `Resolved` |
| Resolved By | Admin email that last changed the status |
| Resolution Timestamp | Manila time of that change |

### Write safety

- Every read/modify/write is serialized inside the server instance (`withLock`).
- Writes are **conditional**: the storage layer sends the current version with the write
  (ETag `ifMatch` on Blob). If another function instance wrote first, the save is rejected
  and the mutation is re-applied to the fresh workbook, up to 5 attempts. No guest's row
  is silently discarded.
- The produced workbook is parsed and validated before it becomes the live copy.
- A corrupt or unreadable workbook is reported (HTTP 503) and left untouched, with a
  `.corrupt-<ts>.bak` copy written to the same storage backend. The server never silently
  starts a fresh empty workbook over damaged data.
- Rows are never deleted. Duplicates are surfaced for review, not deduplicated.

### Workbook limits

- Local disk: a normal file write with a temp-file swap; a single writer at a time.
- Blob: free-tier Hobby allows ~2,000 write operations per month. A 150-guest wedding
  uses roughly 150 submissions plus a similar number of status updates, comfortably
  inside the limit.
- Excel is a file, not a database. This is sized for one wedding, not for heavy traffic.

## Public RSVP endpoint

`POST /api/rsvp` — open to everyone, no invitation code.

Validation (server-side, mirrored on the client):

- `name` required after trimming, max 100.
- `attendance` must be `accepted` or `declined`.
- `guest2` requires `guest1`.
- `message` max 500; rendered as plain text.
- Honeypot field `company` — filled means silently accepted and discarded.
- Rate limit: 12 submissions per 10 minutes per IP (configurable).

Responses:

- Decline → saved, no session issued, any existing guest cookie is cleared.
- Accept → saved, then a signed HttpOnly guest cookie is issued carrying the
  submission ID.

## Access control for the full wedding programme

**Public:** opening invitation, couple introduction, date, RSVP deadline, basic venue
names and addresses, countdown and calendar.

**Protected** (served only via `GET /api/program`): curtain reveal and portrait,
gramophone, venue maps and full addresses, programme outline, complete entourage,
Our Story, Wedding Details (attire, timeline, gift guide, reminders), final slideshow
and hashtag.

How the grant works:

1. `POST /api/rsvp` with `accepted` writes the row and sets `hk_guest`, an HMAC-signed
   token containing the submission ID (`HttpOnly`, `SameSite=Lax`, `Secure` in
   production, 10-day expiry).
2. `GET /api/program` verifies the signature, then re-reads the workbook and requires
   that record to still be `accepted`. Nothing protected is sent otherwise.
3. `POST /api/rsvp` with `declined` clears the cookie → the same browser loses access
   immediately.
4. Deleting or editing the cookie does nothing: the signature will not verify, and the
   workbook is the source of truth.

Protected content is never bundled into the public JavaScript — the sample story,
programme outline, and other protected copy live only in `server/program.js` and are
fetched after authorization. Client-side state changes cannot unlock the section; the
UI renders the gate unless the server returns the payload.

## Admin (kept deliberately simple)

- One email and one password, read from server-side `.env` variables:
  `ADMIN_EMAIL` and `ADMIN_PASSWORD`. The server refuses to boot without them.
- Compared in constant time (`crypto.timingSafeEqual`). Never logged, never returned,
  never bundled — asserted by tests.
- Session: HMAC-signed `hk_admin` cookie, HttpOnly, 12-hour expiry, cleared on logout.
- Endpoints (all behind the admin session):
  - `GET /api/admin/rsvps?q=&attendance=` — filtered list plus totals
  - `PATCH /api/admin/rsvps/:id` — `{ status }` limited to the four allowed values;
    writes `Resolved By` and `Resolution Timestamp`
  - `GET /api/admin/workbook-info` — where the workbook lives, nothing more
- The dashboard shows totals (attending responses, companions, total guests, declines),
  filters, search, possible-duplicate flags, and per-row status editing.
- Password rotation: change `ADMIN_PASSWORD` in `.env` (locally) or in the Vercel
  project's Environment Variables, then restart/redeploy. No hash tooling involved.

## Explicitly out of scope

No email receipts or notifications. No guest-list verification or invitation codes.
See `docs/08-deployment.md` for the open-RSVP identity limitation.
