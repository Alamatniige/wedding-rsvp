import { useState  } from 'react'
import type {FormEvent} from 'react';
import { AnimatePresence, motion } from 'framer-motion'
import { addressForm } from '../../data/weddingData'

type FormState = {
  fullName: string
  mailingAddress: string
  additionalDetails: string
}

type FormErrors = {
  fullName?: string
  mailingAddress?: string
}

type AddressFormProps = {
  highlighted?: boolean
  onSaved?: () => void
}

const ADDRESS_STORAGE_KEY = 'wedding:address'

const initialState: FormState = {
  fullName: '',
  mailingAddress: '',
  additionalDetails: '',
}

const panelVariants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
}

export default function AddressForm({
  highlighted = false,
  onSaved,
}: AddressFormProps) {
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<'editing' | 'submitting' | 'saved'>(
    'editing',
  )

  const validate = (): FormErrors => {
    const next: FormErrors = {}
    if (!form.fullName.trim()) {
      next.fullName = addressForm.fullNameRequired
    }
    if (!form.mailingAddress.trim()) {
      next.mailingAddress = addressForm.mailingAddressRequired
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
      fullName: form.fullName.trim(),
      mailingAddress: form.mailingAddress.trim(),
      additionalDetails: form.additionalDetails.trim() || undefined,
      savedAt: new Date().toISOString(),
    }

    try {
      localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // Private mode may block storage; still show saved UI.
    }

    setStatus('saved')
    onSaved?.()
  }

  const submitDisabled = status !== 'editing'

  return (
    <section
      id="address"
      className={`address-form section-wrap${highlighted ? ' address-form--highlight' : ''}`}
    >
      <div className="address-form__panel capiz-panel">
        <p className="section-label">{addressForm.label}</p>
        <div className="section-divider" />
        <h2 className="section-title">{addressForm.title}</h2>
        <p className="address-form__helper">{addressForm.helper}</p>

        <div className="address-form__body">
          <AnimatePresence mode="wait">
            {status === 'saved' ? (
              <motion.div
                key="saved"
                className="address-form__saved"
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35 }}
              >
                <p className="address-form__saved-title">
                  {addressForm.savedTitle}
                </p>
                <p className="address-form__saved-copy">
                  {addressForm.savedCopy}
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className="address-form__form"
                onSubmit={handleSubmit}
                noValidate
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35 }}
              >
                <div className="address-form__field">
                  <label className="address-form__label" htmlFor="address-name">
                    {addressForm.fullNameLabel}*
                  </label>
                  <input
                    id="address-name"
                    className="address-form__input"
                    type="text"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={
                      errors.fullName ? 'address-name-error' : undefined
                    }
                  />
                  {errors.fullName ? (
                    <p id="address-name-error" className="address-form__error">
                      {errors.fullName}
                    </p>
                  ) : null}
                </div>

                <div className="address-form__field">
                  <label
                    className="address-form__label"
                    htmlFor="address-mailing"
                  >
                    {addressForm.mailingAddressLabel}*
                  </label>
                  <textarea
                    id="address-mailing"
                    className="address-form__textarea"
                    rows={4}
                    autoComplete="street-address"
                    value={form.mailingAddress}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        mailingAddress: e.target.value,
                      }))
                    }
                    aria-invalid={Boolean(errors.mailingAddress)}
                    aria-describedby={
                      errors.mailingAddress
                        ? 'address-mailing-error'
                        : undefined
                    }
                  />
                  {errors.mailingAddress ? (
                    <p
                      id="address-mailing-error"
                      className="address-form__error"
                    >
                      {errors.mailingAddress}
                    </p>
                  ) : null}
                </div>

                <div className="address-form__field">
                  <label
                    className="address-form__label"
                    htmlFor="address-details"
                  >
                    {addressForm.additionalDetailsLabel}
                  </label>
                  <textarea
                    id="address-details"
                    className="address-form__textarea"
                    rows={3}
                    placeholder={addressForm.additionalDetailsPlaceholder}
                    value={form.additionalDetails}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        additionalDetails: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="address-form__nav">
                  <button
                    type="submit"
                    className="address-form__btn"
                    disabled={submitDisabled}
                  >
                    {status === 'submitting'
                      ? 'Saving…'
                      : addressForm.submitLabel}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
