import React, { useState } from 'react'
import { SITE, RSVP_FORM, ACCESS } from '../config/site.js'
import { GoldFrame, Ornament, Field } from './ui.jsx'
import { ShinyText, ParticleField } from './effects.jsx'
import { CalendarIcon, MailIcon, RingIcon } from './Icons.jsx'

/**
 * The first view: answer the form, then enter the code it shares. Two numbered
 * steps, because guests kept missing the order. Courtesy gate only — the code
 * ships in the bundle, so it keeps polite guests out, not determined ones. A
 * successful code is remembered on the device and re-checked on every load
 * (see `App.jsx`), so a refresh stays inside.
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
          <span className="gate-crest"><RingIcon size={22} /></span>
          <p className="gate-kicker">{ACCESS.kicker}</p>
          <h1 className="gate-names">
            <ShinyText>Harthwel</ShinyText>
            <span className="script gate-amp">and</span>
            <ShinyText>Khatrina</ShinyText>
          </h1>
          <p className="gate-date"><CalendarIcon size={15} /> {SITE.dateLabel} · {SITE.timeLabel}</p>
          <Ornament />
        </header>

        <div className="gate-steps">
          <section className="gate-step">
            <span className="gate-step-badge" aria-hidden="true">1</span>
            <div className="gate-step-body">
              <h2 className="gate-step-title">Answer our RSVP form</h2>
              <p className="gate-sub">{ACCESS.sub}</p>
              <a className="btn btn-gold gate-form-btn" href={RSVP_FORM.linkUrl} target="_blank" rel="noreferrer">
                <MailIcon size={16} /> {ACCESS.formButton}
              </a>
              <p className="gate-deadline">{SITE.rsvpDeadline}</p>
            </div>
          </section>

          <section className="gate-step">
            <span className="gate-step-badge" aria-hidden="true">2</span>
            <div className="gate-step-body">
              <h2 className="gate-step-title">Enter the code you receive</h2>
              <form className="gate-form" onSubmit={submit} noValidate>
                <Field label={ACCESS.codeLabel}>
                  <input
                    className="gate-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck="false"
                    placeholder="ABCD2345EF"
                  />
                </Field>
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="btn btn-gold gate-code-btn" type="submit">
                  <MailIcon size={16} /> {ACCESS.codeButton}
                </button>
              </form>
            </div>
          </section>
        </div>

        <p className="gate-hash">{SITE.hashtag}</p>
      </GoldFrame>
    </div>
  )
}
