import { useRef, type CSSProperties } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { preWeddingParallax } from '../data/weddingData'
import { useGSAP } from '../hooks/useGSAP'
import { parallaxOnScroll } from '../hooks/useScrollTrigger'
import RSVPForm from '../components/pre-wedding/RSVPForm'
import Footer from '../components/shared/Footer'
import WeddingDayPlaceholder from '../components/wedding-day/WeddingDayPlaceholder'

gsap.registerPlugin(ScrollTrigger)

export const Route = createFileRoute('/rsvp')({
  component: RsvpPage,
})

function RsvpPage() {
  const { weddingMode } = Route.useRouteContext()

  if (weddingMode === 'wedding-day') {
    return <WeddingDayPlaceholder />
  }

  return <RsvpContent />
}

function RsvpContent() {
  const rootRef = useRef<HTMLElement>(null)
  const skyRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const root = rootRef.current
    const sky = skyRef.current
    if (!root || !sky) return

    const layers = [
      { sel: '.pre-wedding-page__palm-layer--back-left', y: -40 },
      { sel: '.pre-wedding-page__palm-layer--back-right', y: -55 },
      { sel: '.pre-wedding-page__palm-layer--mid', y: -90 },
      { sel: '.pre-wedding-page__palm-layer--fore-left', y: -140 },
      { sel: '.pre-wedding-page__palm-layer--fore-right', y: -160 },
    ] as const

    for (const layer of layers) {
      const el = root.querySelector(layer.sel)
      if (el) {
        parallaxOnScroll({ trigger: root, target: el, y: layer.y })
      }
    }

    gsap.set(sky, { '--gradient-sky-progress': 0 })
    gsap.to(sky, {
      '--gradient-sky-progress': 1,
      ease: 'none',
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    })
  }, [])

  return (
    <main ref={rootRef} className="pre-wedding-page">
      <div
        ref={skyRef}
        className="pre-wedding-page__sky"
        style={
          {
            '--page-bg-image': `url('${preWeddingParallax.pageBackgroundSrc}')`,
          } as CSSProperties
        }
        aria-hidden="true"
      />

      <div className="pre-wedding-page__palms" aria-hidden="true">
        <div className="pre-wedding-page__palm-layer pre-wedding-page__palm-layer--back-left">
          <img
            className="pre-wedding-page__palm"
            src={preWeddingParallax.palmBackLeftSrc}
            alt=""
          />
        </div>
        <div className="pre-wedding-page__palm-layer pre-wedding-page__palm-layer--back-right">
          <img
            className="pre-wedding-page__palm pre-wedding-page__palm--flip"
            src={preWeddingParallax.palmBackRightSrc}
            alt=""
          />
        </div>
        <div className="pre-wedding-page__palm-layer pre-wedding-page__palm-layer--mid">
          <img
            className="pre-wedding-page__palm"
            src={preWeddingParallax.palmMidSrc}
            alt=""
          />
        </div>
        <div className="pre-wedding-page__palm-layer pre-wedding-page__palm-layer--fore-left">
          <img
            className="pre-wedding-page__palm"
            src={preWeddingParallax.palmForeLeftSrc}
            alt=""
          />
        </div>
        <div className="pre-wedding-page__palm-layer pre-wedding-page__palm-layer--fore-right">
          <img
            className="pre-wedding-page__palm pre-wedding-page__palm--flip"
            src={preWeddingParallax.palmForeRightSrc}
            alt=""
          />
        </div>
      </div>

      <div className="pre-wedding-page__content">
        <RSVPForm />
        <Footer variant="rsvp" />
      </div>
    </main>
  )
}
