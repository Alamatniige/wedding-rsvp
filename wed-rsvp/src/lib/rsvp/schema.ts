export const RSVP_SOURCES = ['pre_wedding', 'wedding_day', 'admin'] as const

export type RSVPSource = (typeof RSVP_SOURCES)[number]

export type RSVPInput = {
  firstName: string
  lastName: string
  email: string
  additionalDetails: string
  submissionSource: RSVPSource
}

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

export type RSVPRecord = RSVPInput & {
  id: string
  notificationStatus: { [key: string]: JSONValue }
  lastNotifiedAt: string | null
  createdAt: string
  updatedAt: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function requiredText(
  value: unknown,
  label: string,
  maximumLength: number,
): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} is required.`)
  }
  const normalized = value.trim()
  if (normalized.length > maximumLength) {
    throw new Error(`${label} must be ${maximumLength} characters or fewer.`)
  }
  return normalized
}

export function normalizeEmail(value: unknown): string {
  const email = requiredText(value, 'Email', 320).toLowerCase()
  if (!EMAIL_PATTERN.test(email)) {
    throw new Error('Please enter a valid email address.')
  }
  return email
}

export function validateRSVPInput(
  data: unknown,
  allowedSources: readonly RSVPSource[] = RSVP_SOURCES,
): RSVPInput {
  if (!data || typeof data !== 'object') {
    throw new Error('RSVP details are required.')
  }

  const input = data as Record<string, unknown>
  const source = input.submissionSource
  if (
    typeof source !== 'string' ||
    !allowedSources.includes(source as RSVPSource)
  ) {
    throw new Error('A valid RSVP submission source is required.')
  }

  const additionalDetails =
    typeof input.additionalDetails === 'string'
      ? input.additionalDetails.trim()
      : ''
  if (additionalDetails.length > 4000) {
    throw new Error('Additional details must be 4000 characters or fewer.')
  }

  return {
    firstName: requiredText(input.firstName, 'First name', 100),
    lastName: requiredText(input.lastName, 'Last name', 100),
    email: normalizeEmail(input.email),
    additionalDetails,
    submissionSource: source as RSVPSource,
  }
}

export function hasMeaningfulRSVPChanges(
  current: RSVPRecord,
  next: RSVPInput,
): boolean {
  return (
    current.firstName !== next.firstName ||
    current.lastName !== next.lastName ||
    current.email !== next.email ||
    current.additionalDetails !== next.additionalDetails ||
    current.submissionSource !== next.submissionSource
  )
}
