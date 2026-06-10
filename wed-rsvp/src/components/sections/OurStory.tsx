import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { story } from '../../data/weddingData'
import { useGSAP } from '../../hooks/useGSAP'
import { fadeUpOnScroll, parallaxOnScroll } from '../../hooks/useScrollTrigger'
import StoryPhotoCard from '../ui/StoryPhotoCard'

const SLANTS_DESKTOP = [-2.5, 1.8, -1.2, 2.2, -1.8, 1.5]
const SLANTS_MOBILE = [-1.5, 1.2, -0.8, 1.4, -1.2, 1]
const PARALLAX_OFFSETS = [-35, -55, -25, -45, -30, -50]

function getSlant(index: number) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const slants = isMobile ? SLANTS_MOBILE : SLANTS_DESKTOP
  return slants[index % slants.length]
}

function getParallaxY(index: number) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const offset = PARALLAX_OFFSETS[index % PARALLAX_OFFSETS.length]
  return isMobile ? -20 : offset
}

function getSlantFromOuter(outer: Element) {
  return Number((outer as HTMLElement).dataset.slant) || 0
}

function animateCardsIn(batch: Element[]) {
  const slantEls = batch.map((el) => el.querySelector('.our-story__card-slant'))

  gsap.to(batch, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.9,
    stagger: 0.12,
    ease: 'power3.out',
    overwrite: 'auto',
  })

  gsap.to(slantEls, {
    rotation: (_i, el) => getSlantFromOuter((el as Element).parentElement as Element),
    duration: 0.9,
    stagger: 0.12,
    ease: 'power3.out',
    overwrite: 'auto',
  })
}

function animateCardsOut(batch: Element[]) {
  const slantEls = batch.map((el) => el.querySelector('.our-story__card-slant'))

  gsap.to(batch, {
    opacity: 0,
    y: 50,
    scale: 0.94,
    duration: 0.55,
    stagger: 0.08,
    ease: 'power2.in',
    overwrite: 'auto',
  })

  gsap.to(slantEls, {
    rotation: (_i, el) => getSlantFromOuter((el as Element).parentElement as Element) + 6,
    duration: 0.55,
    stagger: 0.08,
    ease: 'power2.in',
    overwrite: 'auto',
  })
}

export default function OurStory() {
  const sectionRef = useRef<HTMLElement>(null)
  const quoteRef = useRef<HTMLParagraphElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const [flippedId, setFlippedId] = useState<string | null>(null)

  const handleFlip = (id: string) => {
    setFlippedId((prev) => (prev === id ? null : id))
  }

  useGSAP(() => {
    if (!sectionRef.current || !quoteRef.current || !galleryRef.current) return

    fadeUpOnScroll({
      trigger: sectionRef.current,
      targets: quoteRef.current,
      y: 30,
    })

    const cards = galleryRef.current.querySelectorAll('.our-story__card-outer')
    const slants = galleryRef.current.querySelectorAll('.our-story__card-slant')

    if (cards.length > 0) {
      gsap.set(cards, { opacity: 0, y: 50, scale: 0.94 })
      gsap.set(slants, {
        rotation: (_i, el) => getSlantFromOuter((el as Element).parentElement as Element) + 6,
      })

      ScrollTrigger.batch(cards, {
        start: 'top 88%',
        end: 'bottom 12%',
        onEnter: animateCardsIn,
        onLeave: animateCardsOut,
        onEnterBack: animateCardsIn,
        onLeaveBack: animateCardsOut,
      })

      cards.forEach((card, index) => {
        const slant = card.querySelector('.our-story__card-slant')
        if (!slant) return

        parallaxOnScroll({
          trigger: card,
          target: slant,
          y: getParallaxY(index),
        })
      })
    }
  }, [])

  return (
    <section ref={sectionRef} id="story" className="our-story section-wrap">
      <p className="section-label">Our Story</p>
      <div className="section-divider" />
      <h2 className="section-title">How We Met</h2>
      <p ref={quoteRef} className="our-story__quote will-animate">
        {story.quote}
      </p>
      <div ref={galleryRef} className="our-story__gallery">
        {story.galleryImages.map((card, index) => (
          <StoryPhotoCard
            key={card.id}
            card={card}
            slant={getSlant(index)}
            isFlipped={flippedId === card.id}
            onFlip={() => handleFlip(card.id)}
          />
        ))}
      </div>
    </section>
  )
}
