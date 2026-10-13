// Client-side configuration for the PUBLIC invitation site.
// All content is public; the access gate is a courtesy screen, not access control.

export const SITE = {
  dateISO: '2026-11-30T06:30:00+08:00',
  dateLabel: 'November 30, 2026',
  timeLabel: '6:30 AM',
  hashtag: '#NaKHATitiyakNaKayHARTH',
  rsvpDeadline: 'PLEASE RESPOND BY NOVEMBER 15, 2026',
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

const un = (id) => `https://images.unsplash.com/${id}?q=80&w=1200&auto=format&fit=crop`

// Photographs that appear on the PUBLIC page. All are temporary stock imagery,
// clearly labelled in the interface, and replaced when the couple supplies photos.
export const PHOTOS = {
  heroPortrait: un('photo-1519741497674-611481863552'),
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
  kicker: 'Kindly respond first',
  sub: 'Our RSVP form shares the access code that opens the full invitation.',
  formButton: 'Open the RSVP form',

  codeLabel: 'Access code',
  codeButton: 'Open our invitation',
  codeError: 'That code does not match. Please check it and try again.',
}
