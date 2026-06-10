import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { couple } from '../../data/weddingData'
import { WaxSeal } from './WaxSeal'

const ENVELOPE_TEXTURE =
  '/env.avif'

const STORAGE_KEY = 'wedding:envelope-opened'

type WelcomeGateProps = {
  onComplete: () => void
}

export default function WelcomeGate({ onComplete }: WelcomeGateProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const flapRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const sealRef = useRef<HTMLButtonElement>(null)
  const [hidden, setHidden] = useState(false)
  const [opening, setOpening] = useState(false)

  // Skip gate for returning visitors in the same session
  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === '1') {
      setHidden(true)
      onComplete()
    }
  }, [onComplete])

  // Idle pulse on the seal
  useEffect(() => {
    if (hidden || opening || !sealRef.current) return
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
  }, [hidden, opening])

  const handleOpen = () => {
    if (opening) return
    setOpening(true)

    gsap.killTweensOf(sealRef.current)

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        sessionStorage.setItem(STORAGE_KEY, '1')
        setHidden(true)
        onComplete()
      },
    })

    tl.to(sealRef.current, { scale: 0.85, opacity: 0, duration: 0.35, ease: 'power2.in' })
      .to(
        flapRef.current,
        { rotateX: -180, duration: 1.1, transformOrigin: 'top center' },
        '<0.1',
      )
      .to(cardRef.current, { y: '-130%', duration: 1.2, ease: 'power3.out' }, '-=0.6')
      .to(overlayRef.current, { opacity: 0, duration: 0.6 }, '-=0.4')
  }

  if (hidden) return null

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-gate)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2d0a0e',
        contain: 'strict',
      }}
    >
      {/* vignette overlay */}
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      <div
        className="envelope-scene"
        style={{ position: 'relative', width: '100%', maxWidth: '26rem', padding: '0 1.5rem' }}
      >
        {/* Invitation card — sits behind envelope, slides up on open */}
        <div
          ref={cardRef}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 0,
            willChange: 'transform',
          }}
        >
          <div
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
        </div>

        {/* Envelope body */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            aspectRatio: '7 / 5',
            width: '100%',
            overflow: 'hidden',
            borderRadius: 'var(--radius-sm)',
            backgroundImage: `url(${ENVELOPE_TEXTURE})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 30px 80px -20px rgba(0,0,0,0.75)',
          }}
        >
          {/* Triangular flap */}
          <div
            ref={flapRef}
            style={{
              position: 'absolute',
              inset: '0 0 auto 0',
              height: '62%',
              zIndex: 20,
              backgroundImage: `url(${ENVELOPE_TEXTURE})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              filter: 'brightness(0.93)',
              transformStyle: 'preserve-3d',
            }}
          />

          {/* Shadow seam where flap closes */}
          <div
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              left: 0,
              right: 0,
              top: 'calc(62% - 1px)',
              height: '2px',
              zIndex: 10,
              background:
                'linear-gradient(to right, transparent, rgba(0,0,0,0.18), transparent)',
            }}
          />

          {/* Bottom V crease lines */}
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

          {/* Address line */}
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

        {/* Wax seal — positioned at flap junction */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '62%',
            transform: 'translate(-50%, -50%)',
            zIndex: 30,
          }}
        >
          <WaxSeal ref={sealRef} onClick={handleOpen} />
        </div>
      </div>
    </div>
  )
}
