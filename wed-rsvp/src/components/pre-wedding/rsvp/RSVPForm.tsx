import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { rsvpForm } from '../../../data/weddingData'
import { createRSVP, findRSVPByEmail } from '../../../lib/rsvp/server'
import MixedDisplayText, {
  wordInitialScriptIndices,
} from '../../typography/MixedDisplayText'
import { Button } from '../../ui/button'

type FormState = {
  firstName: string
  lastName: string
  email: string
  additionalDetails: string
}

type FormErrors = {
  firstName?: string
  lastName?: string
  email?: string
  additionalDetails?: string
}

const RSVP_STORAGE_KEY = 'wedding:guest-rsvp'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const initialState: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  additionalDetails: '',
}

function readSavedPayload(): FormState | null {
  try {
    const raw = localStorage.getItem(RSVP_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<FormState> & {
      persisted?: unknown
    }
    if (
      parsed.persisted === true &&
      typeof parsed.firstName === 'string' &&
      typeof parsed.lastName === 'string' &&
      typeof parsed.email === 'string'
    ) {
      return {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email,
        additionalDetails:
          typeof parsed.additionalDetails === 'string'
            ? parsed.additionalDetails
            : '',
      }
    }
  } catch {
    // Ignore corrupt or blocked storage.
  }
  return null
}

export default function RSVPForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submissionNote, setSubmissionNote] = useState<string | null>(null)
  const [status, setStatus] = useState<'editing' | 'submitting' | 'submitted'>(
    'editing',
  )

  useEffect(() => {
    const saved = readSavedPayload()
    if (!saved) return

    let cancelled = false
    setForm(saved)
    void findRSVPByEmail({ data: { email: saved.email } })
      .then((record) => {
        if (cancelled) return
        if (record) {
          setStatus('submitted')
        } else {
          try {
            localStorage.removeItem(RSVP_STORAGE_KEY)
          } catch {
            // Private mode may block storage.
          }
        }
      })
      .catch(() => {
        // A local hint must never prevent a fresh database submission.
      })

    return () => {
      cancelled = true
    }
  }, [])

  const validate = (): FormErrors => {
    const next: FormErrors = {}
    if (!form.firstName.trim()) {
      next.firstName = rsvpForm.firstNameRequired
    }
    if (!form.lastName.trim()) {
      next.lastName = rsvpForm.lastNameRequired
    }
    const email = form.email.trim()
    if (!email) {
      next.email = rsvpForm.emailRequired
    } else if (!EMAIL_PATTERN.test(email)) {
      next.email = rsvpForm.emailInvalid
    }
    return next
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (status !== 'editing') return

    const nextErrors = validate()
    setErrors(nextErrors)
    setSubmissionNote(null)
    if (Object.keys(nextErrors).length > 0) return

    setStatus('submitting')

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      additionalDetails: form.additionalDetails.trim(),
      savedAt: new Date().toISOString(),
      persisted: true,
    }

    try {
      const result = await createRSVP({
        data: {
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          additionalDetails: payload.additionalDetails,
          submissionSource: 'pre_wedding',
        },
      })

      try {
        localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(payload))
      } catch {
        // The database is authoritative; local storage is only a UI hint.
      }

      if (result.notification.status === 'failed') {
        setSubmissionNote(
          'Your details were saved, but one or more emails could not be sent right now.',
        )
      } else {
        const skippedMessages = [
          result.notification.deliveries.guest,
          result.notification.deliveries.owner,
          result.notification.deliveries.invitation,
        ]
          .filter((email) => email.status === 'skipped')
          .map((email) => email.reason)
        if (skippedMessages.length > 0) {
          setSubmissionNote(skippedMessages.join(' '))
        }
      }
      setStatus('submitted')
    } catch (error) {
      setSubmissionNote(
        error instanceof Error
          ? error.message
          : 'Your RSVP could not be saved. Please try again.',
      )
      setStatus('editing')
    }
  }

  const submitDisabled = status !== 'editing'
  const buttonLabel =
    status === 'submitted'
      ? rsvpForm.submittedLabel
      : status === 'submitting'
        ? rsvpForm.submittingLabel
        : rsvpForm.submitLabel

  return (
    <section id="rsvp" className="rsvp-form">
      <Link to="/" className="rsvp-form__back">
        {rsvpForm.backLabel}
      </Link>
      <h2 className="rsvp-form__title">
        <MixedDisplayText
          text={rsvpForm.title}
          scriptIndices={wordInitialScriptIndices(rsvpForm.title)}
        />
      </h2>
      <p className="rsvp-form__description">{rsvpForm.description}</p>
      <p className="rsvp-form__helper">
        {rsvpForm.helperPrefix}
        <span className="rsvp-form__helper-date">{rsvpForm.helperDate}</span>
      </p>

      <form className="rsvp-form__form" onSubmit={handleSubmit} noValidate>
        <div className="rsvp-form__row">
          <div className="rsvp-form__field">
            <label className="rsvp-form__label" htmlFor="rsvp-first-name">
              {rsvpForm.firstNameLabel}*
            </label>
            <input
              id="rsvp-first-name"
              className="rsvp-form__input"
              type="text"
              autoComplete="given-name"
              value={form.firstName}
              disabled={submitDisabled}
              onChange={(e) =>
                setForm((f) => ({ ...f, firstName: e.target.value }))
              }
              aria-invalid={Boolean(errors.firstName)}
              aria-describedby={
                errors.firstName ? 'rsvp-first-name-error' : undefined
              }
            />
            {errors.firstName ? (
              <p id="rsvp-first-name-error" className="rsvp-form__error">
                {errors.firstName}
              </p>
            ) : null}
          </div>

          <div className="rsvp-form__field">
            <label className="rsvp-form__label" htmlFor="rsvp-last-name">
              {rsvpForm.lastNameLabel}*
            </label>
            <input
              id="rsvp-last-name"
              className="rsvp-form__input"
              type="text"
              autoComplete="family-name"
              value={form.lastName}
              disabled={submitDisabled}
              onChange={(e) =>
                setForm((f) => ({ ...f, lastName: e.target.value }))
              }
              aria-invalid={Boolean(errors.lastName)}
              aria-describedby={
                errors.lastName ? 'rsvp-last-name-error' : undefined
              }
            />
            {errors.lastName ? (
              <p id="rsvp-last-name-error" className="rsvp-form__error">
                {errors.lastName}
              </p>
            ) : null}
          </div>
        </div>

        <div className="rsvp-form__field">
          <label className="rsvp-form__label" htmlFor="rsvp-email">
            {rsvpForm.emailLabel}*
          </label>
          <input
            id="rsvp-email"
            className="rsvp-form__input"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={form.email}
            disabled={submitDisabled}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'rsvp-email-error' : undefined}
          />
          {errors.email ? (
            <p id="rsvp-email-error" className="rsvp-form__error">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="rsvp-form__field">
          <label className="rsvp-form__label" htmlFor="rsvp-additional-details">
            {rsvpForm.additionalDetailsLabel}
          </label>
          <textarea
            id="rsvp-additional-details"
            className="rsvp-form__textarea"
            rows={4}
            value={form.additionalDetails}
            disabled={submitDisabled}
            onChange={(e) =>
              setForm((f) => ({ ...f, additionalDetails: e.target.value }))
            }
            aria-invalid={Boolean(errors.additionalDetails)}
            aria-describedby={
              errors.additionalDetails
                ? 'rsvp-additional-details-error'
                : undefined
            }
          />
          {errors.additionalDetails ? (
            <p id="rsvp-additional-details-error" className="rsvp-form__error">
              {errors.additionalDetails}
            </p>
          ) : null}
        </div>

        <div className="rsvp-form__nav">
          <Button
            type="submit"
            variant="outline"
            size="lg"
            disabled={submitDisabled}
          >
            {buttonLabel}
          </Button>
        </div>
        {submissionNote ? (
          <p className="rsvp-form__helper" role="status">
            {submissionNote}
          </p>
        ) : null}
      </form>
    </section>
  )
}
