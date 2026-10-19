import React, { useState } from 'react'
import { SITE, RSVP_FORM, ACCESS } from '../config/site.js'
import { GoldFrame } from './ui.jsx'
import { ShinyText, ParticleField } from './effects.jsx'
import { CalendarIcon, MailIcon } from './Icons.jsx'

/**
 * The first view: answer the form, then enter the code it shares. An unboxed,
 * editorial column — no crest, no numbering, no step frames — so the two
 * sentences carry the order on their own. Courtesy gate only: the code ships in
 * the bundle, so it keeps polite guests out, not determined ones. A successful
 * code is remembered on the device and re-checked on every load (see `App.jsx`),
 * so a refresh stays inside.
 */
export default function AccessGate({ onUnlock }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    const value = code.trim().toUpperCase()
    if (value && value === ACCESS.code.toUpperCase()) {
      setError('')
      onUnlock(value)
      return
    }
    setError(ACCESS.codeError)
  }

  return (
    <div className="access-gate">
      <ParticleField density={40} className="gate-particles" />
      <div className="gate-vignette" aria-hidden="true" />

      <GoldFrame className="gate-card">
        <header className="gate-head">
          <h1 className="gate-names">
            <ShinyText>Harthwel</ShinyText>
            <span className="script gate-amp">and</span>
            <ShinyText>Khatrina</ShinyText>
          </h1>
          <p className="gate-date">
            <CalendarIcon size={15} />
            <span className="gate-date-part">{SITE.dateLabel}</span>
            <span className="gate-date-dot" aria-hidden="true">·</span>
            <span className="gate-date-part gate-date-time">{SITE.timeLabel}</span>
          </p>
        </header>

        <div className="gate-steps">
          <section className="gate-step">
            <h2 className="gate-step-title">{ACCESS.attendanceTitle}</h2>
            <p className="gate-sub">{ACCESS.sub}</p>
            <a className="btn btn-gold gate-form-btn" href={RSVP_FORM.linkUrl} target="_blank" rel="noreferrer">
              <MailIcon size={16} /> {ACCESS.formButton}
            </a>
            <p className="gate-deadline">{SITE.rsvpDeadline}</p>
          </section>

          <section className="gate-step">
            <h2 className="gate-step-title">{ACCESS.codeTitle}</h2>
            <form className="gate-form" onSubmit={submit} noValidate>
              {/* The input keeps its accessible name, not a visible label. */}
              <input
                className="gate-input"
                aria-label={ACCESS.codeLabel}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck="false"
                placeholder="ABCD2345EF"
              />
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="btn btn-gold gate-code-btn" type="submit">
                <MailIcon size={16} /> {ACCESS.codeButton}
              </button>
            </form>
          </section>
        </div>

        <p className="gate-hash">{SITE.hashtag}</p>
      </GoldFrame>
    </div>
  )
}
