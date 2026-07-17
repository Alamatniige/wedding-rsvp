import { useEffect, useState } from 'react'
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
  const [downloading, setDownloading] = useState(false)

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

  async function handleDownload() {
    if (downloading) return
    setDownloading(true)
    try {
      const image = await loadImage(dataUrl)
      const canvas = renderPolaroid(image, guestLabel, timeLabel)
      const blob = await canvasToBlob(canvas)
      const stamp = capturedAt
        ? capturedAt.replace(/[:.]/g, '-').slice(0, 19)
        : String(Date.now())
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `wedding-polaroid-${stamp}.jpg`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
    } catch {
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `wedding-moment-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      link.remove()
    } finally {
      setDownloading(false)
    }
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
        <button
          type="button"
          className="wd-lightbox__close"
          onClick={onClose}
          aria-label="Close"
        >
          <X aria-hidden="true" />
        </button>
        <div className="wd-lightbox__polaroid">
          <img
            src={dataUrl}
            alt={`Photo by ${guestLabel}${timeLabel ? ` at ${timeLabel}` : ''}`}
            className="wd-lightbox__image"
          />
          <div className="wd-lightbox__caption">
            <p className="wd-lightbox__guest">{guestLabel}</p>
            {timeLabel ? (
              <p className="wd-lightbox__time">{timeLabel}</p>
            ) : null}
          </div>
        </div>
        <footer className="wd-lightbox__footer">
          <Button
            type="button"
            size="lg"
            onClick={() => void handleDownload()}
            disabled={downloading}
          >
            <Download data-icon="inline-start" aria-hidden="true" />
            {downloading ? 'Preparing…' : 'Download Polaroid'}
          </Button>
        </footer>
      </div>
    </div>
  )
}

const EXPORT_WIDTH = 1200
const EXPORT_HEIGHT = 1440
const FRAME = 70
const PHOTO_SIZE = EXPORT_WIDTH - FRAME * 2

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not prepare this photo.'))
    image.src = src
  })
}

function renderPolaroid(
  image: HTMLImageElement,
  guestLabel: string,
  timeLabel: string | null,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = EXPORT_WIDTH
  canvas.height = EXPORT_HEIGHT
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is unavailable.')

  context.fillStyle = '#fffdf8'
  context.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT)

  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight)
  const sourceX = (image.naturalWidth - sourceSize) / 2
  const sourceY = (image.naturalHeight - sourceSize) / 2
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    FRAME,
    FRAME,
    PHOTO_SIZE,
    PHOTO_SIZE,
  )

  context.fillStyle = '#2a3236'
  context.textBaseline = 'middle'
  context.font = '600 46px Poppins, sans-serif'
  context.fillText(guestLabel, FRAME, 1265, 720)

  if (timeLabel) {
    context.fillStyle = '#6e6b64'
    context.font = '400 32px Poppins, sans-serif'
    context.textAlign = 'right'
    context.fillText(timeLabel, EXPORT_WIDTH - FRAME, 1265)
    context.textAlign = 'left'
  }

  context.fillStyle = '#c0866a'
  context.font = 'italic 42px Fraunces, Georgia, serif'
  context.fillText('Jianne & Joe · Wedding Day', FRAME, 1340)

  return canvas
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Could not create the Polaroid download.'))
      },
      'image/jpeg',
      0.94,
    )
  })
}
