import { sign, verify } from './sessions.js'

export const COOKIE_ADMIN = 'hk_admin'
export const COOKIE_GUEST = 'hk_guest'

const TEN_DAYS = 10 * 24 * 60 * 60 * 1000

export function readCookies(req) {
  const header = req.headers.cookie || ''
  const out = {}
  header.split(';').forEach((part) => {
    const i = part.indexOf('=')
    if (i < 0) return
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  })
  return out
}

function cookieOptions(req) {
  const secure = process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true'
  return { httpOnly: true, secure, sameSite: 'lax', path: '/' }
}

export function setCookie(res, req, name, value, maxAgeMs) {
  const opts = cookieOptions(req)
  const bits = [`${name}=${encodeURIComponent(value)}`, 'HttpOnly', `SameSite=${opts.sameSite === 'lax' ? 'Lax' : 'Strict'}`, 'Path=/']
  if (opts.secure) bits.push('Secure')
  if (maxAgeMs) bits.push(`Max-Age=${Math.floor(maxAgeMs / 1000)}`)
  const prev = res.getHeader('Set-Cookie') || []
  res.setHeader('Set-Cookie', Array.isArray(prev) ? [...prev, bits.join('; ')] : [prev, bits.join('; ')])
}

export function clearCookie(res, req, name) {
  const bits = [`${name}=`, 'HttpOnly', 'SameSite=Lax', 'Path=/', 'Max-Age=0']
  if (cookieOptions(req).secure) bits.push('Secure')
  const prev = res.getHeader('Set-Cookie') || []
  res.setHeader('Set-Cookie', Array.isArray(prev) ? [...prev, bits.join('; ')] : [prev, bits.join('; ')])
}

/* ------------------------------- origin guard ------------------------------ */

const LOCAL_ORIGINS = [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/, /^http:\/\/\[::1\]:\d+$/]

export function originGuard(origin) {
  return (req, res, next) => {
    const src = req.headers.origin || req.headers.referer
    const host = req.headers.host
    if (!src) return next() // same-origin navigations and curl-style clients send no Origin
    let allowed = false
    try {
      const url = new URL(src)
      if (host && url.host === host) allowed = true
      else if (origin && url.origin === origin) allowed = true
      else if (LOCAL_ORIGINS.some((re) => re.test(url.origin))) allowed = true
    } catch {
      allowed = false
    }
    if (!allowed) return res.status(403).json({ error: 'Request origin not allowed.' })
    next()
  }
}

/* -------------------------------- rate limit ------------------------------- */

export function rateLimit({ windowMs = 10 * 60 * 1000, max = 60, message = 'Too many requests. Please try again later.' } = {}) {
  const hits = new Map()
  return (req, res, next) => {
    const key = req.ip || 'unknown'
    const now = Date.now()
    const arr = (hits.get(key) || []).filter((t) => now - t < windowMs)
    arr.push(now)
    hits.set(key, arr)
    if (arr.length > max) {
      // Tell the client exactly how long to wait so the UI can say something useful.
      const retryAfterMs = Math.max(1000, arr[0] + windowMs - now)
      res.set('Retry-After', String(Math.ceil(retryAfterMs / 1000)))
      return res.status(429).json({
        error: message,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
      })
    }
    next()
  }
}

/* --------------------------------- sessions -------------------------------- */

export function issueGuestSession(res, req, secret, rsvpId) {
  const token = sign({ kind: 'guest', rsvpId }, secret, TEN_DAYS)
  setCookie(res, req, COOKIE_GUEST, token, TEN_DAYS)
  return token
}

export function guestSession(req, secret) {
  const token = readCookies(req)[COOKIE_GUEST]
  const body = verify(token, secret)
  if (!body || body.kind !== 'guest') return null
  return body
}

export function clearGuestSession(res, req) {
  clearCookie(res, req, COOKIE_GUEST)
}

export function issueAdminSession(res, req, secret) {
  const token = sign({ kind: 'admin', email: process.env.ADMIN_EMAIL }, secret, 12 * 60 * 60 * 1000)
  setCookie(res, req, COOKIE_ADMIN, token, 12 * 60 * 60 * 1000)
  return token
}

export function adminSession(req, secret) {
  const body = verify(readCookies(req)[COOKIE_ADMIN], secret)
  if (!body || body.kind !== 'admin') return null
  return body
}

export function clearAdminSession(res, req) {
  clearCookie(res, req, COOKIE_ADMIN)
}

/* ---------------------------------- guards --------------------------------- */

export function requireAdmin(secret) {
  return (req, res, next) => {
    if (!adminSession(req, secret)) return res.status(401).json({ error: 'Administrator session required.' })
    next()
  }
}

/**
 * Access control for the protected wedding program.
 * The grant is a server-signed cookie bound to a specific RSVP submission id.
 * The workbook is re-checked on every request, so a declined visitor cannot
 * reuse an old grant after switching their RSVP to a decline.
 */
export function requireAttendingGuest(secret, lookupRecord) {
  return async (req, res, next) => {
    const session = guestSession(req, secret)
    if (!session) return res.status(401).json({ error: 'Attending RSVP required.' })
    try {
      const record = await lookupRecord(session.rsvpId)
      if (!record) return res.status(401).json({ error: 'RSVP record not found.' })
      if (record.attendance !== 'accepted') return res.status(403).json({ error: 'Attendance was declined.' })
      req.rsvpRecord = record
      next()
    } catch (err) {
      next(err)
    }
  }
}
