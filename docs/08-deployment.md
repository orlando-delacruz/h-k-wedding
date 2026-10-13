# 08 — Deployment (static site)

There is no backend, no database, no Blob store.

## Environment variables

One variable, and it is public by design:

```
VITE_ACCESS_CODE=<the code guests receive with their RSVP confirmation>
```

Set it in Vercel → Project → Settings → Environment Variables (Production and
Preview) and in `.env` locally. Vite inlines it into the browser bundle, so it is
a courtesy code, not a secret. If it is missing, the build falls back to the
placeholder in `src/config/site.js` and guests will be told a code that does not
work — always set it.

## Vercel

1. Push to GitHub, import in Vercel (Vite preset).
2. Set `VITE_ACCESS_CODE` (above).
3. `vercel.json` builds `dist/` only — no functions.
4. Deploy. Verify: open the live URL on mobile + desktop, enter the code, and
   confirm the RSVP form still loads.

## Local development

```bash
npm install
npm run dev      # Vite only: http://localhost:5173
npm run build    # production bundle in dist/
```

## Backups

Nothing server-side to back up. Respondents live in the owner's Google Form
account. Keep this repo pushed.

## Known limitations

- RSVP is open by design: anyone with the link can submit. The site cannot
  prove a name belongs to an invited guest.
- All page content is public. Hiding a section in the UI is not protection.
- The embedded Form may require sign-in if the owner configures it that way —
  keep it public per `05`.
