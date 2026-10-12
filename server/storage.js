// Storage abstraction for the RSVP workbook.
//
// Two backends, chosen automatically:
//   - Vercel Blob  (when BLOB_READ_WRITE_TOKEN or VERCEL_OIDC_TOKEN + BLOB_STORE_ID exist)
//   - Local disk   (development and any host with a persistent volume)
//
// Vercel functions have a read-only filesystem, so the workbook CANNOT live on disk
// there. Blob keeps the single-.xlsx design and uses conditional writes (ETag /
// ifMatch) so two guests submitting at the same moment cannot silently overwrite
// each other: the loser detects the conflict and retries against the fresh copy.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const BLOB_PATHNAME = process.env.WORKBOOK_BLOB_PATH || 'rsvp/rsvps.xlsx'
export const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data')
export const LOCAL_PATH = process.env.WORKBOOK_PATH || path.join(DATA_DIR, 'rsvps.xlsx')

const hasBlobCredentials = !!(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN))
export const usingBlob = process.env.STORAGE_DRIVER === 'blob' ? true : process.env.STORAGE_DRIVER === 'file' ? false : hasBlobCredentials

/* --------------------------------- local disk -------------------------------- */

const fileDriver = {
  name: 'file',
  description: () => LOCAL_PATH,
  async read() {
    if (!fs.existsSync(LOCAL_PATH)) return null
    return { bytes: fs.readFileSync(LOCAL_PATH), version: null }
  },
  async write(bytes, { ifMatch } = {}) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    const tmp = path.join(DATA_DIR, `.rsvps.${process.pid}.${Date.now()}.tmp.xlsx`)
    fs.writeFileSync(tmp, bytes)
    try {
      fs.renameSync(tmp, LOCAL_PATH)
    } catch (err) {
      // Windows can refuse a rename while a reader holds the file — fall back to copy.
      if (err.code === 'EPERM' || err.code === 'EACCES' || err.code === 'EBUSY') {
        fs.copyFileSync(tmp, LOCAL_PATH)
        fs.unlinkSync(tmp)
      } else {
        try { fs.unlinkSync(tmp) } catch {}
        throw err
      }
    }
    return { version: null }
  },
  backupName: (stamp) => `${LOCAL_PATH}.corrupt-${stamp}.bak`,
  async backup(bytes, stamp) {
    try { fs.writeFileSync(this.backupName(stamp), bytes) } catch {}
  },
}

/* -------------------------------- Vercel Blob -------------------------------- */

const blobDriver = {
  name: 'blob',
  description: () => `vercel-blob:${BLOB_PATHNAME}`,
  async read() {
    const { get } = await import('@vercel/blob')
    // useCache:false guarantees we see the latest written workbook, not a cached copy.
    const result = await get(BLOB_PATHNAME, { access: 'private', useCache: false })
    if (!result || result.statusCode !== 200 || !result.stream) return null
    const bytes = Buffer.from(await new Response(result.stream).arrayBuffer())
    return { bytes, version: result.blob.etag || null }
  },
  async write(bytes, { ifMatch } = {}) {
    const { put } = await import('@vercel/blob')
    const options = {
      access: 'private',
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      cacheControlMaxAge: 60, // minimum allowed; workbook reads bypass cache anyway
    }
    if (ifMatch) options.ifMatch = ifMatch
    const res = await put(BLOB_PATHNAME, bytes, options)
    return { version: res.etag || null }
  },
  async backup(bytes, stamp) {
    const { put } = await import('@vercel/blob')
    try {
      await put(`rsvp/backups/rsvps.corrupt-${stamp}.bak`, bytes, {
        access: 'private',
        allowOverwrite: true,
        addRandomSuffix: false,
        contentType: 'application/octet-stream',
      })
    } catch {}
  },
}

export const storage = usingBlob ? blobDriver : fileDriver
export function describeStorage() {
  return storage.description()
}
export function usingBlobStorage() {
  return storage.name === 'blob'
}
