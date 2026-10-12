import React, { useEffect, useMemo, useRef, useState } from 'react'
import anime from 'animejs'
import { SITE, PUBLIC_VENUES, SONGS, FALLBACK_AUDIO, PHOTOS, RSVP_LIMITS } from './config/site.js'
import { PRINCIPAL_ROLES, PRINCIPAL_SPONSORS, SECONDARY_PAIRED, OTHER_MEMBERS } from './config/entourage.js'
import { api } from './api.js'
import { ParticleField, Tilt, CountUp, useReveal, burstAt, ShinyText } from './components/effects.jsx'
import { SectionHeading, Divider, GoldFrame, Ornament, Field } from './components/ui.jsx'
import { BottomNav, MusicBar } from './components/chrome.jsx'
import Intro from './components/Intro.jsx'
import Admin from './components/Admin.jsx'
import ProgramStage from './components/ProgramStage.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { FloralCorner } from './components/Floral.jsx'
import {
  CalendarIcon, MapPinIcon, ChurchIcon, HomeIcon, MusicIcon, HeartIcon, RingIcon, GiftIcon,
  DressIcon, CameraOffIcon, UsersIcon, ClockIcon, MailIcon, ScrollIcon,
  ChevronDownIcon, FlowerIcon, SparkleIcon, ArrowLeftIcon, CheckIcon,
} from './components/Icons.jsx'

const REDUCED = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
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

export default function App() {
  useReveal()
  const isAdmin = typeof window !== 'undefined' && window.location.hash.startsWith('#admin')

  const [introOpen, setIntroOpen] = useState(false)
  const [access, setAccess] = useState({ state: 'checking' }) // checking | public | granted
  const [program, setProgram] = useState(null)
  const [justAccepted, setJustAccepted] = useState(false)

  const [songIdx, setSongIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [needTap, setNeedTap] = useState(false)
  const audioRef = useRef(null)

  /* Ask the server who this visitor is. The answer — not the UI — decides what renders. */
  useEffect(() => {
    let alive = true
    api.accessState()
      .then((s) => { if (alive) setAccess({ state: s.granted ? 'granted' : 'public', name: s.name }) })
      .catch(() => { if (alive) setAccess({ state: 'public' }) })
    return () => { alive = false }
  }, [])

  /* Program content only ever arrives after the server authorizes this session.
     The API wraps the payload as { guest, programme } — unwrap it here so every
     section receives exactly the shape it expects. */
  useEffect(() => {
    if (access.state !== 'granted') return
    let alive = true
    api.program()
      .then((payload) => {
        if (!alive) return
        const programme = payload?.programme
        if (!programme) throw new Error('The server returned no programme content.')
        setProgram({ ...programme, guest: payload.guest })
      })
      .catch(() => { if (alive) setAccess({ state: 'public' }) })
    return () => { alive = false }
  }, [access.state])

  const audioUrl = useMemo(() => (SONGS[songIdx] ? FALLBACK_AUDIO[SONGS[songIdx].id] : ''), [songIdx])

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

  const isGranted = access.state === 'granted' && !!program

  if (isAdmin) return <Admin />

  return (
    <div className="page">
      {!introOpen && <Intro onOpen={() => setIntroOpen(true)} />}
      <div className="bg-orb orb-a" aria-hidden="true" />
      <div className="bg-orb orb-b" aria-hidden="true" />
      <ParticleField density={26} className="bg-particles" />
      <MusicBar
        visible={introOpen && isGranted}
        song={SONGS[songIdx]?.title}
        playing={playing}
        onToggle={toggle}
        onOpenPlayer={() => document.getElementById('music')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
      />
      <BottomNav visible={introOpen} granted={isGranted} />

      <audio ref={audioRef} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />

      {/* ————— 1 · Opening invitation ————— */}
      <section id="top" className="hero">
        <ParticleField density={70} />
        <div className="hero-vignette" aria-hidden="true" />
        <GoldFrame className="hero-card" label="Save the Date">
          <div className="hero-crown"><RingIcon size={26} /></div>
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
        </GoldFrame>
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

      {/* ————— 3 · RSVP ————— */}
      <RsvpSection
        access={access}
        onAccepted={() => { setJustAccepted(true); setAccess((a) => ({ ...a, state: 'granted' })) }}
        onDeclined={() => setAccess({ state: 'public' })}
      />

      {/* ————— Public venue context ————— */}
      <section id="venue" className="sec venue-sec">
        <SectionHeading icon={MapPinIcon} kicker="Two places, one celebration" title="The Venues" sub="Detailed maps unlock with your attending RSVP" />
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

      {/* ————— 7 · Countdown + calendar (public) ————— */}
      <CountdownSection />

      {/* ————— 4–6, 8–11 · Protected programme ————— */}
      <ErrorBoundary>
        <ProtectedProgram
          access={access}
          program={program}
          justAccepted={justAccepted}
          onJustAcceptedDone={() => setJustAccepted(false)}
          songIdx={songIdx}
          playing={playing}
          needTap={needTap}
          onToggle={toggle}
          onSelectSong={selectSong}
          onPlayPressed={play}
        />
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

/** Turn an API failure into something a guest can actually act on. */
function describeError(err) {
  const wait = err?.body?.retryAfterSeconds
  if (wait) {
    const mins = Math.max(1, Math.ceil(wait / 60))
    return `Too many submissions were sent just now. Please wait about ${mins} minute${mins === 1 ? '' : 's'} and press the button again — your details are still here.`
  }
  if (err?.status >= 500) {
    return 'Our server had a problem saving this. Your details are still here — please press the button again.'
  }
  return err?.message || 'We could not save your response. Please try again.'
}

/* ------------------------------- RSVP section ------------------------------- */

function RsvpSection({ access, onAccepted, onDeclined }) {
  const [step, setStep] = useState('name') // name | guests | done | rejected
  const [name, setName] = useState('')
  const [guest1, setGuest1] = useState('')
  const [guest2, setGuest2] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmName, setConfirmName] = useState('')
  const cardRef = useRef(null)
  const sectionRef = useRef(null)

  const nameOk = name.trim().length > 0 && name.trim().length <= RSVP_LIMITS.name
  const companionsOk = guest2.trim() === '' || guest1.trim() !== ''

  async function submitDecline() {
    if (!nameOk || busy) return
    setBusy(true)
    setError('')
    try {
      await api.submitRsvp({ name: name.trim(), attendance: 'declined' })
      // Record saved — only now may the dust animation run.
      const card = cardRef.current
      const finish = () => { setConfirmName(name.trim()); setStep('rejected') }
      if (REDUCED || !card) finish()
      else anime({ targets: card, opacity: [1, 0], scale: [1, 1.03], filter: ['blur(0px)', 'blur(7px)'], duration: 1000, easing: 'easeInQuad', complete: finish })
      onDeclined?.()
    } catch (err) {
      // A failed write must never look like a success. Keep the name for a retry.
      setError(describeError(err))
    } finally {
      setBusy(false)
    }
  }

  async function submitAccept() {
    if (!nameOk || !companionsOk || busy) return
    setBusy(true)
    setError('')
    try {
      await api.submitRsvp({
        name: name.trim(),
        attendance: 'accepted',
        guest1: guest1.trim(),
        guest2: guest2.trim(),
        message: message.trim(),
      })
      // Server confirmed the write — play the cinematic handoff.
      burstAt(cardRef.current, 30)
      setConfirmName(name.trim())
      setStep('done')
      onAccepted?.()
      setTimeout(() => {
        document.getElementById('music')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 900)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setBusy(false)
    }
  }

  const remaining = RSVP_LIMITS.message - message.length

  return (
    <section id="rsvp" ref={sectionRef} className="sec rsvp-sec" aria-busy={busy}>
      <SectionHeading icon={MailIcon} kicker={SITE.rsvpDeadline} title="RSVP" light sub="Add up to two companions and a message for the couple." />
      <div ref={cardRef} className={`rsvp-card ${step === 'guests' ? 'navy' : ''}`} data-reveal>
        {error && (
          <p className="rsvp-error" role="alert">
            <SparkleIcon size={15} /> {error} Your entries are kept — press the button again to retry.
          </p>
        )}

        {step === 'name' && (
          <div className="rsvp-step">
            <Field label="Your name" hint="Please enter the name we should greet on the day">
              <input
                placeholder="Enter your name..."
                value={name}
                maxLength={RSVP_LIMITS.name}
                disabled={busy}
                autoComplete="name"
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && nameOk && setStep('guests')}
              />
            </Field>
            <div className="rsvp-actions">
              <button className="btn btn-gold" disabled={!nameOk || busy} onClick={() => setStep('guests')}>
                <CheckIcon size={16} /> YES I'M GOING TO ATTEND!
              </button>
              <button className="btn btn-outline" disabled={!nameOk || busy} onClick={submitDecline}>
                {busy ? 'Saving…' : 'SORRY, I HAVE SOMETHING TO DO'}
              </button>
            </div>
          </div>
        )}

        {step === 'guests' && (
          <div className="rsvp-step">
            <p className="rsvp-eyebrow"><UsersIcon size={15} /> Additional Guests</p>
            <p className="rsvp-note">You can bring 1 or 2 companions</p>
            <div className="rsvp-grid">
              <Field label="Guest 1:"><input placeholder="full name" value={guest1} maxLength={RSVP_LIMITS.companion} disabled={busy} onChange={(e) => setGuest1(e.target.value)} /></Field>
              <Field label="Guest 2"><input placeholder="full name" value={guest2} maxLength={RSVP_LIMITS.companion} disabled={busy} onChange={(e) => setGuest2(e.target.value)} /></Field>
            </div>
            {!companionsOk && <p className="rsvp-note">Please fill in Guest 1 before adding Guest 2.</p>}
            <Field label="Leave a message for the couple" hint={`${remaining} characters left`}>
              <textarea rows={3} placeholder="Express your heartfelt message here..." value={message} maxLength={RSVP_LIMITS.message} disabled={busy} onChange={(e) => setMessage(e.target.value)} />
            </Field>
            <div className="rsvp-actions">
              <button className="btn btn-outline" disabled={busy} onClick={() => setStep('name')}><ArrowLeftIcon size={16} /> Back</button>
              <button className="btn btn-gold" disabled={busy || !companionsOk} onClick={submitAccept}>
                {busy ? 'Sending…' : <><MailIcon size={16} /> Send RSVP</>}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="rsvp-done">
            <div className="rsvp-done-badge"><HeartIcon size={26} /></div>
            <h3>Thank you, {confirmName}!</h3>
            <Divider />
            <p>Your RSVP is recorded. The curtain is about to rise on our full wedding programme.</p>
          </div>
        )}

        {step === 'rejected' && (
          <div className="rsvp-done">
            <div className="rsvp-done-badge soft"><FlowerIcon size={26} /></div>
            <h3>Thank you, {confirmName || 'friend'}.</h3>
            <Divider />
            <p>You'll be dearly missed — your blessing reaches us all the same. Thank you for letting us know.</p>
          </div>
        )}
      </div>
      {!access?.name && step === 'name' && (
        <p className="rsvp-foot" data-reveal>Open to everyone — no invitation code needed.</p>
      )}
    </section>
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

/* --------------------------- Protected programme ---------------------------- */

function ProtectedProgram({ access, program, justAccepted, onJustAcceptedDone, ...music }) {
  if (access.state === 'checking') {
    return (
      <section className="sec"><p className="gate-checking" data-reveal>Checking your access…</p></section>
    )
  }

  if (access.state !== 'granted' || !program) {
    return (
      <section id="program-gate" className="sec gate">
        <div className="gate-panel" data-reveal>
          <div className="gate-badge"><HeartIcon size={26} /></div>
          <h3>The Wedding Programme</h3>
          <Divider />
          <p>
            Our complete wedding programme — the entourage, venues with maps, our story, attire guide,
            timeline and photo gallery — is reserved for guests who have confirmed their attendance.
          </p>
          <p>Please send your RSVP to unlock it. You can also revisit the invitation any time.</p>
          <div className="gate-actions">
            <button className="btn btn-gold" onClick={() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              <MailIcon size={16} /> Go to RSVP
            </button>
            <button className="btn btn-outline" onClick={() => document.getElementById('top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              <ArrowLeftIcon size={16} /> Back to invitation
            </button>
          </div>
          <p className="gate-note">Already responded that you're attending? Reload the page or open this link in the same browser to continue.</p>
        </div>
      </section>
    )
  }

  return (
    <>
      <ProgramStage program={program} autoOpen={justAccepted} {...music} />
      {Array.isArray(program.photos?.strip) && <StorySection program={program} />}
      <EntourageSection />
      <DetailsSection program={program} />
      {Array.isArray(program.photos?.slideshow) && <GallerySection program={program} />}
    </>
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
