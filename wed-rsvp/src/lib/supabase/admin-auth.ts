import { createServerFn } from '@tanstack/react-start'
import type { AdminIdentity } from './admin-auth.server'

function validateLogin(data: unknown): { email: string; password: string } {
  if (!data || typeof data !== 'object') {
    throw new Error('Email and password are required.')
  }
  const input = data as Record<string, unknown>
  if (
    typeof input.email !== 'string' ||
    !input.email.trim() ||
    typeof input.password !== 'string' ||
    !input.password
  ) {
    throw new Error('Email and password are required.')
  }
  return { email: input.email.trim().toLowerCase(), password: input.password }
}

export const signInAdmin = createServerFn({ method: 'POST' })
  .validator(validateLogin)
  .handler(async ({ data }): Promise<AdminIdentity> => {
    const { authenticateAdmin } = await import('./admin-auth.server')
    return authenticateAdmin(data)
  })

export const signOutAdmin = createServerFn({ method: 'POST' }).handler(
  async () => {
    const { clearAdminSession } = await import('./admin-auth.server')
    clearAdminSession()
    return { signedOut: true }
  },
)

export const getAdminSession = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AdminIdentity | null> => {
    const { resolveAdmin } = await import('./admin-auth.server')
    return resolveAdmin()
  },
)
