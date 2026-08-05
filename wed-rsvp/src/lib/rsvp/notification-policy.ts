import type { RSVPRecord } from './schema'

export function shouldSendInvitation(
  record: Pick<RSVPRecord, 'submissionSource'>,
  event: 'created' | 'updated',
): boolean {
  return event === 'created' && record.submissionSource !== 'wedding_day'
}
