import { describe, expect, it } from 'vitest'
import { isAllowedAdminEmail } from './server'

describe('administrator allowlist', () => {
  const allowlist = new Set(['owner@example.com'])

  it('normalizes and accepts allowlisted addresses', () => {
    expect(isAllowedAdminEmail(' OWNER@example.com ', allowlist)).toBe(true)
  })

  it('rejects absent and unknown addresses', () => {
    expect(isAllowedAdminEmail(undefined, allowlist)).toBe(false)
    expect(isAllowedAdminEmail('guest@example.com', allowlist)).toBe(false)
  })
})
