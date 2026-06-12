import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { AnimatePresence, motion } from 'framer-motion'
import { couple } from '../../data/weddingData'

const STORAGE_KEY = 'wedding:envelope-opened'

const CARTOUCHE_PATH = [
  'M125,14',
  'C 160,14 186,9 201,22',
  'C 216,35 209,56 221,76',
  'C 233,98 236,130 232,165',
  'C 236,205 233,252 221,274',
  'C 209,294 216,315 201,328',
  'C 186,341 160,336 125,336',
  'C 90,336 64,341 49,328',
  'C 34,315 41,294 29,274',
  'C 17,252 14,205 18,165',
  'C 14,130 17,98 29,76',
  'C 41,56 34,35 49,22',
  'C 64,9 90,14 125,14',
  'Z',
].join(' ')

const weddingWeekday = new Date(couple.weddingDateISO).toLocaleDateString('en-US', {
  weekday: 'long',
})
const PANEL_SIDES = ['top', 'right', 'bottom', 'left'] as const
const PEEL_ROTATE_X = [-140, 0, 140, 0]
const PEEL_ROTATE_Y = [0, -140, 0, 140]
const PEEL_ORIGIN = ['center top', 'right center', 'center bottom', 'left center']

type Stage = 'wrapped' | 'unwrapping' | 'revealed' | 'exiting'

type WelcomeGateProps = {
  onComplete: () => void
}

export default function WelcomeGate({ onComplete }: WelcomeGateProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const shadowRef = useRef<HTMLDivElement>(null)
  const promptRef = useRef<HTMLParagraphElement>(null)
  const knotRef = useRef<HTMLButtonElement>(null)
  const stringsRef = useRef<SVGSVGElement>(null)
  const panelRefs = useRef<Array<HTMLDivElement | null>>([])

  const [stage, setStage] = useState<Stage>('wrapped')
  const [skipped, setSkipped] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const draggingRef = useRef(false)
  const dragStartY = useRef(0)

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === '1') {
      setSkipped(true)
      onComplete()
    }
  }, [onComplete])

  /* Idle: gentle sway on the knot so the string reads as interactive */
  useEffect(() => {
    if (skipped || stage !== 'wrapped' || !knotRef.current) return
    const sway = gsap.fromTo(
      knotRef.current,
      { rotation: -4 },
      { rotation: 4, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 },
    )
    return () => {
      sway.kill()
    }
  }, [skipped, stage])

  const startUnwrap = () => {
    if (stage !== 'wrapped') return
    setStage('unwrapping')
    gsap.killTweensOf(knotRef.current)

    const panels = panelRefs.current.filter((p): p is HTMLDivElement => p !== null)

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => setStage('revealed'),
    })

    tl.to(knotRef.current, {
      y: '+=44',
      scaleY: 1.22,
      transformOrigin: 'top center',
      duration: 0.32,
      ease: 'power2.in',
    })
      .to(
        stringsRef.current,
        {
          scaleY: 0,
          autoAlpha: 0,
          transformOrigin: 'top center',
          duration: 0.4,
          ease: 'power2.in',
        },
        '<0.1',
      )
      .to(
        knotRef.current,
        { y: '+=140', rotation: 28, autoAlpha: 0, duration: 0.45, ease: 'power1.in' },
        '-=0.25',
      )

    tl.addLabel('peel', '-=0.2')
    tl.to(
      panels,
      {
        rotateX: (i: number) => PEEL_ROTATE_X[i],
        rotateY: (i: number) => PEEL_ROTATE_Y[i],
        transformOrigin: (i: number) => PEEL_ORIGIN[i],
        duration: 0.9,
        stagger: 0.08,
      },
      'peel',
    )

    /* Phase 3 — Settle: the revealed card pops gently into place, its drop
       shadow deepens for tactility, then the "Click to open" prompt fades in */
    tl.fromTo(
      cardRef.current,
      { scale: 0.96 },
      { scale: 1, duration: 0.5, ease: 'back.out(2)' },
      'peel+=0.55',
    )
      .to(shadowRef.current, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '<')
      .fromTo(
        promptRef.current,
        { y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        '>-0.1',
      )
  }

  const handleKnotPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (stage !== 'wrapped') return
    e.currentTarget.setPointerCapture(e.pointerId)
    draggingRef.current = true
    dragStartY.current = e.clientY
    gsap.killTweensOf(knotRef.current)
  }

  const handleKnotPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current || stage !== 'wrapped') return
    const delta = Math.max(0, e.clientY - dragStartY.current)
    gsap.set(knotRef.current, { y: Math.min(delta * 0.55, 72), rotation: 0 })
  }

  const handleKnotPointerUp = () => {
    if (!draggingRef.current || stage !== 'wrapped') return
    draggingRef.current = false
    startUnwrap()
  }

  const handleKnotPointerCancel = () => {
    if (!draggingRef.current) return
    draggingRef.current = false
    gsap.to(knotRef.current, { y: 0, duration: 0.4, ease: 'back.out(2)' })
  }

  const handleCardClick = () => {
    if (stage !== 'revealed') return
    setStage('exiting')
    onComplete()
    setLeaving(true)
  }

  if (skipped) return null

  const isRevealed = stage === 'revealed'

  return (
    <AnimatePresence onExitComplete={() => sessionStorage.setItem(STORAGE_KEY, '1')}>
      {!leaving && (
        <motion.div
          key="gate"
          className="welcome-gate"
          exit={{ opacity: 0, scale: 1.12 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          <div className="welcome-gate__vignette" />

          <div className="gift-scene">

            <div className="gift-backing" />

            <div ref={shadowRef} className="gift-scene__card-shadow" />

            <div
              ref={cardRef}
              className="invite-card"
              role="button"
              tabIndex={isRevealed ? 0 : -1}
              aria-label="Open the invitation"
              style={{ cursor: isRevealed ? 'pointer' : 'default' }}
              onClick={handleCardClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCardClick()
              }}
            >
              <svg
                className="invite-card__frame"
                viewBox="0 0 250 350"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d={CARTOUCHE_PATH}
                  fill="#f9f2e3"
                  stroke="#2f2a26"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d={CARTOUCHE_PATH}
                  transform="translate(125 175) scale(0.93) translate(-125 -175)"
                  fill="none"
                  stroke="#2f2a26"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>

              <div className="invite-card__content">
                <p className="invite-card__intro">
                  You are invited to
                  <br />
                  celebrate the marriage of
                </p>
                <h2 className="invite-card__name">{couple.name1}</h2>
                <h2 className="invite-card__name">
                  <span className="invite-card__amp">&amp;</span> {couple.name2}
                </h2>
                <img
                  className="invite-card__dog"
                  src="/dog.png"
                  alt=""
                  draggable={false}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <p className="invite-card__details">
                  {weddingWeekday} &bull; {couple.weddingDateDisplay}
                  <br />
                  {couple.location}
                </p>
                <p className="invite-card__rsvp">
                  Please RSVP by
                  <br />
                  {couple.rsvpByDisplay}
                </p>
              </div>

              <svg className="invite-card__grain" aria-hidden="true">
                <filter id="gate-paper-grain">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.8"
                    numOctaves="2"
                    stitchTiles="stitch"
                  />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0"
                  />
                </filter>
                <rect width="100%" height="100%" filter="url(#gate-paper-grain)" />
              </svg>
            </div>

            <p ref={promptRef} className="gift-scene__prompt">
              Click to open
            </p>

            <div className="gift-wrap">
              <svg className="gift-wrap__defs" aria-hidden="true" focusable="false">
                <defs>
                  <clipPath id="gate-flap-top" clipPathUnits="objectBoundingBox">
                    <path d="M 0 0 L 1 0 L 0.5 0.5 Z" />
                  </clipPath>
                  <clipPath id="gate-flap-right" clipPathUnits="objectBoundingBox">
                    <path d="M 1 0 L 1 1 L 0.5 0.5 Z" />
                  </clipPath>
                  <clipPath id="gate-flap-bottom" clipPathUnits="objectBoundingBox">
                    <path d="M 1 1 L 0 1 L 0.5 0.5 Z" />
                  </clipPath>
                  <clipPath id="gate-flap-left" clipPathUnits="objectBoundingBox">
                    <path d="M 0 1 L 0 0 L 0.5 0.5 Z" />
                  </clipPath>
                </defs>
              </svg>
              {PANEL_SIDES.map((side, i) => (
                <div
                  key={side}
                  ref={(el) => {
                    panelRefs.current[i] = el
                  }}
                  className={`gift-wrap__panel gift-wrap__panel--${side}`}
                />
              ))}
              <svg
                ref={stringsRef}
                className="gift-wrap__strings"
                viewBox="0 0 100 140"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M 50 0 C 38 25, 40 50, 50 70 C 60 90, 62 115, 50 140"
                  fill="none"
                  stroke="var(--color-gold-light)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d="M 50 0 C 62 25, 60 50, 50 70 C 40 90, 38 115, 50 140"
                  fill="none"
                  stroke="var(--color-gold-light)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            <div className="gift-knot-anchor">
              <button
                ref={knotRef}
                type="button"
                className="gift-knot"
                aria-label="Pull the string to unwrap the invitation"
                onPointerDown={handleKnotPointerDown}
                onPointerMove={handleKnotPointerMove}
                onPointerUp={handleKnotPointerUp}
                onPointerCancel={handleKnotPointerCancel}
              >
                {/* satin wedding bow; the knot at (60,50) is the SVG center, so the
                    anchor's translate(-50%,-50%) seats it exactly on the parcel's
                    top edge with the bottom half overlapping the paper */}
                <svg viewBox="0 0 120 100" className="gift-knot__bow" aria-hidden="true">
                  {/* ribbon tails draping down from the knot with a gentle curve */}
                  <path
                    d="M 57.5 53 C 53 63, 49 75, 43 90 C 47.5 87, 51 85, 53 79 C 55 70, 56.5 61, 58 53 Z"
                    fill="var(--color-gold-light)"
                    stroke="rgba(60, 40, 20, 0.35)"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 62.5 53 C 67 63, 71 75, 77 90 C 72.5 87, 69 85, 67 79 C 65 70, 63.5 61, 62 53 Z"
                    fill="var(--color-gold-light)"
                    stroke="rgba(60, 40, 20, 0.35)"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                  {/* left teardrop loop angled outward, with satin sheen inner path */}
                  <path
                    d="M 60 50 C 48 38, 30 24, 18 32 C 8 39, 14 54, 28 56 C 42 58, 54 55, 60 50 Z"
                    fill="var(--color-gold-light)"
                    stroke="rgba(60, 40, 20, 0.35)"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 58 49 C 47 40, 32 30, 23 36 C 16 41, 21 50, 31 52 C 42 54, 52 52, 58 49 Z"
                    fill="var(--color-champagne)"
                    opacity="0.75"
                  />
                  {/* right teardrop loop, mirrored */}
                  <path
                    d="M 60 50 C 72 38, 90 24, 102 32 C 112 39, 106 54, 92 56 C 78 58, 66 55, 60 50 Z"
                    fill="var(--color-gold-light)"
                    stroke="rgba(60, 40, 20, 0.35)"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 62 49 C 73 40, 88 30, 97 36 C 104 41, 99 50, 89 52 C 78 54, 68 52, 62 49 Z"
                    fill="var(--color-champagne)"
                    opacity="0.75"
                  />
                  {/* gathered center knot: circle with fabric gather lines */}
                  <circle
                    cx="60"
                    cy="50"
                    r="6.5"
                    fill="var(--color-gold)"
                    stroke="rgba(60, 40, 20, 0.4)"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M 56.5 45.5 C 58 50, 58 50, 56.5 54.5 M 60 44.5 C 60.8 50, 60.8 50, 60 55.5 M 63.5 45.5 C 62 50, 62 50, 63.5 54.5"
                    stroke="rgba(255, 255, 255, 0.35)"
                    strokeWidth="1"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="gift-knot__hint">Pull the string</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
