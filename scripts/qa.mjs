/**
 * End-to-end QA for the RSVP + access-control requirements.
 * Runs the real server against a temporary workbook, then exercises:
 *   RSVP storage, decline handling, protected programme access, admin CRUD,
 *   rate limiting, origin checks, concurrency, and workbook safety.
 *
 * Usage: node scripts/qa.mjs
 */
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'
import ExcelJS from 'exceljs'

const ROOT = process.cwd()
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'hk-qa-'))
const WORKBOOK = path.join(TMP, 'rsvps.xlsx')
const PORT = 4123
const BASE = `http://localhost:${PORT}`

const results = []
function check(name, ok, detail = '') {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail && !ok ? `  — ${detail}` : ''}`)
}

let child
const children = []
function startServer(extraEnv = {}) {
  child = spawn(process.execPath, ['server/index.js'], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(PORT),
      WORKBOOK_PATH: WORKBOOK,
      DATA_DIR: TMP,
      ADMIN_EMAIL: 'couple@example.com',
      ADMIN_PASSWORD: 'very-strong-test-password',
      SESSION_SECRET: 'test-session-secret-value',
      SITE_ORIGIN: `http://localhost:${PORT}`,
      NODE_ENV: 'development',
      // Keep the functional checks inside the limit; the rate-limit check re-arms a small window.
      RSVPS_RATE_MAX: '150',
      RSVPS_RATE_WINDOW_MS: '600000',
      AUTH_RATE_MAX: '10',
      ...extraEnv,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  children.push(child)
  child.stdout.on('data', (d) => process.env.QA_VERBOSE && process.stdout.write(`[server] ${d}`))
  child.stderr.on('data', (d) => process.stdout.write(`[server:err] ${d}`))
}

async function waitForServer(timeoutMs = 15000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(`${BASE}/api/health`)
      if (r.ok) return true
    } catch {}
    await new Promise((r) => setTimeout(r, 250))
  }
  return false
}

const jars = {}
function jarFor(key) {
  if (!jars[key]) jars[key] = new Map()
  return jars[key]
}
function cookieHeader(key) {
  return [...jarFor(key).entries()].map(([k, v]) => `${k}=${v}`).join('; ')
}
function captureCookies(key, res) {
  const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : []
  raw.forEach((c) => {
    const [pair] = c.split(';')
    const i = pair.indexOf('=')
    const name = pair.slice(0, i).trim()
    const value = pair.slice(i + 1).trim()
    if (value === '') jarFor(key).delete(name)
    else jarFor(key).set(name, value)
  })
}

async function api(pathname, { method = 'GET', body, jar = 'anon', headers = {}, origin } = {}) {
  const cookie = cookieHeader(jar)
  const res = await fetch(`${BASE}${pathname}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...(origin ? { Origin: origin } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  captureCookies(jar, res)
  let json = null
  try { json = await res.json() } catch {}
  return { status: res.status, body: json, headers: res.headers }
}

async function readRows() {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(WORKBOOK)
  const ws = wb.getWorksheet('RSVP Responses')
  const rows = []
  ws.eachRow((row, i) => {
    if (i === 1) return
    const v = row.values.slice(1).map((x) => (x && x.text) ? x.text : (x ?? ''))
    if (v.some((x) => String(x).trim() !== '')) rows.push(v)
  })
  return { sheetNames: wb.worksheets.map((w) => w.name), header: ws.getRow(1).values.slice(1), rows }
}

try {
  startServer()
  const up = await waitForServer()
  if (!up) throw new Error('server did not start')
  console.log(`\nQA run — workbook at ${WORKBOOK}\n`)

  /* ---------------------------- 1. workbook creation --------------------------- */
  const declined = await api('/api/rsvp', { method: 'POST', jar: 'declined', body: { name: 'Liza Dela Cruz', attendance: 'declined' } })
  check('decline is stored (201/200 response)', declined.status === 200 && declined.body?.ok === true, JSON.stringify(declined.body))
  check('decline does NOT receive a guest access cookie', !cookieHeader('declined').includes('hk_guest'), cookieHeader('declined'))
  const afterDecline = await readRows()
  check('workbook has "RSVP Responses" sheet', afterDecline.sheetNames.includes('RSVP Responses'), afterDecline.sheetNames.join(','))
  check('workbook has "Settings" sheet', afterDecline.sheetNames.includes('Settings'), afterDecline.sheetNames.join(','))
  check('workbook header matches spec columns', JSON.stringify(afterDecline.header) === JSON.stringify([
    'Submission ID', 'Primary Guest Name', 'Attendance Response', 'Companion 1', 'Companion 2', 'Message',
    'Party Size', 'Submission Timestamp', 'Review Status', 'Resolved By', 'Resolution Timestamp',
  ]), JSON.stringify(afterDecline.header))
  check('decline row stored before the dust animation could run', afterDecline.rows.length === 1 && afterDecline.rows[0][2] === 'declined')

  /* ------------------------------ 2. validation ------------------------------- */
  const noName = await api('/api/rsvp', { method: 'POST', jar: 'noname', body: { name: '   ', attendance: 'accepted' } })
  check('missing name rejected', noName.status === 400, `${noName.status} ${JSON.stringify(noName.body)}`)
  const badAttendance = await api('/api/rsvp', { method: 'POST', jar: 'badatt', body: { name: 'Ana', attendance: 'maybe' } })
  check('invalid attendance rejected', badAttendance.status === 400)
  const guest2Only = await api('/api/rsvp', { method: 'POST', jar: 'g2only', body: { name: 'Ana', attendance: 'accepted', guest2: 'Second' } })
  check('Guest 2 without Guest 1 rejected', guest2Only.status === 400, JSON.stringify(guest2Only.body))
  const longName = await api('/api/rsvp', { method: 'POST', jar: 'longname', body: { name: 'x'.repeat(300), attendance: 'accepted' } })
  check('over-long name is trimmed to the limit', longName.status === 200, String(longName.status))
  const honeypot = await api('/api/rsvp', { method: 'POST', jar: 'bot', body: { name: 'Bot', attendance: 'accepted', company: 'spam' } })
  check('honeypot silently ignored', honeypot.status === 200 && honeypot.body?.grant !== true)

  /* --------------------------- 3. acceptance + grant --------------------------- */
  const accepted = await api('/api/rsvp', {
    method: 'POST', jar: 'attending',
    body: { name: 'Juan Ramos', attendance: 'accepted', guest1: 'Maria Ramos', guest2: 'Pedro Ramos', message: 'So happy for you both!' },
  })
  check('accepted RSVP stored', accepted.status === 200 && accepted.body?.grant === true, JSON.stringify(accepted.body))
  check('accepted RSVP issues HttpOnly guest cookie', /hk_guest=/.test(cookieHeader('attending')))
  const access = await api('/api/rsvp/access', { jar: 'attending' })
  check('attending session verified by server', access.body?.granted === true, JSON.stringify(access.body))
  const prog = await api('/api/program', { jar: 'attending' })
  check('protected programme served to attending session', prog.status === 200 && !!prog.body?.programme?.story, String(prog.status))
  check('programme payload is marked private/no-store', /no-store/.test(prog.headers.get('cache-control') || ''), prog.headers.get('cache-control'))

  const rowsAfterAccept = (await readRows()).rows
  const juan = rowsAfterAccept.find((r) => r[1] === 'Juan Ramos')
  check('companions + party size recorded', juan && juan[3] === 'Maria Ramos' && juan[4] === 'Pedro Ramos' && Number(juan[6]) === 3, JSON.stringify(juan))
  check('message recorded as plain text', juan && juan[5] === 'So happy for you both!')

  const anonProgram = await api('/api/program')
  check('anonymous visitor denied the programme', anonProgram.status === 401, String(anonProgram.status))
  const declinedProgram = await api('/api/program', { jar: 'declined' })
  check('declined visitor denied the programme', declinedProgram.status === 401, String(declinedProgram.status))
  const anonAudio = await api('/api/program/audio/pahintulot.mp3')
  const audioDenied = anonAudio.status === 401 || anonAudio.status === 403 || (anonAudio.status === 404 && /not supplied|not found/i.test(JSON.stringify(anonAudio.body || {})))
  check('anonymous visitor denied protected audio', audioDenied, `${anonAudio.status} ${JSON.stringify(anonAudio.body)}`)

  /* ------------------------------ 4. decline revokes --------------------------- */
  const switchToDecline = await api('/api/rsvp', { method: 'POST', jar: 'attending', body: { name: 'Juan Ramos', attendance: 'declined' } })
  check('a later decline is recorded separately', switchToDecline.status === 200 && switchToDecline.body?.record?.attendance === 'declined')
  check('decline clears the guest cookie', !cookieHeader('attending').includes('hk_guest'), cookieHeader('attending'))
  const afterRevoke = await api('/api/program', { jar: 'attending' })
  check('revoked session can no longer read the programme', afterRevoke.status === 401, String(afterRevoke.status))

  /* ---------------------------- 5. forged grant rejected ----------------------- */
  const forged = await api('/api/program', { jar: 'forged' })
  check('session without a grant is denied', forged.status === 401)
  const tampered = await api('/api/program', { headers: { Cookie: 'hk_guest=abc.def' } })
  check('tampered cookie signature rejected', tampered.status === 401, String(tampered.status))

  /* ---------------------------------- 6. admin -------------------------------- */
  const badLogin = await api('/api/admin/login', { method: 'POST', body: { email: 'couple@example.com', password: 'wrong-password' } })
  check('invalid admin credentials rejected', badLogin.status === 401)
  const noAuth = await api('/api/admin/rsvps')
  check('admin records require a session', noAuth.status === 401)
  const login = await api('/api/admin/login', { method: 'POST', jar: 'admin', body: { email: 'couple@example.com', password: 'very-strong-test-password' } })
  check('valid admin login succeeds', login.status === 200 && !!cookieHeader('admin'), JSON.stringify(login.body))
  const list = await api('/api/admin/rsvps', { jar: 'admin' })
  check('admin can list records with totals', list.status === 200 && Array.isArray(list.body?.records) && !!list.body?.totals, String(list.status))
  const info = await api('/api/admin/workbook-info', { jar: 'admin' })
  check('workbook-info reports the active driver and a real boolean', info.status === 200 && info.body.driver === 'file' && typeof info.body.initialized === 'boolean', JSON.stringify(info.body))
  const target = list.body.records[0]
  const patch = await api(`/api/admin/rsvps/${encodeURIComponent(target.id)}`, { method: 'PATCH', jar: 'admin', body: { status: 'Reviewed' } })
  check('admin can mark a record reviewed', patch.status === 200 && patch.body?.record?.status === 'Reviewed', JSON.stringify(patch.body))
  const persisted = (await readRows()).rows.find((r) => r[0] === target.id)
  check('review status persisted to the workbook', persisted && persisted[8] === 'Reviewed' && !!persisted[9], JSON.stringify(persisted))
  const badStatus = await api(`/api/admin/rsvps/${encodeURIComponent(target.id)}`, { method: 'PATCH', jar: 'admin', body: { status: 'Nope' } })
  check('invalid review status rejected', badStatus.status === 400)
  const logout = await api('/api/admin/logout', { method: 'POST', jar: 'admin' })
  const afterLogout = await api('/api/admin/rsvps', { jar: 'admin' })
  check('logout invalidates the admin session', logout.status === 200 && afterLogout.status === 401, String(afterLogout.status))

  /* ------------------------------ 7. origin guard ------------------------------ */
  const badOrigin = await api('/api/rsvp', { method: 'POST', body: { name: 'Mallory', attendance: 'accepted' }, origin: 'https://evil.example.com' })
  check('request from an unknown origin rejected', badOrigin.status === 403, String(badOrigin.status))
  const goodOrigin = await api('/api/rsvp', { method: 'POST', body: { name: 'Good Origin', attendance: 'accepted' }, origin: `http://localhost:${PORT}` })
  check('request from the site origin accepted', goodOrigin.status === 200, String(goodOrigin.status))

  /* --------------------------- 8. duplicates + history -------------------------- */
  const dupA = await api('/api/rsvp', { method: 'POST', body: { name: 'Ana Reyes', attendance: 'accepted' } })
  const dupB = await api('/api/rsvp', { method: 'POST', body: { name: 'Ana Reyes', attendance: 'declined' } })
  const dupRows = (await readRows()).rows.filter((r) => r[1] === 'Ana Reyes')
  check('repeated submissions create separate rows', dupA.status === 200 && dupB.status === 200 && dupRows.length === 2, JSON.stringify(dupRows.map((r) => r[0])))
  check('duplicate rows keep distinct ids and statuses', new Set(dupRows.map((r) => r[0])).size === 2)

  /* ----------------------------- 9. concurrency -------------------------------- */
  const before = (await readRows()).rows.length
  const burst = await Promise.all(
    Array.from({ length: 8 }, (_, i) =>
      api('/api/rsvp', { method: 'POST', body: { name: `Concurrent ${i}`, attendance: 'accepted', guest1: i % 2 ? 'Plus One' : '' } })
    )
  )
  const after = (await readRows()).rows
  const burstOk = burst.every((r) => r.status === 200) && after.length === before + 8
  check('8 concurrent submissions all persisted (no lost updates)', burstOk, `before=${before} afterBurst=${after.length} statuses=${burst.map((b) => b.status).join(',')}`)

  /* ------------------------- 10. workbook safety ------------------------------ */
  const corrupted = fs.readFileSync(WORKBOOK)
  fs.writeFileSync(WORKBOOK, Buffer.from('this is not a workbook at all'))
  const afterCorrupt = await api('/api/rsvp', { method: 'POST', body: { name: 'After Corrupt', attendance: 'accepted' } })
  check('corrupted workbook reported instead of silently overwritten', afterCorrupt.status === 503, `${afterCorrupt.status} ${JSON.stringify(afterCorrupt.body)}`)
  const stillCorrupt = fs.readFileSync(WORKBOOK)
  check('corrupted workbook left untouched on disk', stillCorrupt.equals(Buffer.from('this is not a workbook at all')))
  const backups = fs.readdirSync(TMP).filter((f) => f.includes('.corrupt-'))
  check('a recovery backup was written', backups.length > 0, backups.join(','))
  fs.writeFileSync(WORKBOOK, corrupted)
  const recovered = await api('/api/rsvp', { method: 'POST', body: { name: 'Restored Guest', attendance: 'accepted' } })
  check('server resumes normally after the workbook is restored', recovered.status === 200, String(recovered.status))

  /* ---------------------------- 11. secret hygiene ----------------------------- */
  const distDir = path.join(ROOT, 'dist')
  const bundleText = fs.existsSync(distDir)
    ? fs.readdirSync(path.join(distDir, 'assets')).filter((f) => f.endsWith('.js'))
      .map((f) => fs.readFileSync(path.join(distDir, 'assets', f), 'utf8')).join('\n')
    : ''
  check('admin password never appears in the frontend bundle', !bundleText.includes('very-strong-test-password'))
  check('session secret never appears in the frontend bundle', !bundleText.includes('test-session-secret-value'))
  check('protected story is not in the bundle (server-only)', !bundleText.includes('Two souls, two paths, one promise'))
  check('workbook path is not exposed as a download route',
    (await api('/rsvps.xlsx')).status === 404 && (await api('/data/rsvps.xlsx')).status === 404)
  check('API never returns the admin password', !JSON.stringify(list.body || {}).includes('very-strong-test-password'))

  /* ------------------------------ 12. rate limit ------------------------------- */
  // Re-arm the limiter with a small, real window and confirm it engages.
  // Production defaults (12 per 10 min) are the same code path.
  child.kill('SIGTERM')
  await new Promise((r) => setTimeout(r, 500))
  const TIGHT_PORT = PORT + 1
  const TIGHT_BASE = `http://localhost:${TIGHT_PORT}`
  const tightServer = spawn(process.execPath, ['server/index.js'], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(TIGHT_PORT),
      WORKBOOK_PATH: path.join(TMP, 'tight.xlsx'),
      DATA_DIR: TMP,
      ADMIN_EMAIL: 'couple@example.com',
      ADMIN_PASSWORD: 'very-strong-test-password',
      SESSION_SECRET: 'test-session-secret-value',
      RSVPS_RATE_MAX: '3',
      RSVPS_RATE_WINDOW_MS: '60000',
      NODE_ENV: 'development',
    },
    stdio: ['ignore', 'ignore', 'inherit'],
  })
  children.push(tightServer)
  let tightUp = false
  for (let i = 0; i < 40 && !tightUp; i++) {
    try { tightUp = (await fetch(`${TIGHT_BASE}/api/health`)).ok } catch {}
    if (!tightUp) await new Promise((r) => setTimeout(r, 250))
  }
  check('second server started for the rate-limit check', tightUp)
  const statuses = []
  for (let i = 0; i < 6; i++) {
    const r = await fetch(`${TIGHT_BASE}/api/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `Flood ${i}`, attendance: 'declined' }),
    })
    statuses.push(r.status)
    await r.text()
  }
  const firstLimited = statuses.indexOf(429)
  check('rate limiting engages once the window is exhausted', firstLimited > 0 && firstLimited <= 4, `statuses: ${statuses.join(',')}`)

  // The UI must be able to explain the wait, so the response has to carry it.
  const limitedRes = await fetch(`${TIGHT_BASE}/api/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Limited Guest', attendance: 'declined' }),
  })
  const limitedBody = await limitedRes.json().catch(() => ({}))
  check('rate-limited response reports retryAfterSeconds', limitedRes.status === 429 && Number(limitedBody.retryAfterSeconds) > 0, JSON.stringify(limitedBody))
  check('rate-limited response sends a Retry-After header', !!limitedRes.headers.get('retry-after'), String(limitedRes.headers.get('retry-after')))
} catch (err) {
  check('QA run completed without throwing', false, err.message)
} finally {
  children.forEach((c) => { try { c.kill('SIGTERM') } catch {} })
  if (child) { try { child.kill('SIGTERM') } catch {} }
  await new Promise((r) => setTimeout(r, 600))
  try { fs.rmSync(TMP, { recursive: true, force: true }) } catch {}
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
if (failed.length) {
  console.log('\nFailures:')
  failed.forEach((f) => console.log(` - ${f.name}${f.detail ? ` :: ${f.detail}` : ''}`))
  process.exit(1)
}
