import { useRef, type CSSProperties } from 'react'
import { Link } from '@tanstack/react-router'
import { heroLanding, preWeddingParallax } from '../../data/weddingData'
import { useGSAP } from '../../hooks/useGSAP'
import { fadeUpOnScroll } from '../../hooks/useScrollTrigger'
import { Button } from '../ui/button'
import Footer from '../shared/Footer'
import CountdownTimer from './CountdownTimer'

type PreWeddingPageProps = {
  gateOpen: boolean
}

export default function PreWeddingPage({ gateOpen }: PreWeddingPageProps) {
  const heroRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const hero = heroRef.current
    if (!hero || !gateOpen) return

    fadeUpOnScroll({
      trigger: hero,
      targets: hero.querySelectorAll('.hero-landing__anim'),
      start: 'top 90%',
      stagger: 0.1,
    })
  }, [gateOpen])

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

          <div className="hero-landing__images hero-landing__anim">
            {heroLanding.images.map((image) => (
              <div key={image.id} className="hero-landing__image-frame">
                {'placeholder' in image && image.placeholder ? (
                  <div className="hero-landing__image-placeholder">
                    Photo placeholder
                  </div>
                ) : (
                  <img
                    className="hero-landing__image"
                    src={image.src}
                    alt={image.alt}
                  />
                )}
              </div>
            ))}
          </div>

          <p className="hero-landing__hope hero-landing__anim">
            {heroLanding.hopeMessage}
          </p>
          <div className="hero-landing__timer hero-landing__anim">
            <CountdownTimer />
          </div>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="hero-landing__cta hero-landing__anim"
          >
            <Link to="/rsvp">{heroLanding.ctaLabel}</Link>
          </Button>
        </section>

        <Footer variant="hero" />
      </div>
    </main>
  )
}
