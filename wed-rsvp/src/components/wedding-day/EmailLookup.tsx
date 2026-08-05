import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '../ui/button'
import { couple } from '../../data/weddingData'
import { createRSVP, findRSVPByEmail } from '../../lib/rsvp/server'
import { writeSession } from './storage'
import type { WeddingDaySession } from './storage'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type EmailLookupProps = {
  onMatched: (session: WeddingDaySession) => void
}

type FormMode = 'lookup' | 'signup'

export default function EmailLookup({ onMatched }: EmailLookupProps) {
  const lookupRef = useRef<HTMLElement>(null)
  const [mode, setMode] = useState<FormMode>('lookup')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    firstName?: string
    lastName?: string
  }>({})

  function scrollToLookup() {
    lookupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function openSignup(prefillEmail?: string) {
    setMode('signup')
    setError(null)
    setFieldErrors({})
    if (prefillEmail) setEmail(prefillEmail)
  }

  function openLookup() {
    setMode('lookup')
    setError(null)
    setFieldErrors({})
    setFirstName('')
    setLastName('')
  }

  async function handleLookupSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})

    const trimmed = email.trim()
    if (!trimmed) {
      setFieldErrors({ email: 'Please enter your email address.' })
      return
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      setFieldErrors({ email: 'Please enter a valid email address.' })
      return
    }

    setSubmitting(true)
    try {
      const guest = await findRSVPByEmail({ data: { email: trimmed } })
      if (!guest) {
        openSignup(trimmed)
        setError(
          "We couldn't find an RSVP with that email. Sign up below to join the celebration.",
        )
        return
      }

      const session: WeddingDaySession = {
        guestId: guest.id,
        email: guest.email,
      }
      writeSession(session)
      onMatched(session)
    } catch {
      setError('Guest lookup is unavailable. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignupSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()
    const trimmedFirst = firstName.trim()
    const trimmedLast = lastName.trim()
    const nextErrors: typeof fieldErrors = {}

    if (!trimmedEmail) {
      nextErrors.email = 'Please enter your email address.'
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = 'Please enter a valid email address.'
    }
    if (!trimmedFirst) nextErrors.firstName = 'First name is required.'
    if (!trimmedLast) nextErrors.lastName = 'Last name is required.'

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setSubmitting(true)
    try {
      const existing = await findRSVPByEmail({
        data: { email: trimmedEmail },
      })
      if (existing) {
        const session: WeddingDaySession = {
          guestId: existing.id,
          email: existing.email,
        }
        writeSession(session)
        onMatched(session)
        return
      }

      const result = await createRSVP({
        data: {
          email: trimmedEmail,
          firstName: trimmedFirst,
          lastName: trimmedLast,
          additionalDetails: '',
          submissionSource: 'wedding_day',
        },
      })
      const session: WeddingDaySession = {
        guestId: result.record.id,
        email: result.record.email,
      }
      writeSession(session)
      onMatched(session)
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Could not save your guest details. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="wd-welcome">
      <section className="wd-welcome__hero" aria-labelledby="wd-welcome-title">
        <p className="wd-eyebrow">Wedding Day</p>
        <h1 id="wd-welcome-title" className="wd-welcome__title">
          Welcome
        </h1>
        <p className="wd-welcome__names">
          {couple.name1} &amp; {couple.name2}
        </p>
        <p className="wd-welcome__copy">
          So glad you&apos;re here. Scroll down to find your RSVP — or sign up
          on the spot — and start capturing moments with us.
        </p>
        <button
          type="button"
          className="wd-welcome__scroll"
          onClick={scrollToLookup}
          aria-label="Scroll to email lookup"
        >
          <span>Continue</span>
          <ChevronDown aria-hidden="true" />
        </button>
      </section>

      <section
        ref={lookupRef}
        className="wd-panel wd-lookup"
        aria-labelledby="wd-lookup-title"
      >
        {mode === 'lookup' ? (
          <>
            <p className="wd-eyebrow">Moments</p>
            <h2 id="wd-lookup-title" className="wd-title">
              Find your RSVP
            </h2>
            <p className="wd-copy">
              Enter the email you used when you RSVP&apos;d to unlock the
              photobooth.
            </p>

            <form className="wd-form" onSubmit={handleLookupSubmit} noValidate>
              <label className="wd-label" htmlFor="wd-email">
                Email
              </label>
              <input
                id="wd-email"
                className="wd-input"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-invalid={fieldErrors.email ? true : undefined}
                aria-describedby={
                  fieldErrors.email ? 'wd-email-error' : undefined
                }
              />
              {fieldErrors.email ? (
                <p id="wd-email-error" className="wd-error" role="alert">
                  {fieldErrors.email}
                </p>
              ) : null}
              <div className="wd-actions">
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? 'Checking…' : 'Continue'}
                </Button>
              </div>
            </form>

            <p className="wd-lookup__alt">
              No RSVP yet?{' '}
              <button
                type="button"
                className="wd-lookup__link"
                onClick={() => openSignup(email)}
              >
                Sign up as a guest
              </button>
            </p>
          </>
        ) : (
          <>
            <p className="wd-eyebrow">Same-day guest</p>
            <h2 id="wd-lookup-title" className="wd-title">
              Join the celebration
            </h2>
            <p className="wd-copy">
              Share a few details and you can start capturing moments right
              away.
            </p>
            {error ? (
              <p className="wd-lookup__notice" role="status">
                {error}
              </p>
            ) : null}

            <form className="wd-form" onSubmit={handleSignupSubmit} noValidate>
              <label className="wd-label" htmlFor="wd-signup-email">
                Email
              </label>
              <input
                id="wd-signup-email"
                className="wd-input"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-invalid={fieldErrors.email ? true : undefined}
                aria-describedby={
                  fieldErrors.email ? 'wd-signup-email-error' : undefined
                }
              />
              {fieldErrors.email ? (
                <p id="wd-signup-email-error" className="wd-error" role="alert">
                  {fieldErrors.email}
                </p>
              ) : null}

              <div className="wd-form__row">
                <div className="wd-form__field">
                  <label className="wd-label" htmlFor="wd-first-name">
                    First name
                  </label>
                  <input
                    id="wd-first-name"
                    className="wd-input"
                    type="text"
                    name="firstName"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    aria-invalid={fieldErrors.firstName ? true : undefined}
                    aria-describedby={
                      fieldErrors.firstName ? 'wd-first-name-error' : undefined
                    }
                  />
                  {fieldErrors.firstName ? (
                    <p
                      id="wd-first-name-error"
                      className="wd-error"
                      role="alert"
                    >
                      {fieldErrors.firstName}
                    </p>
                  ) : null}
                </div>
                <div className="wd-form__field">
                  <label className="wd-label" htmlFor="wd-last-name">
                    Last name
                  </label>
                  <input
                    id="wd-last-name"
                    className="wd-input"
                    type="text"
                    name="lastName"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    aria-invalid={fieldErrors.lastName ? true : undefined}
                    aria-describedby={
                      fieldErrors.lastName ? 'wd-last-name-error' : undefined
                    }
                  />
                  {fieldErrors.lastName ? (
                    <p
                      id="wd-last-name-error"
                      className="wd-error"
                      role="alert"
                    >
                      {fieldErrors.lastName}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="wd-actions wd-actions--row">
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Start capturing'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={openLookup}
                >
                  Back to lookup
                </Button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
