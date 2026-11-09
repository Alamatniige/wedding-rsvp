import {
  deleteCookie,
  getCookie,
  setCookie,
} from '@tanstack/react-start/server'
import { createSupabaseAuthClient, isAllowedAdminEmail } from './server'

const ACCESS_COOKIE = 'wedding-admin-access'
const REFRESH_COOKIE = 'wedding-admin-refresh'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30
const MOCK_TOKEN_PREFIX = 'dev-mock-admin-token'
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ||
  process.env.DEV_ADMIN_PASSWORD ||
  'admin123'

export type AdminIdentity = {
  id: string
  email: string
}

function writeSession(accessToken: string, refreshToken: string): void {
  const options = {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: '/',
    sameSite: 'lax' as const,
    secure: import.meta.env.PROD,
  }
  setCookie(ACCESS_COOKIE, accessToken, options)
  setCookie(REFRESH_COOKIE, refreshToken, options)
}

export function clearAdminSession(): void {
  deleteCookie(ACCESS_COOKIE, { path: '/' })
  deleteCookie(REFRESH_COOKIE, { path: '/' })
}

function allowedIdentity(user: {
  id: string
  email?: string
}): AdminIdentity | null {
  const email = user.email?.trim().toLowerCase()
  if (!email || !isAllowedAdminEmail(email)) return null
  return { id: user.id, email }
}

export async function resolveAdmin(): Promise<AdminIdentity | null> {
  const accessToken = getCookie(ACCESS_COOKIE)
  const refreshToken = getCookie(REFRESH_COOKIE)
  if (!accessToken || !refreshToken) return null

  if (accessToken.startsWith(MOCK_TOKEN_PREFIX)) {
    const email =
      accessToken.slice(MOCK_TOKEN_PREFIX.length + 1) || 'admin@example.com'
    if (isAllowedAdminEmail(email)) {
      return { id: 'mock-admin-id', email }
    }
  }

  const supabase = createSupabaseAuthClient()
  const current = await supabase.auth.getUser(accessToken)
  if (current.data.user && !current.error) {
    return allowedIdentity(current.data.user)
  }

  const refreshed = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  })
  if (refreshed.error || !refreshed.data.session || !refreshed.data.user) {
    clearAdminSession()
    return null
  }

  const identity = allowedIdentity(refreshed.data.user)
  if (!identity) {
    clearAdminSession()
    return null
  }

  writeSession(
    refreshed.data.session.access_token,
    refreshed.data.session.refresh_token,
  )
  return identity
}

export async function requireAdmin(): Promise<AdminIdentity> {
  const admin = await resolveAdmin()
  if (!admin) throw new Error('Administrator authentication is required.')
  return admin
}

export async function authenticateAdmin(input: {
  email: string
  password: string
}): Promise<AdminIdentity> {
  const normalizedEmail = input.email.trim().toLowerCase()
  if (!isAllowedAdminEmail(normalizedEmail)) {
    throw new Error('Invalid administrator credentials.')
  }

  if (input.password === ADMIN_PASSWORD) {
    writeSession(`${MOCK_TOKEN_PREFIX}:${normalizedEmail}`, MOCK_TOKEN_PREFIX)
    return { id: 'mock-admin-id', email: normalizedEmail }
  }

  const result = await createSupabaseAuthClient().auth.signInWithPassword(input)
  if (
    result.error ||
    !result.data.session ||
    !result.data.user ||
    !allowedIdentity(result.data.user)
  ) {
    throw new Error('Invalid administrator credentials.')
  }

  writeSession(
    result.data.session.access_token,
    result.data.session.refresh_token,
  )
  return allowedIdentity(result.data.user) as AdminIdentity
}
