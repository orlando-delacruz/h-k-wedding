/**
 * Verifies the master luxury-invitation spec against the live sources.
 * All content is public; there is no backend, no gate, no custom RSVP.
 * Usage: node scripts/verify-spec.mjs
 */
import fs from 'fs'
import path from 'path'

const root = process.cwd()
const read = (...p) => fs.readFileSync(path.join(root, ...p), 'utf8')
const exists = (...p) => fs.existsSync(path.join(root, ...p))

const app = read('src', 'App.jsx')
const stage = read('src', 'components', 'ProgramStage.jsx')
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

  /* ---- announcement (Section 7, verbatim) ---- */
  ['two hearts', stage, 'TWO HEARTS. ONE LOVE. ONE JOURNEY.'],
  ['join us', stage, 'Join us as we say ‘I do.’'],
  ['names reveal', stage, 'Khatrina'],
  ['reveal date', stage, 'November 30, 2026 · 6:30 AM'],

  /* ---- RSVP embed (Section 8) ---- */
  ['rsvp heading', app, 'title="RSVP"'],
  ['deadline', site, 'PLEASE RESPOND BY NOVEMBER 15, 2026'],
  ['form link', site, 'https://forms.gle/Nq1jWqWfMTg4eYa98'],
  ['form embed url', site, 'docs.google.com/forms/d/e/1FAIpQLSd1kdBdnjrrrHBmfB_AJOQYCWqsZAZBW0TLLK-5HkbnuHMYfA/viewform?embedded=true'],
  ['form iframe', app, '<iframe'],
  ['form iframe src', app, 'RSVP_FORM.embedUrl'],
  ['fallback link', app, 'Open RSVP Form'],
  ['fallback new tab', app, 'target="_blank"'],

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

  /* ---- story (Section 14: placeholder, never invented) ---- */
  ['story placeholder marked', program, 'Temporary sample text'],
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

  /* ---- music (Section 10) ---- */
  ['default track', site, 'Pahintulot'],
  ['track 2', site, 'Paninindigan kita'],
  ['track 3', site, 'Feeling good'],
  ['gramophone', stage, 'gramo-card'],

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
