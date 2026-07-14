import { useRef, type CSSProperties } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { preWeddingParallax } from '../data/weddingData'
import { useGSAP } from '../hooks/useGSAP'
import RSVPForm from '../components/pre-wedding/rsvp/RSVPForm'
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

      <div className="pre-wedding-page__content">
        <RSVPForm />
        <Footer variant="rsvp" />
      </div>
    </main>
  )
}
