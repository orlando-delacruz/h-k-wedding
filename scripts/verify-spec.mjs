/**
 * Verifies every locked string from the master specification against the live sources.
 * Public copy lives in src/, protected programme copy lives in server/program.js.
 * Usage: node scripts/verify-spec.mjs
 */
import fs from 'fs'
import path from 'path'

const root = process.cwd()
const read = (...p) => fs.readFileSync(path.join(root, ...p), 'utf8')

const app = read('src', 'App.jsx')
const stage = read('src', 'components', 'ProgramStage.jsx')
const site = read('src', 'config', 'site.js')
const ent = read('src', 'config', 'entourage.js')
const program = read('server', 'program.js')
const server = read('server', 'app.js')
const storageSrc = read('server', 'storage.js')
const styles = read('src', 'styles.css')
const html = read('index.html')

const checks = [
  /* ---- 5. Opening invitation ---- */
  ['hero kicker', app, 'TO A LOVE THAT WILL LAST A LIFETIME'],
  ['invite line', app, 'we invite you to celebrate with us'],
  ['couple names', app, 'Harthwel'],
  ['couple names 2', app, 'Khatrina'],
  ['hero copy', app, "Two hearts, one promise, and a lifetime to share. We would love for you to be part of this special moment as we say 'I do'"],

  /* ---- 6. Couple introduction ---- */
  ['the wedding of', app, 'The wedding of'],
  ['intro sub', app, 'November 30, 2026 · Girasoles Farm'],

  /* ---- 7. RSVP ---- */
  ['rsvp heading', app, 'title="RSVP"'],
  ['deadline', site, 'PLEASE RESPOND BY NOVEMBER 15, 2026'],
  ['name placeholder', app, 'Enter your name...'],
  ['accept button', app, "YES I'M GOING TO ATTEND!"],
  ['decline button', app, 'SORRY, I HAVE SOMETHING TO DO'],
  ['additional guests', app, 'Additional Guests'],
  ['companions note', app, 'You can bring 1 or 2 companions'],
  ['guest 1 label', app, 'Guest 1:'],
  ['guest 2 label', app, 'Guest 2'],
  ['full name placeholder', app, 'placeholder="full name"'],
  ['message label', app, 'Leave a message for the couple'],
  ['message placeholder', app, 'Express your heartfelt message here...'],
  ['back button', app, 'Back'],
  ['send button', app, 'Send RSVP'],

  /* ---- 10. Reveal content ---- */
  ['two hearts', stage, 'TWO HEARTS. ONE LOVE. ONE JOURNEY.'],
  ['join us', stage, 'Join us as we say ‘I do.’'],
  ['reveal date', stage, 'November 30, 2026 · 6:30 AM'],

  /* ---- 11. Venues ---- */
  ['ceremony title', program, 'Wedding Ceremony Venue'],
  ['ceremony name', program, 'Girasoles Farm Candelaria'],
  ['reception title', program, 'Reception Venue'],
  ['reception name', program, "Bride's Residence Sittio Bibingkahan Concepcion Uno Sariaya Quezon"],
  ['ceremony address', program, 'Girasoles Farm, Candelaria, Quezon, Philippines'],
  ['reception address', program, "Bride's Residence, Sitio Bibingkahan, Concepcion Uno, Sariaya, Quezon, Philippines"],
  ['public ceremony name', site, 'Girasoles Farm Candelaria'],
  ['public reception name', site, "Bride's Residence Sittio Bibingkahan Concepcion Uno Sariaya Quezon"],

  /* ---- 12. Countdown + calendar ---- */
  ['days', app, 'Days'],
  ['hours', app, 'Hours'],
  ['minutes', app, 'Minutes'],
  ['seconds', app, 'Seconds'],
  ['november 2026', app, 'November 2026'],
  ['nov 30 gold circle', app, 'cal-day hl'],
  ['manila target', site, '2026-11-30T06:30:00+08:00'],
  ['post-event state', app, 'Just married'],

  /* ---- 13. Entourage ---- */
  ['entourage heading', app, 'The Entourage'],
  ['to assist', app, 'To assist us in our needs'],
  ['principal sponsors', app, 'PRINCIPAL SPONSORS'],
  ['secondary sponsors', app, 'SECONDARY SPONSORS'],
  ['best man role', ent, 'BEST MAN'],
  ['best man name', ent, 'Janrey Colimbino'],
  ['maid of honor role', ent, 'MAID OF HONOR'],
  ['maid of honor name', ent, 'Maria Geselle Silang'],
  ['parents of the groom', ent, 'George B. Ilustre & Brien R. Ilustre'],
  ['parents of the bride', ent, 'Simplicio A. Silang & Romarica B. Silang'],
  ['sponsor 1', ent, 'Mr. Edwin De La Rosa & Mrs. Maritoni De La Rosa'],
  ['sponsor 8', ent, 'Mr. Florante An & Mrs. Marjorie Aguilar'],
  ['sponsor 15', ent, 'Mr. Rhomel Bautista & Mrs. Maria Lean Bautista'],
  ['groomsman 1', ent, 'Joven Pala'],
  ['bridesmaid 1', ent, 'Nicole Silang'],
  ['groomsman 7', ent, 'Mopera Xyrille Markney'],
  ['bridesmaid 7', ent, 'Jemaica Alvarez'],
  ['groomsman 14', ent, 'Jessie Opalda'],
  ['bridesmaid 14', ent, 'Shella Labalan'],
  ['little bride', ent, 'Graceharth Ilustre'],
  ['little groom', ent, 'Daaron Mathise Silang'],
  ['flower girl 1', ent, 'Beryl Amber Vibas'],
  ['flower girl 4', ent, 'Nathalie Mae Yocte'],
  ['bible bearer', ent, 'Athan Kirch Marin'],
  ['covenant bearer', ent, 'Francis Rhyme Carabuena'],

  /* ---- 14. Our story ---- */
  ['film strip markup', app, 'film-track'],
  ['story card markup', app, 'story-card'],
  ['sample story marked temporary', program, 'Temporary sample text'],
  ['story supplied by server', program, 'Two souls, two paths, one promise'],

  /* ---- 15. Wedding details ---- */
  ['details heading', app, 'The Wedding Details'],
  ['attire guide', app, 'ATTIRE GUIDE'],
  ['attire copy', app, "We would be honored if you could join us in your best attire. Let's make our special day more memorable in these colors."],
  ['timeline', app, 'WEDDING TIMELINE'],
  ['timeline placeholder', app, 'Timeline image placeholder'],
  ['gift guide', app, 'GIFT GUIDE'],
  ['gift copy', app, "With all that we have, we've been blessed. Your presence is our greatest gift. Should you wish to contribute further, a gift of cash towards our future together would be deeply appreciated."],
  ['reminder heading', app, 'REMINDER — “With Respect”'],
  ['adult only copy', app, 'While we love your little ones, we have decided to have our wedding be an adult-only occasion. We hope this advance notice means you are still able to share our big day!'],
  ['arrive copy', app, "Please arrive by exact time so you're seated and ready before the ceremony begins"],
  ['phones copy', app, 'We invite you to be fully present with us during our ceremony. Please silence and put away phones and cameras - we promise our photographer has it covered!'],
  ['shades copy', app, "We can't wait to see everyone dressed up! We simply ask that shades of white, ivory, and cream be saved for the bride."],
  ['surprise copy', app, "Please help us keep the surprise! We ask that you refrain from posting photos of the bride and groom on social media until we've shared our first photos"],
  ['floral frame varieties', read('src', 'components', 'Floral.jsx'), 'Chrysanthemum'],
  ['lilac variety', read('src', 'components', 'Floral.jsx'), 'Lilac'],

  /* ---- 16. Final slideshow ---- */
  ['hashtag', program, '#NaKHATitiyakNaKayHARTH'],
  ['slideshow element', app, 'slideshow'],
  ['crossfade transition', styles, 'transition: opacity'],
  ['kenburns zoom', styles, 'kenburns'],

  /* ---- 3. Design system ---- */
  ['midnight blue', styles, '#10182B'],
  ['navy blue', styles, '#172746'],
  ['champagne gold', styles, '#D6B46A'],
  ['deep gold', styles, '#A77A30'],
  ['soft gold highlight', styles, '#F4DF9A'],
  ['light neutral', styles, '#FAF9F6'],
  ['cormorant garamond', html, 'Cormorant+Garamond'],
  ['montserrat', html, 'Montserrat'],
  ['allura', html, 'Allura'],
  ['gold shine animation', styles, '@keyframes shine'],
  ['static fallback for reduced motion', styles, 'prefers-reduced-motion'],
  ['focus-visible outlines', styles, 'focus-visible'],
  ['no flat yellow gold', styles, '--grad-gold'],

  /* ---- 17-19. Server behaviour ---- */
  ['workbook sheet name', server + read('server', 'workbook.js'), 'RSVP Responses'],
  ['settings sheet', read('server', 'workbook.js'), 'Settings'],
  ['submission id column', read('server', 'workbook.js'), 'Submission ID'],
  ['party size column', read('server', 'workbook.js'), 'Party Size'],
  ['resolved by column', read('server', 'workbook.js'), 'Resolved By'],
  ['resolution timestamp column', read('server', 'workbook.js'), 'Resolution Timestamp'],
  ['conditional write retry in the workbook layer', read('server', 'workbook.js'), 'ifMatch: version'],
  ['conflict retry loop', read('server', 'workbook.js'), 'BlobPreconditionFailedError'],
  ['write serialization', read('server', 'workbook.js'), 'withLock'],
  ['no database service', server, '/api/rsvp'],
  ['admin credentials from env', server, 'ADMIN_EMAIL'],
  ['session cookie httpOnly', read('server', 'middleware.js'), 'HttpOnly'],
  ['sameSite policy', read('server', 'middleware.js'), 'SameSite'],
  ['secure flag in production', read('server', 'middleware.js'), 'Secure'],
  ['protected programme endpoint', server, '/api/program'],
  ['attending guard', server, 'requireAttendingGuest'],
  ['decline clears guest session', server, 'clearGuestSession'],
  ['origin guard', server, 'originGuard'],
  ['rate limiting', server, 'rateLimit'],
  ['rate limit reports a wait time', read('server', 'middleware.js'), 'retryAfterSeconds'],
  ['rate limit sends Retry-After', read('server', 'middleware.js'), "set('Retry-After'"],
  ['dev limits stay testable', server, 'DEV_MODE'],
  ['guest sees a usable rate-limit message', app, 'Too many submissions were sent just now'],
  ['startup config validation', server, 'configErrors'],
  ['constant-time credential compare', read('server', 'sessions.js'), 'timingSafeEqual'],
  ['single storage backend selector', storageSrc, 'usingBlob'],
  ['blob conditional write', storageSrc, 'ifMatch'],
  ['blob storage path is private', storageSrc, "access: 'private'"],
  ['no password hashing layer', server, 'verifyPlain'],
  ['vercel serverless entry point', read('api', 'index.js'), 'server/app.js'],
]

let fails = []
for (const [name, src, needle] of checks) if (!src.includes(needle)) fails.push(`${name} :: ${needle}`)

console.log(`Spec checks: ${checks.length - fails.length}/${checks.length} passed`)
if (fails.length) {
  console.log('\nMISSING:')
  fails.forEach((f) => console.log(' -', f))
  process.exit(1)
}
