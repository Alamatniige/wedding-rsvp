import { render } from '@react-email/render'
import { Resend } from 'resend'
import InvitationEmail from './invitation'
import type { InvitationEmailProps } from './invitation'
import RSVPConfirmationEmail from './rsvp-confirmation'
import type { RSVPConfirmationEmailProps } from './rsvp-confirmation'
import RSVPOwnerNotificationEmail from './rsvp-owner-notification'
import type { RSVPOwnerNotificationEmailProps } from './rsvp-owner-notification'

type EmailDeliveryResult =
  | { status: 'sent'; id?: string }
  | { status: 'skipped'; reason: string }

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.RESEND_FROM_EMAIL?.trim()

  if (!apiKey || !from) {
    return null
  }

  return { apiKey, from }
}

function getResendClient() {
  const config = getResendConfig()
  if (!config) {
    return null
  }

  return {
    resend: new Resend(config.apiKey),
    from: config.from,
  }
}

async function sendRenderedEmail(options: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<EmailDeliveryResult> {
  const client = getResendClient()
  if (!client) {
    return {
      status: 'skipped',
      reason:
        'Resend is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.',
    }
  }

  const result = await client.resend.emails.send({
    from: client.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  })
  if (result.error) {
    throw new Error(result.error.message)
  }

  return {
    status: 'sent',
    id: typeof result.data?.id === 'string' ? result.data.id : undefined,
  }
}

export async function sendRSVPConfirmation(
  props: RSVPConfirmationEmailProps,
): Promise<EmailDeliveryResult> {
  const html = await render(RSVPConfirmationEmail(props))
  const text = await render(RSVPConfirmationEmail(props), {
    plainText: true,
  })

  return sendRenderedEmail({
    to: props.guestEmail,
    subject: `RSVP received for ${props.guestName}`,
    html,
    text,
  })
}

export async function sendInvitation(
  to: string,
  props: InvitationEmailProps,
): Promise<EmailDeliveryResult> {
  const html = await render(InvitationEmail(props))
  const text = await render(InvitationEmail(props), {
    plainText: true,
  })

  return sendRenderedEmail({
    to,
    subject: `${props.guestName}, you're invited to our wedding`,
    html,
    text,
  })
}

export async function sendRSVPOwnerNotification(
  props: RSVPOwnerNotificationEmailProps,
): Promise<EmailDeliveryResult> {
  const ownerEmail = process.env.EVENT_OWNER_EMAIL?.trim()
  if (!ownerEmail) {
    return {
      status: 'skipped',
      reason: 'EVENT_OWNER_EMAIL is not configured.',
    }
  }

  const html = await render(RSVPOwnerNotificationEmail(props))
  const text = await render(RSVPOwnerNotificationEmail(props), {
    plainText: true,
  })

  return sendRenderedEmail({
    to: ownerEmail,
    subject: `${props.guestName} ${props.event === 'created' ? 'submitted' : 'updated'} an RSVP`,
    html,
    text,
  })
}

export type { EmailDeliveryResult }
