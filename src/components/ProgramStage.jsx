import React from 'react'
import { SectionHeading } from './ui.jsx'
import { MusicIcon, MapPinIcon, SparkleIcon } from './Icons.jsx'

/**
 * The announcement, the venues with maps, and the outline of the day. All
 * content is public. Every field is read defensively — a missing asset must
 * never blank the page. Music is played from the floating player (`MusicBar`),
 * which is also where a song is chosen.
 */
export default function ProgramStage({ program }) {
  const venues = Array.isArray(program?.venues) ? program.venues : []
  const stages = Array.isArray(program?.stages) ? program.stages : []

  return (
    <>
      {/* ————— Announcement ————— */}
      <section id="music" className="sec music-sec">
        <SectionHeading icon={MusicIcon} kicker="Join us as we say ‘I do.’" title="TWO HEARTS. ONE LOVE. ONE JOURNEY." />
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
