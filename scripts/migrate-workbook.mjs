/**
 * Uploads the local workbook to Vercel Blob and/or downloads the current blob copy.
 *
 *   node scripts/migrate-workbook.mjs upload     # local data/rsvps.xlsx -> Blob
 *   node scripts/migrate-workbook.mjs download   # Blob -> backups/rsvps-<date>.xlsx
 *
 * Requires blob credentials in the environment:
 *   BLOB_READ_WRITE_TOKEN, or BLOB_STORE_ID + VERCEL_OIDC_TOKEN (vercel env pull)
 */
import fs from 'fs'
import path from 'path'
import { put, get, head } from '@vercel/blob'

const BLOB_PATH = process.env.WORKBOOK_BLOB_PATH || 'rsvp/rsvps.xlsx'
const LOCAL = process.env.WORKBOOK_PATH || path.join(process.cwd(), 'data', 'rsvps.xlsx')
const BACKUP_DIR = path.join(process.cwd(), 'backups')

const command = process.argv[2]

if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
  console.error('No Blob credentials found. Set BLOB_READ_WRITE_TOKEN, or run `vercel env pull` and retry.')
  process.exit(1)
}

if (command === 'upload') {
  if (!fs.existsSync(LOCAL)) {
    console.error(`No local workbook at ${LOCAL}. Nothing to upload.`)
    process.exit(1)
  }
  const bytes = fs.readFileSync(LOCAL)
  const res = await put(BLOB_PATH, bytes, {
    access: 'private',
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  console.log(`Uploaded ${bytes.length} bytes to ${BLOB_PATH}`)
  console.log(`ETag: ${res.etag}`)
  console.log('The site will now read this copy. Keep the local file as a backup.')
} else if (command === 'download') {
  const result = await get(BLOB_PATH, { access: 'private', useCache: false })
  if (!result || result.statusCode !== 200 || !result.stream) {
    console.error('No workbook found in the blob store yet.')
    process.exit(1)
  }
  const bytes = Buffer.from(await new Response(result.stream).arrayBuffer())
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const target = path.join(BACKUP_DIR, `rsvps-blob-${stamp}.xlsx`)
  fs.writeFileSync(target, bytes)
  console.log(`Downloaded ${bytes.length} bytes to ${target}`)
  console.log('Open it in Excel to review or archive the RSVP records.')
} else if (command === 'info') {
  try {
    const meta = await head(BLOB_PATH)
    console.log(`Blob: ${meta.pathname}`)
    console.log(`Size: ${meta.size} bytes`)
    console.log(`Uploaded: ${meta.uploadedAt}`)
  } catch {
    console.log('No workbook in the blob store yet.')
  }
} else {
  console.error('Usage: node scripts/migrate-workbook.mjs upload|download|info')
  process.exit(1)
}
