/**
 * Mock guest dataset for the wedding-day photobooth prototype.
 * Swap this file for a real backend lookup when infrastructure exists.
 */

import { findLocalGuestByEmail } from './storage'
import type { LocalGuest } from './storage'

export type MockGuest = {
  id: string
  firstName: string
  lastName: string
  email: string
}

export const MOCK_GUESTS: MockGuest[] = [
  {
    id: 'guest-001',
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'maria.santos@example.com',
  },
  {
    id: 'guest-002',
    firstName: 'James',
    lastName: 'Reyes',
    email: 'james.reyes@example.com',
  },
  {
    id: 'guest-003',
    firstName: 'Ana',
    lastName: 'Cruz',
    email: 'ana.cruz@example.com',
  },
  {
    id: 'guest-004',
    firstName: 'David',
    lastName: 'Garcia',
    email: 'david.garcia@example.com',
  },
  {
    id: 'guest-005',
    firstName: 'Sofia',
    lastName: 'Lim',
    email: 'sofia.lim@example.com',
  },
  {
    id: 'guest-006',
    firstName: 'Miguel',
    lastName: 'Torres',
    email: 'miguel.torres@example.com',
  },
  {
    id: 'guest-007',
    firstName: 'Elena',
    lastName: 'Villanueva',
    email: 'elena.v@example.com',
  },
  {
    id: 'guest-008',
    firstName: 'Test',
    lastName: 'Guest',
    email: 'test@wedding.local',
  },
]

/**
 * Case-insensitive, trimmed email match against the mock guest list
 * and any same-day local registrations on this device.
 */
export function findGuestByEmail(
  email: string,
): MockGuest | LocalGuest | undefined {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return undefined
  const seeded = MOCK_GUESTS.find(
    (guest) => guest.email.toLowerCase() === normalized,
  )
  if (seeded) return seeded
  return findLocalGuestByEmail(normalized)
}
