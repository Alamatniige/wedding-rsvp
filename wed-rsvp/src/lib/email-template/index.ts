export { EmailShell } from './_components/EmailShell'
export { default as InvitationEmail } from './invitation'
export type { InvitationEmailProps } from './invitation'
export { default as RSVPConfirmationEmail } from './rsvp-confirmation'
export type { RSVPConfirmationEmailProps } from './rsvp-confirmation'
export { default as RSVPOwnerNotificationEmail } from './rsvp-owner-notification'
export type { RSVPOwnerNotificationEmailProps } from './rsvp-owner-notification'
export {
  sendInvitation,
  sendRSVPConfirmation,
  sendRSVPOwnerNotification,
} from './send'
export type { EmailDeliveryResult } from './send'
export { emailTheme, layoutStyles, textStyles } from './theme'
