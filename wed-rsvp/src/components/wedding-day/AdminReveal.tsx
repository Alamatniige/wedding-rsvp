import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { setWeddingDayPreview } from '../../lib/wedding-mode'
import { Button } from '../ui/button'
import {
  readAdminOk,
  readRevealed,
  writeAdminOk,
  writeRevealed,
} from './storage'

/**
 * Client-only admin gate for this prototype.
 * Passcode check is NOT real auth — MUST be replaced with proper
 * server-side authentication once a backend exists.
 */
const ADMIN_PASSCODE = 'reveal2027'

type AdminRevealProps = {
  initialPreviewEnabled: boolean
}

export default function AdminReveal({
  initialPreviewEnabled,
}: AdminRevealProps) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [previewEnabled, setPreviewEnabled] = useState(initialPreviewEnabled)
  const [previewSaving, setPreviewSaving] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  useEffect(() => {
    setAuthed(readAdminOk())
    setRevealed(readRevealed())
    setReady(true)
  }, [])

  function handleUnlock(event: FormEvent) {
    event.preventDefault()
    setError(null)
    // Client-only placeholder — do not treat as production security.
    if (passcode.trim() !== ADMIN_PASSCODE) {
      setError('Incorrect passcode.')
      return
    }
    writeAdminOk(true)
    setAuthed(true)
  }

  function toggleReveal() {
    const next = !revealed
    writeRevealed(next)
    setRevealed(next)
  }

  async function toggleWeddingDayPreview() {
    const next = !previewEnabled
    setPreviewSaving(true)
    setPreviewError(null)

    try {
      await setWeddingDayPreview({ data: { enabled: next } })
      setPreviewEnabled(next)
      await router.invalidate()
    } catch {
      setPreviewError('Could not update preview mode. Please try again.')
    } finally {
      setPreviewSaving(false)
    }
  }

  return (
    <main className="wd-page">
      <div className="wd-page__sky" aria-hidden="true" />
      <div className="wd-page__content">
        {!ready ? (
          <p className="wd-copy">Loading…</p>
        ) : (
          <section
            className="wd-panel wd-admin"
            aria-labelledby="wd-admin-title"
          >
            <p className="wd-eyebrow">Coordinator</p>
            <h1 id="wd-admin-title" className="wd-title">
              Gallery reveal
            </h1>

            {!authed ? (
              <>
                <p className="wd-copy">
                  Enter the coordinator passcode to unlock the reveal control.
                </p>
                <form className="wd-form" onSubmit={handleUnlock}>
                  <label className="wd-label" htmlFor="wd-passcode">
                    Passcode
                  </label>
                  <input
                    id="wd-passcode"
                    className="wd-input"
                    type="password"
                    autoComplete="current-password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                  />
                  {error ? (
                    <p className="wd-error" role="alert">
                      {error}
                    </p>
                  ) : null}
                  <div className="wd-actions">
                    <Button type="submit">Unlock</Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <p className="wd-copy">
                  Flip this toggle when you&apos;re ready for guests to see the
                  shared gallery.
                </p>
                <div className="wd-admin__toggle-row">
                  <span className="wd-admin__status" aria-live="polite">
                    Gallery is {revealed ? 'revealed' : 'hidden'}
                  </span>
                  <button
                    type="button"
                    className={`wd-toggle${revealed ? ' is-on' : ''}`}
                    role="switch"
                    aria-checked={revealed}
                    onClick={toggleReveal}
                  >
                    <span className="wd-toggle__knob" />
                  </button>
                </div>
                <p className="wd-copy">
                  Preview the wedding-day website before the scheduled date.
                  This setting applies only to this browser.
                </p>
                <div className="wd-admin__toggle-row">
                  <span className="wd-admin__status" aria-live="polite">
                    Wedding-day preview is {previewEnabled ? 'on' : 'off'}
                  </span>
                  <button
                    type="button"
                    className={`wd-toggle${previewEnabled ? ' is-on' : ''}`}
                    role="switch"
                    aria-checked={previewEnabled}
                    aria-label="Toggle wedding-day website preview"
                    disabled={previewSaving}
                    onClick={toggleWeddingDayPreview}
                  >
                    <span className="wd-toggle__knob" />
                  </button>
                </div>
                {previewError ? (
                  <p className="wd-error" role="alert">
                    {previewError}
                  </p>
                ) : null}
                <div className="mt-6 flex justify-center">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link to="/">View website</Link>
                  </Button>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
