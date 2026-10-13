/**
 * Verifies the master luxury-invitation spec against the live sources.
 * All content is public; there is no backend, no admin and no custom RSVP.
 * The access gate is a courtesy screen, not access control.
 * Usage: node scripts/verify-spec.mjs
 */
import fs from 'fs'
import path from 'path'

const root = process.cwd()
const read = (...p) => fs.readFileSync(path.join(root, ...p), 'utf8')
const exists = (...p) => fs.existsSync(path.join(root, ...p))

const app = read('src', 'App.jsx')
const stage = read('src', 'components', 'ProgramStage.jsx')
const gate = read('src', 'components', 'AccessGate.jsx')
const entry = read('src', 'components', 'EntryCurtain.jsx')
const chrome = read('src', 'components', 'chrome.jsx')
const site = read('src', 'config', 'site.js')
const ent = read('src', 'config', 'entourage.js')
const program = read('src', 'config', 'program.js')
const styles = read('src', 'styles.css')
const html = read('index.html')
const vercel = read('vercel.json')
const pkg = read('package.json')

const checks = [
  /* ---- invitation card copy (Section 5, verbatim) ---- */
  ['hero kicker', app, 'TO A LOVE THAT WILL LAST A LIFETIME'],
  ['invite line', app, 'we invite you to celebrate with us'],
  ['groom name', app, 'Harthwel'],
  ['bride name', app, 'Khatrina'],
  ['hero copy', app, "Two hearts, one promise, and a lifetime to share. We would love for you to be part of this special moment as we say 'I do'"],
  ['hero date', app, 'November 30, 2026'],

  /* ---- couple intro (Section 6) ---- */
  ['the wedding of', app, 'The wedding of'],
  ['intro sub', app, 'November 30, 2026 · Girasoles Farm'],

  /* ---- announcement (Section 7) ---- */
  ['two hearts', stage, 'TWO HEARTS. ONE LOVE. ONE JOURNEY.'],
  ['join us', stage, 'Join us as we say ‘I do.’'],
  ['no in-details curtain', stage + styles, '___absent:curtain-panel___'],
  ['no reveal copy block', stage, '___absent:curtain-reveal___'],
  ['no gramophone card', stage + styles, '___absent:gramo-card___'],
  ['no songs-of-love label', stage, '___absent:Songs of love___'],

  /* ---- RSVP (Section 8): one Google Form, offered from the gate ---- */
  ['deadline on the gate', gate, 'SITE.rsvpDeadline'],
  ['deadline exact', site, 'PLEASE RESPOND BY NOVEMBER 15, 2026'],
  ['form link', site, 'https://forms.gle/Nq1jWqWfMTg4eYa98'],
  ['no rsvp section in the invitation', app, '___absent:id="rsvp"___'],
  ['no embedded form frame', app + gate, '___absent:docs.google.com___'],
  ['no custom submission code', app + gate, '___absent:fetch(___'],

  /* ---- access gate (Section 8a): courtesy screen, never claimed as protection --- */
  ['gate is the first view', app, 'if (!unlocked) return <AccessGate'],
  ['gate component exists', gate, 'ACCESS.code'],
  ['gate sends guests to the form', gate, 'RSVP_FORM.linkUrl'],
  ['gate form opens a new tab', gate, 'target="_blank"'],
  ['gate code lives in config', site, 'code:'],
  ['gate code comes from the environment', site, 'import.meta.env.VITE_ACCESS_CODE'],
  ['gate code is documented', read('.env.example'), 'VITE_ACCESS_CODE'],
  ['gate names use the script font', styles, '.gate-names'],
  ['gate light-sweep on the gold frame', styles, 'gate-card'],
  ['gate remembers the unlock', app, 'localStorage.setItem(STORE_KEY'],
  ['stored code is re-checked on load', app, 'saved.toUpperCase() === ACCESS.code.toUpperCase()'],
  ['gate keeps no session storage', gate + app, '___absent:sessionStorage___'],
  ['gate claims no privacy', gate, '___absent:private___'],
  ['gate claims no security', gate, '___absent:secure___'],

  /* ---- venues (Section 11) ---- */
  ['ceremony title', program, 'Wedding Ceremony Venue'],
  ['ceremony name', program, 'Girasoles Farm Candelaria'],
  ['reception title', program, 'Reception Venue'],
  ['reception display name', program, "Bride's Residence Sittio Bibingkahan Concepcion Uno Sariaya Quezon"],
  ['reception address spelling', program, 'Sitio Bibingkahan'],
  ['mirror frames', stage, 'mirror-face'],
  ['light sweep on mirrors', styles, 'mirrorSweep'],

  /* ---- countdown + calendar (Section 12) ---- */
  ['days', app, 'Days'],
  ['hours', app, 'Hours'],
  ['minutes', app, 'Minutes'],
  ['seconds', app, 'Seconds'],
  ['november 2026', app, 'November 2026'],
  ['nov 30 highlight', app, 'cal-day hl'],
  ['manila target', site, '2026-11-30T06:30:00+08:00'],
  ['post-event state', app, 'Just married'],
  ['no negative countdown', app, 'Math.max(0, target - now)'],

  /* ---- entourage (Section 13, locked order) ---- */
  ['entourage heading', app, 'The Entourage'],
  ['to assist', app, 'To assist us in our needs'],
  ['principal sponsors', app, 'PRINCIPAL SPONSORS'],
  ['secondary sponsors', app, 'SECONDARY SPONSORS'],
  ['best man', ent, 'Janrey Colimbino'],
  ['maid of honor', ent, 'Maria Geselle Silang'],
  ['groom parents', ent, 'George B. Ilustre & Brien R. Ilustre'],
  ['bride parents', ent, 'Simplicio A. Silang & Romarica B. Silang'],
  ['sponsor pair 1', ent, 'Mr. Edwin De La Rosa & Mrs. Maritoni De La Rosa'],
  ['sponsor pair 15', ent, 'Mr. Rhomel Bautista & Mrs. Maria Lean Bautista'],
  ['pair 1 groomsman', ent, 'Joven Pala'],
  ['pair 1 bridesmaid', ent, 'Nicole Silang'],
  ['pair 14 groomsman', ent, 'Jessie Opalda'],
  ['pair 14 bridesmaid', ent, 'Shella Labalan'],
  ['little bride', ent, 'Graceharth Ilustre'],
  ['little groom', ent, 'Daaron Mathise Silang'],
  ['flower girl', ent, 'Beryl Amber Vibas'],
  ['bible bearer', ent, 'Athan Kirch Marin'],
  ['covenant bearer', ent, 'Francis Rhyme Carabuena'],

  /* ---- story (Section 14) ---- */
  ['story copy present', program, 'Two souls, two paths, one promise.'],
  ['no temporary notes in the UI', app + program + stage, '___absent:Temporary___'],
  ['no placeholder labels in the UI', app + program, '___absent:image placeholder___'],
  ['film strip', app, 'film-track'],

  /* ---- details (Section 15, verbatim) ---- */
  ['details heading', app, 'The Wedding Details'],
  ['attire heading', app, 'ATTIRE GUIDE'],
  ['attire copy', app, "We would be honored if you could join us in your best attire. Let's make our special day more memorable in these colors."],
  ['timeline heading', app, 'WEDDING TIMELINE'],
  ['gift heading', app, 'GIFT GUIDE'],
  ['gift copy', app, "With all that we have, we've been blessed."],
  ['reminder heading', app, 'REMINDER'],
  ['with respect', app, 'With Respect'],
  ['adult only', app, 'adult-only occasion'],
  ['chrysanthemum', read('src', 'components', 'Floral.jsx'), 'Chrysanthemum'],
  ['lilac', read('src', 'components', 'Floral.jsx'), 'Lilac'],

  /* ---- hashtag (Section 16, exact) ---- */
  ['hashtag exact', program, '#NaKHATitiyakNaKayHARTH'],
  ['hashtag signature styling', styles, '.hashtag'],

  /* ---- music: the couple's 2 local tracks (Section 10) ---- */
  ['default track', site, 'Pahintulot'],
  ['track 2', site, 'Paninindigan kita'],
  ['only two tracks', site, '___absent:feeling-good___'],
  ['no demo streams', site + app + stage, '___absent:soundhelix___'],
  ['no fallback audio map', site, '___absent:FALLBACK_AUDIO___'],
  ['player serves local files', app, 'music/${SONGS[songIdx].file}'],
  ['player offers song selection', chrome, 'mb-menu'],
  ['player is the only player', app, 'onSelectSong={selectSong}'],

  /* ---- entry curtain: post-code velvet reveal (Section 10b) ---- */
  ['entry curtain mounts on fresh unlock', app, 'startWithCurtain'],
  ['entry curtain component exists', entry, 'entry-panel'],
  ['music starts with the opening', app, 'onBeginOpening={play}'],
  ['entry overlay styles', styles, '.entry-curtain'],
  ['entry panels styled', styles, '.entry-panel'],
  ['reduced-motion skips the entry curtain', entry, 'REDUCED'],
  ['curtain only arms on code entry', app, 'setFreshEntry(true)'],

  /* ---- approved fonts only (Section 4) ---- */
  ['pinyon script loaded', html, 'Pinyon+Script'],
  ['cormorant loaded', html, 'Cormorant+Garamond'],
  ['script token is pinyon', styles, '"Pinyon Script"'],
  ['no montserrat in page', html + styles, '___absent:Montserrat___'],

  /* ---- palette (Section 3) ---- */
  ['velvet midnight', styles, '#101D36'],
  ['velvet navy', styles, '#192A46'],
  ['antique gold', styles, '#8D6710'],
  ['gold highlight', styles, '#F5D76E'],
  ['gold shine animation', styles, '@keyframes shine'],
  ['reduced motion guard', styles, 'prefers-reduced-motion'],
  ['focus visible', styles, 'focus-visible'],
  ['metallic gradient', styles, '--grad-gold'],

  /* ---- no backend, no gate, no envelope (Sections 8/9/18) ---- */
  ['no api calls in frontend', app + stage, '___absent:/api/___'],
  ['no guest sessions in frontend', app, '___absent:hk_guest___'],
  ['no program gate', app, '___absent:program-gate___'],
  ['no envelope intro', app, '___absent:Intro___'],
  ['vercel is static only', vercel, '___absent:/api/___'],
  ['no server deps', pkg, '___absent:express___'],
  ['no excel dep', pkg, '___absent:exceljs___'],
]

const absentFiles = [
  ['no server dir', 'server'],
  ['no api dir', 'api'],
  ['no backend workbook', 'server/workbook.js'],
  ['no intro component', 'src/components/Intro.jsx'],
  ['no frontend api helper', 'src/api.js'],
  ['no admin component', 'src/components/Admin.jsx'],
  ['no supabase client', 'src/lib/supabase.js'],
  ['no rsvp api layer', 'src/lib/rsvpApi.js'],
  ['no supabase project dir', 'supabase'],
]

let fails = []
for (const [name, src, needle] of checks) {
  if (needle.startsWith('___absent:')) {
    const token = needle.slice('___absent:'.length, -3)
    if (src.includes(token)) fails.push(`${name} :: must not contain ${token}`)
  } else if (!src.includes(needle)) {
    fails.push(`${name} :: ${needle}`)
  }
}
for (const [name, p] of absentFiles) if (exists(p)) fails.push(`${name} :: ${p} still exists`)

console.log(`Spec checks: ${checks.length + absentFiles.length - fails.length}/${checks.length + absentFiles.length} passed`)
if (fails.length) {
  console.log('\nMISSING:')
  fails.forEach((f) => console.log(' -', f))
  process.exit(1)
}
