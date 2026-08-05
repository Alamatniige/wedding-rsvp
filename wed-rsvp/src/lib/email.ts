import {
  sendInvitation,
  sendRSVPConfirmation,
  sendRSVPOwnerNotification,
} from '#/lib/email-template'
import type { EmailDeliveryResult } from '#/lib/email-template'
import { shouldSendInvitation } from '#/lib/rsvp/notification-policy'
import type { RSVPRecord } from '#/lib/rsvp/schema'

export type RSVPEmailBundleResult = {
  guest: EmailDeliveryResult
  owner: EmailDeliveryResult
  invitation:
    | EmailDeliveryResult
    | EmailDeliveryResult
    | { status: 'not_applicable'; reason: string }
}

export async function notifyRSVP(
  record: RSVPRecord,
  event: 'created' | 'updated',
): Promise<RSVPEmailBundleResult> {
  const guestName = `${record.firstName} ${record.lastName}`.trim()
  const [guest, owner] = await Promise.all([
    sendRSVPConfirmation({
      guestName,
      guestEmail: record.email,
      additionalDetails: record.additionalDetails,
      event,
      submissionSource: record.submissionSource,
    }),
    sendRSVPOwnerNotification({
      event,
      guestName,
      guestEmail: record.email,
      additionalDetails: record.additionalDetails,
      submissionSource: record.submissionSource,
    }),
  ])

  const invitation = shouldSendInvitation(record, event)
    ? await sendInvitation(record.email, { guestName })
    : {
        status: 'not_applicable' as const,
        reason: 'Invitations are only sent for new pre-wedding RSVPs.',
      }

  return { guest, owner, invitation }
}
