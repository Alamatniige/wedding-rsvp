import type { WeddingDaySession } from './storage'

/** Display name for locally stored photos without exposing RSVP details. */
export function getGuestDisplayName(
  guestId: string,
  session?: Pick<WeddingDaySession, 'guestId' | 'displayName'> | null,
): string {
  if (session && guestId === session.guestId) {
    const name = session.displayName?.trim()
    if (name) return name
  }
  return 'Guest'
}
