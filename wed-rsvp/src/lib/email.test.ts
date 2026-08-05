import { describe, expect, it } from 'vitest'
import { shouldSendInvitation } from './rsvp/notification-policy'

describe('RSVP notification decisions', () => {
  it('sends invitations for new pre-wedding and admin records', () => {
    expect(
      shouldSendInvitation({ submissionSource: 'pre_wedding' }, 'created'),
    ).toBe(true)
    expect(shouldSendInvitation({ submissionSource: 'admin' }, 'created')).toBe(
      true,
    )
  })

  it('does not send invitations for updates or wedding-day signups', () => {
    expect(
      shouldSendInvitation({ submissionSource: 'pre_wedding' }, 'updated'),
    ).toBe(false)
    expect(
      shouldSendInvitation({ submissionSource: 'wedding_day' }, 'created'),
    ).toBe(false)
  })
})
