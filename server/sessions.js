// Minimal signed-token sessions (HMAC-SHA256), stored in HttpOnly cookies.
// No session data lives in the client bundle or localStorage.
import crypto from 'crypto'

export function sign(payload, secret, ttlMs) {
  const body = { ...payload, exp: Date.now() + ttlMs }
  const data = Buffer.from(JSON.stringify(body)).toString('base64url')
  const mac = crypto.createHmac('sha256', secret).update(data).digest('base64url')
  return `${data}.${mac}`
}

export function verify(token, secret) {
  if (typeof token !== 'string' || !token.includes('.')) return null
  const [data, mac] = token.split('.')
  if (!data || !mac) return null
  const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url')
  const a = Buffer.from(mac)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const body = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'))
    if (!body.exp || body.exp < Date.now()) return null
    return body
  } catch {
    return null
  }
}

/** Constant-time string compare for credentials. */
export function safeEqual(a = '', b = '') {
  const ab = Buffer.from(String(a))
  const bb = Buffer.from(String(b))
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

/** Constant-time password comparison against the value configured in .env. */
export function verifyPlain(password, expected) {
  return safeEqual(password, expected)
}

export function randomSecret() {
  return crypto.randomBytes(32).toString('hex')
}
