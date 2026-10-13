import React, { useId } from 'react'
import { SparkleIcon } from './Icons.jsx'

export function SectionHeading({ icon: Icon, kicker, title, sub, className = '' }) {
  return (
    <header className={`sec-head ${className}`} data-reveal>
      {Icon && (
        <div className="sec-icon">
          <Icon size={22} />
        </div>
      )}
      {kicker && <p className="sec-kicker">{kicker}</p>}
      <h2 className="sec-title">{title}</h2>
      <Divider />
      {sub && <p className="sec-sub">{sub}</p>}
    </header>
  )
}

export function Divider({ className = '' }) {
  return (
    <div className={`divider ${className}`} aria-hidden="true">
      <span className="divider-line" />
      <SparkleIcon size={14} className="divider-gem" />
      <span className="divider-line" />
    </div>
  )
}

export function GoldFrame({ children, className = '', corners = true, label }) {
  return (
    <div className={`gold-frame ${className}`}>
      {corners && (
        <>
          <span className="fc tl" aria-hidden="true" />
          <span className="fc tr" aria-hidden="true" />
          <span className="fc bl" aria-hidden="true" />
          <span className="fc br" aria-hidden="true" />
        </>
      )}
      {label && <span className="frame-label">{label}</span>}
      {children}
    </div>
  )
}

export function Ornament() {
  // useId keeps the gradient id unique: the hero, the footer and the entry
  // curtain all render this ornament on the same page.
  const gid = `gold-${useId().replace(/:/g, '')}`
  return (
    <div className="ornament" aria-hidden="true">
      <svg viewBox="0 0 240 34" width="220" height="31" fill="none">
        <path d="M6 17h58" stroke={`url(#${gid})`} strokeWidth="1.2" />
        <path d="M176 17h58" stroke={`url(#${gid})`} strokeWidth="1.2" />
        <path d="M120 5.5c4 5 9 6.5 15 19.5-6-13-11.5-14-15-14s-9 1-15 14c6-13 11-14.5 15-19.5Z" stroke={`url(#${gid})`} strokeWidth="1.2" />
        <circle cx="120" cy="17" r="2.4" fill={`url(#${gid})`} />
        <circle cx="104" cy="17" r="1.5" fill={`url(#${gid})`} />
        <circle cx="136" cy="17" r="1.5" fill={`url(#${gid})`} />
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="240" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#BF953F" /><stop offset=".35" stopColor="#FCF6BA" /><stop offset=".6" stopColor="#AA771C" /><stop offset="1" stopColor="#BF953F" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export function Field({ label, children, hint }) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}
