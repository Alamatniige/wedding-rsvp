/**
 * localStorage helpers for the wedding-day photobooth prototype.
 * All persistence is client-only until a real backend exists.
 */

export const WD_SESSION_KEY = 'wedding:wd-session'
export const WD_PHOTOS_PREFIX = 'wedding:wd-photos:'
export const WD_REVEALED_KEY = 'wedding:gallery-revealed'
export const WD_ADMIN_OK_KEY = 'wedding:wd-admin-ok'
export const WD_LOCAL_GUESTS_KEY = 'wedding:wd-local-guests'

/** Client-only photo cap for this prototype — MUST be re-enforced server-side once a backend exists. */
export const MAX_PHOTOS_PER_GUEST = 10

export type WeddingDaySession = {
  guestId: string
  email: string
}

export type WeddingDayPhoto = {
  dataUrl: string
  capturedAt: string | null
}

export type LocalGuest = {
  id: string
  firstName: string
  lastName: string
  email: string
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function readSession(): WeddingDaySession | null {
  try {
    const parsed = safeParseJson<Partial<WeddingDaySession>>(
      localStorage.getItem(WD_SESSION_KEY),
    )
    if (
      parsed &&
      typeof parsed.guestId === 'string' &&
      typeof parsed.email === 'string'
    ) {
      return { guestId: parsed.guestId, email: parsed.email }
    }
  } catch {
    // private mode / unavailable storage
  }
  return null
}

export function writeSession(session: WeddingDaySession): void {
  try {
    localStorage.setItem(WD_SESSION_KEY, JSON.stringify(session))
  } catch {
    // private mode / unavailable storage
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(WD_SESSION_KEY)
  } catch {
    // private mode / unavailable storage
  }
}

export function photosKey(guestId: string): string {
  return `${WD_PHOTOS_PREFIX}${guestId}`
}

function normalizePhoto(item: unknown): WeddingDayPhoto | null {
  if (typeof item === 'string' && item.length > 0) {
    return { dataUrl: item, capturedAt: null }
  }
  if (
    item &&
    typeof item === 'object' &&
    'dataUrl' in item &&
    typeof (item as { dataUrl: unknown }).dataUrl === 'string'
  ) {
    const dataUrl = (item as { dataUrl: string }).dataUrl
    if (!dataUrl) return null
    const rawAt = (item as { capturedAt?: unknown }).capturedAt
    const capturedAt =
      typeof rawAt === 'string' && rawAt.length > 0 ? rawAt : null
    return { dataUrl, capturedAt }
  }
  return null
}

export function readPhotos(guestId: string): WeddingDayPhoto[] {
  try {
    const parsed = safeParseJson<unknown>(
      localStorage.getItem(photosKey(guestId)),
    )
    if (Array.isArray(parsed)) {
      return parsed
        .map(normalizePhoto)
        .filter((item): item is WeddingDayPhoto => item !== null)
    }
  } catch {
    // private mode / unavailable storage
  }
  return []
}

/**
 * Append a photo for a guest.
 * Cap is client-only for this prototype and MUST be re-enforced server-side
 * once a backend exists — do not treat this as the final security model.
 */
export function appendPhoto(
  guestId: string,
  dataUrl: string,
  capturedAt: string = new Date().toISOString(),
): { photos: WeddingDayPhoto[]; capped: boolean; saved: boolean } {
  const existing = readPhotos(guestId)
  if (existing.length >= MAX_PHOTOS_PER_GUEST) {
    return { photos: existing, capped: true, saved: false }
  }
  const photos = [...existing, { dataUrl, capturedAt }]
  try {
    localStorage.setItem(photosKey(guestId), JSON.stringify(photos))
    return { photos, capped: false, saved: true }
  } catch {
    return { photos: existing, capped: false, saved: false }
  }
}

export function readLocalGuests(): LocalGuest[] {
  try {
    const parsed = safeParseJson<unknown>(
      localStorage.getItem(WD_LOCAL_GUESTS_KEY),
    )
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is LocalGuest => {
      if (!item || typeof item !== 'object') return false
      const g = item as Partial<LocalGuest>
      return (
        typeof g.id === 'string' &&
        typeof g.firstName === 'string' &&
        typeof g.lastName === 'string' &&
        typeof g.email === 'string'
      )
    })
  } catch {
    return []
  }
}

export function findLocalGuestByEmail(email: string): LocalGuest | undefined {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return undefined
  return readLocalGuests().find(
    (guest) => guest.email.toLowerCase() === normalized,
  )
}

export function registerLocalGuest(input: {
  email: string
  firstName: string
  lastName: string
}): LocalGuest {
  const email = input.email.trim().toLowerCase()
  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()
  const existing = findLocalGuestByEmail(email)
  if (existing) return existing

  const guest: LocalGuest = {
    id: `local-${crypto.randomUUID()}`,
    firstName,
    lastName,
    email,
  }
  const guests = [...readLocalGuests(), guest]
  try {
    localStorage.setItem(WD_LOCAL_GUESTS_KEY, JSON.stringify(guests))
  } catch {
    // private mode / unavailable storage
  }
  return guest
}

export function readRevealed(): boolean {
  try {
    return localStorage.getItem(WD_REVEALED_KEY) === 'true'
  } catch {
    return false
  }
}

export function writeRevealed(revealed: boolean): void {
  try {
    localStorage.setItem(WD_REVEALED_KEY, revealed ? 'true' : 'false')
  } catch {
    // private mode / unavailable storage
  }
}

export function readAdminOk(): boolean {
  try {
    return localStorage.getItem(WD_ADMIN_OK_KEY) === 'true'
  } catch {
    return false
  }
}

export function writeAdminOk(ok: boolean): void {
  try {
    if (ok) {
      localStorage.setItem(WD_ADMIN_OK_KEY, 'true')
    } else {
      localStorage.removeItem(WD_ADMIN_OK_KEY)
    }
  } catch {
    // private mode / unavailable storage
  }
}

export type GalleryPhotoEntry = {
  guestId: string
  dataUrl: string
  capturedAt: string | null
  index: number
}

/** Collect all guest photo arrays from localStorage. */
export function readAllGalleryPhotos(): GalleryPhotoEntry[] {
  const entries: GalleryPhotoEntry[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(WD_PHOTOS_PREFIX)) continue
      const guestId = key.slice(WD_PHOTOS_PREFIX.length)
      const photos = readPhotos(guestId)
      photos.forEach((photo, index) => {
        entries.push({
          guestId,
          dataUrl: photo.dataUrl,
          capturedAt: photo.capturedAt,
          index,
        })
      })
    }
  } catch {
    // private mode / unavailable storage
  }
  return entries
}

export type GalleryGuestSummary = {
  guestId: string
  photoCount: number
  thumbUrl: string
  latestCapturedAt: string | null
}

/** One summary per guest who has at least one photo. */
export function readGalleryGuests(): GalleryGuestSummary[] {
  const byGuest = new Map<
    string,
    GalleryGuestSummary & { sortIndex: number }
  >()
  for (const entry of readAllGalleryPhotos()) {
    const existing = byGuest.get(entry.guestId)
    if (!existing) {
      byGuest.set(entry.guestId, {
        guestId: entry.guestId,
        photoCount: 1,
        thumbUrl: entry.dataUrl,
        latestCapturedAt: entry.capturedAt,
        sortIndex: entry.index,
      })
      continue
    }
    existing.photoCount += 1
    const existingTime = existing.latestCapturedAt
      ? Date.parse(existing.latestCapturedAt)
      : NaN
    const nextTime = entry.capturedAt ? Date.parse(entry.capturedAt) : NaN
    const preferByTime =
      !Number.isNaN(nextTime) &&
      (Number.isNaN(existingTime) || nextTime >= existingTime)
    const preferByIndex =
      Number.isNaN(nextTime) &&
      Number.isNaN(existingTime) &&
      entry.index >= existing.sortIndex
    if (preferByTime || preferByIndex) {
      existing.thumbUrl = entry.dataUrl
      existing.latestCapturedAt = entry.capturedAt
      existing.sortIndex = entry.index
    }
  }
  return Array.from(byGuest.values())
    .map(({ sortIndex: _sortIndex, ...summary }) => summary)
    .sort((a, b) => {
      const aTime = a.latestCapturedAt ? Date.parse(a.latestCapturedAt) : 0
      const bTime = b.latestCapturedAt ? Date.parse(b.latestCapturedAt) : 0
      return bTime - aTime
    })
}

/** Short wedding-friendly time label, e.g. "8:42 PM". */
export function formatCaptureTime(capturedAt: string | null): string | null {
  if (!capturedAt) return null
  const date = new Date(capturedAt)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}
