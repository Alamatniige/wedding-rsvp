import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { rsvpForm } from '../../data/weddingData'

type FormState = {
  firstName: string
  lastName: string
  email: string
}

type FormErrors = {
  firstName?: string
  lastName?: string
  email?: string
}

const RSVP_STORAGE_KEY = 'wedding:guest-rsvp'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const initialState: FormState = {
  firstName: '',
  lastName: '',
  email: '',
}

function readSavedPayload(): FormState | null {
  try {
    const raw = localStorage.getItem(RSVP_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<FormState>
    if (
      typeof parsed.firstName === 'string' &&
      typeof parsed.lastName === 'string' &&
      typeof parsed.email === 'string'
    ) {
      return {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email,
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
  const [status, setStatus] = useState<'editing' | 'submitting' | 'submitted'>(
    'editing',
  )

  useEffect(() => {
    const saved = readSavedPayload()
    if (saved) {
      setForm(saved)
      setStatus('submitted')
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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (status !== 'editing') return

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setStatus('submitting')

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      savedAt: new Date().toISOString(),
    }

    try {
      localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // Private mode may block storage; still show submitted UI.
    }

    setStatus('submitted')
  }

  const submitDisabled = status !== 'editing'
  const buttonLabel =
    status === 'submitted'
      ? rsvpForm.submittedLabel
      : status === 'submitting'
        ? rsvpForm.submittingLabel
        : rsvpForm.submitLabel

  return (
    <section id="rsvp" className="rsvp-form section-wrap">
      <div className="rsvp-form__panel capiz-panel">
        <p className="section-label">{rsvpForm.label}</p>
        <div className="section-divider" />
        <h2 className="section-title">{rsvpForm.title}</h2>
        <p className="rsvp-form__helper">{rsvpForm.helper}</p>

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
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'rsvp-email-error' : undefined}
            />
            {errors.email ? (
              <p id="rsvp-email-error" className="rsvp-form__error">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className="rsvp-form__nav">
            <motion.button
              type="submit"
              className={`rsvp-form__btn${status === 'submitted' ? ' rsvp-form__btn--submitted' : ''}`}
              disabled={submitDisabled}
              layout
              transition={{ duration: 0.25 }}
            >
              {buttonLabel}
            </motion.button>
          </div>
        </form>
      </div>
    </section>
  )
}
