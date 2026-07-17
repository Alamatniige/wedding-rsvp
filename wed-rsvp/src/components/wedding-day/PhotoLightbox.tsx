import { useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '../ui/button'
import { formatCaptureTime } from './storage'

type PhotoLightboxProps = {
  dataUrl: string
  guestLabel: string
  capturedAt: string | null
  onClose: () => void
}

export default function PhotoLightbox({
  dataUrl,
  guestLabel,
  capturedAt,
  onClose,
}: PhotoLightboxProps) {
  const timeLabel = formatCaptureTime(capturedAt)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  function handleDownload() {
    const link = document.createElement('a')
    const stamp = capturedAt
      ? capturedAt.replace(/[:.]/g, '-').slice(0, 19)
      : String(Date.now())
    link.href = dataUrl
    link.download = `wedding-moment-${stamp}.jpg`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <div
      className="wd-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo by ${guestLabel}`}
    >
      <button
        type="button"
        className="wd-lightbox__backdrop"
        aria-label="Close photo"
        onClick={onClose}
      />
      <div className="wd-lightbox__panel">
        <header className="wd-lightbox__header">
          <div className="wd-lightbox__meta">
            <p className="wd-lightbox__guest">{guestLabel}</p>
            {timeLabel ? (
              <p className="wd-lightbox__time">{timeLabel}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="wd-lightbox__close"
            onClick={onClose}
            aria-label="Close"
          >
            <X aria-hidden="true" />
          </button>
        </header>
        <img
          src={dataUrl}
          alt={`Photo by ${guestLabel}${timeLabel ? ` at ${timeLabel}` : ''}`}
          className="wd-lightbox__image"
        />
        <footer className="wd-lightbox__footer">
          <Button type="button" size="lg" onClick={handleDownload}>
            <Download data-icon="inline-start" aria-hidden="true" />
            Download
          </Button>
        </footer>
      </div>
    </div>
  )
}
