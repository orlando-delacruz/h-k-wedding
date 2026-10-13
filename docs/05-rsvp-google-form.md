# 05 — RSVP via Google Form + the access gate

There is no custom RSVP backend, database, workbook, admin, or submission API.
Google Forms owns fields, validation, submission, confirmation, and all
responses.

## Integration

- Config: `RSVP_FORM.linkUrl` and `ACCESS` (code + copy) in
  `src/config/site.js`. Change the URL and the code there only — never scatter
  them through components.
- Placement: the gate (first view) offers the Form in a new tab
  (`target="_blank"`) beside the deadline. The invitation itself has no RSVP
  section and never embeds the Form.
- Never rebuild Form fields in HTML. Never fake a submission confirmation.
- Never scrape responses, never embed a response spreadsheet, never expose
  response data or account credentials.

## The access gate

1. The couple adds the access code to the Form's confirmation text (for example:
   “Your access code is … — enter it on the invitation to open the full
   details”).
2. `src/components/AccessGate.jsx` is the first view: the button that opens the
   Form comes first, then the code field. The code is compared in the browser
   against `ACCESS.code` — which reads `VITE_ACCESS_CODE` (`.env` locally, Vercel
   for production, see `.env.example`) and falls back to the placeholder in
   `src/config/site.js`. The invitation mounts only when it matches.
3. The gate is a **courtesy screen**. `ACCESS.code` ships in the JS bundle, so
   any guest can read or share it — it keeps polite guests out, not determined
   ones. Never describe it as private, secure, or protected, and never claim the
   page is access-controlled.
4. A successful code is remembered on the device (`localStorage`, key
   `hk_access`) and re-checked against the configured code on every load: a
   refresh or a return visit stays inside the invitation, while a rotated code
   sends everyone back to the gate.
5. Revoking access (a guest who declines, or the deadline passing): change
   `VITE_ACCESS_CODE` in Vercel, update the Form's confirmation text, redeploy.
   Guests holding the old code are locked out. This is the only lever — the site
   cannot read Form responses, so it can never know who answered what.

## Form configuration (owner's Google account)

- Responses tab + linked Sheet + email notifications: the couple's admin.
- Suggested fields: guest full name (required), attendance, companion 1/2,
  message. Companion rule if kept: guest 2 requires guest 1.
- Branching suggestion: decline answers jump straight to Submit.
- The access code belongs in the confirmation text, not in a question: the site
  cannot check it against the Form.

## Explicitly out of scope

- No email receipts from the site.
- No guest-list verification, no per-guest codes, no response storage.
- No real access control: the gate proves nothing, and all page content is
  public by design.
