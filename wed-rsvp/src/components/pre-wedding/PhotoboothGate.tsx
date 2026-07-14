import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { AnimatePresence, motion } from 'framer-motion'
import { couple, entranceGate } from '../../data/weddingData'
import { useGSAP } from '../../hooks/useGSAP'

const STORAGE_KEY = 'wedding:photobooth-opened'
const STRIP_PHOTO_COUNT = 4
const PULL_THRESHOLD = 0.72
const PEEK_RATIO = 0.12
const PULSE_OFFSET = 15

type PhotoboothGateProps = {
  onComplete: () => void
}

export default function PhotoboothGate({ onComplete }: PhotoboothGateProps) {
  const greetingRef = useRef<HTMLParagraphElement>(null)
  const namesRef = useRef<HTMLHeadingElement>(null)
  const machineRef = useRef<HTMLDivElement>(null)
  const machineImgRef = useRef<HTMLImageElement>(null)
  const stripWindowRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
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
  const [stripLayoutReady, setStripLayoutReady] = useState(false)
  const [stripEjected, setStripEjected] = useState(false)
  const [pullReady, setPullReady] = useState(false)
  const [pullProgress, setPullProgress] = useState(0)

  const measureStripPositions = useCallback((applyHidden = true) => {
    const strip = stripRef.current
    const windowEl = stripWindowRef.current
    if (!strip || !windowEl) return false

    const windowHeight = windowEl.offsetHeight
    const stripHeight = strip.offsetHeight
    const tab = strip.querySelector<HTMLElement>('.photobooth-gate__strip-tab')
    const tabHeight = tab?.offsetHeight ?? 0
    const bodyHeight = stripHeight - tabHeight

    if (windowHeight === 0 || stripHeight === 0 || bodyHeight <= 0) return false

    const peekAmount = bodyHeight * PEEK_RATIO
    hiddenYRef.current = -(bodyHeight - peekAmount)
    revealedYRef.current = 0

    if (applyHidden) {
      currentYRef.current = hiddenYRef.current
      gsap.set(strip, { y: hiddenYRef.current })
    }

    return true
  }, [])

  const startPulseTween = useCallback(() => {
    const strip = stripRef.current
    if (!strip) return

    pulseTweenRef.current?.kill()
    pulseTweenRef.current = gsap.fromTo(
      strip,
      { y: hiddenYRef.current },
      {
        y: hiddenYRef.current + PULSE_OFFSET,
        duration: 1.1,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      },
    )
  }, [])

  const stripIntroPlayedRef = useRef(false)
  const stripLayoutReadyRef = useRef(stripLayoutReady)
  stripLayoutReadyRef.current = stripLayoutReady

  const tryInitStripLayout = useCallback(() => {
    if (photoRevealed || isDraggingRef.current || stripLayoutReady) return
    if (measureStripPositions()) {
      setStripLayoutReady(true)
    }
  }, [measureStripPositions, photoRevealed, stripLayoutReady])

  const tryInitStripLayoutRef = useRef(tryInitStripLayout)
  tryInitStripLayoutRef.current = tryInitStripLayout

  const handleMachineImgLoad = useCallback(() => {
    requestAnimationFrame(() => {
      tryInitStripLayout()
    })
  }, [tryInitStripLayout])

  const handleStripPhotoLoad = useCallback(() => {
    requestAnimationFrame(() => {
      tryInitStripLayout()
    })
  }, [tryInitStripLayout])

  useEffect(() => {
    const img = machineImgRef.current
    if (img?.complete && img.naturalHeight > 0) {
      handleMachineImgLoad()
    }
  }, [handleMachineImgLoad])

  useEffect(() => {
    const windowEl = stripWindowRef.current
    const machineEl = machineRef.current
    if (!windowEl) return

    const observer = new ResizeObserver(() => {
      tryInitStripLayoutRef.current()
    })

    observer.observe(windowEl)
    if (machineEl) observer.observe(machineEl)
    return () => observer.disconnect()
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
    const saveLabel = saveLabelRef.current
    const date = dateRef.current
    const exit = exitRef.current

    if (!strip || !saveLabel || !date || !exit) return

    measureStripPositions(false)
    setStripEjected(true)
    pulseTweenRef.current?.kill()
    isDraggingRef.current = false

    currentYRef.current = revealedYRef.current

    photoTimelineRef.current = gsap
      .timeline({
        onComplete: () => {
          setPhotoRevealed(true)
          setPullProgress(1)
        },
      })
      .to(
        strip,
        {
          y: revealedYRef.current,
          rotate: 0,
          duration: 0.8,
          ease: 'power2.out',
        },
      )
      .to(strip, { scale: 1, duration: 0.4, ease: 'back.out(1.4)' }, '-=0.15')
      .to(saveLabel, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.1')
      .to(date, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.45')
      .to(exit, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
  }, [measureStripPositions, photoRevealed])

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

    if (pullReady) {
      startPulseTween()
    }
  }, [completeReveal, getPullProgress, photoRevealed, pullReady, snapStrip, startPulseTween])

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
    const saveLabel = saveLabelRef.current
    const date = dateRef.current
    const exit = exitRef.current

    if (!greeting || !names || !machine) return

    gsap.set([greeting, names, machine], { opacity: 0, y: 24 })
    if (strip && !stripLayoutReadyRef.current && !stripIntroPlayedRef.current) {
      gsap.set(strip, { opacity: 0, rotate: 0, scale: 1 })
    }
    gsap.set(machine, { scale: 0.92 })
    if (saveLabel && date && exit) {
      gsap.set([saveLabel, date, exit], { opacity: 0, y: 16 })
    }

    const tl = gsap.timeline({ delay: 0.35 })

    tl.to(greeting, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' })
      .to(names, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.65')
      .to(machine, {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: 'power2.out',
        onComplete: () => tryInitStripLayoutRef.current(),
      }, '-=0.35')
  }, [skipped])

  useEffect(() => {
    if (skipped || !stripLayoutReady || stripIntroPlayedRef.current || photoRevealed) return

    let cancelled = false

    const runStripIntro = () => {
      if (cancelled || stripIntroPlayedRef.current) return

      const strip = stripRef.current
      if (!strip) {
        requestAnimationFrame(runStripIntro)
        return
      }

      stripIntroPlayedRef.current = true
      measureStripPositions()

      gsap.to(strip, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          if (cancelled) return
          setPullReady(true)
          startPulseTween()
        },
      })
    }

    runStripIntro()

    return () => {
      cancelled = true
    }
  }, [skipped, stripLayoutReady, photoRevealed, measureStripPositions, startPulseTween])

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
          <img
            className="photobooth-gate__palm-backdrop"
            src="/images/entrance/wed-bg.jpg"
            alt=""
            aria-hidden="true"
            draggable={false}
          />

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
                  ref={machineImgRef}
                  className="photobooth-gate__machine-img"
                  src={entranceGate.photoboothMachineSrc}
                  alt=""
                  width={512}
                  height={640}
                  loading="eager"
                  fetchPriority="high"
                  decoding="sync"
                  draggable={false}
                  onLoad={handleMachineImgLoad}
                />

                <div
                  ref={stripWindowRef}
                  className={`photobooth-gate__strip-window${stripEjected ? ' photobooth-gate__strip-window--revealed' : ''}`}
                >
                  <div
                    ref={stripRef}
                    className={`photobooth-gate__strip${stripLayoutReady ? ' photobooth-gate__strip--ready' : ''}${photoRevealed ? ' photobooth-gate__strip--revealed' : ''}`}
                    role="slider"
                    aria-label="Pull down to reveal photos"
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
                          loading="eager"
                          fetchPriority="high"
                          decoding="sync"
                          draggable={false}
                          onLoad={handleStripPhotoLoad}
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
