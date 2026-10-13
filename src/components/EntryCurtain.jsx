import React, { useEffect, useRef, useState } from 'react'
import anime from 'animejs'
import { SITE } from '../config/site.js'
import { burstAt } from './effects.jsx'
import { Ornament } from './ui.jsx'
import { FloralCorner } from './Floral.jsx'

const REDUCED = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const HOLD_MS = 1400
const OPEN_MS = 3200
const FADE_MS = 650

/**
 * Full-screen midnight-velvet curtain shown once, right after the access code
 * matches. It holds closed, then opens the way cloth does — the slack is taken
 * up, the drape swings back on the rod, the hem trails the top, the folds
 * compress toward the rod end and a wave runs through the fabric — while the
 * music starts (onBeginOpening). "Tap to unveil" skips the hold; reduced-motion
 * guests go straight to the hero.
 */
export default function EntryCurtain({ onBeginOpening, onOpened }) {
  const rootRef = useRef(null)
  const [leaving, setLeaving] = useState(false)
  const stateRef = useRef({ opened: false, left: false })
  const timers = useRef([])

  useEffect(() => {
    document.body.classList.add('no-scroll')
    if (REDUCED) {
      onBeginOpening()
      onOpened()
      return () => document.body.classList.remove('no-scroll')
    }
    timers.current.push(setTimeout(beginOpening, HOLD_MS))
    return () => {
      timers.current.forEach(clearTimeout)
      document.body.classList.remove('no-scroll')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function beginOpening() {
    const s = stateRef.current
    if (s.opened) return
    s.opened = true
    onBeginOpening()
    const root = rootRef.current
    if (root) {
      root.classList.add('opening')
      burstAt(root, 34)
      open(root.querySelector('.entry-panel.left'), -1, 0, OPEN_MS)
      open(root.querySelector('.entry-panel.right'), 1, 90, OPEN_MS - 160)
      anime({
        targets: root.querySelector('.entry-shadow'),
        opacity: [1, 0],
        duration: OPEN_MS * 0.85,
        easing: 'easeOutQuad',
      })
      anime({
        targets: root.querySelector('.entry-crest'),
        translateY: [0, 58],
        opacity: [1, 0],
        scale: [1, 0.86],
        duration: 950,
        delay: 220,
        easing: 'easeInQuad',
      })
      const tie = (target, dir) => anime({
        targets: target,
        opacity: [0, 1],
        translateX: [0, dir * 26],
        duration: 1500,
        delay: 700,
        easing: 'easeOutQuad',
      })
      tie(root.querySelector('.entry-tieback.left'), -1)
      tie(root.querySelector('.entry-tieback.right'), 1)
    }
    timers.current.push(setTimeout(leave, OPEN_MS + 200))
  }

  /**
   * Cloth, not a sliding panel:
   *  - the first ~12% of the travel is the slack being taken up (slow), then the
   *    pull (fast), then a long settle — one keyframed translateX
   *  - the drape pivots at the rod end, top corner, so the hem swings through a
   *    wider arc than the header (skewY about that origin) and the cloth swings
   *    back into the room (rotateY)
   *  - folds compress toward the rod end (scaleX about the rod-end origin)
   *  - a soft light wave runs from the leading edge to the rod end, so the
   *    fabric looks like it is being disturbed rather than moved
   */
  function open(panel, dir, delay, duration) {
    if (!panel) return
    anime({
      targets: panel,
      translateX: [
        { value: dir * 5, duration: duration * 0.14, easing: 'easeInQuad' },
        { value: dir * 74, duration: duration * 0.5, easing: 'easeInOutQuart' },
        { value: dir * 66, duration: duration * 0.36, easing: 'easeInOutSine' },
      ],
      scaleX: [
        { value: 0.985, duration: duration * 0.14, easing: 'easeInQuad' },
        { value: 0.5, duration: duration * 0.5, easing: 'easeInOutQuart' },
        { value: 0.42, duration: duration * 0.36, easing: 'easeInOutSine' },
      ],
      rotateY: [
        { value: dir * -2, duration: duration * 0.14, easing: 'easeInQuad' },
        { value: dir * -17, duration: duration * 0.5, easing: 'easeInOutQuart' },
        { value: dir * -12, duration: duration * 0.36, easing: 'easeInOutSine' },
      ],
      skewY: [
        { value: dir * -1.4, duration: duration * 0.3, easing: 'easeOutQuad' },
        { value: dir * -4.6, duration: duration * 0.4, easing: 'easeInOutSine' },
        { value: dir * -1.8, duration: duration * 0.3, easing: 'easeInOutSine' },
      ],
      translateY: [
        { value: 3, duration: duration * 0.3, easing: 'easeOutQuad' },
        { value: 9, duration: duration * 0.4, easing: 'easeInOutSine' },
        { value: 0, duration: duration * 0.3, easing: 'easeInOutSine' },
      ],
      scaleY: [
        { value: 1.02, duration: duration * 0.45, easing: 'easeOutQuad' },
        { value: 1, duration: duration * 0.55, easing: 'easeInOutSine' },
      ],
      duration,
      delay,
    })
    anime({
      targets: panel.querySelector('.entry-wave'),
      translateX: [0, dir * 150],
      opacity: [
        { value: 0.5, duration: duration * 0.25, easing: 'easeOutQuad' },
        { value: 0, duration: duration * 0.75, easing: 'easeInQuad' },
      ],
      duration,
      delay: delay + 120,
    })
    anime({
      targets: panel.querySelector('.entry-floral'),
      translateX: [0, dir * -16],
      duration,
      delay,
      easing: 'easeInOutQuart',
    })
    anime({
      targets: panel.querySelector('.entry-dim'),
      opacity: [0, 0.32],
      duration: duration * 0.8,
      delay,
      easing: 'easeOutQuad',
    })
  }

  function leave() {
    const s = stateRef.current
    if (s.left) return
    s.left = true
    if (!s.opened) {
      s.opened = true
      onBeginOpening()
    }
    setLeaving(true)
    timers.current.push(setTimeout(onOpened, FADE_MS))
  }

  return (
    <div ref={rootRef} className={`entry-curtain${leaving ? ' leaving' : ''}`} role="dialog" aria-label="Unveiling your invitation">
      <div className="entry-backdrop" aria-hidden="true" />
      <div className="entry-panel left" aria-hidden="true">
        <span className="entry-weave" /><span className="entry-wave" /><span className="entry-sheen" />
        <span className="entry-floral"><FloralCorner /></span>
        <span className="entry-trim" /><span className="entry-dim" />
      </div>
      <div className="entry-panel right" aria-hidden="true">
        <span className="entry-weave" /><span className="entry-wave" /><span className="entry-sheen" />
        <span className="entry-floral"><FloralCorner /></span>
        <span className="entry-trim" /><span className="entry-dim" />
      </div>
      <div className="entry-shadow" aria-hidden="true" />
      <div className="entry-valance" aria-hidden="true" />
      <div className="entry-rod" aria-hidden="true" />
      <div className="entry-crest-slot">
        <div className="entry-crest">
          <Ornament />
          <p className="entry-names">Harthwel &amp; Khatrina</p>
          <p className="entry-date">{SITE.dateLabel}</p>
        </div>
      </div>
      <span className="entry-tieback left" aria-hidden="true"><i /><b /></span>
      <span className="entry-tieback right" aria-hidden="true"><i /><b /></span>
      <button type="button" className="entry-skip" onClick={leave}>Tap to unveil</button>
    </div>
  )
}
