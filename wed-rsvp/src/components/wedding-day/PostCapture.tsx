import { useMemo, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Button } from '../ui/button'
import GuestStrip from './GuestStrip'
import PhotoLightbox from './PhotoLightbox'
import { formatCaptureTime, readGalleryGuests } from './storage'
import type { WeddingDayPhoto } from './storage'

type PostCaptureProps = {
  photoCount: number
  photos: WeddingDayPhoto[]
  revealed: boolean
  sessionGuestId?: string | null
  onBackToCamera: () => void
  onViewGallery: (guestId?: string | null) => void
}

export default function PostCapture({
  photoCount,
  photos,
  revealed,
  sessionGuestId = null,
  onBackToCamera,
  onViewGallery,
}: PostCaptureProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const guests = useMemo(
    () => (revealed ? readGalleryGuests() : []),
    [revealed],
  )

  if (!revealed) {
    return (
      <section
        className="wd-post wd-post--hidden"
        aria-labelledby="wd-post-title"
      >
        <header className="wd-gallery__header">
          <button
            type="button"
            className="wd-gallery__back"
            onClick={onBackToCamera}
            aria-label="Back to camera"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <h1 id="wd-post-title" className="wd-gallery__title">
            Your Moments
          </h1>
          <span className="wd-gallery__header-spacer" aria-hidden="true" />
        </header>

        <div className="wd-post__body">
          {photos.length > 0 ? (
            <>
              <h2 className="wd-gallery__section-title">
                {photoCount} {photoCount === 1 ? 'moment' : 'moments'} saved
              </h2>
              <div className="wd-post__preview" aria-hidden="true">
                {photos.map((photo, index) => {
                  const timeLabel = formatCaptureTime(photo.capturedAt)
                  return (
                    <div className="wd-post__preview-item" key={index}>
                      <img
                        src={photo.dataUrl}
                        alt=""
                        className="wd-post__preview-image"
                      />
                      <span className="wd-post__preview-caption">
                        <span>Moment {index + 1}</span>
                        {timeLabel ? (
                          <span className="wd-post__preview-time">
                            {timeLabel}
                          </span>
                        ) : null}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="wd-state">
              <p className="wd-state__copy">
                No moments yet — head back and capture your first snap.
              </p>
            </div>
          )}

          <div className="wd-post__footer">
            <p className="wd-post__footer-title">Hidden until reveal</p>
            <p className="wd-post__footer-copy">
              A little mystery for now. Your moments are saved and will come
              into focus when the couple unveils the gallery.
            </p>
            <div className="wd-actions">
              <Button type="button" size="lg" onClick={onBackToCamera}>
                Back to camera
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const lightboxPhoto =
    lightboxIndex != null ? (photos[lightboxIndex] ?? null) : null

  return (
    <section
      className="wd-post wd-post--revealed"
      aria-labelledby="wd-post-title"
    >
      <header className="wd-gallery__header wd-gallery__header--wide">
        <button
          type="button"
          className="wd-gallery__back"
          onClick={onBackToCamera}
          aria-label="Back to camera"
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <h1 id="wd-post-title" className="wd-gallery__title">
          Your Moments
        </h1>
        <span className="wd-gallery__header-spacer" aria-hidden="true" />
      </header>

      {guests.length > 0 ? (
        <div className="wd-post__guests">
          <p className="wd-post__guests-label">Browse guests</p>
          <GuestStrip
            guests={guests}
            sessionGuestId={sessionGuestId}
            activeGuestId={null}
            navigateOnly
            onSelectGuest={(guestId) => onViewGallery(guestId)}
          />
        </div>
      ) : null}

      <p className="wd-eyebrow">Saved</p>
      <h2 className="wd-title wd-title--sm">
        {photoCount === 1 ? 'Photo saved' : `${photoCount} photos saved`}
      </h2>
      <p className="wd-copy">
        Tap a photo to view or download it — or browse another guest above.
      </p>

      {photos.length > 0 ? (
        <div className="wd-post__preview">
          {photos.map((photo, index) => {
            const timeLabel = formatCaptureTime(photo.capturedAt)
            return (
              <button
                type="button"
                className="wd-post__preview-item wd-post__preview-item--open"
                key={index}
                onClick={() => setLightboxIndex(index)}
                aria-label={`View your photo${timeLabel ? ` from ${timeLabel}` : ''}`}
              >
                <img
                  src={photo.dataUrl}
                  alt=""
                  className="wd-post__preview-image wd-post__preview-image--clear"
                />
                <span className="wd-post__preview-caption">
                  <span>Moment {index + 1}</span>
                  {timeLabel ? (
                    <span className="wd-post__preview-time">{timeLabel}</span>
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}

      <div className="wd-state">
        <div className="wd-actions wd-actions--row">
          <Button type="button" size="lg" onClick={() => onViewGallery(null)}>
            View full gallery
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onBackToCamera}
          >
            Take more
          </Button>
        </div>
      </div>

      {lightboxPhoto ? (
        <PhotoLightbox
          dataUrl={lightboxPhoto.dataUrl}
          guestLabel="You"
          capturedAt={lightboxPhoto.capturedAt}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </section>
  )
}
