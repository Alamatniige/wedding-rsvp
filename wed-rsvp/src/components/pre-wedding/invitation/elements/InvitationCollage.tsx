import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '../../../../hooks/useGSAP'
import SaveTheDateCard from './SaveTheDateCard'
import CelebrationCard from './CelebrationCard'
import FilmStrip from './FilmStrip'
import Polaroid from './Polaroid'
import PalmLeaves from './PalmLeaves'

type InvitationCollageProps = {
  /** When false, skip entry motion (e.g. gate still closed). */
  animate?: boolean
  /** Seconds — only set when revealing after Open Invitation click. */
  revealDelay?: number
}

export default function InvitationCollage({
  animate = true,
  revealDelay = 0,
}: InvitationCollageProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const root = rootRef.current
    if (!root) return

    const film = root.querySelector<HTMLElement>('[data-collage-piece="film"]')
    const polaroid = root.querySelector<HTMLElement>('[data-collage-piece="polaroid"]')
    const saveDate = root.querySelector<HTMLElement>('[data-collage-piece="save-date"]')
    const postcard = root.querySelector<HTMLElement>('[data-collage-piece="postcard"]')
    const leaves = root.querySelector<HTMLElement>('[data-collage-piece="leaves"]')

    const pieces = [film, polaroid, saveDate, postcard, leaves].filter(
      (el): el is HTMLElement => Boolean(el),
    )
    if (pieces.length === 0) return

    // Keep pieces hidden while the entrance gate is still covering the page.
    gsap.set(pieces, { opacity: 0 })

    if (!animate) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion) {
      gsap.fromTo(
        pieces,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          delay: revealDelay,
          ease: 'power2.out',
        },
      )
      return
    }

    // Fly-by from each side — delayed only after Open Invitation, not on reload skip.
    gsap.set(film, { opacity: 0, xPercent: -95, y: 56 })
    gsap.set(polaroid, { opacity: 0, xPercent: 105, y: -40 })
    gsap.set(saveDate, { opacity: 0, yPercent: -85, x: 28 })
    gsap.set(postcard, { opacity: 0, yPercent: 95, x: -16 })
    gsap.set(leaves, { opacity: 0, xPercent: 85, yPercent: 70 })

    const settle = {
      opacity: 1,
      x: 0,
      y: 0,
      xPercent: 0,
      yPercent: 0,
      duration: 1.15,
      ease: 'power3.out' as const,
    }

    gsap
      .timeline({ delay: revealDelay, defaults: { overwrite: 'auto' } })
      .to(saveDate, settle, 0)
      .to(postcard, settle, 0.14)
      .to(film, settle, 0.22)
      .to(polaroid, settle, 0.3)
      .to(leaves, settle, 0.4)
  }, [animate, revealDelay])

  return (
    <div ref={rootRef} className="invitation-collage" aria-label="Wedding invitation collage">
      <div className="invitation-collage__stage">
        <div
          data-collage-piece="save-date"
          className="invitation-collage__piece invitation-collage__piece--save-date"
        >
          <SaveTheDateCard />
        </div>
        <div
          data-collage-piece="postcard"
          className="invitation-collage__piece invitation-collage__piece--postcard"
        >
          <CelebrationCard />
        </div>
        <div
          data-collage-piece="film"
          className="invitation-collage__piece invitation-collage__piece--film"
        >
          <FilmStrip />
        </div>
        <div
          data-collage-piece="polaroid"
          className="invitation-collage__piece invitation-collage__piece--polaroid"
        >
          <Polaroid />
        </div>
        <div
          data-collage-piece="leaves"
          className="invitation-collage__piece invitation-collage__piece--leaves"
        >
          <PalmLeaves />
        </div>
      </div>
    </div>
  )
}
