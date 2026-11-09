import type { WeddingDaySession } from './storage'

export type MockGuest = {
  guestId: string
  firstName: string
  lastName: string
  email: string
}

export const MOCK_GUESTS: readonly MockGuest[] = [
  {
    guestId: 'mock-guest-mia',
    firstName: 'Mia',
    lastName: 'Santos',
    email: 'mia@example.com',
  },
  {
    guestId: 'mock-guest-jon',
    firstName: 'Jon',
    lastName: 'Reyes',
    email: 'jon@example.com',
  },
  {
    guestId: 'mock-guest-ana',
    firstName: 'Ana',
    lastName: 'Cruz',
    email: 'ana@example.com',
  },
  {
    guestId: 'mock-guest-leo',
    firstName: 'Leo',
    lastName: 'Lim',
    email: 'leo@example.com',
  },
] as const

export function isMockGuestEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase()
  return (
    normalized.endsWith('@example.com') ||
    normalized.endsWith('@test.com') ||
    normalized.startsWith('mock') ||
    MOCK_GUESTS.some((guest) => guest.email.toLowerCase() === normalized)
  )
}

/** Display name for locally stored photos without exposing RSVP details. */
export function getGuestDisplayName(
  guestId: string,
  session?: Pick<WeddingDaySession, 'guestId' | 'displayName'> | null,
): string {
  if (session && guestId === session.guestId) {
    const name = session.displayName?.trim()
    if (name) return name
  }
  const matched = MOCK_GUESTS.find((guest) => guest.guestId === guestId)
  if (matched) return `${matched.firstName} ${matched.lastName}`
  return 'Guest'
}
