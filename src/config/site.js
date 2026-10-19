// Client-side configuration for the PUBLIC invitation site.
// All content is public; the access gate is a courtesy screen, not access control.

export const SITE = {
  dateISO: '2026-11-30T06:30:00+08:00',
  dateLabel: 'November 30, 2026',
  timeLabel: '6:30 AM',
  hashtag: '#NaKHATitiyakNaKayHARTH',
  // Rendered bold under the Form button on the gate (owner wording, docs/03).
  rsvpDeadline: 'Please Respond before November 15, 2026',
}

// Venue names, addresses and map links live in `program.js` (the Venues section
// renders them once, with mirror-framed maps). Never duplicate them here.

// Song catalogue. The couple's files live in public/music/ and ship with the
// site; the player streams them from /music/<file>. Only these 2 tracks exist,
// and the first one is the default.
export const SONGS = [
  { id: 'pahintulot', title: 'Pahintulot', file: 'pahintulot.mp3' },
  { id: 'paninindigan', title: 'Paninindigan kita', file: 'paninindigan-kita.mp3' },
]

// Photographs that appear on the PUBLIC page. `main.jpg` is the couple's own
// portrait (beside the hero); the pre-wedding photoshoot fills the film strip and
// the closing slideshow. All served from `public/images/` — swap a path only.
// The full-resolution originals live in `assets-originals/` (git-ignored); the
// files under `public/` are web-sized copies (1200–1400px, ~80% quality).
export const PHOTOS = {
  heroPortrait: '/images/main.jpg',
}

// RSVP — the Google Form owns fields, validation, submission and every response
// (docs/05). The site never rebuilds the form, never stores a response, and
// never reads one back.
export const RSVP_FORM = {
  linkUrl: 'https://forms.gle/Nq1jWqWfMTg4eYa98',
}

// Courtesy gate: guests answer the Form, the confirmation shares the code, and
// the code opens the full invitation. The code is NOT a secret — it ships to the
// browser with the page, so it keeps polite guests out, not determined ones.
// Set the real code in `VITE_ACCESS_CODE` (.env locally, Vercel for production);
// the fallback below keeps the site usable when the variable is missing.
// TEMPORARY wording: the couple confirms the final sentences (docs/07).
const FALLBACK_ACCESS_CODE = 'HARTHWEL2026'

export const ACCESS = {
  code: (import.meta.env.VITE_ACCESS_CODE || '').trim() || FALLBACK_ACCESS_CODE,
  sub: 'Our RSVP form shares the access code that opens the full invitation.',
  formButton: 'Open the RSVP form',

  // Gate copy — the owner's final sentences (no kicker, no step numbers).
  attendanceTitle: 'Please confirm your attendance on our Wedding Day',
  codeTitle: 'Enter the code you receive',

  // Kept as the input's accessible name only; the gate shows no label text.
  codeLabel: 'Access code',
  codeButton: 'Open our invitation',
  codeError: 'That code does not match. Please check it and try again.',
}
