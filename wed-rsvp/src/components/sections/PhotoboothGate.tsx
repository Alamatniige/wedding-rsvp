import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { AnimatePresence, motion } from 'framer-motion'
import { couple, entranceGate } from '../../data/weddingData'
import { useGSAP } from '../../hooks/useGSAP'

const STORAGE_KEY = 'wedding:photobooth-opened'
const STRIP_PHOTO_COUNT = 4
const PULL_THRESHOLD = 0.72

type PhotoboothGateProps = {
  onComplete: () => void
}

export default function PhotoboothGate({ onComplete }: PhotoboothGateProps) {
  const greetingRef = useRef<HTMLParagraphElement>(null)
  const namesRef = useRef<HTMLHeadingElement>(null)
  const machineRef = useRef<HTMLDivElement>(null)
  const stripWindowRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const pullPromptRef = useRef<HTMLParagraphElement>(null)
  const saveLabelRef = useRef<HTMLParagraphElement>(null)
  const dateRef = useRef<HTMLParagraphElement>(null)
  const exitRef = useRef<HTMLButtonElement>(null)

  const pulseTweenRef = useRef<gsap.core.Tween | null>(null)
  const photoTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const hiddenYRef = useRef(0)
  const revealedYRef = useRef(0)
  const currentYRef = useRef(0)
  const dragStartYRef = useRef(0)
  const dragStartOffsetRef = useRef(0)
  const isDraggingRef = useRef(false)

  const [skipped, setSkipped] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [photoRevealed, setPhotoRevealed] = useState(false)
  const [pullReady, setPullReady] = useState(false)
  const [pullProgress, setPullProgress] = useState(0)

  const measureStripPositions = useCallback(() => {
    const strip = stripRef.current
    if (!strip) return

    const stripHeight = strip.offsetHeight
    const tab = strip.querySelector<HTMLElement>('.photobooth-gate__strip-tab')
    const tabHeight = tab?.offsetHeight ?? 0

    hiddenYRef.current = -(stripHeight - tabHeight)
    revealedYRef.current = 0
    currentYRef.current = hiddenYRef.current

    gsap.set(strip, { y: hiddenYRef.current })
  }, [])

  useEffect(() => {
    return () => {
      pulseTweenRef.current?.kill()
      photoTimelineRef.current?.kill()
    }
  }, [])

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === '1') {
      setSkipped(true)
      onComplete()
    }
  }, [onComplete])

  const getPullProgress = useCallback((y: number) => {
    const range = revealedYRef.current - hiddenYRef.current
    if (range === 0) return 0
    return Math.min(1, Math.max(0, (y - hiddenYRef.current) / range))
  }, [])

  const completeReveal = useCallback(() => {
    if (photoRevealed) return

    const strip = stripRef.current
    const pullPrompt = pullPromptRef.current
    const saveLabel = saveLabelRef.current
    const date = dateRef.current
    const exit = exitRef.current

    if (!strip || !pullPrompt || !saveLabel || !date || !exit) return

    setPhotoRevealed(true)
    setPullProgress(1)
    pulseTweenRef.current?.kill()
    isDraggingRef.current = false

    currentYRef.current = revealedYRef.current

    photoTimelineRef.current = gsap
      .timeline()
      .to(pullPrompt, { opacity: 0, duration: 0.3 })
      .to(
        strip,
        {
          y: revealedYRef.current,
          rotate: 0,
          duration: 0.8,
          ease: 'power2.out',
        },
        '<',
      )
      .to(strip, { scale: 1, duration: 0.4, ease: 'back.out(1.4)' }, '-=0.15')
      .to(saveLabel, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.1')
      .to(date, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.45')
      .to(exit, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
  }, [photoRevealed])

  const snapStrip = useCallback(
    (y: number, animate = true) => {
      const strip = stripRef.current
      if (!strip) return

      const clamped = Math.min(revealedYRef.current, Math.max(hiddenYRef.current, y))
      currentYRef.current = clamped
      const progress = getPullProgress(clamped)
      setPullProgress(progress)

      if (animate) {
        gsap.to(strip, { y: clamped, duration: 0.35, ease: 'power2.out' })
      } else {
        gsap.set(strip, { y: clamped })
      }

      if (progress >= PULL_THRESHOLD) {
        completeReveal()
      }
    },
    [completeReveal, getPullProgress],
  )

  const handlePullStart = useCallback(
    (clientY: number) => {
      if (!pullReady || photoRevealed) return

      isDraggingRef.current = true
      dragStartYRef.current = clientY
      dragStartOffsetRef.current = currentYRef.current
      pulseTweenRef.current?.kill()
      gsap.set(stripRef.current, { scale: 1, rotate: 0 })
    },
    [photoRevealed, pullReady],
  )

  const handlePullMove = useCallback(
    (clientY: number) => {
      if (!isDraggingRef.current || photoRevealed) return

      const delta = clientY - dragStartYRef.current
      snapStrip(dragStartOffsetRef.current + delta, false)
    },
    [photoRevealed, snapStrip],
  )

  const handlePullEnd = useCallback(() => {
    if (!isDraggingRef.current || photoRevealed) return

    isDraggingRef.current = false

    if (getPullProgress(currentYRef.current) >= PULL_THRESHOLD) {
      completeReveal()
      return
    }

    snapStrip(hiddenYRef.current)

    if (pullReady && !photoRevealed) {
      pulseTweenRef.current = gsap.fromTo(
        stripRef.current,
        { y: currentYRef.current },
        {
          y: currentYRef.current + 5,
          duration: 1.1,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        },
      )
    }
  }, [completeReveal, getPullProgress, photoRevealed, pullReady, snapStrip])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pullReady || photoRevealed) return

    event.currentTarget.setPointerCapture(event.pointerId)
    handlePullStart(event.clientY)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    handlePullMove(event.clientY)
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    handlePullEnd()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!pullReady || photoRevealed) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault()
      snapStrip(currentYRef.current + 24)
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault()
      snapStrip(currentYRef.current - 24)
    }
  }

  useGSAP(() => {
    if (skipped) return

    const greeting = greetingRef.current
    const names = namesRef.current
    const machine = machineRef.current
    const strip = stripRef.current
    const pullPrompt = pullPromptRef.current
    const saveLabel = saveLabelRef.current
    const date = dateRef.current
    const exit = exitRef.current

    if (!greeting || !names || !machine || !strip || !pullPrompt) return

    measureStripPositions()

    gsap.set([greeting, names, machine, strip, pullPrompt], { opacity: 0, y: 24 })
    gsap.set(machine, { scale: 0.92 })
    gsap.set(strip, { rotate: 0, scale: 1 })
    if (saveLabel && date && exit) {
      gsap.set([saveLabel, date, exit], { opacity: 0, y: 16 })
    }

    const tl = gsap.timeline({ delay: 0.35 })

    tl.to(greeting, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' })
      .to(names, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.65')
      .to(machine, { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, '-=0.35')
      .to(strip, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.45')
      .to(pullPrompt, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.35')
      .add(() => {
        setPullReady(true)
        pulseTweenRef.current = gsap.fromTo(
          strip,
          { y: hiddenYRef.current },
          {
            y: hiddenYRef.current + 5,
            duration: 1.1,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          },
        )
      })
  }, [measureStripPositions, skipped])

  const handleExit = () => {
    setLeaving(true)
    onComplete()
  }

  if (skipped) return null

  return (
    <AnimatePresence onExitComplete={() => sessionStorage.setItem(STORAGE_KEY, '1')}>
      {!leaving && (
        <motion.div
          key="photobooth-gate"
          className="photobooth-gate"
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          <div className="photobooth-gate__vignette" aria-hidden="true" />

          <div className="photobooth-gate__stage">
            <p ref={greetingRef} className="photobooth-gate__greeting">
              {entranceGate.greeting}
            </p>

            <h1 ref={namesRef} className="photobooth-gate__names">
              {couple.name1} &amp; {couple.name2}
            </h1>

            <div className="photobooth-gate__machine-scene">
              <div ref={machineRef} className="photobooth-gate__machine">
                <img
                  className="photobooth-gate__machine-img"
                  src={entranceGate.photoboothMachineSrc}
                  alt=""
                  width={512}
                  height={640}
                  draggable={false}
                />

                <div ref={stripWindowRef} className="photobooth-gate__strip-window">
                  <div
                    ref={stripRef}
                    className={`photobooth-gate__strip${photoRevealed ? ' photobooth-gate__strip--revealed' : ''}`}
                    role="slider"
                    aria-label="Pull down to reveal our photos"
                    aria-orientation="vertical"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(pullProgress * 100)}
                    aria-disabled={photoRevealed}
                    tabIndex={pullReady && !photoRevealed ? 0 : -1}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onKeyDown={handleKeyDown}
                  >
                    <div className="photobooth-gate__strip-photos">
                      {Array.from({ length: STRIP_PHOTO_COUNT }, (_, index) => (
                        <img
                          key={index}
                          className="photobooth-gate__strip-photo"
                          src={entranceGate.couplePhotoSrc}
                          alt={index === 0 ? `${couple.name1} and ${couple.name2}` : ''}
                          width={320}
                          height={320}
                          draggable={false}
                        />
                      ))}
                    </div>
                    <div className="photobooth-gate__strip-tab" aria-hidden="true">
                      <span className="photobooth-gate__strip-grip" />
                      <span className="photobooth-gate__strip-chevron" />
                    </div>
                  </div>
                </div>
              </div>

              <p ref={pullPromptRef} className="photobooth-gate__pull-prompt">
                {entranceGate.pullPrompt}
              </p>
            </div>

            <div className="photobooth-gate__save-block">
              <p ref={saveLabelRef} className="photobooth-gate__save-label">
                {entranceGate.saveTheDateLabel}
              </p>
              <p ref={dateRef} className="photobooth-gate__date">
                {couple.weddingDateDisplay}
              </p>
            </div>

            <div className="photobooth-gate__exit-wrap">
              <button
                ref={exitRef}
                type="button"
                className="photobooth-gate__exit-cta"
                aria-label="Open the invitation"
                onClick={handleExit}
              >
                {entranceGate.exitCta}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
