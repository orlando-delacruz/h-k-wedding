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
  // useId keeps the gradient id unique: the hero and the footer both render this
  // ornament on the same page.
  const gid = `gold-${useId().replace(/:/g, '')}`
  // One heart glyph, reused at three sizes — the small pair flanks a full-size
  // heart at the centre.
  const heart = (x, y, s) => (
    <path
      d="M0 3.1C0 1.5 1.3.2 2.9.2c1 0 1.8.5 2.3 1.3C5.7.7 6.5.2 7.5.2 9.1.2 10.4 1.5 10.4 3.1c0 2.6-3.6 5-5.2 6.9C3.6 8.1 0 5.7 0 3.1Z"
      transform={`translate(${x} ${y}) scale(${s})`}
      stroke={`url(#${gid})`}
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
  )
  return (
    <div className="ornament" aria-hidden="true">
      <svg viewBox="0 0 240 34" width="220" height="31" fill="none">
        <path d="M6 17h70" stroke={`url(#${gid})`} strokeWidth="1.2" />
        <path d="M164 17h70" stroke={`url(#${gid})`} strokeWidth="1.2" />
        {heart(96.9, 13.5, 0.6)}
        {heart(114.8, 11.5, 1)}
        {heart(136.9, 13.5, 0.6)}
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="240" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#BF953F" /><stop offset=".35" stopColor="#FCF6BA" /><stop offset=".6" stopColor="#AA771C" /><stop offset="1" stopColor="#BF953F" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
