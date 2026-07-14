import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '../../../../hooks/useGSAP'
import SaveTheDateCard from './SaveTheDateCard'
import CelebrationCard from './CelebrationCard'
import FilmStrip from './FilmStrip'
import Polaroid from './Polaroid'
import PalmLeaves from './PalmLeaves'

gsap.registerPlugin(ScrollTrigger)

type InvitationCollageProps = {
  /** When false, skip entry motion (e.g. gate still closed). */
  animate?: boolean
}

export default function InvitationCollage({ animate = true }: InvitationCollageProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const root = rootRef.current
    if (!root || !animate) return

    const film = root.querySelector<HTMLElement>('[data-collage-piece="film"]')
    const polaroid = root.querySelector<HTMLElement>('[data-collage-piece="polaroid"]')
    const saveDate = root.querySelector<HTMLElement>('[data-collage-piece="save-date"]')
    const postcard = root.querySelector<HTMLElement>('[data-collage-piece="postcard"]')
    const leaves = root.querySelector<HTMLElement>('[data-collage-piece="leaves"]')

    const pieces = [film, polaroid, saveDate, postcard, leaves].filter(
      (el): el is HTMLElement => Boolean(el),
    )
    if (pieces.length === 0) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion) {
      gsap.fromTo(
        pieces,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: root,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true,
          },
        },
      )
      return
    }

    gsap.set(film, { opacity: 0, xPercent: -80, y: 40 })
    gsap.set(polaroid, { opacity: 0, xPercent: 90, y: -30 })
    gsap.set(saveDate, { opacity: 0, yPercent: -70, x: 20 })
    gsap.set(postcard, { opacity: 0, yPercent: 80, x: -10 })
    gsap.set(leaves, { opacity: 0, xPercent: 70, yPercent: 60 })

    const settle = {
      opacity: 1,
      x: 0,
      y: 0,
      xPercent: 0,
      yPercent: 0,
      duration: 1.05,
      ease: 'power3.out' as const,
    }

    const tl = gsap.timeline({ paused: true, defaults: { overwrite: 'auto' } })

    tl.to(saveDate, settle, 0)
      .to(postcard, settle, 0.12)
      .to(film, settle, 0.2)
      .to(polaroid, settle, 0.28)
      .to(leaves, settle, 0.38)

    let played = false
    const playEntry = () => {
      if (played) return
      played = true
      tl.play(0)
    }

    ScrollTrigger.create({
      trigger: root,
      start: 'top 90%',
      once: true,
      onEnter: playEntry,
      // Hero sits in the first viewport after the gate — fire if already visible.
      onRefresh: (self) => {
        if (self.isActive || self.progress > 0) playEntry()
      },
    })

    ScrollTrigger.refresh()

    // Immediate play when collage is already on-screen (post-gate).
    const rect = root.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
      playEntry()
    }
  }, [animate])

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
