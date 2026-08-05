import { createServerFn } from '@tanstack/react-start'
import { normalizeEmail, validateRSVPInput } from './schema'
import type { RSVPInput } from './schema'

function validatePublicCreate(data: unknown): RSVPInput {
  return validateRSVPInput(data, ['pre_wedding', 'wedding_day'])
}

export const createRSVP = createServerFn({ method: 'POST' })
  .validator(validatePublicCreate)
  .handler(async ({ data }) => {
    const { insertRSVP } = await import('./operations.server')
    return insertRSVP(data)
  })

export const findRSVPByEmail = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (!data || typeof data !== 'object' || !('email' in data)) {
      throw new Error('Email is required.')
    }
    return { email: normalizeEmail(data.email) }
  })
  .handler(async ({ data }) => {
    const { lookupRSVP } = await import('./operations.server')
    return lookupRSVP(data.email)
  })

export const listRSVPs = createServerFn({ method: 'GET' }).handler(async () => {
  const { listAdminRSVPs } = await import('./operations.server')
  return listAdminRSVPs()
})

function validateAdminCreate(data: unknown): RSVPInput {
  if (!data || typeof data !== 'object') {
    throw new Error('RSVP details are required.')
  }
  return validateRSVPInput({
    ...(data as Record<string, unknown>),
    submissionSource: 'admin',
  })
}

export const createAdminRSVP = createServerFn({ method: 'POST' })
  .validator(validateAdminCreate)
  .handler(async ({ data }) => {
    const { insertAdminRSVP } = await import('./operations.server')
    return insertAdminRSVP(data)
  })

function validateAdminUpdate(data: unknown): {
  id: string
  input: RSVPInput
} {
  if (!data || typeof data !== 'object') {
    throw new Error('RSVP details are required.')
  }
  const value = data as Record<string, unknown>
  if (typeof value.id !== 'string' || !value.id) {
    throw new Error('RSVP id is required.')
  }
  return { id: value.id, input: validateRSVPInput(value) }
}

export const updateAdminRSVP = createServerFn({ method: 'POST' })
  .validator(validateAdminUpdate)
  .handler(async ({ data }) => {
    const { updateAdminRecord } = await import('./operations.server')
    return updateAdminRecord(data.id, data.input)
  })

export const deleteAdminRSVP = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (
      !data ||
      typeof data !== 'object' ||
      !('id' in data) ||
      typeof data.id !== 'string' ||
      !data.id
    ) {
      throw new Error('RSVP id is required.')
    }
    return { id: data.id }
  })
  .handler(async ({ data }) => {
    const { deleteAdminRecord } = await import('./operations.server')
    return deleteAdminRecord(data.id)
  })
