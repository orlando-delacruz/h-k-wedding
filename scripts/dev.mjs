/**
 * Runs the API server and the Vite dev server together in one terminal.
 * Usage: npm run dev   (or npm run dev:all — same thing)
 *
 * Without the API server, every /api call fails with 500 / ECONNREFUSED through
 * the Vite proxy. This is the single command that avoids that.
 */
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()

// Preflight: warn early about missing server configuration instead of a confusing 500.
const envPath = path.join(ROOT, '.env')
let envText = ''
try {
  envText = fs.readFileSync(envPath, 'utf8')
} catch {
  console.error('No .env file found. Copy .env.example to .env and fill in the values first.')
  process.exit(1)
}
const configured = (name) => new RegExp(`^${name}=.+`, 'm').test(envText)
if (!configured('ADMIN_EMAIL') || !configured('ADMIN_PASSWORD')) {
  console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.')
  process.exit(1)
}
if (!configured('SESSION_SECRET')) {
  console.warn('[warn] SESSION_SECRET is empty — sessions reset every server restart. Set it in .env.')
}

const processes = []
let shuttingDown = false

/** Detect an already-listening API on either loopback (Windows may bind IPv6 only). */
async function portInUse(port) {
  const net = await import('net')
  const tryConnect = (host) =>
    new Promise((resolve) => {
      const socket = net.connect({ port, host })
      const done = (result) => { socket.destroy(); resolve(result) }
      socket.once('connect', () => done(true))
      socket.once('error', () => done(false))
      socket.setTimeout(400, () => done(false))
    })
  return (await tryConnect('127.0.0.1')) || (await tryConnect('::1'))
}

function start(label, args, color) {
  // Spawn "node" from PATH with an argument array — no shell, so spaces in the
  // executable path cannot break the command on Windows.
  const child = spawn('node', args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] })
  processes.push(child)
  const prefix = `\x1b[${color}m[${label}]\x1b[0m `
  const pipe = (stream, target) => {
    let buffer = ''
    stream.on('data', (chunk) => {
      buffer += chunk.toString()
      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop()
      lines.forEach((line) => line.trim() && target.write(prefix + line + '\n'))
    })
  }
  pipe(child.stdout, process.stdout)
  pipe(child.stderr, process.stderr)
  child.on('error', (err) => {
    console.error(`${prefix}could not start: ${err.message}`)
    shutdown(1)
  })
  child.on('exit', (code) => {
    if (shuttingDown) return
    console.log(`${prefix}exited with code ${code}`)
    shutdown(code ?? 0)
  })
}

function shutdown(code = 0) {
  shuttingDown = true
  processes.forEach((p) => { try { p.kill() } catch {} })
  setTimeout(() => process.exit(code), 400)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

const API_PORT = Number(process.env.PORT || 3001)

if (await portInUse(API_PORT)) {
  console.log(`The RSVP API is already running on port ${API_PORT} — reusing it.`)
} else {
  start('api', ['server/index.js'], '33')
  console.log(`\nStarting the RSVP API (:${API_PORT}) and the Vite dev server. Press Ctrl+C to stop both.\n`)
}
start('web', ['./node_modules/vite/bin/vite.js'], '36')
