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
/** File names in a directory — lets asset checks prove the files are on disk. */
const files = (...p) => fs.readdirSync(path.join(root, ...p)).join('\n')

const app = read('src', 'App.jsx')
const stage = read('src', 'components', 'ProgramStage.jsx')
const gate = read('src', 'components', 'AccessGate.jsx')
const envelope = read('src', 'components', 'EnvelopeReveal.jsx')
const chrome = read('src', 'components', 'chrome.jsx')
const download = read('src', 'components', 'DownloadSection.jsx')
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
  ['date and venue set bold', styles, '.portrait-sec .sec-sub {\n  font-size: var(--date-size);\n  font-weight: 700;'],
  ['hero date set bold', styles, '.hero-date {\n  display: inline-flex;\n  align-items: center;\n  gap: 9px;\n  font-size: var(--date-size);\n  font-weight: 700;'],
  ['wedding date is one size everywhere', styles, '--date-size: 20px'],
  ['hero scroll line', app, 'Scroll down'],
  ["couple's own portrait", site, "heroPortrait: '/images/main.jpg'"],
  ['portrait file is on disk', files('public', 'images'), 'main.jpg'],

  /* ---- the couple's wedding timeline, under the portrait ---- */
  ["timeline image is wired in the config", program, "timeline: '/images/wedding-timeline.jpg'"],
  ['timeline file is on disk', files('public', 'images'), 'wedding-timeline.jpg'],
  ['portrait section shows the timeline strip', app, 'timeline-strip'],
  ['timeline is not shown twice', app, '___absent:WEDDING TIMELINE___'],
  ['no fact pills under the portrait', app + styles, '___absent:portrait-meta___'],

  /* ---- announcement (Sections 7): removed by the owner ---- */
  ['no announcement heading', stage, '___absent:TWO HEARTS___'],
  ['no join-us line', stage, '___absent:Join us as we say___'],
  ['no announcement section', stage, '___absent:id="music"___'],
  ['no in-details curtain', stage + styles, '___absent:curtain-panel___'],
  ['no reveal copy block', stage, '___absent:curtain-reveal___'],
  ['no gramophone card', stage + styles, '___absent:gramo-card___'],
  ['no songs-of-love label', stage, '___absent:Songs of love___'],

  /* ---- RSVP (Section 8): one Google Form, offered from the gate ---- */
  ['deadline on the gate', gate, 'SITE.rsvpDeadline'],
  ['deadline exact', site, 'Please Respond before November 15, 2026'],
  ['form link', site, 'https://forms.gle/Nq1jWqWfMTg4eYa98'],
  ['no rsvp section in the invitation', app, '___absent:id="rsvp"___'],
  ['no embedded form frame', app + gate, '___absent:docs.google.com___'],
  ['no custom submission code', app + gate, '___absent:fetch(___'],

  /* ---- access gate (Section 8a): courtesy screen, never claimed as protection --- */
  ['gate is the first view', app, 'if (!unlocked) return <AccessGate'],
  ['gate component exists', gate, 'ACCESS.code'],
  ['gate sends guests to the form', gate, 'RSVP_FORM.linkUrl'],
  ['gate form opens a new tab', gate, 'target="_blank"'],
  ['gate attendance line', site, 'Please confirm your attendance on our Wedding Day'],
  ['gate code step line', site, 'Enter the code you receive'],
  ['gate shows no numbered badges', gate + styles, '___absent:gate-step-badge___'],
  ['gate shows no crest ring', gate + styles, '___absent:gate-crest___'],
  ['gate shows no kicker', gate + styles, '___absent:gate-kicker___'],
  ['gate code label is hidden', gate, 'aria-label={ACCESS.codeLabel}'],
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
  ['venue names set bold and one size up', styles, '.venue-name {\n  font-family: var(--font-serif);\n  font-size: 20px;\n  font-weight: 700;'],
  ['map sits in the gold frame', stage, 'map-frame'],
  ['map is embedded', stage, 'map-embed'],
  ['light sweep on the frame', styles, 'map-shine'],
  ['no mirror left in the markup', stage, '___absent:mirror___'],
  ['programme photo slot is wired', stage, 'programmeShot'],
  ['programme photo comes from config', program, 'programme:'],

  /* ---- countdown + calendar (Section 12) ---- */
  ['days', app, 'Days'],
  ['hours', app, 'Hours'],
  ['minutes', app, 'Minutes'],
  ['seconds', app, 'Seconds'],
  ['november 2026', app, 'November 2026'],
  ['nov 30 highlight', app, 'cal-day hl'],
  ['calendar note', app, 'Save the date'],
  ['manila target', site, '2026-11-30T06:30:00+08:00'],
  ['post-event state', app, 'Just married'],
  ['no negative countdown', app, 'Math.max(0, target - now)'],

  /* ---- entourage (Section 13, locked order) ---- */
  ['entourage heading', app, 'The Entourage'],
  ['to assist', app, 'To assist us in our needs'],
  ['entourage sits in one gold frame', app, '<GoldFrame className="ent-frame">'],
  ['entourage frame carries the sweep', styles, 'ent-shine'],
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
  ['story copy present', program, 'Nagkakilala kami sa isang Leadership Training'],
  ['no placeholder story comes back', program, '___absent:Two souls, two paths___'],
  ['no temporary notes in the UI', app + program + stage, '___absent:Temporary___'],
  ['no placeholder labels in the UI', app + program, '___absent:image placeholder___'],
  ['film strip', app, 'film-track'],

  /* ---- details (Section 15, verbatim) ---- */
  ['details heading', app, 'The Wedding Details'],
  ['attire heading', app, 'ATTIRE GUIDE'],
  ['attire copy', app, "We would be honored if you could join us in your best attire. Let's make our special day more memorable in these colors."],
  ['attire colour sky blue', app, 'Sky Blue'],
  ['attire colour gray', app, 'Gray'],
  ['attire colour champagne', app, 'Champagne'],
  ['attire colour dusty pink', app, 'Dusty Pink'],
  ['attire legend swatch is styled', styles, '.floral-legend .sky i'],
  ['no midnight in the attire legend', app, '___absent:>Midnight<___'],
  ['no navy in the attire legend', app, '___absent:>Navy<___'],
  ['no white in the attire legend', app, '___absent:>White<___'],
  ['no gold in the attire legend', app, '___absent:>Gold<___'],
  ['gift heading', app, 'GIFT GUIDE'],
  ['gift copy', app, "With all that we have, we've been blessed."],
  ['gift QR row is wired', app, 'className="qr-row"'],
  ['gift QR codes are local files', program, '/images/gift-qr/gcash.jpg'],
  ['gift QR codes are labelled', program, "label: 'China Bank'"],
  ['every gift code is on disk', files('public', 'images', 'gift-qr'), 'maribank.jpg'],
  ['gift codes open full size', app, 'className="qr-tap"'],
  ['full preview is a modal', app, '<QrLightbox'],
  ["attire guide is the couple's sheet", program, '/images/attire/attire.jpg'],
  ['attire guide is never cropped', styles, 'object-fit: contain'],
  ['attire guide file is on disk', files('public', 'images', 'attire'), 'attire.jpg'],
  ['reminder heading', app, 'REMINDER'],
  ['with respect', app, 'With Respect'],
  ['adult only', app, 'adult-only occasion'],
  ['chrysanthemum', read('src', 'components', 'Floral.jsx'), 'Chrysanthemum'],
  ['lilac', read('src', 'components', 'Floral.jsx'), 'Lilac'],

  /* ---- hashtag (Section 16, exact) ---- */
  ['hashtag exact', program, '#NaKHATitiyakNaKayHARTH'],
  ['hashtag signature styling', styles, '.hashtag'],
  ['gallery heading is bare', app, '<SectionHeading kicker="A glimpse of us" title="Forever Starts Now" />'],
  ['gallery kicker set bold', styles, '.gallery-sec .sec-kicker {\n  font-weight: 700;'],
  ['hashtag rides on the photographs', app, 'className="hashtag"'],
  ['slideshow is the couple\'s photoshoot', program, "'/images/photoshoot/0A4A7953.jpg'"],
  ['film strip is the same shoot', program, 'strip: ['],
  ['photo originals are not deployed', read('.gitignore'), 'assets-originals/'],
  ['no stock photography left', site + program, '___absent:images.unsplash.com___'],

  /* ---- music: the couple's 2 local tracks (Section 10) ---- */
  ['default track', site, 'Pahintulot'],
  ['track 2', site, 'Paninindigan kita'],
  ['only two tracks', site, '___absent:feeling-good___'],
  ['no demo streams', site + app + stage, '___absent:soundhelix___'],
  ['no fallback audio map', site, '___absent:FALLBACK_AUDIO___'],
  ['player serves local files', app, 'music/${SONGS[songIdx].file}'],
  ['player offers song selection', chrome, 'mb-menu'],
  ['player is the only player', app, 'onSelectSong={selectSong}'],

  /* ---- envelope reveal: post-code velvet opening (Section 10b) ---- */
  ['envelope mounts on fresh unlock', app, 'startWithEnvelope'],
  ['envelope component exists', envelope, 'envelope-flap'],
  ['envelope is real 3D', styles + envelope, 'preserve-3d'],
  ['envelope flap is gold tipped', styles, '.envelope-flap-rim'],
  ['envelope keeps the gold sweep', styles, 'envelope-sheen'],
  ['front page rides in the envelope', envelope, 'envelope-letter'],
  ['front page matches the hero', envelope, 'hero-card envelope-card'],
  ['page lands on the measured hero', envelope, '#top .hero-card'],
  ['music starts with the opening', app, 'onBeginOpening={play}'],
  ['envelope overlay styles', styles, '.envelope-layer'],
  ['reduced-motion skips the envelope', envelope, 'REDUCED'],
  ['envelope only arms on code entry', app, 'setFreshEntry(true)'],

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

  /* ---- downloads (last section) ---- */
  ['download section is mounted', app, '<DownloadSection />'],
  ['download section has its anchor', download, 'id="downloads"'],
  ['download section title', download, 'Download Soft Copies'],
  ['download option for the programs', download, 'Download Wedding Programs'],
  ['download option for the invitation cards', download, 'Download Invitation Cards'],
  ['download sets live in the config', program, 'export const DOWNLOADS'],
  ['program leaves are listed', program, '/images/program/wedding-ceremony.jpg'],
  ['invitation cards are listed', program, '/images/invitation/image-8.jpg'],
  ['program leaves are on disk', files('public', 'images', 'program'), 'wedding-ceremony.jpg'],
  ['reception program is on disk', files('public', 'images', 'program'), 'wedding-reception.jpg'],
  ['invitation cards are on disk', files('public', 'images', 'invitation'), 'image-1.jpg'],
  ['the last invitation card is on disk', files('public', 'images', 'invitation'), 'image-8.jpg'],

  /* ---- no backend (Sections 8/9/18) ---- */
  ['no api calls in frontend', app + stage, '___absent:/api/___'],
  ['no guest sessions in frontend', app, '___absent:hk_guest___'],
  ['no program gate', app, '___absent:program-gate___'],
  ['no wax seal', envelope + styles, '___absent:wax___'],
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
