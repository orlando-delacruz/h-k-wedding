import React from 'react'
import {
  HomeIcon, ChurchIcon, MailIcon, UsersIcon, FlowerIcon,
  MusicIcon, PlayIcon, PauseIcon,
} from './Icons.jsx'

/** All anchors: every section is public, no access gate. Capped at 5 items so
 *  the bar never crowds a phone's width. */
function navItems() {
  return [
    { id: 'top', label: 'Invite', Icon: HomeIcon },
    { id: 'portrait', label: 'Couple', Icon: ChurchIcon },
    { id: 'venue', label: 'Venue', Icon: ChurchIcon },
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

/**
 * The floating mini-gramophone is the player: the vinyl plays/pauses, the
 * nameplate picks a track. Scrolling down folds it away to just the disc (CD);
 * scrolling back up or tapping it brings the nameplate back.
 */
export function MusicBar({ visible, songs, songIdx, playing, onToggle, onSelectSong }) {
  const [picking, setPicking] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState(false)
  const song = songs[songIdx]

  React.useEffect(() => {
    let last = window.scrollY
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const y = window.scrollY
        const dy = y - last
        if (Math.abs(dy) < 24) return
        last = y
        if (dy > 0 && y > 90) {
          setCollapsed(true)
          setPicking(false)
        } else if (dy < 0) {
          setCollapsed(false)
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  function handleDisc() {
    if (collapsed) {
      setCollapsed(false)
      return
    }
    onToggle()
  }

  function handleMeta() {
    if (collapsed) setCollapsed(false)
    else setPicking((p) => !p)
  }

  return (
    <div className={`music-bar-wrap ${visible ? 'show' : ''} ${collapsed ? 'collapsed' : ''}`}>
      {picking && !collapsed && (
        <div className="mb-menu" role="group" aria-label="Choose a song">
          <p className="mb-menu-label">Choose a song</p>
          {songs.map((s, i) => {
            const current = i === songIdx
            return (
              <button
                key={s.id}
                className={`mb-track ${current ? 'on' : ''} ${current && playing ? 'playing' : ''}`}
                aria-pressed={current}
                onClick={() => { onSelectSong(i); setPicking(false) }}
              >
                <span className="mb-track-disc" aria-hidden="true"><span /></span>
                <span className="mb-track-copy">
                  <b>{s.title}</b>
                  <small>{current ? (playing ? 'Now playing' : 'Paused') : 'Tap to play'}</small>
                </span>
                <span className="mb-track-state" aria-hidden="true">
                  {current && playing ? <span className="eq"><i /><i /><i /><i /></span> : <PlayIcon size={15} />}
                </span>
              </button>
            )
          })}
        </div>
      )}
      <div className={`music-bar ${playing ? 'is-playing' : ''} ${collapsed ? 'collapsed' : ''}`}>
        <div className="mb-row">
          <button
            className="mb-deck"
            onClick={handleDisc}
            aria-label={collapsed ? 'Show the song title' : playing ? 'Pause music' : 'Play music'}
          >
            <span className="mb-disc">
              <span className="mb-grooves" />
              <span className="mb-label">{playing ? <PauseIcon size={12} /> : <PlayIcon size={12} />}</span>
            </span>
            <span className="mb-arm" aria-hidden="true"><i /><b /></span>
          </button>
          <button
            className="mb-meta"
            onClick={handleMeta}
            aria-expanded={picking}
            aria-label={`Choose a song — now playing ${song?.title || ''}`}
          >
            <span className="eq" aria-hidden="true"><i /><i /><i /><i /></span>
            <span className="mb-title"><MusicIcon size={13} /> {song?.title}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
