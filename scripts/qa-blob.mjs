/**
 * Verifies the Vercel Blob storage driver end-to-end, with no real credentials:
 *   - the workbook is created inside the blob store, not on disk
 *   - RSVPs are appended and readable through the API
 *   - conditional writes (ETag) reject stale writers and the retry recovers
 *   - corrupt blobs are reported and backed up, never silently replaced
 *
 * Run: node --import ./scripts/mocks/blob-loader.mjs scripts/qa-blob.mjs
 */
import fs from 'fs'
import path from 'path'
import os from 'os'
import ExcelJS from 'exceljs'

const mock = await import('./mocks/vercel-blob.js')

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'hk-blob-'))
process.env.STORAGE_DRIVER = 'blob'
process.env.WORKBOOK_BLOB_PATH = 'rsvp/rsvps.xlsx'
process.env.DATA_DIR = TMP
process.env.ADMIN_EMAIL = 'couple@example.com'
process.env.ADMIN_PASSWORD = 'very-strong-test-password'
process.env.SESSION_SECRET = 'blob-test-secret'
process.env.RSVPS_RATE_MAX = '200'
process.env.SITE_ORIGIN = 'http://localhost:4321'

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail && !ok ? `  — ${detail}` : ''}`)
}

const PORT = 4321
const BASE = `http://localhost:${PORT}`
const BLOB = 'rsvp/rsvps.xlsx'

/** Parse the blob with ExcelJS — XLSX text is not stored as plain bytes. */
async function blobRows() {
  const found = mock._read(BLOB)
  if (!found) return []
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(found.bytes)
  const ws = wb.getWorksheet('RSVP Responses')
  if (!ws) return []
  const rows = []
  ws.eachRow((row, i) => {
    if (i === 1) return
    const values = row.values.slice(1).map((v) => (v && v.text ? v.text : (v ?? '')))
    if (values.some((v) => String(v).trim() !== '')) rows.push(values)
  })
  return rows
}

let server
try {
  server = await mock._start(PORT)
  await new Promise((r) => setTimeout(r, 400))

  const health = await (await fetch(`${BASE}/api/health`)).json()
  check('health reports no workbook before the first submission', health.workbook === false, JSON.stringify(health))

  /* ------------------------------ acceptance ------------------------------ */
  const accept = await fetch(`${BASE}/api/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Blob Guest', attendance: 'accepted', guest1: 'Plus One', message: 'See you there' }),
  })
  const acceptBody = await accept.json()
  check('accepted RSVP succeeds with the blob driver', accept.status === 200 && acceptBody.grant === true, JSON.stringify(acceptBody))
  check('workbook was written into the blob store', !!mock._read(BLOB))
  check('workbook was NOT written to the local disk', !fs.existsSync(path.join(TMP, 'rsvps.xlsx')))

  let rows = await blobRows()
  check('guest row present with companions and party size', rows.length === 1 && rows[0][1] === 'Blob Guest' && rows[0][3] === 'Plus One' && Number(rows[0][6]) === 2, JSON.stringify(rows))

  const cookie = (accept.headers.getSetCookie()[0] || '').split(';')[0]
  check('guest cookie issued', cookie.startsWith('hk_guest='), cookie.slice(0, 20))

  /* --------------------------- protected access --------------------------- */
  const access = await (await fetch(`${BASE}/api/rsvp/access`, { headers: { Cookie: cookie } })).json()
  check('server recognises the attending session', access.granted === true, JSON.stringify(access))
  check('protected programme served', (await fetch(`${BASE}/api/program`, { headers: { Cookie: cookie } })).status === 200)
  check('anonymous visitor still denied', (await fetch(`${BASE}/api/program`)).status === 401)

  /* ------------------------------- decline -------------------------------- */
  const decline = await fetch(`${BASE}/api/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Blob Decliner', attendance: 'declined' }),
  })
  check('declined RSVP succeeds', decline.status === 200, String(decline.status))
  rows = await blobRows()
  check('declined row is in the same workbook', rows.length === 2 && rows.some((r) => r[1] === 'Blob Decliner' && r[2] === 'declined'), JSON.stringify(rows.map((r) => r[1])))

  /* --------------------------- conditional write -------------------------- */
  // Another function instance writes a real change (a row we can see) between our
  // read and our write. The ETag changes with the content, exactly like a real
  // object store, so the app's write must be rejected and retried.
  const beforeTag = mock._read(BLOB).etag
  const wbSim = new ExcelJS.Workbook()
  await wbSim.xlsx.load(mock._read(BLOB).bytes)
  wbSim.getWorksheet('RSVP Responses').addRow([
    'RSVP-SIM-0001', 'Other Instance Guest', 'accepted', '', '', '', 1,
    '2026-10-13T09:00:00+08:00', 'New', '', '',
  ])
  mock._inject(BLOB, Buffer.from(await wbSim.xlsx.writeBuffer()))
  check('concurrent writer changed the ETag', mock._read(BLOB).etag !== beforeTag, `${beforeTag} -> ${mock._read(BLOB).etag}`)

  const concurrent = await fetch(`${BASE}/api/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Concurrent Guest', attendance: 'accepted' }),
  })
  check('submission after a concurrent write still succeeds (retry)', concurrent.status === 200, String(concurrent.status))
  rows = await blobRows()
  check('both the concurrent writer row and the new submission survive',
    rows.length === 4 && rows.some((r) => r[1] === 'Other Instance Guest') && rows.some((r) => r[1] === 'Concurrent Guest'),
    JSON.stringify(rows.map((r) => r[1])))

  /* --------------------------- two rapid writes --------------------------- */
  const [a, b] = await Promise.all([
    fetch(`${BASE}/api/rsvp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Parallel One', attendance: 'accepted' }) }),
    fetch(`${BASE}/api/rsvp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Parallel Two', attendance: 'accepted' }) }),
  ])
  rows = await blobRows()
  const parallelStored = rows.some((r) => r[1] === 'Parallel One') && rows.some((r) => r[1] === 'Parallel Two')
  check('two rapid submissions both stored', a.status === 200 && b.status === 200 && parallelStored, `statuses=${a.status},${b.status} rows=${JSON.stringify(rows.map((r) => r[1]))}`)

  /* ------------------------------ corruption ------------------------------ */
  const good = mock._read(BLOB).bytes
  mock._inject(BLOB, Buffer.from('definitely not a workbook'))
  const corrupt = await fetch(`${BASE}/api/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'After Corrupt', attendance: 'accepted' }),
  })
  check('corrupt blob reported instead of overwritten', corrupt.status === 503, String(corrupt.status))
  check('corrupt blob left untouched', mock._containsBytes(BLOB, 'definitely not a workbook'))
  const backups = (await mock.list({ prefix: 'rsvp/backups/' })).blobs
  check('recovery backup written to the blob store', backups.length > 0, backups.map((b) => b.pathname).join(','))
  mock._inject(BLOB, good)
  const recovered = await fetch(`${BASE}/api/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Restored Guest', attendance: 'accepted' }),
  })
  check('server resumes after the blob is restored', recovered.status === 200, String(recovered.status))

  /* --------------------------------- admin -------------------------------- */
  const login = await fetch(`${BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'couple@example.com', password: 'very-strong-test-password' }),
  })
  check('admin login works with the simple env password', login.status === 200, String(login.status))
  check('a password-only login is still rejected', (await fetch(`${BASE}/api/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'couple@example.com', password: 'wrong-password' }) })).status === 401)
  const adminCookie = (login.headers.getSetCookie()[0] || '').split(';')[0]
  const records = await (await fetch(`${BASE}/api/admin/rsvps`, { headers: { Cookie: adminCookie } })).json()
  rows = await blobRows()
  check('admin sees every stored record', records.records.length === rows.length && rows.length === 7, `api=${records.records.length} blob=${rows.length}`)
  check('totals computed from blob data', records.totals.totalGuests >= 3, JSON.stringify(records.totals))
  const patch = await fetch(`${BASE}/api/admin/rsvps/${records.records[0].id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ status: 'Reviewed' }),
  })
  check('review status writes back to the blob workbook', patch.status === 200 && (await blobRows()).some((r) => r[8] === 'Reviewed'), String(patch.status))
} catch (err) {
  check('blob QA completed without throwing', false, err.stack?.split('\n')[0] || err.message)
} finally {
  mock._stop()
  try { fs.rmSync(TMP, { recursive: true, force: true }) } catch {}
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} blob checks passed`)
if (failed.length) {
  console.log('\nFailures:')
  failed.forEach((f) => console.log(` - ${f.name}${f.detail ? ` :: ${f.detail}` : ''}`))
  process.exit(1)
}
