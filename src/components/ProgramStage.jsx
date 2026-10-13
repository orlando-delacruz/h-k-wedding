import React, { useEffect, useRef, useState } from 'react'
import anime from 'animejs'
import { SONGS } from '../config/site.js'
import { SectionHeading, Divider } from './ui.jsx'
import { burstAt } from './effects.jsx'
import { MusicIcon, MapPinIcon, CalendarIcon, SparkleIcon, PlayIcon } from './Icons.jsx'

const REDUCED = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * The cinematic announcement: curtain reveal, gramophone, venues with maps,
 * and the outline of the day. All content is public. Every field is read
 * defensively — a missing asset must never blank the page.
 */
export default function ProgramStage({ program, songIdx, playing, needTap, onToggle, onSelectSong, onPlayPressed }) {
  const [opened, setOpened] = useState(false)
  const wrapRef = useRef(null)
  const portraitRef = useRef(null)
  const copyRef = useRef(null)
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  /** Card zoom → curtain → ~3s hold → open from the centre. */
  function openCurtain() {
    if (opened) return
    setOpened(true)
    onPlayPressed()
    const wrap = wrapRef.current
    if (!wrap) return
    if (REDUCED) {
      copyRef.current?.classList.add('shown')
      return
    }
    anime({
      targets: wrap.querySelectorAll('.curtain-panel'),
      translateX: (el) => (el.classList.contains('left') ? '-102%' : '102%'),
      duration: 2200,
      delay: 3000, // spec: hold, then open
      easing: 'easeInOutQuart',
    })
    anime({
      targets: portraitRef.current,
      scale: [1.08, 1],
      filter: ['brightness(0.5)', 'brightness(1)'],
      duration: 2600,
      delay: 3050,
      easing: 'easeOutQuad',
      begin: () => burstAt(wrap, 30),
    })
    const t = setTimeout(() => copyRef.current?.classList.add('shown'), 3300)
    timers.current.push(t)
  }

  useEffect(() => {
    if (!opened) return
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const venues = Array.isArray(program?.venues) ? program.venues : []
  const stages = Array.isArray(program?.stages) ? program.stages : []
  const curtainPortrait = program?.photos?.curtainPortrait

  return (
    <>
      {/* ————— Curtain reveal + gramophone ————— */}
      <section id="music" className="sec music-sec">
        <SectionHeading icon={MusicIcon} kicker="Join us as we say ‘I do.’" title="TWO HEARTS. ONE LOVE. ONE JOURNEY." />
        <div ref={wrapRef} className={`curtain-wrap ${opened ? 'is-open' : ''}`} data-reveal="in">
          {curtainPortrait ? (
            <img ref={portraitRef} className="curtain-portrait" src={curtainPortrait} alt="Harthwel and Khatrina behind the curtain (temporary photo)" loading="lazy" />
          ) : (
            <div ref={portraitRef} className="curtain-portrait curtain-placeholder" aria-hidden="true" />
          )}
          <div className="curtain-panel left"><span className="curtain-folds" /></div>
          <div className="curtain-panel right"><span className="curtain-folds" /></div>
          {!opened && (
            <button className="curtain-cta" onClick={openCurtain}>
              <SparkleIcon size={18} /> Pull the curtain
            </button>
          )}
        </div>

        <div ref={copyRef} className="curtain-reveal">
          <p className="script reveal-script">Harthwel</p>
          <p className="reveal-and">and</p>
          <p className="script reveal-script">Khatrina</p>
          <Divider />
          <p className="reveal-date"><CalendarIcon size={15} /> November 30, 2026 · 6:30 AM</p>
        </div>

        <div className="gramo-card" data-reveal="in">
          <p className="gramo-label"><MusicIcon size={15} /> Songs of love</p>
          <div className="gramo-player">
            <button className={`vinyl ${playing ? 'spinning' : ''}`} onClick={onToggle} aria-label={playing ? 'Pause music' : 'Play music'}>
              <span className="vinyl-grooves" />
              <span className="vinyl-label"><b>H</b><i>♥</i><b>K</b></span>
            </button>
            <div className={`tonearm ${playing ? 'down' : ''}`} aria-hidden="true"><i /><b /></div>
            <div className="gramo-status">
              <span className="eq big" aria-hidden="true"><i /><i /><i /><i /></span>
              <strong>{SONGS[songIdx]?.title}</strong>
              <small>{playing ? 'Now playing' : 'Tap the vinyl or choose a song'}</small>
            </div>
          </div>
          <div className="song-list" role="group" aria-label="Song selection">
            {SONGS.map((s, i) => (
              <button
                key={s.id}
                className={`song-chip ${i === songIdx ? 'active' : ''}`}
                aria-pressed={i === songIdx}
                onClick={() => onSelectSong(i)}
              >
                {i === songIdx && <span className="eq" aria-hidden="true"><i /><i /><i /><i /></span>}
                {s.title}
                {i === songIdx && s.isDefault ? <em>default</em> : null}
              </button>
            ))}
          </div>
          {needTap && (
            <button className="btn btn-gold gramo-fallback" onClick={onPlayPressed}>
              <PlayIcon size={16} /> Tap to play Songs of love
            </button>
          )}
        </div>
      </section>

      {/* ————— Venues with full addresses + maps ————— */}
      {venues.length > 0 && (
        <section id="venue" className="sec venue-sec">
          <SectionHeading icon={MapPinIcon} kicker="Two places, one celebration" title="The Venues" sub="Tap a mirror to open in Google Maps" />
          {venues.map((v, i) => (
            <div className="venue-block" key={v.id || i} {...{ 'data-reveal': true, style: { transitionDelay: `${i * 120}ms` } }}>
              <div className="venue-title">
                <span className="venue-icon"><MapPinIcon size={20} /></span>
                <h3>{v.title}</h3>
              </div>
              {v.mapEmbed && (
                <div className="mirror">
                  <div className="mirror-face">
                    <iframe title={v.name || 'Venue map'} src={v.mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                    <span className="mirror-shine" aria-hidden="true" />
                  </div>
                  <div className="mirror-stand" aria-hidden="true" />
                </div>
              )}
              <p className="venue-name">{v.name}</p>
              {v.address && <p className="venue-address">{v.address}</p>}
              {v.mapLink && <a className="venue-link" href={v.mapLink} target="_blank" rel="noreferrer">Open map</a>}
            </div>
          ))}
        </section>
      )}

      {/* ————— Outline of the day ————— */}
      {stages.length > 0 && (
        <section className="sec">
          <SectionHeading icon={SparkleIcon} kicker="Order of the day" title="The Wedding Programme" sub="Only the ceremony time is confirmed; the couple's timeline image will complete this section." />
          <ol className="stage-list" data-reveal>
            {stages.map((s, i) => (
              <li key={s.title || i}>
                <b>{s.time}</b>
                <span>{s.title}</span>
                <small>{s.detail}</small>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  )
}
