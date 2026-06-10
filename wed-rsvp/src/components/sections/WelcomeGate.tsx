import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { couple } from '../../data/weddingData'
import { WaxSeal } from './WaxSeal'

const ENVELOPE_TEXTURE = '/env.avif'
const STORAGE_KEY = 'wedding:envelope-opened'
const DRAG_COMMIT_THRESHOLD = 64 
const CARD_PEEK_RATIO = 0.24 
const DRAG_MAX_RISE_RATIO = 0.75 

type Stage = 'idle' | 'peeking' | 'revealing' | 'done'

type WelcomeGateProps = {
  onComplete: () => void
}

export default function WelcomeGate({ onComplete }: WelcomeGateProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const vignetteRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const flapWrapRef = useRef<HTMLDivElement>(null)
  const flapRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const cardInnerRef = useRef<HTMLDivElement>(null)
  const swipeHintRef = useRef<HTMLDivElement>(null)
  const sealRef = useRef<HTMLButtonElement>(null)

  const [stage, setStage] = useState<Stage>('idle')
  const [hidden, setHidden] = useState(false)

  const dragStartY = useRef(0)
  const dragBaseY = useRef(0)
  const dragLastY = useRef(0)
  const dragLastT = useRef(0)
  const dragVel = useRef(0)

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === '1') {
      setHidden(true)
      onComplete()
    }
  }, [onComplete])

  useEffect(() => {
    if (hidden || stage !== 'idle' || !sealRef.current) return
    const pulse = gsap.to(sealRef.current, {
      scale: 1.06,
      duration: 1.4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
    return () => {
      pulse.kill()
    }
  }, [hidden, stage])

  const triggerZoom = () => {
    setStage('done')

    let gateRevealed = false
    const revealHero = () => {
      if (gateRevealed) return
      gateRevealed = true
      onComplete()
    }

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem(STORAGE_KEY, '1')
        setHidden(true)
      },
    })

    const cardH = cardInnerRef.current?.offsetHeight ?? 220
    const curY = (gsap.getProperty(cardInnerRef.current, 'y') as number) || 0
    const targetY = -cardH * 1.45 
    const remaining = Math.max(0, curY - targetY)
    const v = Math.max(dragVel.current, 0.2) 
    const glide = Math.min(0.75, Math.max(0.4, remaining / (v * 1000)))

    tl.to(cardInnerRef.current, { y: targetY, duration: glide, ease: 'power2.out' })
      .to(sceneRef.current, { scale: 6, duration: 1.1, ease: 'power2.in' }, '-=0.08')
      .to(vignetteRef.current, { opacity: 1, duration: 1.1, ease: 'power2.in' }, '<')
      .to(overlayRef.current, { backgroundColor: '#0a0204', duration: 1.1, ease: 'power2.in' }, '<')
      .call(revealHero)
      .to(overlayRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in' }, '-=0.15')
  }

  const getPeekY = () => -(cardInnerRef.current?.offsetHeight ?? 220) * CARD_PEEK_RATIO

  const handleOpen = () => {
    if (stage !== 'idle') return
    setStage('peeking')

    gsap.killTweensOf(sealRef.current)

    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } })

    tl.to(sealRef.current, { scale: 0, opacity: 0, duration: 0.3, ease: 'power2.in' })
      .to(cardRef.current, { opacity: 1, duration: 0.4, ease: 'power3.out' }, '<')
      .addLabel('flap')
      .to(flapRef.current, { rotateX: 180, y: 1, duration: 0.7, transformOrigin: 'top center' }, 'flap')
      .set(flapWrapRef.current, { zIndex: 5 }, 'flap+=0.35')
      .to(cardInnerRef.current, { y: getPeekY, duration: 0.7, ease: 'power3.out' }, 'flap')
      .to(swipeHintRef.current, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 'flap+=0.7')
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stage !== 'peeking') return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStartY.current = e.clientY
    dragBaseY.current = gsap.getProperty(cardInnerRef.current, 'y') as number
    dragLastY.current = e.clientY
    dragLastT.current = performance.now()
    dragVel.current = 0
    gsap.to(swipeHintRef.current, { opacity: 0, duration: 0.15 })
    setStage('revealing')
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stage !== 'revealing') return
    const delta = dragStartY.current - e.clientY
    const clampedDelta = Math.max(0, delta) * 1.15
    const cardH = cardInnerRef.current?.offsetHeight ?? 220
    const maxRise = -cardH * DRAG_MAX_RISE_RATIO
    gsap.set(cardInnerRef.current, { y: Math.max(dragBaseY.current - clampedDelta, maxRise) })

    const now = performance.now()
    const dt = now - dragLastT.current
    if (dt > 0) {
      const v = (dragLastY.current - e.clientY) / dt
      dragVel.current = dragVel.current * 0.4 + v * 0.6
    }
    dragLastY.current = e.clientY
    dragLastT.current = now
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stage !== 'revealing') return
    const delta = dragStartY.current - e.clientY
    if (delta >= DRAG_COMMIT_THRESHOLD) {
      triggerZoom()
    } else {
      setStage('peeking')
      gsap.to(cardInnerRef.current, { y: getPeekY(), duration: 0.5, ease: 'back.out(1.5)' })
      gsap.to(swipeHintRef.current, { opacity: 1, duration: 0.3, delay: 0.3 })
    }
  }

  if (hidden) return null

  const isCardInteractive = stage === 'peeking' || stage === 'revealing'
  const cardRaised = stage === 'done'

  return (
    <div ref={overlayRef} className="welcome-gate">
      <div ref={vignetteRef} className="welcome-gate__vignette" />

      <div ref={sceneRef} className="envelope-scene">
        <div
          className="envelope-scene__inside"
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '7 / 5',
            zIndex: 1,
            pointerEvents: 'none',
            borderRadius: 'var(--radius-sm)',
            backgroundImage: `url(${ENVELOPE_TEXTURE})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.8)',
          }}
        />

        <div
          ref={cardRef}
          className="envelope-scene__card"
          style={{
            zIndex: cardRaised ? 50 : 10,
            pointerEvents: isCardInteractive ? 'auto' : 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div
            ref={cardInnerRef}
            className="envelope-scene__card-inner"
            style={{
              width: '16rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem 1.5rem',
              backgroundColor: 'var(--color-ivory)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 20px 60px -10px rgba(0,0,0,0.6)',
              textAlign: 'center',
              gap: '0.75rem',
              cursor: stage === 'peeking' ? 'grab' : stage === 'revealing' ? 'grabbing' : 'default',
              userSelect: 'none',
              touchAction: 'none',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-subheading)',
                fontSize: '0.65rem',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: '#6b1520',
              }}
            >
              You are invited
            </p>
            <div
              style={{
                height: '1px',
                width: '3.5rem',
                backgroundColor: 'var(--color-gold)',
                opacity: 0.6,
              }}
            />
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontStyle: 'italic',
                fontWeight: 300,
                lineHeight: 1.2,
                color: 'var(--color-navy)',
              }}
            >
              {couple.name1}{' '}
              <span style={{ color: 'var(--color-gold)' }}>&amp;</span>{' '}
              {couple.name2}
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-subheading)',
                fontSize: '0.7rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--color-navy-soft)',
              }}
            >
              {couple.weddingDateDisplay}
            </p>
          </div>

          <div ref={swipeHintRef} className="envelope-scene__swipe-hint">
            <div className="envelope-scene__swipe-hint-chevrons">
              <span className="envelope-scene__chevron envelope-scene__chevron--1">&#8963;</span>
              <span className="envelope-scene__chevron envelope-scene__chevron--2">&#8963;</span>
            </div>
            <p className="envelope-scene__swipe-hint-label">swipe up</p>
          </div>
        </div>

        <div
          className="envelope-scene__body"
          style={{
            position: 'absolute',
            top: 0,
            left: '1.5rem',
            right: '1.5rem',
            aspectRatio: '7 / 5',
            zIndex: 20,
            pointerEvents: 'none',
            overflow: 'hidden',
            borderRadius: 'var(--radius-sm)',
            backgroundImage: `url(${ENVELOPE_TEXTURE})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 30px 80px -20px rgba(0,0,0,0.75)',
            clipPath: 'polygon(0% 0%, 50% 50%, 100% 0%, 100% 100%, 0% 100%)',
          }}
        >
          <div
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              inset: 0,
              zIndex: 5,
              background: `
                linear-gradient(135deg, transparent 49.5%, rgba(0,0,0,0.06) 49.5%, rgba(0,0,0,0.06) 50.5%, transparent 50.5%),
                linear-gradient(225deg, transparent 49.5%, rgba(0,0,0,0.06) 49.5%, rgba(0,0,0,0.06) 50.5%, transparent 50.5%)
              `,
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: '1rem',
              zIndex: 10,
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: '0.7rem',
                color: 'rgba(45,10,14,0.65)',
              }}
            >
              To our beloved guest
            </p>
          </div>
        </div>

        <div
          ref={flapWrapRef}
          style={{
            position: 'absolute',
            top: 0,
            left: '1.5rem',
            right: '1.5rem',
            aspectRatio: '7 / 5',
            zIndex: 30,
            pointerEvents: 'none',
            perspective: '1200px',
          }}
        >
          <div
            ref={flapRef}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0) 11%), url(${ENVELOPE_TEXTURE})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              clipPath: 'polygon(0 0, 100% 0, 50% 62%)',
              backfaceVisibility: 'visible',
            }}
          />
        </div>

        <div className="welcome-gate__seal-wrap">
          <WaxSeal ref={sealRef} onClick={handleOpen} />
        </div>
      </div>
    </div>
  )
}
