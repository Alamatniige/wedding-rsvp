import { createServerFn } from '@tanstack/react-start'
import { sendInvitation, sendRSVPConfirmation } from '#/lib/email-template'
import type { EmailDeliveryResult } from '#/lib/email-template'

type RSVPEmailInput = {
  firstName: string
  lastName: string
  email: string
  additionalDetails?: string
}

type InvitationEmailInput = {
  to: string
  guestName: string
}

export type RSVPEmailBundleResult = {
  confirmation: EmailDeliveryResult
  invitation: EmailDeliveryResult
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function validateRSVPEmailInput(data: unknown): RSVPEmailInput {
  if (typeof data !== 'object' || data === null) {
    throw new Error('RSVP email payload is required.')
  }

  const { firstName, lastName, email, additionalDetails } = data as Record<
    string,
    unknown
  >

  if (!isNonEmptyString(firstName) || !isNonEmptyString(lastName)) {
    throw new Error('Guest first and last name are required.')
  }

  if (!isNonEmptyString(email)) {
    throw new Error('Guest email is required.')
  }

  return {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    additionalDetails: isNonEmptyString(additionalDetails)
      ? additionalDetails.trim()
      : '',
  }
}

function validateInvitationEmailInput(data: unknown): InvitationEmailInput {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invitation email payload is required.')
  }

  const { to, guestName } = data as Record<string, unknown>

  if (!isNonEmptyString(to) || !isNonEmptyString(guestName)) {
    throw new Error('Invitation recipient and guest name are required.')
  }

  return {
    to: to.trim(),
    guestName: guestName.trim(),
  }
}

export const sendRSVPEmail = createServerFn({ method: 'POST' })
  .validator(validateRSVPEmailInput)
  .handler(async ({ data }): Promise<RSVPEmailBundleResult> => {
    const guestName = `${data.firstName} ${data.lastName}`.trim()

    const [confirmation, invitation] = await Promise.all([
      sendRSVPConfirmation({
        guestName,
        guestEmail: data.email,
        additionalDetails: data.additionalDetails,
      }),
      sendInvitation(data.email, { guestName }),
    ])

    return { confirmation, invitation }
  })

export const sendInvitationEmail = createServerFn({ method: 'POST' })
  .validator(validateInvitationEmailInput)
  .handler(async ({ data }) => {
    return sendInvitation(data.to, {
      guestName: data.guestName,
    })
  })
