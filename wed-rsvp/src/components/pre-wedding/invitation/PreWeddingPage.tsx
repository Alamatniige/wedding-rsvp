import { useRef, type CSSProperties } from 'react'
import { Link } from '@tanstack/react-router'
import gsap from 'gsap'
import { heroLanding, preWeddingParallax } from '../../../data/weddingData'
import { useGSAP } from '../../../hooks/useGSAP'
import { Button } from '../../ui/button'
import Footer from '../../shared/Footer'
import CountdownTimer from './CountdownTimer'
import InvitationCollage from './elements/InvitationCollage'

type PreWeddingPageProps = {
  gateOpen: boolean
  /** Seconds — set only when user clicked Open Invitation (gate still fading). */
  revealDelay?: number
}

export default function PreWeddingPage({
  gateOpen,
  revealDelay = 0,
}: PreWeddingPageProps) {
  const heroRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const hero = heroRef.current
    if (!hero) return

    const targets = hero.querySelectorAll('.hero-landing__anim')
    if (targets.length === 0) return

    // Hero is already in the first viewport post-gate — don't wait on scroll.
    gsap.set(targets, { opacity: 0, y: 36 })

    if (!gateOpen) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: reduceMotion ? 0.35 : 0.8,
      stagger: reduceMotion ? 0.04 : 0.1,
      delay: revealDelay,
      ease: 'power2.out',
    })
  }, [gateOpen, revealDelay])

  return (
    <main className="pre-wedding-page pre-wedding-page--hero">
      <div
        className="pre-wedding-page__sky"
        style={
          {
            '--page-bg-image': `url('${preWeddingParallax.pageBackgroundSrc}')`,
          } as CSSProperties
        }
        aria-hidden="true"
      />

      <div className="pre-wedding-page__content">
        <section id="hero" ref={heroRef} className="hero-landing">
          <p className="hero-landing__meet hero-landing__anim">
            {heroLanding.meetUsPrefix}
          </p>
          <h1 className="hero-landing__venue hero-landing__anim">
            {heroLanding.venue}
          </h1>
          <p className="hero-landing__date hero-landing__anim">
            {heroLanding.date}
          </p>

          <InvitationCollage animate={gateOpen} revealDelay={revealDelay} />

          <p className="hero-landing__hope hero-landing__anim">
            {heroLanding.hopeMessage}
          </p>

          <div className="hero-landing__timer hero-landing__anim">
            <CountdownTimer />
          </div>

          <p className="hero-landing__description hero-landing__anim">
            {heroLanding.description}
          </p>
          
          <Button asChild variant="outline" size="lg" className="hero-landing__anim">
            <Link to="/rsvp">{heroLanding.ctaLabel}</Link>
          </Button>
        </section>

        <Footer variant="hero" />
      </div>
    </main>
  )
}
