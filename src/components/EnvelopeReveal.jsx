import React, { useEffect, useRef, useState } from 'react'
import anime from 'animejs'
import { burstAt, ShinyText } from './effects.jsx'
import { Divider } from './ui.jsx'
import { CalendarIcon, ChevronDownIcon } from './Icons.jsx'

const REDUCED = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* Beats, in ms: the envelope holds, the flap falls open, the front page is drawn
   out of the pocket and grows as it comes, then it is set down on the living hero
   card while the envelope dissolves behind it and the default song starts. */
const HOLD_MS = 900
const FLAP_MS = 1150
const RISE_DELAY = 950
const RISE_MS = 1250
const PLACE_DELAY = 2250
const PLACE_MS = 950
const DISSOLVE_MS = 950
const FADE_LEAD = 1000
const FADE_MS = 650

/* The page's pose. The tuck is measured in envelope heights (it lives in the
   pocket); the pull-out is measured from the top of the viewport, so the whole
   page is on screen at every size, whatever the envelope's proportions. */
const TUCK_T = 0.05
const TUCK_S = 0.22
const OUT_S = 0.62
const OUT_TOP = 0.06

/**
 * The opening of the invitation, once the access code matches: a velvet
 * midnight-blue envelope with antique gold on the flap tip, held in real 3D —
 * the stage carries the perspective, the envelope the depth, so the flap swings
 * back on its fold line and the front page is drawn out of the pocket. The page
 * is then set down exactly where the living hero card sits (measured from the
 * page behind the overlay, so the two are indistinguishable at the hand-off)
 * while the envelope dissolves and the default song starts.
 *
 * Reduced-motion guests go straight to the hero, and "Tap to unveil" skips
 * ahead for anyone who wants in now.
 */
export default function EnvelopeReveal({ onBeginOpening, onOpened }) {
  const rootRef = useRef(null)
  const envRef = useRef(null)
  const flapRef = useRef(null)
  const letterRef = useRef(null)
  const riseRef = useRef(null)
  const timelineRef = useRef(null)
  const timers = useRef([])
  const poseRef = useRef({ riseTo: 0 })
  const stateRef = useRef({ placed: false, done: false })
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    document.body.classList.add('no-scroll')
    const cleanup = () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
      timelineRef.current?.pause()
      document.body.classList.remove('no-scroll')
    }

    if (REDUCED) {
      onBeginOpening()
      onOpened()
      return cleanup
    }

    const env = envRef.current
    const letter = letterRef.current
    const rise = riseRef.current
    const hero = document.querySelector('#top .hero-card')

    /* Match the page's geometry to the hero card behind the overlay: same width,
       same classes, same content — so the last frame of the pull-out and the live
       hero are the same size and the crossfade cannot be seen. */
    if (letter && hero) {
      const w = Math.round(hero.getBoundingClientRect().width)
      if (w) letter.style.width = `${w}px`
    }

    // Tucked in the pocket, its top edge peeking into the mouth.
    const H = env?.offsetHeight || 220
    const riseFrom = Math.round(H * TUCK_T)
    // Drawn clear of the pocket and held with a sliver of screen above it, so the
    // set-down that follows never starts off-frame. The envelope is centred in the
    // layer, so its centre line is the middle of the viewport.
    const cardH = letter?.getBoundingClientRect().height || 0
    const riseTo = Math.round(window.innerHeight * OUT_TOP + (cardH * OUT_S) / 2 - window.innerHeight / 2)
    poseRef.current = { riseTo }
    if (rise) rise.style.transform = `translateY(${riseFrom}px) scale(${TUCK_S})`

    const tl = anime.timeline({ autoplay: true })
    timelineRef.current = tl

    tl.add({ targets: rootRef.current, opacity: [0, 1], duration: 420, easing: 'linear' }, 0)
    // Squared to the camera, the way a held envelope is turned to face you.
    tl.add({ targets: env, rotateX: [7, 0], rotateZ: [-1.2, 0], duration: 1000, easing: 'easeOutCubic' }, HOLD_MS)
    // The flap swings back on its fold line.
    tl.add({ targets: flapRef.current, rotateX: [0, -152], duration: FLAP_MS, easing: 'easeInOutQuart' }, HOLD_MS)
    tl.add({
      targets: rise,
      translateY: [riseFrom, riseTo],
      scale: [TUCK_S, OUT_S],
      duration: RISE_MS,
      easing: 'easeOutCubic',
    }, HOLD_MS + RISE_DELAY)
    // The envelope lets go, piece by piece, behind the page.
    tl.add({
      targets: env ? env.querySelectorAll('[data-fade]') : [],
      opacity: [1, 0],
      duration: DISSOLVE_MS,
      delay: anime.stagger(80),
      easing: 'easeInOutQuad',
    }, HOLD_MS + PLACE_DELAY)
    tl.add({ targets: rootRef.current, opacity: [1, 0], duration: FADE_MS, easing: 'linear' }, HOLD_MS + PLACE_DELAY + FADE_LEAD)

    timers.current.push(setTimeout(() => burstAt(rootRef.current, 30), HOLD_MS + 240))
    // The music starts with the envelope's exit, and the page is set down on top.
    timers.current.push(setTimeout(() => {
      onBeginOpening()
      placePage()
    }, HOLD_MS + PLACE_DELAY))
    timers.current.push(setTimeout(onOpened, HOLD_MS + PLACE_DELAY + FADE_LEAD + FADE_MS))

    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Set the front page down on the living hero card, once it is clear of the
   * pocket. The page's own transform is `none` — the rise lives on its inner
   * wrapper — so its rect is its layout box, and the visible box is that box
   * scaled by the rise and shifted up by the rise's own offset. Dividing the
   * rise's scale out of the target ratio and scaling its offset down by the same
   * factor lands the page at exactly the hero's size and position: the two are
   * indistinguishable at the hand-off. The page is lifted above the envelope
   * first, which then dissolves behind it.
   */
  function placePage() {
    const letter = letterRef.current
    const hero = document.querySelector('#top .hero-card')
    if (!letter) return

    const H = envRef.current?.offsetHeight || 220
    const riseTy = poseRef.current.riseTo || Math.round(-H * 0.5)
    let tx = 0
    let ty = 0
    let scale = 1

    if (hero) {
      const box = letter.getBoundingClientRect()
      const target = hero.getBoundingClientRect()
      if (box.width > 0 && target.width > 0) {
        const cx = box.left + box.width / 2
        const cy = box.top + box.height / 2
        scale = (target.width / box.width) / OUT_S
        tx = (target.left + target.width / 2) - cx
        ty = (target.top + target.height / 2) - cy - scale * riseTy
      }
    } else {
      // No hero to measure (unexpected): settle the page over the envelope.
      ty = Math.round(-H * 0.1)
    }

    stateRef.current.placed = true
    envRef.current?.classList.add('placed')
    anime({ targets: letter, translateX: tx, translateY: ty, scale, duration: PLACE_MS, easing: 'easeOutCubic' })
  }

  /** End the reveal early (the skip button) without a jolt. */
  function finish() {
    const s = stateRef.current
    if (s.done) return
    s.done = true
    timers.current.forEach(clearTimeout)
    timers.current = []
    timelineRef.current?.pause()
    if (!s.placed) {
      s.placed = true
      onBeginOpening()
    }
    setLeaving(true)
    anime({ targets: rootRef.current, opacity: 0, duration: 400, easing: 'linear', complete: onOpened })
  }

  return (
    <div
      ref={rootRef}
      className={`envelope-layer${leaving ? ' leaving' : ''}`}
      role="dialog"
      aria-label="Opening your invitation"
    >
      <div className="envelope-backdrop" aria-hidden="true" />
      <div className="envelope-stage">
        <div className="envelope" ref={envRef}>
          <div className="envelope-inner" data-fade aria-hidden="true" />

          <div className="envelope-frame">
            <div className="envelope-letter" ref={letterRef}>
              <div className="envelope-rise" ref={riseRef}>
                {/* The front page. Same classes and content as the live hero in
                    App.jsx, so the two are indistinguishable at the hand-off. */}
                <article className="hero-card envelope-card">
                  <p className="hero-kicker">TO A LOVE THAT WILL LAST A LIFETIME</p>
                  <p className="script hero-script">we invite you to celebrate with us</p>
                  <h1 className="hero-names">
                    <ShinyText>Harthwel</ShinyText>
                    <span className="hero-amp script">and</span>
                    <ShinyText>Khatrina</ShinyText>
                  </h1>
                  <Divider />
                  <p className="hero-date"><CalendarIcon size={16} /> November 30, 2026</p>
                  <p className="hero-copy">Two hearts, one promise, and a lifetime to share. We would love for you to be part of this special moment as we say 'I do'</p>
                  <span className="hero-scroll"><span>Scroll down</span><ChevronDownIcon size={18} /></span>
                </article>
              </div>
            </div>
          </div>

          <div className="envelope-pocket envelope-pocket-bottom" data-fade aria-hidden="true" />
          <div className="envelope-pocket envelope-pocket-left" data-fade aria-hidden="true" />
          <div className="envelope-pocket envelope-pocket-right" data-fade aria-hidden="true" />
          {/* The side flaps' seams, revealed as the top flap swings clear. */}
          <svg className="envelope-creases" viewBox="0 0 100 66" preserveAspectRatio="none" data-fade aria-hidden="true">
            <path d="M0 0 L46 33" />
            <path d="M100 0 L54 33" />
          </svg>

          <div className="envelope-flap" ref={flapRef} data-fade aria-hidden="true">
            <span className="envelope-flap-side">
              <span className="envelope-flap-rim" />
              <span className="envelope-flap-cloth" />
            </span>
            <span className="envelope-flap-side envelope-flap-side-back">
              <span className="envelope-flap-rim" />
              <span className="envelope-flap-cloth envelope-flap-cloth-back" />
            </span>
          </div>

          <span className="envelope-sheen" data-fade aria-hidden="true" />
        </div>
      </div>

      <button type="button" className="envelope-skip" onClick={finish}>Tap to unveil</button>
    </div>
  )
}
