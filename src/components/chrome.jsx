import React from 'react'
import {
  HomeIcon, ChurchIcon, MailIcon, UsersIcon, FlowerIcon, ClockIcon,
  MusicIcon, PlayIcon, PauseIcon,
} from './Icons.jsx'

/** All anchors: every section is public, no access gate. */
function navItems() {
  return [
    { id: 'top', label: 'Invite', Icon: HomeIcon },
    { id: 'portrait', label: 'Couple', Icon: ChurchIcon },
    { id: 'venue', label: 'Venue', Icon: ChurchIcon },
    { id: 'countdown', label: 'Countdown', Icon: ClockIcon },
    { id: 'music', label: 'Music', Icon: MusicIcon },
    { id: 'entourage', label: 'Weds', Icon: UsersIcon },
    { id: 'details', label: 'Details', Icon: FlowerIcon },
  ]
}

export function BottomNav({ visible }) {
  const items = navItems()
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
      <button className="mb-deck" onClick={onToggle} aria-label={playing ? 'Pause music' : 'Play music'}>
        <span className="mb-disc">
          <span className="mb-grooves" />
          <span className="mb-label">{playing ? <PauseIcon size={12} /> : <PlayIcon size={12} />}</span>
        </span>
        <span className="mb-arm" aria-hidden="true"><i /><b /></span>
      </button>
      <button className="mb-meta" onClick={onOpenPlayer} aria-label={`Open music player: ${song}`}>
        <span className="eq" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="mb-title"><MusicIcon size={13} /> {song}</span>
      </button>
    </div>
  )
}
