import { describe, expect, it } from 'vitest'
import {
  hasMeaningfulRSVPChanges,
  normalizeEmail,
  validateRSVPInput,
} from './schema'
import type { RSVPRecord } from './schema'

const record: RSVPRecord = {
  id: '00000000-0000-0000-0000-000000000001',
  firstName: 'Maria',
  lastName: 'Santos',
  email: 'maria@example.com',
  additionalDetails: '',
  submissionSource: 'pre_wedding',
  notificationStatus: {},
  lastNotifiedAt: null,
  createdAt: '2026-08-04T00:00:00.000Z',
  updatedAt: '2026-08-04T00:00:00.000Z',
}

describe('RSVP validation', () => {
  it('normalizes email addresses', () => {
    expect(normalizeEmail('  Maria@Example.COM ')).toBe('maria@example.com')
  })

  it('rejects invalid public details', () => {
    expect(() =>
      validateRSVPInput({
        firstName: '',
        lastName: 'Santos',
        email: 'not-an-email',
        submissionSource: 'pre_wedding',
      }),
    ).toThrow('First name is required.')
  })

  it('restricts submission sources', () => {
    expect(() =>
      validateRSVPInput({ ...record, submissionSource: 'admin' }, [
        'pre_wedding',
        'wedding_day',
      ]),
    ).toThrow('valid RSVP submission source')
  })

  it('detects meaningful updates only', () => {
    const same = {
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      additionalDetails: record.additionalDetails,
      submissionSource: record.submissionSource,
    }
    expect(hasMeaningfulRSVPChanges(record, same)).toBe(false)
    expect(
      hasMeaningfulRSVPChanges(record, {
        ...same,
        additionalDetails: 'Vegetarian meal',
      }),
    ).toBe(true)
  })
})
