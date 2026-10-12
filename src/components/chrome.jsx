import React from 'react'
import {
  HomeIcon, ChurchIcon, MailIcon, UsersIcon, FlowerIcon, ClockIcon,
  MusicIcon, PlayIcon, PauseIcon,
} from './Icons.jsx'

/** Public anchors stay available; programme anchors appear after access is granted. */
function navItems(granted) {
  const publicItems = [
    { id: 'top', label: 'Invite', Icon: HomeIcon },
    { id: 'portrait', label: 'Couple', Icon: ChurchIcon },
    { id: 'rsvp', label: 'RSVP', Icon: MailIcon },
    { id: 'venue', label: 'Venue', Icon: ChurchIcon },
    { id: 'countdown', label: 'Countdown', Icon: ClockIcon },
  ]
  const programItems = [
    { id: 'music', label: 'Music', Icon: MusicIcon },
    { id: 'entourage', label: 'Weds', Icon: UsersIcon },
    { id: 'details', label: 'Details', Icon: FlowerIcon },
  ]
  return granted ? [...publicItems.slice(0, 4), ...programItems] : publicItems.slice(0, 4)
}

export function BottomNav({ visible, granted = false }) {
  const items = navItems(granted)
  return (
    <nav className={`bottom-nav ${visible ? 'show' : ''}`} aria-label="Sections">
      {items.map(({ id, label, Icon }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
        >
          <Icon size={19} />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  )
}

export function MusicBar({ visible, song, playing, onToggle, onOpenPlayer }) {
  return (
    <div className={`music-bar ${visible ? 'show' : ''} ${playing ? 'is-playing' : ''}`}>
      <button className="music-disc" onClick={onToggle} aria-label={playing ? 'Pause music' : 'Play music'}>
        <span className="disc-rings" />
        {playing ? <PauseIcon size={15} /> : <PlayIcon size={15} />}
      </button>
      <button className="music-meta" onClick={onOpenPlayer}>
        <span className="eq" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="music-title"><MusicIcon size={13} /> {song}</span>
      </button>
    </div>
  )
}
