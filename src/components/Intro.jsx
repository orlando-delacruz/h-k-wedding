import React, { useEffect, useRef, useState } from 'react'
import anime from 'animejs'
import { MailIcon, SparkleIcon } from './Icons.jsx'
import { ParticleField, burstAt } from './effects.jsx'

/* Sealed-envelope intro: tap the wax seal to unseal the invitation. */
export default function Intro({ onOpen }) {
  const [state, setState] = useState('idle') // idle | opening | gone
  const root = useRef(null)
  const seal = useRef(null)

  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (state !== 'opening') return
    burstAt(root.current, 30)
    if (reduced) {
      const t = setTimeout(() => setState('gone'), 250)
      return () => clearTimeout(t)
    }
    const tl = anime.timeline({ easing: 'easeOutCubic' })
    tl.add({ targets: seal.current, scale: [1, 1.25, 0], rotate: [0, -18, 40], opacity: [1, 1, 0], duration: 620 })
      .add({ targets: '.intro-flap', rotateX: [0, -168], duration: 900, easing: 'easeInOutQuad' }, '-=380')
      .add({ targets: '.intro-card', translateY: [24, -14], scale: [0.92, 1.02], opacity: [0, 1], duration: 700 }, '-=620')
      .add({ targets: '.intro-overlay', opacity: [1, 0], duration: 620, easing: 'easeInQuad' }, '-=340')
      .add({
        complete: () => setState('gone'),
      })
  }, [state, reduced])

  useEffect(() => {
    document.body.classList.toggle('no-scroll', state !== 'gone')
    if (state === 'gone') onOpen?.()
  }, [state, onOpen])

  if (state === 'gone') return null

  return (
    <div ref={root} className={`intro ${state === 'opening' ? 'opening' : ''}`}>
      <div className="intro-overlay">
        <ParticleField density={40} />
        <div className="intro-inner">
          <p className="intro-kicker">The Wedding Of</p>
          <div className="intro-names">
            <span>Harthwel</span>
            <i className="script">and</i>
            <span>Khatrina</span>
          </div>
          <div className="envelope">
            <div className="envelope-back" />
            <div className="intro-card">
              <MailIcon size={26} />
              <p>You are cordially invited</p>
              <small>November 30, 2026 · Girasoles Farm</small>
            </div>
            <div className="intro-flap" />
            <button ref={seal} className="seal" onClick={() => state === 'idle' && setState('opening')} aria-label="Open invitation">
              <SparkleIcon size={16} />
              <b>H</b>
              <i>·</i>
              <b>K</b>
            </button>
          </div>
          <p className="intro-hint">Tap the seal to open</p>
        </div>
      </div>
    </div>
  )
}
