import { getGuestDisplayName } from './guestNames'
import type { GalleryGuestSummary } from './storage'

type GuestStripProps = {
  guests: GalleryGuestSummary[]
  sessionGuestId?: string | null
  activeGuestId: string | null
  onSelectGuest: (guestId: string | null) => void
  /** When true, selecting always navigates (e.g. from PostCapture into Gallery). */
  navigateOnly?: boolean
}

export default function GuestStrip({
  guests,
  sessionGuestId,
  activeGuestId,
  onSelectGuest,
  navigateOnly = false,
}: GuestStripProps) {
  if (guests.length === 0) return null

  return (
    <div className="wd-guest-strip" role="navigation" aria-label="Guest galleries">
      <button
        type="button"
        className={`wd-guest-strip__all${activeGuestId === null && !navigateOnly ? ' is-active' : ''}`}
        onClick={() => onSelectGuest(null)}
        aria-pressed={activeGuestId === null && !navigateOnly}
      >
        All
      </button>
      <ul className="wd-guest-strip__list">
        {guests.map((guest) => {
          const label = getGuestDisplayName(guest.guestId, sessionGuestId)
          const isActive = activeGuestId === guest.guestId
          return (
            <li key={guest.guestId}>
              <button
                type="button"
                className={`wd-guest-strip__item${isActive ? ' is-active' : ''}`}
                onClick={() => onSelectGuest(guest.guestId)}
                aria-pressed={isActive}
                aria-label={`${label}, ${guest.photoCount} photos`}
              >
                <img
                  src={guest.thumbUrl}
                  alt=""
                  className="wd-guest-strip__thumb"
                />
                <span className="wd-guest-strip__name">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
