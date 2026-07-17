import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import GuestStrip from './GuestStrip'
import PhotoLightbox from './PhotoLightbox'
import { getGuestDisplayName } from './guestNames'
import {
  formatCaptureTime,
  readAllGalleryPhotos,
  readGalleryGuests,
} from './storage'
import type { GalleryPhotoEntry, WeddingDaySession } from './storage'

type GalleryProps = {
  session: WeddingDaySession | null
  onBack: () => void
  /** Optional guest to focus when opening from PostCapture thumbnails. */
  initialGuestId?: string | null
}

type DisplayItem = GalleryPhotoEntry & {
  isMine: boolean
  guestLabel: string
}

export default function Gallery({
  session,
  onBack,
  initialGuestId = null,
}: GalleryProps) {
  const [activeGuestId, setActiveGuestId] = useState<string | null>(
    initialGuestId,
  )
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    setActiveGuestId(initialGuestId ?? null)
  }, [initialGuestId])

  const guests = useMemo(() => readGalleryGuests(), [])

  const items = useMemo(() => {
    const all = readAllGalleryPhotos()
    const mapped: DisplayItem[] = all.map((entry) => ({
      ...entry,
      isMine: session ? entry.guestId === session.guestId : false,
      guestLabel: getGuestDisplayName(entry.guestId, session?.guestId),
    }))

    mapped.sort((a, b) => {
      if (a.isMine !== b.isMine) return a.isMine ? -1 : 1
      const aTime = a.capturedAt ? Date.parse(a.capturedAt) : NaN
      const bTime = b.capturedAt ? Date.parse(b.capturedAt) : NaN
      if (!Number.isNaN(aTime) && !Number.isNaN(bTime) && aTime !== bTime) {
        return bTime - aTime
      }
      if (!Number.isNaN(aTime) && Number.isNaN(bTime)) return -1
      if (Number.isNaN(aTime) && !Number.isNaN(bTime)) return 1
      return b.index - a.index
    })

    if (activeGuestId) {
      return mapped.filter((item) => item.guestId === activeGuestId)
    }
    return mapped
  }, [session, activeGuestId])

  const activeGuestLabel =
    activeGuestId != null
      ? getGuestDisplayName(activeGuestId, session?.guestId)
      : null

  const lightboxItem =
    lightboxIndex != null ? (items[lightboxIndex] ?? null) : null

  return (
    <section className="wd-gallery" aria-labelledby="wd-gallery-title">
      <header className="wd-gallery__header wd-gallery__header--wide">
        <button
          type="button"
          className="wd-gallery__back"
          onClick={onBack}
          aria-label="Back to camera"
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <h1 id="wd-gallery-title" className="wd-gallery__title">
          {activeGuestLabel
            ? activeGuestLabel === 'You'
              ? 'Your Moments'
              : `${activeGuestLabel}'s Moments`
            : 'Celebration Gallery'}
        </h1>
        <span className="wd-gallery__header-spacer" aria-hidden="true" />
      </header>

      <GuestStrip
        guests={guests}
        sessionGuestId={session?.guestId}
        activeGuestId={activeGuestId}
        onSelectGuest={setActiveGuestId}
      />

      {items.length === 0 ? (
        <div className="wd-state">
          <p className="wd-state__copy">
            {activeGuestId
              ? 'No photos for this guest yet.'
              : 'No photos yet — the photobooth is waiting for the first snap.'}
          </p>
        </div>
      ) : (
        <>
          <h2 className="wd-gallery__section-title">
            {activeGuestLabel
              ? `${items.length} ${items.length === 1 ? 'moment' : 'moments'}`
              : 'Celebration moments'}
          </h2>
          <ul className="wd-gallery__grid">
            {items.map((item, itemIndex) => {
              const timeLabel = formatCaptureTime(item.capturedAt)
              return (
                <motion.li
                  key={`${item.guestId}-${item.index}`}
                  className={`wd-gallery__item${item.isMine ? ' is-mine' : ''}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(itemIndex * 0.025, 0.2),
                  }}
                >
                  <button
                    type="button"
                    className="wd-gallery__open"
                    onClick={() => setLightboxIndex(itemIndex)}
                    aria-label={`View photo by ${item.guestLabel}${timeLabel ? ` at ${timeLabel}` : ''}`}
                  >
                    <img
                      src={item.dataUrl}
                      alt=""
                      className="wd-gallery__img"
                    />
                    <span className="wd-gallery__caption">
                      {item.isMine ? 'You' : item.guestLabel}
                    </span>
                    {timeLabel ? (
                      <span className="wd-gallery__time">{timeLabel}</span>
                    ) : null}
                  </button>
                </motion.li>
              )
            })}
          </ul>
        </>
      )}

      {lightboxItem ? (
        <PhotoLightbox
          dataUrl={lightboxItem.dataUrl}
          guestLabel={lightboxItem.guestLabel}
          capturedAt={lightboxItem.capturedAt}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </section>
  )
}
