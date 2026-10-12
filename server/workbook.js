// Excel workbook storage for RSVP records.
//
// Spec: no database service — one .xlsx workbook, ExcelJS, append-only history.
// Storage backend (local disk or Vercel Blob) is handled by storage.js.
//
// Guarantees:
//  - Every read/modify/write is serialized in-process.
//  - Writes are conditional. On Blob the ETag is sent with the write, so a change
//    made by another function instance is detected and the mutation is retried
//    against the fresh workbook. No guest's row is silently discarded.
//  - A corrupt workbook is reported and preserved, never silently recreated.
import ExcelJS from 'exceljs'
import { storage, describeStorage, usingBlobStorage } from './storage.js'

export const SHEET_RSVP = 'RSVP Responses'
export const SHEET_SETTINGS = 'Settings'

export const COLUMNS = [
  'Submission ID',
  'Primary Guest Name',
  'Attendance Response',
  'Companion 1',
  'Companion 2',
  'Message',
  'Party Size',
  'Submission Timestamp',
  'Review Status',
  'Resolved By',
  'Resolution Timestamp',
]

export const REVIEW_STATUSES = ['New', 'Reviewed', 'Duplicate', 'Resolved']

export class WorkbookError extends Error {}

let queue = Promise.resolve()

/** Serialize workbook access within this server instance. */
function withLock(task) {
  const run = queue.then(task, task)
  queue = run.then(() => undefined, () => undefined)
  return run
}

export function describeWorkbook() {
  return describeStorage()
}
export function storageDriver() {
  return usingBlobStorage() ? 'vercel-blob' : 'file'
}
export function isInitialized() {
  return initializedFlag
}

/** True once a workbook exists in the active storage backend. */
export async function hasWorkbook() {
  if (initializedFlag) return true
  const snapshot = await storage.read()
  initializedFlag = !!snapshot
  return initializedFlag
}

let initializedFlag = false

/* ------------------------------ workbook shape ------------------------------ */

function buildFreshWorkbook() {
  const wb = new ExcelJS.Workbook()
  const rs = wb.addWorksheet(SHEET_RSVP)
  rs.addRow(COLUMNS)
  rs.getRow(1).font = { bold: true }
  rs.views = [{ state: 'frozen', ySplit: 1 }]
  rs.columns.forEach((c, i) => {
    c.width = [16, 24, 20, 22, 22, 40, 12, 26, 14, 14, 22][i] || 18
  })
  const settings = wb.addWorksheet(SHEET_SETTINGS)
  settings.addRow(['Key', 'Value'])
  settings.getRow(1).font = { bold: true }
  settings.addRow(['Workbook version', '1'])
  settings.addRow(['Purpose', 'RSVP storage for the Harthwel & Khatrina wedding website'])
  settings.addRow(['Note', 'Never store credentials or session secrets in this workbook.'])
  settings.columns[0].width = 22
  settings.columns[1].width = 70
  return wb
}

function ensureSheets(wb) {
  let rs = wb.getWorksheet(SHEET_RSVP)
  if (!rs) {
    rs = wb.addWorksheet(SHEET_RSVP)
    rs.addRow(COLUMNS)
    rs.getRow(1).font = { bold: true }
  } else {
    // Add any column that exists in the spec but not in the file (forward migration).
    const present = new Set((rs.getRow(1).values || []).filter((v) => typeof v === 'string'))
    COLUMNS.filter((c) => !present.has(c)).forEach((name) => {
      rs.getRow(1).getCell(rs.columnCount + 1).value = name
    })
  }
  if (!wb.getWorksheet(SHEET_SETTINGS)) {
    const settings = wb.addWorksheet(SHEET_SETTINGS)
    settings.addRow(['Key', 'Value'])
    settings.addRow(['Workbook version', '1'])
  }
  return rs
}

/* ------------------------------- read / write ------------------------------- */

async function parseSnapshot(origin) {
  const snapshot = await storage.read()
  if (!snapshot) return { exists: false, wb: buildFreshWorkbook(), version: null }
  const wb = new ExcelJS.Workbook()
  try {
    await wb.xlsx.load(snapshot.bytes)
  } catch (err) {
    await storage.backup(snapshot.bytes, Date.now())
    throw new WorkbookError(
      `The RSVP workbook could not be read (${err.message}). The original file was NOT modified. ` +
        `A recovery copy was saved by the ${origin} storage backend. Restore or fix the workbook, then retry.`
    )
  }
  return { exists: true, wb, version: snapshot.version }
}

/**
 * Read, mutate, and write the workbook, retrying when another instance writes first.
 * `mutate(wb)` returns the value to hand back to the caller.
 */
async function mutateWorkbook(mutate, { attempts = 5, createIfMissing = false } = {}) {
  let lastConflict = null
  for (let attempt = 0; attempt < attempts; attempt++) {
    const { exists, wb, version } = await parseSnapshot('storage')
    if (!exists && !createIfMissing) return { value: null, wb, wrote: false }
    const rs = ensureSheets(wb)
    const value = mutate(wb, rs)
    const bytes = Buffer.from(await wb.xlsx.writeBuffer())

    // Validate the produced workbook before making it the live copy.
    const check = new ExcelJS.Workbook()
    await check.xlsx.load(bytes)
    if (!check.getWorksheet(SHEET_RSVP)) throw new WorkbookError('the new workbook lost its RSVP sheet')

    try {
      await storage.write(bytes, { ifMatch: version })
      return { value, wrote: true }
    } catch (err) {
      const conflict =
        err?.name === 'BlobPreconditionFailedError' ||
        /precondition|conflict|already exists|ETag/i.test(err?.message || '')
      if (!conflict) throw err
      lastConflict = err
      await new Promise((r) => setTimeout(r, 120 * (attempt + 1))) // small backoff, then re-read
    }
  }
  throw new WorkbookError(
    `Could not save the RSVP because other submissions were being written at the same time ` +
      `(${lastConflict?.message || 'write conflict'}). Please press the button again.`
  )
}

/* ---------------------------------- records --------------------------------- */

function headerMap(ws) {
  const map = {}
  const values = ws.getRow(1).values || []
  values.forEach((v, idx) => {
    if (typeof v === 'string' && v.trim()) map[v.trim()] = idx
  })
  return map
}

function cell(row, map, name) {
  const idx = map[name]
  if (!idx || idx < 1) return ''
  const value = row.getCell(idx).value
  if (value === null || value === undefined) return ''
  if (typeof value === 'object' && value.text) return value.text
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function rowToRecord(row, map) {
  return {
    id: cell(row, map, 'Submission ID'),
    name: cell(row, map, 'Primary Guest Name'),
    attendance: cell(row, map, 'Attendance Response'),
    guest1: cell(row, map, 'Companion 1'),
    guest2: cell(row, map, 'Companion 2'),
    message: cell(row, map, 'Message'),
    partySize: Number(cell(row, map, 'Party Size')) || 1,
    timestamp: cell(row, map, 'Submission Timestamp'),
    status: cell(row, map, 'Review Status') || 'New',
    resolvedBy: cell(row, map, 'Resolved By'),
    resolvedAt: cell(row, map, 'Resolution Timestamp'),
  }
}

export function manilaNow() {
  return new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Manila' }).replace(' ', 'T') + '+08:00'
}

function newId() {
  const t = Date.now().toString(36).toUpperCase()
  const r = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `RSVP-${t}-${r}`
}

/** Append one RSVP record. Returns the stored record, or throws WorkbookError. */
export async function appendRecord({ name, attendance, guest1 = '', guest2 = '', message = '', ipHash = '' }) {
  return withLock(async () => {
    const record = {
      id: newId(),
      name,
      attendance,
      guest1,
      guest2,
      message,
      partySize: attendance === 'accepted' ? 1 + [guest1, guest2].filter(Boolean).length : 0,
      timestamp: manilaNow(),
      status: 'New',
      resolvedBy: '',
      resolvedAt: '',
      ipHash,
    }
    const { wrote } = await mutateWorkbook((wb, ws) => {
      ws.addRow([
        record.id, record.name, record.attendance, record.guest1, record.guest2, record.message,
        record.partySize, record.timestamp, record.status, '', '',
      ])
    }, { createIfMissing: true })
    if (!wrote) throw new WorkbookError('the RSVP could not be saved')
    initializedFlag = true
    return record
  })
}

export async function findRecord(id) {
  return withLock(async () => {
    const snapshot = await parseSnapshot('storage')
    initializedFlag = snapshot.exists
    if (!snapshot.exists) return null
    const ws = snapshot.wb.getWorksheet(SHEET_RSVP)
    if (!ws) return null
    const map = headerMap(ws)
    let found = null
    ws.eachRow((row, i) => {
      if (i === 1 || found) return
      const rec = rowToRecord(row, map)
      if (rec.id === id) found = rec
    })
    return found
  })
}

export async function listRecords() {
  return withLock(async () => {
    const snapshot = await parseSnapshot('storage')
    initializedFlag = snapshot.exists
    if (!snapshot.exists) return []
    const ws = snapshot.wb.getWorksheet(SHEET_RSVP)
    if (!ws) return []
    const map = headerMap(ws)
    const rows = []
    ws.eachRow((row, i) => {
      if (i === 1) return
      const rec = rowToRecord(row, map)
      if (rec.id || rec.name) rows.push(rec)
    })
    return rows.reverse() // newest first
  })
}

/** Update review status. Rows are never deleted; history is preserved. */
export async function updateRecordStatus(id, { status, resolvedBy }) {
  return withLock(async () => {
    if (!initializedFlag) {
      const snapshot = await parseSnapshot('storage')
      initializedFlag = snapshot.exists
      if (!snapshot.exists) throw new WorkbookError('no workbook yet')
    }
    const { value, wrote } = await mutateWorkbook((wb, ws) => {
      const map = headerMap(ws)
      let updated = null
      ws.eachRow((row, i) => {
        if (i === 1 || updated) return
        if (cell(row, map, 'Submission ID') !== id) return
        row.getCell(map['Review Status']).value = status
        row.getCell(map['Resolved By']).value = resolvedBy || ''
        row.getCell(map['Resolution Timestamp']).value = manilaNow()
        updated = rowToRecord(row, map)
      })
      return updated
    }, { createIfMissing: false })
    if (!value) return null
    if (!wrote) throw new WorkbookError('the status change could not be saved')
    return value
  })
}

/** Summary totals for the dashboard. */
export async function totals() {
  const rows = await listRecords()
  const attending = rows.filter((r) => r.attendance === 'accepted')
  const declined = rows.filter((r) => r.attendance === 'declined')
  const companions = attending.reduce((sum, r) => sum + Math.max(0, r.partySize - 1), 0)
  return {
    submissions: rows.length,
    attendingResponses: attending.length,
    decliningResponses: declined.length,
    companions,
    totalGuests: attending.length + companions,
  }
}
