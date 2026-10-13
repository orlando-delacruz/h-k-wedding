import React, { useEffect, useMemo, useRef, useState } from 'react'
import { SITE, PUBLIC_VENUES, SONGS, PHOTOS, ACCESS } from './config/site.js'
import { PROGRAM } from './config/program.js'
import { PRINCIPAL_ROLES, PRINCIPAL_SPONSORS, SECONDARY_PAIRED, OTHER_MEMBERS } from './config/entourage.js'
import { ParticleField, Tilt, CountUp, useReveal, ShinyText } from './components/effects.jsx'
import { SectionHeading, Divider, GoldFrame, Ornament } from './components/ui.jsx'
import { BottomNav, MusicBar } from './components/chrome.jsx'
import ProgramStage from './components/ProgramStage.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import AccessGate from './components/AccessGate.jsx'
import EntryCurtain from './components/EntryCurtain.jsx'
import { FloralCorner } from './components/Floral.jsx'
import {
  CalendarIcon, MapPinIcon, ChurchIcon, HomeIcon, MusicIcon, HeartIcon, GiftIcon,
  DressIcon, CameraOffIcon, UsersIcon, ClockIcon, ScrollIcon,
  ChevronDownIcon, FlowerIcon, SparkleIcon,
} from './components/Icons.jsx'

const dly = (i, step = 80) => ({ 'data-reveal': true, style: { transitionDelay: `${i * step}ms` } })

function useCountdown() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const target = new Date(SITE.dateISO).getTime()
  const diff = Math.max(0, target - now)
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor(diff / 3600000) % 24,
    m: Math.floor(diff / 60000) % 60,
    s: Math.floor(diff / 1000) % 60,
    past: diff <= 0,
  }
}

/* November 2026 starts on a Sunday, so November 30 falls on a Monday. */
function Calendar() {
  return (
    <div className="calendar">
      <div className="cal-grid cal-heads">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="cal-grid">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
          <span key={d} className={d === 30 ? 'cal-day hl' : 'cal-day'}>
            {d}
            {d === 30 && <em className="hl-ring" aria-hidden="true" />}
          </span>
        ))}
      </div>
    </div>
  )
}

const STORE_KEY = 'hk_access'

/* The unlock is remembered on the device so a refresh never sends a guest back
   to the gate — but only while the stored code still matches `ACCESS.code`.
   Rotating the code (the couple's revocation lever) closes the door again. */
function readStoredUnlock() {
  try {
    const saved = localStorage.getItem(STORE_KEY)
    if (!saved) return false
    if (saved.toUpperCase() === ACCESS.code.toUpperCase()) return true
    localStorage.removeItem(STORE_KEY)
    return false
  } catch {
    return false // private mode: ask for the code, never break the page
  }
}

export default function App() {
  const [unlocked, setUnlocked] = useState(readStoredUnlock)
  // Fresh code entry only: the entry curtain never shows on refresh, only in
  // the moment the guest earns their way inside.
  const [freshEntry, setFreshEntry] = useState(false)

  function unlock(code) {
    try { localStorage.setItem(STORE_KEY, code) } catch { /* private mode */ }
    setFreshEntry(true)
    setUnlocked(true)
  }

  if (!unlocked) return <AccessGate onUnlock={unlock} />

  return <InvitationPage startWithCurtain={freshEntry} />
}

function InvitationPage({ startWithCurtain }) {
  // One reveal scan covers everything; this page mounts after the gate opens.
  useReveal()

  // The entry curtain owns the first seconds: it blocks the hero, then parts
  // while the default song starts. Stored unlocks skip it entirely.
  const [entry, setEntry] = useState(startWithCurtain)

  const [songIdx, setSongIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [needTap, setNeedTap] = useState(false)
  const audioRef = useRef(null)

  // Couple-supplied files in public/music/, served from /music/<file>.
  const audioUrl = useMemo(() => (SONGS[songIdx] ? `${import.meta.env.BASE_URL}music/${SONGS[songIdx].file}` : ''), [songIdx])

  useEffect(() => {
    const a = audioRef.current
    if (a && a.src !== audioUrl) a.src = audioUrl
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl])

  /* Never overlap playback: pause first, then start the chosen song. */
  function play() {
    const a = audioRef.current
    if (!a) return
    a.play().then(() => { setPlaying(true); setNeedTap(false) }).catch(() => { setPlaying(false); setNeedTap(true) })
  }
  function toggle() {
    const a = audioRef.current
    if (!a) return
    if (playing) { a.pause(); setPlaying(false) } else play()
  }
  function selectSong(i) {
    const a = audioRef.current
    if (a) a.pause()
    setSongIdx(i)
    setPlaying(false)
    setTimeout(play, 40)
  }

  return (
    <div className="page">
      <div className="bg-orb orb-a" aria-hidden="true" />
      <div className="bg-orb orb-b" aria-hidden="true" />
      <ParticleField density={26} className="bg-particles" />
      <MusicBar
        visible
        song={SONGS[songIdx]?.title}
        playing={playing}
        onToggle={toggle}
        onOpenPlayer={() => document.getElementById('music')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
      />
      <BottomNav visible granted />

      <audio ref={audioRef} preload="auto" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />

      {entry && <EntryCurtain onBeginOpening={play} onOpened={() => setEntry(false)} />}

      {/* ————— 1 · Opening invitation ————— */}
      <section id="top" className="hero">
        <ParticleField density={70} />
        <div className="hero-vignette" aria-hidden="true" />
        <div className="hero-card">
          <p className="hero-kicker">TO A LOVE THAT WILL LAST A LIFETIME</p>
          <Ornament />
          <p className="script hero-script">we invite you to celebrate with us</p>
          <h1 className="hero-names">
            <ShinyText>Harthwel</ShinyText>
            <span className="hero-amp script">and</span>
            <ShinyText>Khatrina</ShinyText>
          </h1>
          <Divider />
          <p className="hero-date"><CalendarIcon size={16} /> November 30, 2026</p>
          <p className="hero-copy">Two hearts, one promise, and a lifetime to share. We would love for you to be part of this special moment as we say 'I do'</p>
          <a className="hero-scroll" href="#portrait" onClick={(e) => { e.preventDefault(); document.getElementById('portrait')?.scrollIntoView({ behavior: 'smooth' }) }}>
            <span>Scroll to celebrate</span>
            <ChevronDownIcon size={18} />
          </a>
        </div>
      </section>

      {/* ————— 2 · Couple introduction ————— */}
      <section id="portrait" className="sec portrait-sec">
        <SectionHeading icon={HeartIcon} kicker="The wedding of" title="Harthwel & Khatrina" sub="November 30, 2026 · Girasoles Farm" />
        <div data-reveal style={{ transitionDelay: '120ms' }}>
          <Tilt className="portrait-tilt">
            <GoldFrame className="portrait-frame">
              <img className="portrait-img" src={PHOTOS.heroPortrait} alt="Harthwel and Khatrina (temporary photo)" loading="lazy" />
              <div className="portrait-glow" aria-hidden="true" />
            </GoldFrame>
          </Tilt>
        </div>
        <p className="photo-note" data-reveal>Temporary photo — the couple's real portrait replaces this.</p>
        <div className="portrait-meta">
          <span {...dly(0)}><ClockIcon size={15} /> 6:30 AM Ceremony</span>
          <span {...dly(1)}><MapPinIcon size={15} /> Girasoles Farm</span>
          <span {...dly(2)}><HomeIcon size={15} /> Sariaya, Quezon</span>
        </div>
      </section>

      {/* ————— Venues ————— */}
      <section id="venue" className="sec venue-sec">
        <SectionHeading icon={MapPinIcon} kicker="Two places, one celebration" title="The Venues" sub="Tap a mirror to open in Google Maps" />
        {PUBLIC_VENUES.map((v, i) => (
          <div className="venue-block public-venue" key={v.id} {...dly(i, 140)}>
            <div className="venue-title">
              <span className="venue-icon">{v.id === 'ceremony' ? <ChurchIcon size={20} /> : <HomeIcon size={20} />}</span>
              <h3>{v.title}</h3>
            </div>
            <p className="venue-name">{v.name}</p>
            <p className="venue-address">{v.address}</p>
          </div>
        ))}
      </section>

      {/* ————— 7 · Countdown + calendar ————— */}
      <CountdownSection />

      {/* ————— Programme: announcement, venues, story, entourage, details, gallery ————— */}
      <ErrorBoundary>
        <ProgramStage
          program={PROGRAM}
          songIdx={songIdx}
          playing={playing}
          needTap={needTap}
          onToggle={toggle}
          onSelectSong={selectSong}
          onPlayPressed={play}
        />
        <StorySection program={PROGRAM} />
        <EntourageSection />
        <DetailsSection program={PROGRAM} />
        <GallerySection program={PROGRAM} />
      </ErrorBoundary>

      <footer className="footer">
        <Ornament />
        <p className="script footer-script">Harthwel and Khatrina</p>
        <p className="footer-date">November 30, 2026 · Girasoles Farm, Candelaria</p>
        <p className="footer-hash">{SITE.hashtag}</p>
      </footer>
    </div>
  )
}

/* ---------------------------- Countdown section ----------------------------- */

function CountdownSection() {
  const cd = useCountdown()
  const dayDiff = cd.d
  return (
    <section id="countdown" className="sec count-sec">
      <SectionHeading icon={ClockIcon} kicker={cd.past ? 'The day is here!' : `Only ${dayDiff} days to go`} title="Counting the Moments" sub="November 30, 2026 · 6:30 AM · Asia/Manila" />
      <div className="count-panel" data-reveal>
        {cd.past ? (
          <div className="count-past"><HeartIcon size={28} /><h3>Just married — thank you for celebrating with us.</h3></div>
        ) : (
          <div className="count-grid">
            {[['Days', cd.d], ['Hours', cd.h], ['Minutes', cd.m], ['Seconds', cd.s]].map(([label, value]) => (
              <div className="count-box" key={label}>
                <strong><CountUp value={value} /></strong>
                <small>{label}</small>
              </div>
            ))}
          </div>
        )}
        <div className="calendar-card">
          <div className="calendar-head"><CalendarIcon size={17} /><h3>November 2026</h3></div>
          <Calendar />
          <p className="calendar-note"><SparkleIcon size={13} /> November 30 — the golden day</p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------- Entourage ---------------------------------- */

function EntourageSection() {
  return (
    <section id="entourage" className="sec ent-sec">
      <SectionHeading icon={UsersIcon} kicker="To assist us in our needs" title="The Entourage" sub="With gratitude to the people standing beside us" />
      <div className="ent-roles" data-reveal>
        {PRINCIPAL_ROLES.map((p, i) => (
          <div className="ent-role" key={p.role} {...dly(i, 90)}>
            <small>{p.role}</small>
            <b>{p.name}</b>
          </div>
        ))}
      </div>
      <div className="ent-block" data-reveal>
        <h3 className="ent-block-title"><SparkleIcon size={16} /> PRINCIPAL SPONSORS</h3>
        <div className="sponsor-grid">
          {PRINCIPAL_SPONSORS.map((s, i) => (
            <div className="sponsor" key={s} {...dly(i, 45)}><em>{String(i + 1).padStart(2, '0')}</em><span>{s}</span></div>
          ))}
        </div>
      </div>
      <div className="ent-block" data-reveal>
        <h3 className="ent-block-title"><SparkleIcon size={16} /> SECONDARY SPONSORS</h3>
        <div className="pair-grid">
          {SECONDARY_PAIRED.map(([groomsman, bridesmaid], i) => (
            <div className="pair-card" key={groomsman} {...dly(i, 40)}>
              <em>#{String(i + 1).padStart(2, '0')}</em>
              <span>{groomsman}</span>
              <i className="pair-heart"><HeartIcon size={13} /></i>
              <span>{bridesmaid}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="ent-block" data-reveal>
        <h3 className="ent-block-title"><SparkleIcon size={16} /> THE LITTLE ONES & BEARERS</h3>
        <div className="duo-grid">
          <div className="duo-card" {...dly(0)}><small>LITTLE BRIDE</small><b>{OTHER_MEMBERS.littleBride}</b></div>
          <div className="duo-card" {...dly(1)}><small>LITTLE GROOM</small><b>{OTHER_MEMBERS.littleGroom}</b></div>
        </div>
        <div className="chip-row">
          <span className="chip-label">FLOWER GIRLS</span>
          {OTHER_MEMBERS.flowerGirls.map((f, i) => <span className="chip" key={f} {...dly(i, 60)}>{f}</span>)}
        </div>
        <div className="duo-grid">
          <div className="duo-card" {...dly(0)}><small>BIBLE BEARER</small><b>{OTHER_MEMBERS.bibleBearer}</b></div>
          <div className="duo-card" {...dly(1)}><small>COVENANT BEARER</small><b>{OTHER_MEMBERS.covenantBearer}</b></div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------- Our Story --------------------------------- */

function StorySection({ program }) {
  return (
    <section id="story" className="story-sec">
      <SectionHeading icon={ScrollIcon} kicker="Moments we keep" title="Our Story" light className="wrap sec" />
      <div className="film-strip" data-reveal>
        <div className="film-track">
          {[...program.photos.strip, ...program.photos.strip].map((src, i) => (
            <figure key={i}><img src={src} alt="" loading="lazy" /></figure>
          ))}
        </div>
      </div>
      <div className="wrap">
        <div className="story-card" data-reveal>
          <ScrollIcon size={22} className="story-icon" />
          <p>{program.story}</p>
          <Divider />
          <p className="story-sign script">Harthwel & Khatrina</p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------ Wedding Details ----------------------------- */

function DetailsSection({ program }) {
  return (
    <section id="details" className="sec details-sec">
      <SectionHeading icon={FlowerIcon} kicker="Everything you need to know" title="The Wedding Details" />
      <div className="floral-frame" data-reveal>
        <span className="floral-corner tl"><FloralCorner /></span>
        <span className="floral-corner tr"><FloralCorner /></span>
        <span className="floral-corner bl"><FloralCorner /></span>
        <span className="floral-corner br"><FloralCorner /></span>

        <p className="floral-legend">
          <span className="mid"><i />Midnight</span>
          <span className="nav"><i />Navy</span>
          <span className="wht"><i />White</span>
          <span className="gld"><i />Gold</span>
        </p>

        <article className="detail-block">
          <h3><DressIcon size={20} /> ATTIRE GUIDE</h3>
          <Divider />
          <p>We would be honored if you could join us in your best attire. Let's make our special day more memorable in these colors.</p>
          {program?.photos?.attireGuide ? (
            <Tilt max={5} className="detail-img-tilt">
              <img src={program.photos.attireGuide} alt="Attire guide (temporary placeholder image)" loading="lazy" className="detail-img" />
            </Tilt>
          ) : (
            <div className="timeline-placeholder">
              <DressIcon size={26} />
              <p>Attire guide image placeholder</p>
              <small>The couple's final attire guide will be placed here.</small>
            </div>
          )}
          <p className="detail-note">Temporary image — the couple's final attire guide replaces this.</p>
        </article>

        <article className="detail-block">
          <h3><ClockIcon size={20} /> WEDDING TIMELINE</h3>
          <Divider />
          <div className="timeline-placeholder">
            <ClockIcon size={26} />
            <p>Timeline image placeholder</p>
            <small>The couple's final timeline image will be placed here.</small>
          </div>
        </article>

        <article className="detail-block">
          <h3><GiftIcon size={20} /> GIFT GUIDE</h3>
          <Divider />
          <p>With all that we have, we've been blessed. Your presence is our greatest gift. Should you wish to contribute further, a gift of cash towards our future together would be deeply appreciated.</p>
        </article>

        <article className="detail-block reminder">
          <h3><HeartIcon size={20} /> REMINDER — “With Respect”</h3>
          <Divider />
          <ul>
            <li><FlowerIcon size={16} /> While we love your little ones, we have decided to have our wedding be an adult-only occasion. We hope this advance notice means you are still able to share our big day!</li>
            <li><ClockIcon size={16} /> Please arrive by exact time so you're seated and ready before the ceremony begins</li>
            <li><CameraOffIcon size={16} /> We invite you to be fully present with us during our ceremony. Please silence and put away phones and cameras - we promise our photographer has it covered!</li>
            <li><DressIcon size={16} /> We can't wait to see everyone dressed up! We simply ask that shades of white, ivory, and cream be saved for the bride.</li>
            <li><SparkleIcon size={16} /> Please help us keep the surprise! We ask that you refrain from posting photos of the bride and groom on social media until we've shared our first photos</li>
          </ul>
        </article>
      </div>
    </section>
  )
}

/* -------------------------------- Gallery ----------------------------------- */

function GallerySection({ program }) {
  const [slide, setSlide] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % program.photos.slideshow.length), 5200)
    return () => clearInterval(t)
  }, [program.photos.slideshow.length])

  return (
    <section id="gallery" className="sec gallery-sec">
      <SectionHeading icon={CameraOffIcon} kicker="A glimpse of us" title="Forever Starts Now" sub={program.hashtag} />
      <div className="slideshow" data-reveal>
        {program.photos.slideshow.map((src, i) => (
          <figure key={i} className={`slide ${i === slide ? 'on' : ''}`}>
            <img src={src} alt="" loading="lazy" />
          </figure>
        ))}
        <div className="slide-grain" aria-hidden="true" />
        <div className="hashtag"><ShinyText>{program.hashtag}</ShinyText></div>
      </div>
      <p className="gallery-note" data-reveal>Temporary photos — the couple's real gallery replaces these.</p>
    </section>
  )
}
