import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { Button } from '../../ui/button'
import { couple } from '../../../data/weddingData'
import { formatCaptureTime } from '../storage'

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
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState(true)
  const [downloading, setDownloading] = useState(false)

  function requestClose() {
    setOpen(false)
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') requestClose()
    }
    window.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [])

  async function handleDownload() {
    if (downloading) return
    setDownloading(true)
    try {
      await ensurePolaroidFonts()
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

  const backdropTransition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }

  const polaroidTransition = reduceMotion
    ? { duration: 0.15 }
    : { type: 'spring' as const, stiffness: 340, damping: 28, mass: 0.9 }

  const footerTransition = reduceMotion
    ? { duration: 0.12 }
    : { duration: 0.32, delay: 0.08, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <AnimatePresence onExitComplete={onClose}>
      {open ? (
        <motion.div
          className="wd-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo by ${guestLabel}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={backdropTransition}
        >
          <motion.button
            type="button"
            className="wd-lightbox__backdrop"
            aria-label="Close photo"
            onClick={requestClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
          />
          <motion.div
            className="wd-lightbox__panel"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 40, scale: 0.88, rotate: -3.2 }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: 1, rotate: -0.7 }
            }
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 24, scale: 0.92, rotate: 2.4 }
            }
            transition={polaroidTransition}
          >
            <button
              type="button"
              className="wd-lightbox__close"
              onClick={requestClose}
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
              <p className="wd-lightbox__film-caption">
                {couple.name1} &amp; {couple.name2}{' '}
                <span>{couple.weddingDateDisplay}</span>
              </p>
            </div>
            <motion.footer
              className="wd-lightbox__footer"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={footerTransition}
            >
              <Button
                type="button"
                size="lg"
                onClick={() => void handleDownload()}
                disabled={downloading}
              >
                <Download data-icon="inline-start" aria-hidden="true" />
                {downloading ? 'Preparing…' : 'Download Polaroid'}
              </Button>
            </motion.footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

const EXPORT_WIDTH = 1200
const EXPORT_HEIGHT = 1440
const FRAME = 70
const PHOTO_SIZE = EXPORT_WIDTH - FRAME * 2
const SCRIPT_FONT = '"Loren Blake Script", "Segoe Script", cursive'
const BODY_FONT = '"Cormorant Garamond", Georgia, serif'

async function ensurePolaroidFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts?.load) return
  await Promise.all([
    document.fonts.load(`400 52px ${SCRIPT_FONT}`),
    document.fonts.load(`400 42px ${SCRIPT_FONT}`),
    document.fonts.load(`400 32px ${BODY_FONT}`),
  ])
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    if (!src.startsWith('data:')) {
      image.crossOrigin = 'anonymous'
    }
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

  context.fillStyle = '#6b2f3c'
  context.textBaseline = 'middle'
  context.font = `400 52px ${SCRIPT_FONT}`
  context.fillText(guestLabel, FRAME, 1265, 720)

  if (timeLabel) {
    context.fillStyle = '#6b2f3c'
    context.font = `400 32px ${BODY_FONT}`
    context.textAlign = 'right'
    context.fillText(timeLabel, EXPORT_WIDTH - FRAME, 1265)
    context.textAlign = 'left'
  }

  context.fillStyle = '#6b2f3c'
  context.font = `400 42px ${SCRIPT_FONT}`
  context.fillText(
    `${couple.name1} & ${couple.name2} · ${couple.weddingDateDisplay}`,
    FRAME,
    1340,
  )

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
