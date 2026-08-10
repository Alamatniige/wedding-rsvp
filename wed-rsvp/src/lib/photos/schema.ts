export type WeddingDayPhotoRecord = {
  id: string
  guestId: string
  guestLabel: string
  storagePath: string
  url: string
  capturedAt: string | null
  createdAt: string
}

export type UploadWeddingPhotoInput = {
  guestId: string
  dataUrl: string
  capturedAt: string | null
}

export const WEDDING_DAY_PHOTOS_BUCKET = 'wedding-day-photos'

/** Matches client cap in wedding-day/storage.ts — enforced server-side on upload. */
export const MAX_PHOTOS_PER_GUEST = 10
