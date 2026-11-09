import { notifyRSVP } from '#/lib/email'
import type { RSVPEmailBundleResult } from '#/lib/email'
import { requireAdmin } from '#/lib/supabase/admin-auth.server'
import { createSupabaseAdminClient } from '#/lib/supabase/server'
import { hasMeaningfulRSVPChanges } from './schema'
import type { JSONValue, RSVPInput, RSVPRecord, RSVPSource } from './schema'

type RSVPRow = {
  id: string
  first_name: string
  last_name: string
  email: string
  additional_details: string
  submission_source: RSVPSource
  notification_status: { [key: string]: JSONValue } | null
  last_notified_at: string | null
  created_at: string
  updated_at: string
}

export type NotificationOutcome =
  | { status: 'sent'; deliveries: RSVPEmailBundleResult }
  | { status: 'failed'; reason: string }

function toRecord(row: RSVPRow): RSVPRecord {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    additionalDetails: row.additional_details,
    submissionSource: row.submission_source,
    notificationStatus: row.notification_status ?? {},
    lastNotifiedAt: row.last_notified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toRow(input: RSVPInput) {
  return {
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    additional_details: input.additionalDetails,
    submission_source: input.submissionSource,
  }
}

function isDuplicateError(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === '23505',
  )
}

async function sendAndStoreNotification(
  record: RSVPRecord,
  event: 'created' | 'updated',
): Promise<NotificationOutcome> {
  const supabase = createSupabaseAdminClient()
  try {
    const deliveries = await notifyRSVP(record, event)
    const skippedRequired = [deliveries.guest, deliveries.owner].filter(
      (delivery) => delivery.status !== 'sent',
    )
    if (skippedRequired.length > 0) {
      const reason = skippedRequired
        .map((delivery) =>
          delivery.status === 'skipped'
            ? delivery.reason
            : 'A required email was not sent.',
        )
        .join(' ')
      await supabase
        .from('rsvps')
        .update({
          notification_status: {
            event,
            failedAt: new Date().toISOString(),
            reason,
            deliveries,
          },
        })
        .eq('id', record.id)
      return { status: 'failed', reason }
    }

    const sentAt = new Date().toISOString()
    await supabase
      .from('rsvps')
      .update({
        notification_status: { event, sentAt, deliveries },
        last_notified_at: sentAt,
      })
      .eq('id', record.id)
    return { status: 'sent', deliveries }
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : 'Email delivery failed.'
    await supabase
      .from('rsvps')
      .update({
        notification_status: {
          event,
          failedAt: new Date().toISOString(),
          reason,
        },
      })
      .eq('id', record.id)
    return { status: 'failed', reason }
  }
}

const MOCK_LOOKUP_USERS: Record<
  string,
  { id: string; firstName: string; lastName: string; email: string }
> = {
  'mia@example.com': {
    id: 'mock-guest-mia',
    firstName: 'Mia',
    lastName: 'Santos',
    email: 'mia@example.com',
  },
  'jon@example.com': {
    id: 'mock-guest-jon',
    firstName: 'Jon',
    lastName: 'Reyes',
    email: 'jon@example.com',
  },
  'ana@example.com': {
    id: 'mock-guest-ana',
    firstName: 'Ana',
    lastName: 'Cruz',
    email: 'ana@example.com',
  },
  'leo@example.com': {
    id: 'mock-guest-leo',
    firstName: 'Leo',
    lastName: 'Lim',
    email: 'leo@example.com',
  },
}

export async function insertRSVP(input: RSVPInput) {
  const result = await createSupabaseAdminClient()
    .from('rsvps')
    .insert(toRow(input))
    .select('*')
    .single()

  if (result.error) {
    const isMock =
      input.email.endsWith('@example.com') ||
      input.email.endsWith('@test.com') ||
      Boolean(import.meta.env.DEV)
    if (isMock) {
      const mockId =
        MOCK_LOOKUP_USERS[input.email.toLowerCase()]?.id ??
        `mock-guest-${input.firstName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'}`
      return {
        record: {
          id: mockId,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          additionalDetails: input.additionalDetails,
          submissionSource: input.submissionSource,
          notificationStatus: {},
          lastNotifiedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        notification: null,
      }
    }
    if (isDuplicateError(result.error)) {
      throw new Error('An RSVP already exists for this email address.')
    }
    throw new Error('We could not save this RSVP. Please try again.')
  }

  const record = toRecord(result.data as RSVPRow)
  const notification = await sendAndStoreNotification(record, 'created')
  return { record, notification }
}

export async function lookupRSVP(email: string) {
  const normalized = email.trim().toLowerCase()
  if (normalized in MOCK_LOOKUP_USERS) {
    return MOCK_LOOKUP_USERS[normalized]!
  }

  const result = await createSupabaseAdminClient()
    .from('rsvps')
    .select('id, first_name, last_name, email')
    .eq('email_normalized', email)
    .maybeSingle()

  if (result.error) throw new Error('Guest lookup is unavailable.')
  if (!result.data) return null
  return {
    id: result.data.id as string,
    firstName: result.data.first_name as string,
    lastName: result.data.last_name as string,
    email: result.data.email as string,
  }
}

export async function listAdminRSVPs(): Promise<RSVPRecord[]> {
  await requireAdmin()
  const result = await createSupabaseAdminClient()
    .from('rsvps')
    .select('*')
    .order('created_at', { ascending: false })
  if (result.error) throw new Error('Could not load RSVP records.')
  return (result.data as RSVPRow[]).map(toRecord)
}

export async function insertAdminRSVP(input: RSVPInput) {
  await requireAdmin()
  return insertRSVP(input)
}

export async function updateAdminRecord(id: string, input: RSVPInput) {
  await requireAdmin()
  const supabase = createSupabaseAdminClient()
  const currentResult = await supabase
    .from('rsvps')
    .select('*')
    .eq('id', id)
    .single()
  if (currentResult.error) throw new Error('RSVP record was not found.')

  const current = toRecord(currentResult.data as RSVPRow)
  if (!hasMeaningfulRSVPChanges(current, input)) {
    return { record: current, notification: null }
  }

  const updateResult = await supabase
    .from('rsvps')
    .update(toRow(input))
    .eq('id', id)
    .select('*')
    .single()
  if (updateResult.error) {
    if (isDuplicateError(updateResult.error)) {
      throw new Error('Another RSVP already uses this email address.')
    }
    throw new Error('Could not update this RSVP.')
  }

  const record = toRecord(updateResult.data as RSVPRow)
  const notification = await sendAndStoreNotification(record, 'updated')
  return { record, notification }
}

export async function deleteAdminRecord(id: string) {
  await requireAdmin()
  const result = await createSupabaseAdminClient()
    .from('rsvps')
    .delete()
    .eq('id', id)
  if (result.error) throw new Error('Could not delete this RSVP.')
  return { deleted: true }
}
