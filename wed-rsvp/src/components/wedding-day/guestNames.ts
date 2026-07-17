import { MOCK_GUESTS } from './mockGuests'
import { readLocalGuests } from './storage'

/** Display name for a guest id (seeded + local), or a fallback. */
export function getGuestDisplayName(
  guestId: string,
  sessionGuestId?: string | null,
): string {
  if (sessionGuestId && guestId === sessionGuestId) return 'You'
  const seeded = MOCK_GUESTS.find((g) => g.id === guestId)
  if (seeded) return `${seeded.firstName} ${seeded.lastName}`.trim()
  const local = readLocalGuests().find((g) => g.id === guestId)
  if (local) return `${local.firstName} ${local.lastName}`.trim()
  return 'Guest'
}
