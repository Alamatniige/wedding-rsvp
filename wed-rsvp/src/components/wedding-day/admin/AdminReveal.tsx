import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff, Menu, Pencil, Trash2, X } from 'lucide-react'
import {
  getAdminSession,
  signInAdmin,
  signOutAdmin,
} from '../../../lib/supabase/admin-auth'
import {
  createAdminRSVP,
  deleteAdminRSVP,
  listRSVPs,
  updateAdminRSVP,
} from '../../../lib/rsvp/server'
import type { RSVPRecord } from '../../../lib/rsvp/schema'
import { setWeddingDayPreview } from '../../../lib/wedding-mode'
import { Button } from '../../ui/button'
import { readRevealed, writeRevealed } from '../storage'

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

type DashView = 'list' | 'add' | 'configure'

const emptyEditor: EditorState = {
  firstName: '',
  lastName: '',
  email: '',
  additionalDetails: '',
  submissionSource: 'admin',
}

const viewTitles: Record<DashView, string> = {
  list: 'Guest list',
  add: 'Add RSVP',
  configure: 'Website',
}

export default function AdminReveal({
  initialPreviewEnabled,
}: AdminRevealProps) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [records, setRecords] = useState<RSVPRecord[]>([])
  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState<EditorState>(emptyEditor)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [previewEnabled, setPreviewEnabled] = useState(initialPreviewEnabled)
  const [previewSaving, setPreviewSaving] = useState(false)
  const [view, setView] = useState<DashView>('list')
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<RSVPRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

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
        setError('Could not load this page right now.')
      } finally {
        setReady(true)
      }
    })()
  }, [])

  useEffect(() => {
    if (!menuOpen && !pendingDelete) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (pendingDelete && !deleting) setPendingDelete(null)
      else if (menuOpen) setMenuOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen, pendingDelete, deleting])

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
      setError('That email or password did not match.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    setMenuOpen(false)
    await signOutAdmin()
    setAdminEmail(null)
    setRecords([])
    setEditor(emptyEditor)
    setView('list')
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
    setView('add')
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
      setView('list')
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Could not save RSVP.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    setError(null)
    try {
      await deleteAdminRSVP({ data: { id: pendingDelete.id } })
      if (editor.id === pendingDelete.id) setEditor(emptyEditor)
      await loadRecords()
      setNotice('RSVP deleted.')
      setPendingDelete(null)
    } catch {
      setError('Could not delete this RSVP.')
      setPendingDelete(null)
    } finally {
      setDeleting(false)
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
          <section
            className="wd-admin wd-admin--signin"
            aria-labelledby="admin-title"
          >
            <div className="wd-admin__signin-band">
              <p className="wd-eyebrow">Your wedding</p>
              <h1 id="admin-title" className="wd-title">
                Welcome back
              </h1>
              <p className="wd-copy wd-admin__signin-lede">
                Sign in to manage guests and wedding-day controls.
              </p>
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
                <div className="wd-password-field">
                  <input
                    id="admin-password"
                    className="wd-input wd-password-field__input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="wd-password-field__toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" />
                    ) : (
                      <Eye aria-hidden="true" />
                    )}
                  </button>
                </div>
                {error ? (
                  <p className="wd-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  variant="outline"
                  size="lg"
                  className="wd-admin__signin-submit"
                  disabled={saving}
                >
                  {saving ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>
            </div>
          </section>
        </div>
      </main>
    )
  }

  const headingTitle =
    view === 'add' && editor.id ? 'Edit RSVP' : viewTitles[view]

  return (
    <main className="wd-page">
      <div className="wd-page__sky" aria-hidden="true" />
      <button
        type="button"
        className="wd-admin__menu-trigger wd-admin__menu-trigger--fixed"
        aria-label="Open menu"
        aria-expanded={menuOpen}
        aria-controls="admin-menu-sheet"
        onClick={() => setMenuOpen(true)}
      >
        <Menu aria-hidden="true" />
      </button>

      <div
        className={`wd-admin__sheet${menuOpen ? ' is-open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="wd-admin__sheet-backdrop"
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
        />
        <aside
          id="admin-menu-sheet"
          className="wd-admin__sheet-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Account menu"
        >
          <div className="wd-admin__sheet-header">
            <p className="wd-eyebrow">Account</p>
            <button
              type="button"
              className="wd-admin__menu-trigger"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <X aria-hidden="true" />
            </button>
          </div>
          <p className="wd-admin__menu-email">{adminEmail}</p>
          <button
            type="button"
            className="wd-admin__menu-item"
            onClick={() => void handleSignOut()}
          >
            Sign out
          </button>
        </aside>
      </div>

      <AnimatePresence>
        {pendingDelete ? (
          <motion.div
            className="wd-admin__confirm"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              className="wd-admin__confirm-backdrop"
              aria-label="Cancel delete"
              disabled={deleting}
              onClick={() => {
                if (!deleting) setPendingDelete(null)
              }}
            />
            <motion.div
              className="wd-admin__confirm-panel"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="admin-delete-title"
              aria-describedby="admin-delete-desc"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
            >
              <p className="wd-eyebrow">Remove guest</p>
              <h2 id="admin-delete-title" className="wd-admin__confirm-title">
                Delete this RSVP?
              </h2>
              <p id="admin-delete-desc" className="wd-copy wd-admin__confirm-copy">
                This will permanently remove{' '}
                <strong>
                  {pendingDelete.firstName} {pendingDelete.lastName}
                </strong>
                {pendingDelete.email ? ` (${pendingDelete.email})` : ''}. This
                cannot be undone.
              </p>
              <div className="wd-admin__confirm-actions">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={deleting}
                  onClick={() => setPendingDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="wd-admin__confirm-delete"
                  disabled={deleting}
                  onClick={() => void confirmDelete()}
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="wd-page__content wd-admin-page">
        <section className="wd-admin wd-admin--dash">
          <div className="wd-admin__dash-band">
            <div className="wd-admin__heading">
              <div>
                <p className="wd-eyebrow">Your wedding</p>
                <h1 className="wd-title">{headingTitle}</h1>
              </div>
            </div>

            <nav className="wd-admin__views" aria-label="Dashboard sections">
              <button
                type="button"
                className={`wd-admin__view${view === 'list' ? ' is-active' : ''}`}
                aria-pressed={view === 'list'}
                onClick={() => setView('list')}
              >
                Guests
              </button>
              <button
                type="button"
                className={`wd-admin__view${view === 'add' ? ' is-active' : ''}`}
                aria-pressed={view === 'add'}
                onClick={() => {
                  setEditor(emptyEditor)
                  setView('add')
                }}
              >
                Add RSVP
              </button>
              <button
                type="button"
                className={`wd-admin__view${view === 'configure' ? ' is-active' : ''}`}
                aria-pressed={view === 'configure'}
                onClick={() => setView('configure')}
              >
                Website
              </button>
            </nav>
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

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              className="wd-admin__panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              {view === 'list' ? (
                <div className="wd-admin__guests">
                  <div className="wd-admin__controls wd-admin__surface">
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

                  <div className="wd-admin__table-wrap">
                    <table className="wd-admin__table">
                      <thead>
                        <tr>
                          <th scope="col">Name</th>
                          <th scope="col">Email</th>
                          <th scope="col">Note</th>
                          <th scope="col">Date Submitted</th>
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((record) => (
                          <tr key={record.id}>
                            <td>
                              {record.firstName} {record.lastName}
                            </td>
                            <td>{record.email}</td>
                            <td>{record.additionalDetails || '—'}</td>
                            <td>
                              {new Date(record.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                },
                              )}
                            </td>
                            <td>
                              <div className="wd-admin__table-actions">
                                <button
                                  type="button"
                                  className="wd-admin__row-action"
                                  onClick={() => editRecord(record)}
                                  aria-label={`Edit ${record.firstName} ${record.lastName}`}
                                >
                                  <Pencil aria-hidden="true" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  className="wd-admin__row-action wd-admin__row-action--danger"
                                  onClick={() => {
                                    setNotice(null)
                                    setError(null)
                                    setPendingDelete(record)
                                  }}
                                  aria-label={`Delete ${record.firstName} ${record.lastName}`}
                                >
                                  <Trash2 aria-hidden="true" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredRecords.length === 0 ? (
                      <p className="wd-copy wd-admin__table-empty">
                        No RSVP records found.
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {view === 'add' ? (
                <div className="wd-admin__add wd-admin__surface">
                  <form className="wd-form" onSubmit={handleSave}>
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
                            setEditor({
                              ...editor,
                              firstName: event.target.value,
                            })
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
                            setEditor({
                              ...editor,
                              lastName: event.target.value,
                            })
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
                    <div className="wd-admin__add-actions">
                      <Button
                        type="submit"
                        variant="outline"
                        size="lg"
                        className="wd-admin__add-submit"
                        disabled={saving}
                      >
                        {saving ? 'Saving…' : editor.id ? 'Update' : 'Create'}
                      </Button>
                      {editor.id ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={() => {
                            setEditor(emptyEditor)
                            setView('list')
                          }}
                        >
                          Cancel
                        </Button>
                      ) : null}
                    </div>
                  </form>
                </div>
              ) : null}

              {view === 'configure' ? (
                <div className="wd-admin__day">
                  <div className="wd-admin__day-stack">
                    <div className="wd-admin__toggle-row wd-admin__surface">
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
                    <div className="wd-admin__toggle-row wd-admin__surface">
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
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="wd-admin__day-cta"
                    >
                      <Link to="/">View website</Link>
                    </Button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  )
}
