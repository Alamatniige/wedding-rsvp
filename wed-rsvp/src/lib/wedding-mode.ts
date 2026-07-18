import { createServerFn } from '@tanstack/react-start'
import {
  deleteCookie,
  getCookie,
  setCookie,
} from '@tanstack/react-start/server'

export type WeddingMode = 'pre-wedding' | 'wedding-day'

export const WEDDING_DATE = '2027-04-27'
export const WEDDING_TIMEZONE = 'Asia/Manila'
const WEDDING_DAY_PREVIEW_COOKIE = 'wedding-day-preview'
const PREVIEW_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export type WeddingModeResult = {
  mode: WeddingMode
  overridden: boolean
}

export type WeddingModeContextResult = WeddingModeResult & {
  previewEnabled: boolean
}

export function isWeddingMode(value: unknown): value is WeddingMode {
  return value === 'pre-wedding' || value === 'wedding-day'
}

/** Calendar date (YYYY-MM-DD) for `date` in the given IANA timezone. */
export function getCalendarDateInTimeZone(
  date: Date,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function resolveWeddingMode(options: {
  now: Date
  override?: unknown
  allowOverride: boolean
}): WeddingModeResult {
  const { now, override, allowOverride } = options

  if (allowOverride && isWeddingMode(override)) {
    return { mode: override, overridden: true }
  }

  const todayInWeddingTz = getCalendarDateInTimeZone(now, WEDDING_TIMEZONE)
  const mode: WeddingMode =
    todayInWeddingTz >= WEDDING_DATE ? 'wedding-day' : 'pre-wedding'

  return { mode, overridden: false }
}

/**
 * Force mode locally via `.env` / `.env.local`:
 *   WEDDING_MODE=pre-wedding
 *   WEDDING_MODE=wedding-day
 * Honored only when `import.meta.env.DEV` is true (ignored in production builds).
 */
export const getWeddingMode = createServerFn({ method: 'GET' }).handler(
  (): WeddingModeContextResult => {
    const previewEnabled = getCookie(WEDDING_DAY_PREVIEW_COOKIE) === 'true'
    if (previewEnabled) {
      return {
        mode: 'wedding-day',
        overridden: true,
        previewEnabled: true,
      }
    }

    const result = resolveWeddingMode({
      now: new Date(),
      override: process.env.WEDDING_MODE,
      allowOverride: import.meta.env.DEV,
    })

    return { ...result, previewEnabled: false }
  },
)

function validatePreviewInput(data: unknown): { enabled: boolean } {
  if (
    typeof data !== 'object' ||
    data === null ||
    !('enabled' in data) ||
    typeof data.enabled !== 'boolean'
  ) {
    throw new Error('A boolean preview state is required.')
  }

  return { enabled: data.enabled }
}

export const setWeddingDayPreview = createServerFn({ method: 'POST' })
  .validator(validatePreviewInput)
  .handler(({ data }): { enabled: boolean } => {
    if (data.enabled) {
      setCookie(WEDDING_DAY_PREVIEW_COOKIE, 'true', {
        httpOnly: true,
        maxAge: PREVIEW_MAX_AGE_SECONDS,
        path: '/',
        sameSite: 'lax',
        secure: import.meta.env.PROD,
      })
    } else {
      deleteCookie(WEDDING_DAY_PREVIEW_COOKIE, { path: '/' })
    }

    return { enabled: data.enabled }
  })
