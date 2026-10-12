# 09 — Local Testing Guide

This is the definitive local test sequence for RSVP and the admin dashboard.

## Setup check

```bash
npm run dev
```

Expect two labels in one terminal: `[api] RSVP API listening on http://localhost:3001`
and `[web] Local: http://localhost:5173`.

If the browser console shows `ECONNREFUSED` / `500` on `/api/*`, the API half is not
running — re-run `npm run dev` and confirm the `[api]` line appears.

## 1. Page loads

Open **http://localhost:5173**. Tap the wax seal, then scroll. You should see the gold
invitation card, the couple section, RSVP, the venue block, and the countdown.

Below the venues there is a locked panel: "The Wedding Programme". That is correct —
you have not sent an RSVP yet.

## 2. RSVP — attending (unlocks the programme)

1. Go to **http://localhost:5173/#rsvp**
2. Name: `Juan Dela Cruz`
3. Click **YES I'M GOING TO ATTEND!**
4. Guest 1: `Maria Dela Cruz`, message: `Congratulations!`
5. Click **Send RSVP**

Expect the navy card, then the personalized confirmation, then an automatic scroll to
the curtain.

Checks:

- The curtain section plays: closed, ~3 second pause, opens from the centre.
- The locked panel is replaced by entourage, story, wedding details, and slideshow.
- The floating music bar appears bottom-right; the gramophone vinyl is playable.

## 3. RSVP — declining (must stay locked)

1. Open a **new incognito window** → http://localhost:5173/#rsvp
2. Name: `Pedro Reyes`
3. Click **SORRY, I HAVE SOMETHING TO DO**

Expect the dust-dissolve and the acknowledgement.

Checks:

- The page does **not** scroll anywhere, and no curtain appears.
- The programme is still locked. Reloading does not unlock it.
- Manually visiting http://localhost:5173/api/program returns `401`.

## 4. Admin dashboard

1. Go to **http://localhost:5173/#admin**
2. Email and password: whatever is in your `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)
3. You should see both submissions.

Checks:

- Totals read: attending `1`, declined `1`, companions `1`, total guests `2`.
- Filter buttons (All / Attending / Declined) and the search box work.
- The status dropdown writes back to the workbook — change one to `Reviewed`, refresh,
  it stays.
- `Logout` returns to the login form.

## 5. Where the data is

```bash
ls data/rsvps.xlsx
```

Open it in Excel: sheet `RSVP Responses` with a row per submission, timestamps in
Asia/Manila (`+08:00`), plus a `Settings` sheet that holds no secrets.

To inspect through the API instead:

```bash
curl -c cookies.txt -X POST http://localhost:5173/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<ADMIN_EMAIL>","password":"<ADMIN_PASSWORD>"}'
curl -b cookies.txt http://localhost:5173/api/admin/rsvps
```

## Troubleshooting

### "Too many submissions were sent just now" when sending an RSVP

The server rate-limits submissions per IP address. **In development the limit is
deliberately generous (500 per 10 minutes), so you should not normally see this.** If
you do:

- You sent hundreds of submissions in a few minutes (automated testing).
- Restart the API to reset the counters: `Ctrl+C` in the dev terminal, then `npm run dev`.

In production the limit is strict on purpose (12 per 10 minutes) to keep the open RSVP
form from being flooded. The UI tells the guest how many minutes to wait; their typed
details are preserved.

### Error state instead of the RSVP form

The form keeps the entered name, companions, and message whenever a save fails, so
nothing is lost. Press the same button again to retry.

### `ECONNREFUSED` / `500` on `/api/*`

The API half is not running. Run `npm run dev` (not `npm run dev:web`) and confirm the
`[api] RSVP API listening` line appears.

### Programme stays locked after an attending RSVP

The grant is an HttpOnly cookie bound to the submission. Make sure the browser is not
blocking cookies, and that you are on the same host (localhost, not 127.0.0.1 alternating
with localhost — cookies are host-specific).

## 6. Reset the test data

```bash
# stop the servers first (Ctrl+C in the dev terminal)
rm data/rsvps.xlsx
```

The workbook is recreated on the next RSVP. Never delete it once real guests have
answered.
