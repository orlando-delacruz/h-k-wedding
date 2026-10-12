// Harthwel & Khatrina — RSVP + protected program API.
// Public: invitation, RSVP submission, venues/times, RSVP deadline.
// Private: RSVP records (admin) and the full wedding program (attending guests).
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import {
  appendRecord, findRecord, listRecords, updateRecordStatus, totals, storageDriver,
  describeWorkbook, hasWorkbook, manilaNow, REVIEW_STATUSES, WorkbookError,
} from './workbook.js'
import { PROGRAM } from './program.js'
import { safeEqual, verifyPlain, randomSecret } from './sessions.js'
import {
  COOKIE_ADMIN, COOKIE_GUEST, originGuard, rateLimit, issueGuestSession, guestSession,
  clearGuestSession, issueAdminSession, clearAdminSession, adminSession, requireAdmin,
  requireAttendingGuest, setCookie,
} from './middleware.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3001
const ORIGIN = process.env.SITE_ORIGIN || ''
const IS_PROD = process.env.NODE_ENV === 'production'

/* Tunable limits.
   Production defaults are strict. In development they are deliberately generous so
   local testing is never blocked — the mechanism is still active (and the test suite
   exercises it with an explicit small window). */
const DEV_MODE = process.env.NODE_ENV !== 'production'
const RSVP_RATE_MAX = Number(process.env.RSVPS_RATE_MAX || (DEV_MODE ? 500 : 12))
const RSVP_RATE_WINDOW_MS = Number(process.env.RSVPS_RATE_WINDOW_MS || 10 * 60 * 1000)
const AUTH_RATE_MAX = Number(process.env.AUTH_RATE_MAX || (DEV_MODE ? 200 : 10))
const AUTH_RATE_WINDOW_MS = Number(process.env.AUTH_RATE_WINDOW_MS || 10 * 60 * 1000)

const configErrors = []
if (!process.env.ADMIN_EMAIL) configErrors.push('ADMIN_EMAIL is not set')
if (!process.env.ADMIN_PASSWORD) configErrors.push('ADMIN_PASSWORD is not set')
else if (process.env.ADMIN_PASSWORD.length < 8) configErrors.push('ADMIN_PASSWORD must be at least 8 characters')
if (IS_PROD && !process.env.SESSION_SECRET) configErrors.push('SESSION_SECRET is required in production')
if (configErrors.length) {
  console.error('Server configuration error:')
  configErrors.forEach((e) => console.error('  -', e))
  console.error('Copy .env.example to .env and fill in the required values.')
  process.exit(1)
}

const SESSION_SECRET = process.env.SESSION_SECRET || randomSecret()
if (!process.env.SESSION_SECRET) {
  console.warn('[warn] SESSION_SECRET not set — a random one is used for this process. Sessions end on restart. Set it in .env for stable sessions.')
}

const ADMIN = { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD || '' }
const AUDIO_DIR = process.env.AUDIO_DIR || path.join(__dirname, '..', 'data', 'audio')

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)

app.use(originGuard(ORIGIN))
app.use(express.json({ limit: '16kb' }))
app.use(cors({ origin: ORIGIN || true, credentials: true }))

const authLimiter = rateLimit({ windowMs: AUTH_RATE_WINDOW_MS, max: AUTH_RATE_MAX, message: 'Too many attempts. Please wait before trying again.' })
const rsvpLimiter = rateLimit({ windowMs: RSVP_RATE_WINDOW_MS, max: RSVP_RATE_MAX, message: 'Too many RSVP submissions. Please wait a few minutes.' })

/* --------------------------------- helpers --------------------------------- */
const clean = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max)
const hashIp = (ip = '') => {
  let h = 0
  for (let i = 0; i < ip.length; i++) h = (h * 31 + ip.charCodeAt(i)) >>> 0
  return h.toString(16)
}

/* ---------------------------------- public --------------------------------- */

app.get('/api/health', async (req, res) => res.json({ ok: true, workbook: await hasWorkbook() }))

app.get('/api/rsvp/access', async (req, res, next) => {
  try {
    const session = guestSession(req, SESSION_SECRET)
    if (!session) return res.json({ attending: false, granted: false })
    const record = await findRecord(session.rsvpId)
    if (!record || record.attendance !== 'accepted') {
      clearGuestSession(res, req)
      return res.json({ attending: false, granted: false })
    }
    res.json({ attending: true, granted: true, name: record.name, rsvpId: record.id, since: record.timestamp })
  } catch (err) {
    next(err)
  }
})

app.post('/api/rsvp', rsvpLimiter, async (req, res, next) => {
  try {
    const body = req.body || {}
    if (clean(body.company, 40)) return res.json({ ok: true }) // honeypot: pretend success, store nothing

    const name = clean(body.name, 100)
    const attendance = String(body.attendance || '')
    const guest1 = clean(body.guest1, 100)
    const guest2 = clean(body.guest2, 100)
    const message = String(body.message ?? '').trim().slice(0, 500)

    if (!name) return res.status(400).json({ error: 'Please enter your name.' })
    if (!['accepted', 'declined'].includes(attendance)) return res.status(400).json({ error: 'Please choose whether you can attend.' })
    if (attendance === 'declined' && (guest1 || guest2)) return res.status(400).json({ error: 'Companions only apply to attending responses.' })
    if (guest2 && !guest1) return res.status(400).json({ error: 'Please fill in Guest 1 before adding Guest 2.' })
    if (attendance === 'accepted' && message.length > 500) return res.status(400).json({ error: 'Message is too long.' })

    const record = await appendRecord({ name, attendance, guest1, guest2, message, ipHash: hashIp(req.ip) })

    if (attendance === 'declined') {
      clearGuestSession(res, req) // a decline revokes any previous protected-content grant
      return res.json({ ok: true, message: `Thank you, ${name}.`, record: { id: record.id, attendance } })
    }

    issueGuestSession(res, req, SESSION_SECRET, record.id)
    res.json({
      ok: true,
      message: `Thank you, ${name}!`,
      grant: true,
      record: { id: record.id, attendance, guest1, guest2, message },
    })
  } catch (err) {
    if (err instanceof WorkbookError) return res.status(503).json({ error: err.message })
    next(err)
  }
})

/* ------------------------------ protected program ----------------------------- */
// Everything a declined visitor must not see is only produced here.
app.get('/api/program', requireAttendingGuest(SESSION_SECRET, findRecord), (req, res) => {
  const record = req.rsvpRecord
  res.set('Cache-Control', 'private, no-store')
  res.json({
    guest: { name: record.name, rsvpId: record.id, since: record.timestamp, partySize: record.partySize },
    programme: PROGRAM,
  })
})

// Audio is served from a private directory only to authorized attending guests.
app.get(
  '/api/program/audio/:file',
  requireAttendingGuest(SESSION_SECRET, findRecord),
  (req, res) => {
    const name = path.basename(String(req.params.file))
    const file = path.join(AUDIO_DIR, name)
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'Audio file not supplied yet.' })
    res.setHeader('Cache-Control', 'private, no-store')
    res.sendFile(file)
  }
)

/* ----------------------------------- admin ---------------------------------- */
app.post('/api/admin/login', authLimiter, (req, res) => {
  const email = clean((req.body || {}).email, 120)
  const password = String((req.body || {}).password || '')
  const emailOk = safeEqual(email.toLowerCase(), ADMIN.email.toLowerCase())
  const passOk = verifyPlain(password, ADMIN.password)
  if (!emailOk || !passOk) return res.status(401).json({ error: 'Invalid email or password.' })
  issueAdminSession(res, req, SESSION_SECRET)
  res.json({ ok: true, email: ADMIN.email })
})

app.get('/api/admin/session', (req, res) => {
  const s = adminSession(req, SESSION_SECRET)
  res.json({ authenticated: !!s, email: s ? ADMIN.email : null })
})

app.post('/api/admin/logout', (req, res) => {
  clearAdminSession(res, req)
  res.json({ ok: true })
})

const admin = express.Router()
admin.use(requireAdmin(SESSION_SECRET))

admin.get('/rsvps', async (req, res, next) => {
  try {
    const rows = await listRecords()
    const q = String(req.query.q || '').toLowerCase()
    const attendance = String(req.query.attendance || '')
    const filtered = rows
      .filter((r) => (attendance ? r.attendance === attendance : true))
      .filter((r) =>
        q ? [r.name, r.guest1, r.guest2, r.message, r.id].filter(Boolean).join(' ').toLowerCase().includes(q) : true
      )
    res.set('Cache-Control', 'private, no-store')
    res.json({ records: filtered, totals: await totals() })
  } catch (err) {
    next(err)
  }
})

admin.patch('/rsvps/:id', async (req, res, next) => {
  try {
    const status = String((req.body || {}).status || '')
    if (!REVIEW_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${REVIEW_STATUSES.join(', ')}` })
    }
    const updated = await updateRecordStatus(req.params.id, { status, resolvedBy: ADMIN.email })
    if (!updated) return res.status(404).json({ error: 'RSVP record not found.' })
    res.json({ ok: true, record: updated, totals: await totals() })
  } catch (err) {
    if (err instanceof WorkbookError) return res.status(503).json({ error: err.message })
    next(err)
  }
})

admin.get('/workbook-info', async (req, res) => {
  res.json({
    driver: storageDriver(),
    path: describeWorkbook(),
    initialized: await hasWorkbook(),
    generatedAt: manilaNow(),
    hint: 'Open the workbook in the storage backend. It is never downloadable through the website.',
  })
})

app.use('/api/admin', admin)

/* ---------------------------------- errors --------------------------------- */
app.use((err, req, res, next) => {
  if (err instanceof WorkbookError) return res.status(503).json({ error: err.message })
  console.error('[server error]', err.message)
  res.status(500).json({ error: 'Something went wrong. Please try again.' })
})

export default app
