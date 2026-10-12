import React, { useEffect, useRef, useState } from 'react'

const REDUCED = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* ---------- ParticleField: React Bits-style twinkling dust canvas ---------- */
export function ParticleField({ density = 60, className = '', gold = true }) {
  const ref = useRef(null)
  const raf = useRef(0)

  useEffect(() => {
    if (REDUCED) return
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, dots = []
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.round((density * w * h) / (400 * 900))
      dots = Array.from({ length: Math.max(18, n) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        a: Math.random(),
        v: Math.random() * 0.012 + 0.004,
        d: Math.random() * 0.5 + 0.12,
        g: gold && Math.random() > 0.45,
      }))
    }

    function tick(t) {
      ctx.clearRect(0, 0, w, h)
      for (const p of dots) {
        p.a += p.v
        if (p.a > 1) p.a = 0.1
        p.y += p.d
        if (p.y > h + 4) p.y = -4
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(p.a * Math.PI))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.g ? `rgba(252,246,186,${tw * 0.85})` : `rgba(255,255,255,${tw * 0.6})`
        ctx.fill()
      }
      raf.current = requestAnimationFrame(tick)
    }

    resize()
    raf.current = requestAnimationFrame(tick)
    const onResize = () => resize()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener('resize', onResize)
    }
  }, [density, gold])

  if (REDUCED) return null
  return <canvas ref={ref} className={`particles ${className}`} />
}

/* ---------- useReveal: scroll-in with optional stagger ---------- */
export function useReveal(deps = []) {
  useEffect(() => {
    if (REDUCED) {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('revealed'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    const scan = () => document.querySelectorAll('[data-reveal]:not(.revealed)').forEach((el) => io.observe(el))
    scan()
    const t = setTimeout(scan, 400)
    return () => {
      clearTimeout(t)
      io.disconnect()
    }
  }, deps)
}

/* ---------- Tilt: React Bits-style 3D tilt (touch-aware) ---------- */
export function Tilt({ children, className = '', max = 7, glare = true }) {
  const ref = useRef(null)
  if (REDUCED) return <div className={className}>{children}</div>

  function move(e) {
    const el = ref.current
    if (!el) return
    const p = e.touches ? e.touches[0] : e
    const r = el.getBoundingClientRect()
    const px = (p.clientX - r.left) / r.width
    const py = (p.clientY - r.top) / r.height
    el.style.transform = `perspective(900px) rotateY(${(px - 0.5) * max * 2}deg) rotateX(${(0.5 - py) * max * 2}deg) scale(1.015)`
    el.style.setProperty('--gx', `${px * 100}%`)
    el.style.setProperty('--gy', `${py * 100}%`)
  }
  function reset() {
    const el = ref.current
    if (el) el.style.transform = 'perspective(900px) rotateY(0) rotateX(0) scale(1)'
  }

  return (
    <div
      ref={ref}
      className={`tilt ${className}`}
      onMouseMove={move}
      onMouseLeave={reset}
      onTouchMove={move}
      onTouchEnd={reset}
    >
      {children}
      {glare && <span className="tilt-glare" aria-hidden="true" />}
    </div>
  )
}

/* ---------- CountUp: animated number roll ---------- */
export function CountUp({ value, pad = 2, className = '' }) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)
  useEffect(() => {
    if (REDUCED) {
      setDisplay(value)
      return
    }
    const from = prev.current
    prev.current = value
    if (from === value) return
    const start = performance.now()
    const dur = 520
    let raf
    const step = (t) => {
      const k = Math.min(1, (t - start) / dur)
      const e = 1 - Math.pow(1 - k, 3)
      setDisplay(Math.round(from + (value - from) * e))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <span className={className}>{String(display).padStart(pad, '0')}</span>
}

/* ---------- ShinyText / GradientText helpers ---------- */
export const ShinyText = ({ children, className = '' }) => (
  <span className={`shiny-text ${className}`}>{children}</span>
)

/* ---------- SparkleBurst: DOM gold burst for reveals ---------- */
export function burstAt(container, count = 26) {
  if (REDUCED || !container) return
  const rect = container.getBoundingClientRect()
  const cx = rect.width / 2
  const cy = rect.height / 2
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span')
    s.className = 'burst-dot'
    const ang = Math.random() * Math.PI * 2
    const dist = 60 + Math.random() * Math.max(rect.width, 220) * 0.55
    s.style.left = cx + 'px'
    s.style.top = cy + 'px'
    s.style.setProperty('--tx', `${Math.cos(ang) * dist}px`)
    s.style.setProperty('--ty', `${Math.sin(ang) * dist}px`)
    s.style.setProperty('--sc', `${0.5 + Math.random()}`)
    s.style.animationDelay = `${Math.random() * 180}ms`
    container.appendChild(s)
    setTimeout(() => s.remove(), 1600)
  }
}
