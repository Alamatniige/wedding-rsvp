/** Display name for locally stored photos without exposing RSVP details. */
export function getGuestDisplayName(
  guestId: string,
  sessionGuestId?: string | null,
): string {
  if (sessionGuestId && guestId === sessionGuestId) return 'You'
  return 'Guest'
}
