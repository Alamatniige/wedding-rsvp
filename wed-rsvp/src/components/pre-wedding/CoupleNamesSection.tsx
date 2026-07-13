import { useRef } from 'react'
import { couple, coupleSection } from '../../data/weddingData'
import { useGSAP } from '../../hooks/useGSAP'
import { fadeUpOnScroll } from '../../hooks/useScrollTrigger'

type CoupleNamesSectionProps = {
  onShareAddress: () => void
}

export default function CoupleNamesSection({
  onShareAddress,
}: CoupleNamesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return
    fadeUpOnScroll({
      trigger: section,
      targets: section.querySelectorAll('.couple-names__anim'),
      start: 'top 70%',
      stagger: 0.14,
    })
  }, [])

  return (
    <section id="couple" ref={sectionRef} className="couple-names">
      <img
        className="couple-names__bg"
        src={coupleSection.backgroundImageUrl}
        alt=""
        aria-hidden="true"
      />
      <div className="couple-names__overlay" aria-hidden="true" />
      <div className="couple-names__content">
        <h2 className="couple-names__names couple-names__anim">
          {couple.name1}
          <span className="couple-names__ampersand">&</span>
          {couple.name2}
        </h2>
        <button
          type="button"
          className="couple-names__cta couple-names__anim"
          onClick={onShareAddress}
        >
          {coupleSection.ctaLabel}
        </button>
      </div>
    </section>
  )
}
