# 08 — Deployment (static site)

There is no backend, no database, no environment variables, no Blob store.

## Vercel

1. Push to GitHub, import in Vercel (Vite preset).
2. No env vars to set. `vercel.json` builds `dist/` only — no functions.
3. Deploy. Verify: open the live URL on mobile + desktop.

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
