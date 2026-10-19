import React, { useState } from 'react'
import { DOWNLOADS } from '../config/program.js'
import { SectionHeading, GoldFrame } from './ui.jsx'
import { DownloadIcon, ScrollIcon, SparkleIcon } from './Icons.jsx'

/* Hands the guest the soft copies and the printed cards (docs/07). One click
   per option saves every file in that set: the browser may ask once for
   permission to download multiple files, which is normal and expected. */
function saveAll(files) {
  files.forEach((file, i) => {
    setTimeout(() => {
      const a = document.createElement('a')
      a.href = file.src
      a.download = `${file.file}.jpg`
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
    }, i * 350)
  })
}

export default function DownloadSection() {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState('')

  function run(key, files) {
    saveAll(files)
    setDone(key)
  }

  return (
    <section id="downloads" className="sec downloads-sec">
      <SectionHeading
        icon={ScrollIcon}
        kicker="Keep the memories"
        title="Download Soft Copies"
        sub="The printed program and invitation cards, ready to keep or to print."
      />
      <GoldFrame className="dl-frame">
        <span className="ent-shine" aria-hidden="true" />
        <div className="dl-inner" data-reveal>
          <button
            type="button"
            className="btn btn-gold"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="dl-options"
          >
            <DownloadIcon size={16} /> {open ? 'Hide downloads' : 'Download'}
          </button>

          {open && (
            <div className="dl-options" id="dl-options">
              <button type="button" className="btn btn-outline dl-option" onClick={() => run('programs', DOWNLOADS.programs)}>
                <DownloadIcon size={16} /> Download Wedding Programs
              </button>
              <button type="button" className="btn btn-outline dl-option" onClick={() => run('invitations', DOWNLOADS.invitations)}>
                <DownloadIcon size={16} /> Download Invitation Cards
              </button>
            </div>
          )}

          {done && (
            <p className="dl-note" role="status">
              <SparkleIcon size={14} /> Your download is starting. Allow multiple downloads if your browser asks.
            </p>
          )}
        </div>
      </GoldFrame>
    </section>
  )
}
