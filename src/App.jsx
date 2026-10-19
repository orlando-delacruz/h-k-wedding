import React, { useEffect, useMemo, useRef, useState } from 'react'
import { SITE, SONGS, PHOTOS, ACCESS } from './config/site.js'
import { PROGRAM } from './config/program.js'
import { PRINCIPAL_ROLES, PRINCIPAL_SPONSORS, SECONDARY_PAIRED, OTHER_MEMBERS } from './config/entourage.js'
import { ParticleField, Tilt, CountUp, useReveal, ShinyText } from './components/effects.jsx'
import { SectionHeading, Divider, GoldFrame, Ornament } from './components/ui.jsx'
import { BottomNav, MusicBar } from './components/chrome.jsx'
import ProgramStage from './components/ProgramStage.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import DownloadSection from './components/DownloadSection.jsx'
import AccessGate from './components/AccessGate.jsx'
import EnvelopeReveal from './components/EnvelopeReveal.jsx'
import QrLightbox from './components/QrLightbox.jsx'
import { FloralCorner } from './components/Floral.jsx'
import {
  CalendarIcon, HeartIcon, GiftIcon,
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
  // Fresh code entry only: the envelope never opens on refresh, only in the
  // moment the guest earns their way inside.
  const [freshEntry, setFreshEntry] = useState(false)

  function unlock(code) {
    try { localStorage.setItem(STORE_KEY, code) } catch { /* private mode */ }
    setFreshEntry(true)
    setUnlocked(true)
  }

  if (!unlocked) return <AccessGate onUnlock={unlock} />

  return <InvitationPage startWithEnvelope={freshEntry} />
}

function InvitationPage({ startWithEnvelope }) {
  // One reveal scan covers everything; this page mounts after the gate opens.
  useReveal()

  /* A guest may have scrolled the gate (it is taller than a phone screen)
     before unlocking, so a fresh confirmation always opens on the hero. A
     refresh — no envelope — keeps whatever place they were reading. */
  useEffect(() => {
    if (!startWithEnvelope) return
    const html = document.documentElement
    const prev = html.style.scrollBehavior
    html.style.scrollBehavior = 'auto' // don't animate past the hero
    window.scrollTo(0, 0)
    html.style.scrollBehavior = prev
  }, [startWithEnvelope])

  // The velvet envelope owns the first seconds: the flap opens, the front page
  // is drawn out and set on top, the envelope dissolves and the default song
  // starts. Stored unlocks skip it entirely.
  const [envelope, setEnvelope] = useState(startWithEnvelope)

  const [songIdx, setSongIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
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
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
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

  /* The player runs on: when a track ends it rolls into the other one, and the
     guest can still pick either track by hand from the player. */
  function playNext() {
    selectSong((songIdx + 1) % SONGS.length)
  }

  return (
    <div className="page">
      <div className="bg-orb orb-a" aria-hidden="true" />
      <div className="bg-orb orb-b" aria-hidden="true" />
      <ParticleField density={26} className="bg-particles" />
      <MusicBar
        visible
        songs={SONGS}
        songIdx={songIdx}
        playing={playing}
        onToggle={toggle}
        onSelectSong={selectSong}
      />
      <BottomNav visible />

      <audio
        ref={audioRef}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={playNext}
      />

      {envelope && <EnvelopeReveal onBeginOpening={play} onOpened={() => setEnvelope(false)} />}

      {/* ————— 1 · Opening invitation ————— */}
      <section id="top" className="hero">
        <ParticleField density={70} />
        <div className="hero-vignette" aria-hidden="true" />
        {/* The same content is drawn out of the velvet envelope on a fresh
            unlock (see EnvelopeReveal.jsx) — keep the two in step. */}
        <div className="hero-card">
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
          <a className="hero-scroll" href="#portrait" onClick={(e) => { e.preventDefault(); document.getElementById('portrait')?.scrollIntoView({ behavior: 'smooth' }) }}>
            <span>Scroll down</span>
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
              <img className="portrait-img" src={PHOTOS.heroPortrait} alt="Harthwel and Khatrina" loading="lazy" />
              <div className="portrait-glow" aria-hidden="true" />
            </GoldFrame>
          </Tilt>
        </div>
        {/* The couple's wedding timeline, shown whole under the portrait. */}
        {PROGRAM.photos.timeline && (
          <div className="timeline-strip" data-reveal>
            <img
              src={PROGRAM.photos.timeline}
              alt="Wedding timeline: 6:30 ceremony, 8:45 photo op, 10:00 am reception, 1:00 pm end of program"
              width="2048"
              height="683"
              loading="lazy"
            />
          </div>
        )}
      </section>

      {/* ————— 7 · Countdown + calendar ————— */}
      <CountdownSection />

      {/* ————— Programme: announcement, venues, programme, story, entourage, details, gallery ————— */}
      <ErrorBoundary>
        <ProgramStage program={PROGRAM} />
        <StorySection program={PROGRAM} />
        <EntourageSection />
        <DetailsSection program={PROGRAM} />
        <GallerySection program={PROGRAM} />
      </ErrorBoundary>

      {/* ————— Last section: soft copies + printed cards ————— */}
      <DownloadSection />

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
      <SectionHeading
        icon={ClockIcon}
        kicker={cd.past ? 'The day is here!' : `Only ${dayDiff} days to go`}
        title="Counting the Moments"
        sub={<>November 30, 2026 · 6:30 AM<span className="count-tz-dot"> · </span><span className="count-tz">Asia/Manila</span></>}
      />
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
          <p className="calendar-note"><SparkleIcon size={13} /> Save the date</p>
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
      {/* One antique gold frame holds the whole entourage; the names inside
          carry no borders of their own. */}
      <GoldFrame className="ent-frame">
        <span className="ent-shine" aria-hidden="true" />
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
          <div className="pair-grid">
            {PRINCIPAL_SPONSORS.map((sponsor, i) => {
              const [first, second] = sponsor.split(' & ')
              return (
                <div className="pair-card" key={sponsor} {...dly(i, 40)}>
                  <span>{first}</span>
                  <i className="pair-heart"><HeartIcon size={13} /></i>
                  <span>{second}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="ent-block" data-reveal>
          <h3 className="ent-block-title"><SparkleIcon size={16} /> SECONDARY SPONSORS</h3>
          <div className="sponsor-grid">
            {SECONDARY_PAIRED.map(([groomsman, bridesmaid], i) => (
              <div className="sponsor" key={groomsman} {...dly(i, 45)}>
                <span>{groomsman} &amp; {bridesmaid}</span>
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
      </GoldFrame>
    </section>
  )
}

/* -------------------------------- Our Story --------------------------------- */

function StorySection({ program }) {
  return (
    <section id="story" className="story-sec">
      <SectionHeading icon={ScrollIcon} kicker="Moments we keep" title="Our Story" className="wrap sec" />
      <div className="film-strip" data-reveal>
        <div className="film-track">
          {[...program.photos.strip, ...program.photos.strip].map((src, i) => (
            <figure key={i}><img src={src} alt="" loading="lazy" /></figure>
          ))}
        </div>
      </div>
      <div className="wrap">
        <div className="story-card" data-reveal>
          <span className="story-quote" aria-hidden="true">“</span>
          <ScrollIcon size={22} className="story-icon" />
          <p className="story-text">{program.story}</p>
          <Divider />
          <p className="story-sign script">Harthwel &amp; Khatrina</p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------ Wedding Details ----------------------------- */

function DetailsSection({ program }) {
  const giftQr = program?.photos?.giftQr || []
  const [qrPreview, setQrPreview] = useState(null)
  const previewQr = qrPreview === null ? null : giftQr[qrPreview]

  return (
    <section id="details" className="sec details-sec">
      <SectionHeading icon={FlowerIcon} kicker="Everything you need to know" title="The Wedding Details" />
      <div className="floral-frame" data-reveal>
        <span className="floral-corner tl"><FloralCorner /></span>
        <span className="floral-corner tr"><FloralCorner /></span>
        <span className="floral-corner bl"><FloralCorner /></span>
        <span className="floral-corner br"><FloralCorner /></span>

        <article className="detail-block">
          <h3><DressIcon size={20} /> ATTIRE GUIDE</h3>
          <Divider />
          <p>We would be honored if you could join us in your best attire. Let's make our special day more memorable in these colors.</p>

          <p className="floral-legend">
            <span className="sky"><i />Sky Blue</span>
            <span className="gray"><i />Gray</span>
            <span className="champ"><i />Champagne</span>
            <span className="dusty"><i />Dusty Pink</span>
          </p>

          {program?.photos?.attireGuide && (
            /* The couple's own guide sheet: every look has to stay visible, so
               it is rendered whole (contain), never cropped. */
            <Tilt max={4} className="attire-tilt">
              <img
                src={program.photos.attireGuide}
                alt="Attire guide — suggested looks for the wedding"
                width="2048"
                height="2048"
                loading="lazy"
                className="attire-img"
              />
            </Tilt>
          )}
        </article>

        <article className="detail-block">
          <h3><GiftIcon size={20} /> GIFT GUIDE</h3>
          <Divider />
          <p>With all that we have, we've been blessed. Your presence is our greatest gift. Should you wish to contribute further, a gift of cash towards our future together would be deeply appreciated.</p>
          {/* Gift QR codes (docs/07). Each one is a button: tapping it opens the
              code full size so it can be scanned without pinching. */}
          {giftQr.length > 0 && (
            <div className="qr-row">
              {giftQr.map((qr, i) => (
                <button
                  type="button"
                  className="qr-tap"
                  key={qr.src}
                  onClick={() => setQrPreview(i)}
                  aria-label={`Show the ${qr.label} gift QR code full size`}
                >
                  <GoldFrame className="qr-frame">
                    <img className="qr-img" src={qr.src} alt={`${qr.label} QR code for sending a gift`} width="1840" height="1840" loading="lazy" />
                    <span className="qr-label">{qr.label}</span>
                    <span className="qr-shine" aria-hidden="true" />
                  </GoldFrame>
                </button>
              ))}
            </div>
          )}
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

      {previewQr && (
        <QrLightbox
          src={previewQr.src}
          label={`${previewQr.label} gift QR code`}
          onClose={() => setQrPreview(null)}
        />
      )}
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
      <SectionHeading kicker="A glimpse of us" title="Forever Starts Now" />
      <div className="slideshow" data-reveal>
        {program.photos.slideshow.map((src, i) => (
          <figure key={i} className={`slide ${i === slide ? 'on' : ''}`}>
            <img src={src} alt="" loading="lazy" />
          </figure>
        ))}
        <div className="slide-grain" aria-hidden="true" />
        <div className="hashtag"><ShinyText>{program.hashtag}</ShinyText></div>
      </div>
    </section>
  )
}
