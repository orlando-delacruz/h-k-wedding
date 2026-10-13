# 05 — RSVP via Google Form

There is no custom RSVP backend, workbook, admin, or submission API. Google
Forms owns fields, validation, submission, confirmation, and all responses.

## Integration

- Config: `RSVP_FORM` (`linkUrl`, `embedUrl`) in `src/config/site.js`. Update the
  URLs there only — never scatter form URLs through components.
- Section: iframe embed (`RSVP_FORM.embedUrl`, height 1029, lazy) + “Open RSVP
  Form” button (`target="_blank"`) as fallback.
- Never rebuild Form fields in HTML. Never fake a submission confirmation.
- Never scrape responses, never embed a response spreadsheet, never expose
  response data or account credentials.

## Form configuration (owner's Google account)

- Responses tab + linked Sheet + email notifications: the couple's admin.
- Suggested fields: guest full name (required), attendance, companion 1/2,
  message. Companion rule if kept: guest 2 requires guest 1.
- Branching suggestion: decline answers jump straight to Submit.
- Keep the unlock-code concept OUT: there is no on-site code anymore. If the
  Form text mentions a site code, remove it.

## Explicitly out of scope

No email receipts from the site. No guest-list verification. No access gate:
all page content is public, so nothing here proves who submitted what.
