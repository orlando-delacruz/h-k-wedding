// Small fetch helpers — all requests carry cookies (session-based access control).
const JSON_HEADERS = { 'Content-Type': 'application/json' }

async function request(url, options = {}) {
  const res = await fetch(url, { credentials: 'same-origin', ...options })
  let body = null
  try {
    body = await res.json()
  } catch {
    body = null
  }
  if (!res.ok) {
    const err = new Error((body && body.error) || `Request failed (${res.status})`)
    err.status = res.status
    err.body = body
    throw err
  }
  return body
}

export const api = {
  health: () => request('/api/health'),
  accessState: () => request('/api/rsvp/access'),
  submitRsvp: (payload) => request('/api/rsvp', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(payload) }),
  program: () => request('/api/program'),
  adminLogin: (email, password) => request('/api/admin/login', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ email, password }) }),
  adminSession: () => request('/api/admin/session'),
  adminLogout: () => request('/api/admin/logout', { method: 'POST' }),
  adminRecords: ({ q = '', attendance = '' } = {}) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (attendance) params.set('attendance', attendance)
    return request(`/api/admin/rsvps?${params.toString()}`)
  },
  adminSetStatus: (id, status) =>
    request(`/api/admin/rsvps/${encodeURIComponent(id)}`, { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify({ status }) }),
}
