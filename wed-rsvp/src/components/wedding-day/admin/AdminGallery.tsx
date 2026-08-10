import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Download, X } from 'lucide-react'
import JSZip from 'jszip'
import type { WeddingDayPhotoRecord } from '../../../lib/photos/schema'
import { Button } from '../../ui/button'
import PhotoLightbox from '../gallery/PhotoLightbox'
import { formatCaptureTime } from '../storage'
import { getAdminGalleryMocks } from './adminGalleryMocks'

type AdminGalleryProps = {
  photos: WeddingDayPhotoRecord[]
  loading: boolean
  error: string | null
}

type GuestFilter = {
  guestId: string
  guestLabel: string
  photoCount: number
  thumbUrl: string
}

function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'guest'
  )
}

function stampFor(capturedAt: string | null, fallback: string): string {
  if (!capturedAt) return fallback
  return capturedAt.replace(/[:.]/g, '-').slice(0, 19)
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
}

async function fetchImageBlob(url: string): Promise<Blob> {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Could not fetch a selected photo.')
  return response.blob()
}

function extensionFromBlob(blob: Blob): string {
  if (blob.type.includes('png')) return 'png'
  if (blob.type.includes('webp')) return 'webp'
  return 'jpg'
}

export default function AdminGallery({
  photos,
  loading,
  error,
}: AdminGalleryProps) {
  const [activeGuestId, setActiveGuestId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const usingMocks = photos.length === 0 && !loading
  const sourcePhotos = usingMocks ? getAdminGalleryMocks() : photos

  const guests = useMemo(() => {
    const map = new Map<string, GuestFilter>()
    for (const photo of sourcePhotos) {
      const existing = map.get(photo.guestId)
      if (!existing) {
        map.set(photo.guestId, {
          guestId: photo.guestId,
          guestLabel: photo.guestLabel,
          photoCount: 1,
          thumbUrl: photo.url,
        })
      } else {
        existing.photoCount += 1
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.guestLabel.localeCompare(b.guestLabel),
    )
  }, [sourcePhotos])

  const items = useMemo(() => {
    if (!activeGuestId) return sourcePhotos
    return sourcePhotos.filter((photo) => photo.guestId === activeGuestId)
  }, [sourcePhotos, activeGuestId])

  const selectedItems = useMemo(
    () => items.filter((photo) => selectedIds.has(photo.id)),
    [items, selectedIds],
  )

  const allVisibleSelected =
    items.length > 0 && items.every((photo) => selectedIds.has(photo.id))

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAllVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const photo of items) next.add(photo.id)
      return next
    })
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  async function handleDownloadSelected() {
    if (selectedItems.length === 0 || downloading) return
    setDownloading(true)
    setDownloadError(null)
    try {
      if (selectedItems.length <= 5) {
        for (const [index, photo] of selectedItems.entries()) {
          const blob = await fetchImageBlob(photo.url)
          const ext = extensionFromBlob(blob)
          const filename = `${slugify(photo.guestLabel)}-${stampFor(photo.capturedAt, photo.id)}-${index + 1}.${ext}`
          triggerBlobDownload(blob, filename)
          await new Promise((resolve) => window.setTimeout(resolve, 180))
        }
      } else {
        const zip = new JSZip()
        await Promise.all(
          selectedItems.map(async (photo, index) => {
            const blob = await fetchImageBlob(photo.url)
            const ext = extensionFromBlob(blob)
            const filename = `${slugify(photo.guestLabel)}-${stampFor(photo.capturedAt, photo.id)}-${index + 1}.${ext}`
            zip.file(filename, blob)
          }),
        )
        const archive = await zip.generateAsync({ type: 'blob' })
        triggerBlobDownload(archive, 'wedding-guest-photos.zip')
      }
    } catch {
      setDownloadError('Could not download the selected photos.')
    } finally {
      setDownloading(false)
    }
  }

  const lightboxItem =
    lightboxIndex != null ? (items[lightboxIndex] ?? null) : null

  return (
    <div className="wd-admin__gallery">
      {usingMocks ? (
        <p className="wd-lookup__notice" role="status">
          Showing sample photos
        </p>
      ) : null}
      {error ? (
        <p className="wd-error" role="alert">
          {error}
        </p>
      ) : null}
      {downloadError ? (
        <p className="wd-error" role="alert">
          {downloadError}
        </p>
      ) : null}

      <div className="wd-admin__gallery-toolbar wd-admin__surface">
        <div className="wd-admin__gallery-toolbar-row">
          <p className="wd-copy">
            {loading
              ? 'Loading photos…'
              : `${sourcePhotos.length} ${sourcePhotos.length === 1 ? 'photo' : 'photos'}${
                  selectedItems.length
                    ? ` · ${selectedItems.length} selected`
                    : ''
                }`}
          </p>
          <div className="wd-admin__gallery-toolbar-actions">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || items.length === 0}
              onClick={() => {
                if (allVisibleSelected) clearSelection()
                else selectAllVisible()
              }}
            >
              {allVisibleSelected ? 'Clear selection' : 'Select all'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selectedItems.length === 0 || downloading}
              onClick={() => void handleDownloadSelected()}
            >
              <Download data-icon="inline-start" aria-hidden="true" />
              {downloading
                ? 'Preparing…'
                : selectedItems.length > 5
                  ? `Download ZIP (${selectedItems.length})`
                  : `Download selected (${selectedItems.length})`}
            </Button>
          </div>
        </div>
      </div>

      {guests.length > 0 ? (
        <div
          className="wd-admin__gallery-strip"
          role="navigation"
          aria-label="Filter by guest"
        >
          <button
            type="button"
            className={`wd-admin__gallery-chip${activeGuestId === null ? ' is-active' : ''}`}
            aria-pressed={activeGuestId === null}
            onClick={() => setActiveGuestId(null)}
          >
            All
          </button>
          {guests.map((guest) => (
            <button
              key={guest.guestId}
              type="button"
              className={`wd-admin__gallery-chip${activeGuestId === guest.guestId ? ' is-active' : ''}`}
              aria-pressed={activeGuestId === guest.guestId}
              onClick={() => setActiveGuestId(guest.guestId)}
            >
              <img src={guest.thumbUrl} alt="" className="wd-admin__gallery-chip-thumb" />
              <span>
                {guest.guestLabel} ({guest.photoCount})
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {loading ? (
        <p className="wd-copy">Loading gallery…</p>
      ) : items.length === 0 ? (
        <p className="wd-copy">No photos for this guest yet.</p>
      ) : (
        <ul className="wd-admin__gallery-grid">
          {items.map((photo, index) => {
            const selected = selectedIds.has(photo.id)
            const timeLabel = formatCaptureTime(photo.capturedAt)
            return (
              <li
                key={photo.id}
                className={`wd-admin__gallery-item${selected ? ' is-selected' : ''}`}
              >
                <button
                  type="button"
                  className="wd-admin__gallery-select"
                  aria-pressed={selected}
                  aria-label={
                    selected
                      ? `Deselect photo by ${photo.guestLabel}`
                      : `Select photo by ${photo.guestLabel}`
                  }
                  onClick={() => toggleSelected(photo.id)}
                >
                  <span className="wd-admin__gallery-check" aria-hidden="true">
                    {selected ? <Check /> : null}
                  </span>
                </button>
                <button
                  type="button"
                  className="wd-admin__gallery-open"
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`Expand photo by ${photo.guestLabel}${timeLabel ? ` at ${timeLabel}` : ''}`}
                >
                  <img
                    src={photo.url}
                    alt=""
                    className="wd-admin__gallery-img"
                  />
                  <span className="wd-admin__gallery-meta">
                    <span className="wd-admin__gallery-guest">
                      {photo.guestLabel}
                    </span>
                    {timeLabel ? (
                      <span className="wd-admin__gallery-time">{timeLabel}</span>
                    ) : null}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <AnimatePresence>
        {selectedItems.length > 0 ? (
          <motion.div
            className="wd-admin__gallery-bar"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
          >
            <p className="wd-admin__gallery-bar-copy">
              {selectedItems.length} selected
              {selectedItems.length > 5 ? ' · ZIP download' : ''}
            </p>
            <div className="wd-admin__gallery-bar-actions">
              <button
                type="button"
                className="wd-admin__gallery-bar-clear"
                aria-label="Clear selection"
                onClick={clearSelection}
              >
                <X aria-hidden="true" />
              </button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={downloading}
                onClick={() => void handleDownloadSelected()}
              >
                <Download data-icon="inline-start" aria-hidden="true" />
                {downloading
                  ? 'Preparing…'
                  : selectedItems.length > 5
                    ? 'Download ZIP'
                    : 'Download'}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {lightboxItem ? (
        <PhotoLightbox
          dataUrl={lightboxItem.url}
          guestLabel={lightboxItem.guestLabel}
          capturedAt={lightboxItem.capturedAt}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </div>
  )
}
