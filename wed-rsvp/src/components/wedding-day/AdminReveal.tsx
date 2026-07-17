import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
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

export default function AdminReveal() {
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

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
              </>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
