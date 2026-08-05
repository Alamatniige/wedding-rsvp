import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import {
  getAdminSession,
  signInAdmin,
  signOutAdmin,
} from '../../lib/supabase/admin-auth'
import {
  createAdminRSVP,
  deleteAdminRSVP,
  listRSVPs,
  updateAdminRSVP,
} from '../../lib/rsvp/server'
import type { RSVPRecord } from '../../lib/rsvp/schema'
import { setWeddingDayPreview } from '../../lib/wedding-mode'
import { Button } from '../ui/button'
import { readRevealed, writeRevealed } from './storage'

type AdminRevealProps = {
  initialPreviewEnabled: boolean
}

type EditorState = {
  id?: string
  firstName: string
  lastName: string
  email: string
  additionalDetails: string
  submissionSource: RSVPRecord['submissionSource']
}

const emptyEditor: EditorState = {
  firstName: '',
  lastName: '',
  email: '',
  additionalDetails: '',
  submissionSource: 'admin',
}

export default function AdminReveal({
  initialPreviewEnabled,
}: AdminRevealProps) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [password, setPassword] = useState('')
  const [records, setRecords] = useState<RSVPRecord[]>([])
  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState<EditorState>(emptyEditor)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [previewEnabled, setPreviewEnabled] = useState(initialPreviewEnabled)
  const [previewSaving, setPreviewSaving] = useState(false)

  async function loadRecords() {
    const next = await listRSVPs()
    setRecords(next)
  }

  useEffect(() => {
    void (async () => {
      try {
        const session = await getAdminSession()
        if (session) {
          setAdminEmail(session.email)
          await loadRecords()
        }
        setRevealed(readRevealed())
      } catch {
        setError('Could not load the admin area.')
      } finally {
        setReady(true)
      }
    })()
  }, [])

  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return records
    return records.filter((record) =>
      `${record.firstName} ${record.lastName} ${record.email}`
        .toLowerCase()
        .includes(normalized),
    )
  }, [query, records])

  async function handleLogin(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const session = await signInAdmin({
        data: { email: loginEmail, password },
      })
      setAdminEmail(session.email)
      setPassword('')
      await loadRecords()
    } catch {
      setError('Invalid administrator credentials.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    await signOutAdmin()
    setAdminEmail(null)
    setRecords([])
    setEditor(emptyEditor)
  }

  function editRecord(record: RSVPRecord) {
    setEditor({
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      additionalDetails: record.additionalDetails,
      submissionSource: record.submissionSource,
    })
    setError(null)
    setNotice(null)
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      const payload = {
        firstName: editor.firstName,
        lastName: editor.lastName,
        email: editor.email,
        additionalDetails: editor.additionalDetails,
        submissionSource: editor.submissionSource,
      }
      const result = editor.id
        ? await updateAdminRSVP({ data: { id: editor.id, ...payload } })
        : await createAdminRSVP({ data: payload })
      setNotice(
        result.notification?.status === 'failed'
          ? 'RSVP saved, but email delivery failed.'
          : 'RSVP saved and notifications processed.',
      )
      setEditor(emptyEditor)
      await loadRecords()
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Could not save RSVP.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(record: RSVPRecord) {
    const confirmed = window.confirm(
      `Delete the RSVP for ${record.firstName} ${record.lastName}?`,
    )
    if (!confirmed) return
    setError(null)
    try {
      await deleteAdminRSVP({ data: { id: record.id } })
      if (editor.id === record.id) setEditor(emptyEditor)
      await loadRecords()
      setNotice('RSVP deleted.')
    } catch {
      setError('Could not delete this RSVP.')
    }
  }

  function toggleReveal() {
    const next = !revealed
    writeRevealed(next)
    setRevealed(next)
  }

  async function toggleWeddingDayPreview() {
    const next = !previewEnabled
    setPreviewSaving(true)
    setError(null)
    try {
      await setWeddingDayPreview({ data: { enabled: next } })
      setPreviewEnabled(next)
      await router.invalidate()
    } catch {
      setError('Could not update preview mode.')
    } finally {
      setPreviewSaving(false)
    }
  }

  if (!ready) {
    return (
      <main className="wd-page">
        <div className="wd-page__content">
          <p className="wd-copy">Loading…</p>
        </div>
      </main>
    )
  }

  if (!adminEmail) {
    return (
      <main className="wd-page">
        <div className="wd-page__sky" aria-hidden="true" />
        <div className="wd-page__content">
          <section className="wd-panel wd-admin" aria-labelledby="admin-title">
            <p className="wd-eyebrow">Coordinator</p>
            <h1 id="admin-title" className="wd-title">
              Admin sign in
            </h1>
            <form className="wd-form" onSubmit={handleLogin}>
              <label className="wd-label" htmlFor="admin-email">
                Email
              </label>
              <input
                id="admin-email"
                className="wd-input"
                type="email"
                autoComplete="username"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                required
              />
              <label className="wd-label" htmlFor="admin-password">
                Password
              </label>
              <input
                id="admin-password"
                className="wd-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              {error ? (
                <p className="wd-error" role="alert">
                  {error}
                </p>
              ) : null}
              <Button type="submit" disabled={saving}>
                {saving ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="wd-page">
      <div className="wd-page__sky" aria-hidden="true" />
      <div className="wd-page__content wd-admin-page">
        <section className="wd-panel wd-admin">
          <div className="wd-admin__heading">
            <div>
              <p className="wd-eyebrow">Coordinator</p>
              <h1 className="wd-title">RSVP management</h1>
              <p className="wd-copy">Signed in as {adminEmail}</p>
            </div>
            <Button type="button" variant="outline" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>

          {error ? (
            <p className="wd-error" role="alert">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="wd-lookup__notice" role="status">
              {notice}
            </p>
          ) : null}

          <div className="wd-admin__controls">
            <label className="wd-label" htmlFor="rsvp-search">
              Search RSVPs
            </label>
            <input
              id="rsvp-search"
              className="wd-input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name or email"
            />
            <p className="wd-copy">{records.length} total RSVP records</p>
          </div>

          <div className="wd-admin__crud">
            <form className="wd-form wd-admin__editor" onSubmit={handleSave}>
              <h2 className="wd-title">
                {editor.id ? 'Edit RSVP' : 'Add RSVP'}
              </h2>
              <div className="wd-form__row">
                <div className="wd-form__field">
                  <label className="wd-label" htmlFor="admin-first-name">
                    First name
                  </label>
                  <input
                    id="admin-first-name"
                    className="wd-input"
                    value={editor.firstName}
                    onChange={(event) =>
                      setEditor({ ...editor, firstName: event.target.value })
                    }
                    required
                  />
                </div>
                <div className="wd-form__field">
                  <label className="wd-label" htmlFor="admin-last-name">
                    Last name
                  </label>
                  <input
                    id="admin-last-name"
                    className="wd-input"
                    value={editor.lastName}
                    onChange={(event) =>
                      setEditor({ ...editor, lastName: event.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <label className="wd-label" htmlFor="admin-rsvp-email">
                Email
              </label>
              <input
                id="admin-rsvp-email"
                className="wd-input"
                type="email"
                value={editor.email}
                onChange={(event) =>
                  setEditor({ ...editor, email: event.target.value })
                }
                required
              />
              <label className="wd-label" htmlFor="admin-details">
                Additional details
              </label>
              <textarea
                id="admin-details"
                className="wd-input"
                rows={4}
                value={editor.additionalDetails}
                onChange={(event) =>
                  setEditor({
                    ...editor,
                    additionalDetails: event.target.value,
                  })
                }
              />
              <div className="wd-actions wd-actions--row">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : editor.id ? 'Update' : 'Create'}
                </Button>
                {editor.id ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditor(emptyEditor)}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>

            <div className="wd-admin__records">
              {filteredRecords.map((record) => (
                <article className="wd-admin__record" key={record.id}>
                  <h3>
                    {record.firstName} {record.lastName}
                  </h3>
                  <p>{record.email}</p>
                  <p>
                    {record.submissionSource.replaceAll('_', ' ')} ·{' '}
                    {new Date(record.createdAt).toLocaleString()}
                  </p>
                  {record.additionalDetails ? (
                    <p>{record.additionalDetails}</p>
                  ) : null}
                  <div className="wd-actions wd-actions--row">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => editRecord(record)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleDelete(record)}
                    >
                      Delete
                    </Button>
                  </div>
                </article>
              ))}
              {filteredRecords.length === 0 ? (
                <p className="wd-copy">No RSVP records found.</p>
              ) : null}
            </div>
          </div>

          <hr className="wd-admin__divider" />
          <h2 className="wd-title">Wedding-day controls</h2>
          <div className="wd-admin__toggle-row">
            <span className="wd-admin__status">
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
          <div className="wd-admin__toggle-row">
            <span className="wd-admin__status">
              Wedding-day preview is {previewEnabled ? 'on' : 'off'}
            </span>
            <button
              type="button"
              className={`wd-toggle${previewEnabled ? ' is-on' : ''}`}
              role="switch"
              aria-checked={previewEnabled}
              disabled={previewSaving}
              onClick={() => void toggleWeddingDayPreview()}
            >
              <span className="wd-toggle__knob" />
            </button>
          </div>
          <Button asChild variant="outline">
            <Link to="/">View website</Link>
          </Button>
        </section>
      </div>
    </main>
  )
}
