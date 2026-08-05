import { createClient } from '@supabase/supabase-js'

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`${name} is not configured.`)
  }
  return value
}

function serverClient(key: string) {
  return createClient(requiredEnvironmentVariable('SUPABASE_URL'), key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  })
}

export function createSupabaseAdminClient() {
  return serverClient(requiredEnvironmentVariable('SUPABASE_SERVICE_ROLE_KEY'))
}

export function createSupabaseAuthClient() {
  return serverClient(requiredEnvironmentVariable('SUPABASE_ANON_KEY'))
}

export function getAdminEmailAllowlist(): Set<string> {
  return new Set(
    (process.env.RSVP_ADMIN_EMAILS ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function isAllowedAdminEmail(
  email: string | undefined,
  allowlist: ReadonlySet<string> = getAdminEmailAllowlist(),
): boolean {
  return Boolean(email && allowlist.has(email.trim().toLowerCase()))
}
