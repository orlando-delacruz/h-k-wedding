import * as crypto from 'crypto'
import ExcelJS from 'exceljs'

const { createRequire } = await import('module')
const require = createRequire(import.meta.url)
const express = require('express')

const store = new Map()

function newEtag(bytes) {
  return '"' + crypto.createHash('sha1').update(bytes).digest('hex').slice(0, 16) + '"'
}

export async function put(pathname, body, options = {}) {
  const current = store.get(pathname)
  if (options.ifMatch && current && current.etag !== options.ifMatch) {
    const err = new Error('Precondition failed: the blob was modified by another writer')
    err.name = 'BlobPreconditionFailedError'
    throw err
  }
  const bytes = Buffer.isBuffer(body) ? body : Buffer.from(body)
  if (current && !options.allowOverwrite && !options.ifMatch) {
    const err = new Error('blob already exists')
    err.name = 'BlobAlreadyExistsError'
    throw err
  }
  const etag = newEtag(bytes)
  store.set(pathname, { bytes, etag })
  return { pathname, url: `https://mock.blob.local/${pathname}`, etag }
}

export async function get(pathname, options = {}) {
  const found = store.get(pathname)
  if (!found) return null
  return {
    statusCode: 200,
    stream: new Response(found.bytes).body,
    headers: new Headers(),
    blob: {
      url: `https://mock.blob.local/${pathname}`,
      pathname,
      contentType: null,
      contentDisposition: 'attachment',
      cacheControl: 'no-cache',
      etag: found.etag,
      size: found.bytes.length,
      uploadedAt: new Date(),
    },
  }
}

export async function head(pathname) {
  const found = store.get(pathname)
  if (!found) {
    const err = new Error('not found')
    err.name = 'BlobNotFoundError'
    throw err
  }
  return { pathname, etag: found.etag, size: found.bytes.length, url: `https://mock.blob.local/${pathname}` }
}

export async function list({ prefix = '' } = {}) {
  const blobs = [...store.entries()]
    .filter(([name]) => name.startsWith(prefix))
    .map(([name, v]) => ({ pathname: name, etag: v.etag, size: v.bytes.length, url: `https://mock.blob.local/${name}` }))
  return { blobs }
}

export async function del(pathname) {
  store.delete(pathname)
}

/* ------------------------------ test plumbing ------------------------------ */

export function _read(pathname) {
  return store.get(pathname) || null
}
export function _inject(pathname, bytes) {
  store.set(pathname, { bytes: Buffer.from(bytes), etag: newEtag(Buffer.from(bytes)) })
}
export function _containsBytes(pathname, needle) {
  const found = store.get(pathname)
  if (!found) return false
  return found.bytes.includes(Buffer.from(needle))
}
export async function _rowCount(pathname) {
  const found = store.get(pathname)
  if (!found) return 0
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(found.bytes)
  const ws = wb.getWorksheet('RSVP Responses')
  let n = 0
  if (ws) ws.eachRow((row, i) => { if (i > 1) n++ })
  return n
}

let server
export async function _start(port) {
  const { default: app } = await import('../../server/app.js')
  return new Promise((resolve) => {
    server = express()
    server.use(app)
    server = app.listen(port, () => resolve())
  })
}
export function _stop() {
  if (server) server.close()
}
