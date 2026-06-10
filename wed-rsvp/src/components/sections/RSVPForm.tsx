import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { rsvp } from '../../data/weddingData'

type Attendance = 'accept' | 'decline' | null

type FormState = {
  attendance: Attendance
  name: string
  dietary: string
  plusOne: boolean
  songRequest: string
}

const initialState: FormState = {
  attendance: null,
  name: '',
  dietary: rsvp.dietaryOptions[0],
  plusOne: false,
  songRequest: '',
}

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
}

export default function RSVPForm() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [form, setForm] = useState<FormState>(initialState)

  const goNext = () => {
    setDirection(1)
    setStep((s) => Math.min(s + 1, 2))
  }

  const goBack = () => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  const handleSubmit = () => {
    console.log('RSVP Form Submission:', form)
  }

  const canProceedStep0 = form.attendance !== null
  const canProceedStep1 = form.name.trim().length > 0

  return (
    <section id="rsvp" className="rsvp section-wrap">
      <p className="section-label">RSVP</p>
      <div className="section-divider" />
      <h2 className="section-title">Will You Join Us?</h2>

      <div className="rsvp__form">
        <div className="rsvp__progress">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`rsvp__progress-dot ${step === i ? 'rsvp__progress-dot--active' : ''}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <motion.div
              key="step0"
              className="rsvp__step"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <p className="rsvp__step-title">Your Response</p>
              <div className="rsvp__toggle-group">
                <button
                  type="button"
                  className={`rsvp__toggle-btn ${form.attendance === 'accept' ? 'rsvp__toggle-btn--active' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, attendance: 'accept' }))}
                >
                  Joyfully Accepts
                </button>
                <button
                  type="button"
                  className={`rsvp__toggle-btn ${form.attendance === 'decline' ? 'rsvp__toggle-btn--active' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, attendance: 'decline' }))}
                >
                  Regretfully Declines
                </button>
              </div>
              <div className="rsvp__nav">
                <button
                  type="button"
                  className="rsvp__btn rsvp__btn--primary"
                  onClick={goNext}
                  disabled={!canProceedStep0}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              className="rsvp__step"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <p className="rsvp__step-title">Your Details</p>
              <div className="rsvp__field">
                <label className="rsvp__label" htmlFor="rsvp-name">
                  Full Name
                </label>
                <input
                  id="rsvp-name"
                  className="rsvp__input"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Enter your name"
                />
              </div>
              <div className="rsvp__field">
                <label className="rsvp__label" htmlFor="rsvp-dietary">
                  Dietary Requirements
                </label>
                <select
                  id="rsvp-dietary"
                  className="rsvp__select"
                  value={form.dietary}
                  onChange={(e) => setForm((f) => ({ ...f, dietary: e.target.value }))}
                >
                  {rsvp.dietaryOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rsvp__nav">
                <button type="button" className="rsvp__btn rsvp__btn--secondary" onClick={goBack}>
                  Back
                </button>
                <button
                  type="button"
                  className="rsvp__btn rsvp__btn--primary"
                  onClick={goNext}
                  disabled={!canProceedStep1}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              className="rsvp__step"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <p className="rsvp__step-title">Almost Done</p>
              <div className="rsvp__switch-row">
                <span className="rsvp__label">Bringing a Plus-One?</span>
                <button
                  type="button"
                  className={`rsvp__switch ${form.plusOne ? 'rsvp__switch--on' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, plusOne: !f.plusOne }))}
                  aria-pressed={form.plusOne}
                >
                  <span className="rsvp__switch-knob" />
                </button>
              </div>
              <div className="rsvp__field">
                <label className="rsvp__label" htmlFor="rsvp-song">
                  Song Request
                </label>
                <input
                  id="rsvp-song"
                  className="rsvp__input"
                  type="text"
                  value={form.songRequest}
                  onChange={(e) => setForm((f) => ({ ...f, songRequest: e.target.value }))}
                  placeholder="What song gets you on the dance floor?"
                />
              </div>
              <div className="rsvp__nav">
                <button type="button" className="rsvp__btn rsvp__btn--secondary" onClick={goBack}>
                  Back
                </button>
                <button type="button" className="rsvp__btn rsvp__btn--primary" onClick={handleSubmit}>
                  Submit RSVP
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
