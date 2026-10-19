import React, { useEffect, useRef } from 'react'

/**
 * Full-size preview for one gift QR code. The codes are small on the page so the
 * block reads as a row of three; a guest who wants to scan one taps it and sees
 * the whole code here, uncropped on white — never a zoomed or cropped version.
 *
 * Closes on the backdrop, the close button or Escape, and hands focus back to
 * whatever opened it.
 */
export default function QrLightbox({ src, label, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    const opener = document.activeElement
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('no-scroll')
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [onClose])

  return (
    <div className="qr-modal" role="dialog" aria-modal="true" aria-label={label} onClick={onClose}>
      <button
        ref={closeRef}
        type="button"
        className="qr-modal-close"
        onClick={onClose}
        aria-label="Close the QR preview"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <figure className="qr-modal-figure" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={label} />
        <figcaption className="qr-modal-caption">{label} — scan to send your gift</figcaption>
      </figure>
    </div>
  )
}