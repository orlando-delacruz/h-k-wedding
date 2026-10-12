import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api.js'
import { MailIcon, CheckIcon, UsersIcon, ClockIcon } from './Icons.jsx'
import { GoldFrame, Divider } from './ui.jsx'

const STATUS_OPTIONS = ['New', 'Reviewed', 'Duplicate', 'Resolved']

export default function Admin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(null) // null = checking, false = login form, true = dashboard
  const [rows, setRows] = useState([])
  const [totals, setTotals] = useState(null)
  const [filter, setFilter] = useState('')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await api.adminRecords({ q: query, attendance: filter })
      setRows(data.records)
      setTotals(data.totals)
      setError('')
    } catch (err) {
      if (err.status === 401) setAuthed(false)
      else setError(err.message)
    }
  }, [query, filter])

  useEffect(() => {
    api.adminSession()
      .then((s) => setAuthed(!!s.authenticated))
      .catch(() => setAuthed(false))
  }, [])

  useEffect(() => {
    if (authed) load()
  }, [authed, load])

  async function login() {
    setBusy(true)
    setError('')
    try {
      await api.adminLogin(email.trim(), password)
      setPassword('')
      setAuthed(true)
    } catch (err) {
      setError(err.status === 401 ? 'Invalid email or password.' : err.message)
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    await api.adminLogout().catch(() => {})
    setAuthed(false)
    setRows([])
  }

  async function setStatus(record, status) {
    // Preserve history: rows are never deleted, only their review status changes.
    try {
      await api.adminSetStatus(record.id, status)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const duplicates = useMemo(() => {
    const byName = new Map()
    rows.forEach((r) => {
      const key = r.name.trim().toLowerCase()
      if (!key) return
      byName.set(key, (byName.get(key) || 0) + 1)
    })
    return new Set([...byName.entries()].filter(([, n]) => n > 1).map(([k]) => k))
  }, [rows])

  if (authed === null) {
    return <div className="admin"><p className="gate-checking">Checking your admin session…</p></div>
  }

  if (!authed) {
    return (
      <div className="admin">
        <div className="admin-wrap" style={{ maxWidth: 420, marginTop: '8vh' }}>
          <GoldFrame className="admin-card" label="Private">
            <div style={{ padding: '26px 22px', textAlign: 'center' }}>
              <div className="sec-icon" style={{ margin: '0 auto 14px' }}><MailIcon size={22} /></div>
              <h2 style={{ fontSize: 26, marginBottom: 4 }}>Admin Login</h2>
              <p style={{ color: 'var(--muted)', fontSize: 12.5, marginBottom: 18 }}>
                RSVP records are private to the couple. Credentials come from the server's <code>.env</code> file.
              </p>
              <label className="field"><span className="field-label">Email</span>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin email" autoComplete="username" />
              </label>
              <label className="field"><span className="field-label">Password</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" autoComplete="current-password" onKeyDown={(e) => e.key === 'Enter' && login()} />
              </label>
              {error && <p className="rsvp-error" role="alert">{error}</p>}
              <button className="btn btn-gold" style={{ width: '100%' }} disabled={busy} onClick={login}>
                <CheckIcon size={16} /> {busy ? 'Signing in…' : 'Login'}
              </button>
              <Divider />
              <a className="admin-back" href="#">← Back to invitation</a>
            </div>
          </GoldFrame>
        </div>
      </div>
    )
  }

  return (
    <div className="admin">
      <div className="admin-wrap">
        <div className="admin-head">
          <h2>RSVP Records <span style={{ color: 'var(--gold-3)', fontSize: 15 }}>({totals?.submissions ?? rows.length})</span></h2>
          <div className="admin-toolbar">
            <button className="btn btn-outline" onClick={load}>Refresh</button>
            <button className="btn btn-outline" onClick={logout}>Logout</button>
            <a className="btn btn-gold" href="#">Invitation</a>
          </div>
        </div>

        {totals && (
          <div className="admin-toolbar" aria-label="Totals">
            <span className="chip"><UsersIcon size={13} /> Attending responses · {totals.attendingResponses}</span>
            <span className="chip"><UsersIcon size={13} /> Companions · {totals.companions}</span>
            <span className="chip"><UsersIcon size={13} /> Total guests · {totals.totalGuests}</span>
            <span className="chip"><ClockIcon size={13} /> Declined · {totals.decliningResponses}</span>
          </div>
        )}

        <div className="admin-toolbar">
          {['', 'accepted', 'declined'].map((f) => (
            <button key={f || 'all'} className={`song-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === '' ? 'All' : f === 'accepted' ? 'Attending' : 'Declined'}
            </button>
          ))}
          <input style={{ maxWidth: 260 }} placeholder="Search name, guest, message, ID…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        {error && <p className="rsvp-error" role="alert">{error}</p>}

        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Submission</th><th>Name</th><th>Attendance</th><th>Party</th><th>Companions</th>
                <th>Message</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isDuplicate = duplicates.has(r.name.trim().toLowerCase())
                return (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <code>{r.id}</code>
                      <div style={{ color: 'var(--muted)', fontSize: 11 }}>{r.timestamp}</div>
                    </td>
                    <td>
                      <b>{r.name}</b>
                      {isDuplicate && <div><span className="admin-pill new">possible duplicate</span></div>}
                    </td>
                    <td><span className={`admin-pill ${r.attendance}`}>{r.attendance}</span></td>
                    <td>{r.attendance === 'accepted' ? r.partySize : '—'}</td>
                    <td>{[r.guest1, r.guest2].filter(Boolean).join(', ') || '—'}</td>
                    <td>{r.message || '—'}</td>
                    <td>
                      <span className={`admin-pill ${r.status === 'New' ? 'new' : ''}`}>{r.status}</span>
                      {r.resolvedBy && <div style={{ color: 'var(--muted)', fontSize: 10.5 }}>by {r.resolvedBy}</div>}
                      {r.resolvedAt && <div style={{ color: 'var(--muted)', fontSize: 10.5 }}>{r.resolvedAt}</div>}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <select
                        value={r.status}
                        aria-label={`Review status for ${r.name}`}
                        onChange={(e) => setStatus(r, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                )
              })}
              {!rows.length && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)' }}>No records yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 11.5, marginTop: 14 }}>
          Records are stored server-side in an Excel workbook. Rows are never deleted — duplicate submissions are kept for review.
        </p>
      </div>
    </div>
  )
}
