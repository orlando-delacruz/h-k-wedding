import React from 'react'
import { SectionHeading, GoldFrame } from './ui.jsx'
import { MapPinIcon, SparkleIcon } from './Icons.jsx'

/**
 * Venues with maps, and the outline of the day. All content is public. Every
 * field is read defensively — a missing asset must never blank the page. Music
 * lives in the floating player (`MusicBar`).
 */
export default function ProgramStage({ program }) {
  const venues = Array.isArray(program?.venues) ? program.venues : []
  const stages = Array.isArray(program?.stages) ? program.stages : []

  return (
    <>
      {/* ————— Venues with full addresses + maps ————— */}
      {venues.length > 0 && (
        <section id="venue" className="sec venue-sec">
          <SectionHeading icon={MapPinIcon} kicker="Two places, one celebration" title="The Venues" />
          {venues.map((v, i) => (
            <div className="venue-block" key={v.id || i} {...{ 'data-reveal': true, style: { transitionDelay: `${i * 120}ms` } }}>
              <div className="venue-title">
                <span className="venue-icon"><MapPinIcon size={20} /></span>
                <h3>{v.title}</h3>
              </div>
              {v.mapEmbed && (
                <GoldFrame className="map-frame">
                  <iframe className="map-embed" title={v.name || 'Venue map'} src={v.mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                  <span className="map-shine" aria-hidden="true" />
                </GoldFrame>
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
