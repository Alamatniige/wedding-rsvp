import type { WeddingDayPhotoRecord } from '../../../lib/photos/schema'

const SAMPLE_IMAGES = [
  '/images/couple/couple-1.jpg',
  '/images/couple/couple-2.jpg',
  '/images/couple/couple-3.jpg',
  '/images/couple/couple-4.jpg',
] as const

const SAMPLE_GUESTS = [
  { guestId: 'mock-guest-mia', guestLabel: 'Mia Santos' },
  { guestId: 'mock-guest-jon', guestLabel: 'Jon Reyes' },
  { guestId: 'mock-guest-ana', guestLabel: 'Ana Cruz' },
  { guestId: 'mock-guest-leo', guestLabel: 'Leo Lim' },
] as const

/** Demo photos so the admin Photos tab is reviewable before real uploads exist. */
export function getAdminGalleryMocks(): WeddingDayPhotoRecord[] {
  const now = Date.now()
  return Array.from({ length: 8 }, (_, index) => {
    const guest = SAMPLE_GUESTS[index % SAMPLE_GUESTS.length]!
    const capturedAt = new Date(now - index * 18 * 60 * 1000).toISOString()
    return {
      id: `mock-photo-${index + 1}`,
      guestId: guest.guestId,
      guestLabel: guest.guestLabel,
      storagePath: `mock/${guest.guestId}/${index + 1}.jpg`,
      url: SAMPLE_IMAGES[index % SAMPLE_IMAGES.length]!,
      capturedAt,
      createdAt: capturedAt,
    }
  })
}
