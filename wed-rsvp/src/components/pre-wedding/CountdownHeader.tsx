import { useRef } from 'react'
import { countdown } from '../../data/weddingData'
import { useGSAP } from '../../hooks/useGSAP'
import { fadeUpOnScroll } from '../../hooks/useScrollTrigger'
import CountdownTimer from './CountdownTimer'

export default function CountdownHeader() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return
    fadeUpOnScroll({
      trigger: section,
      targets: section.querySelectorAll('.countdown-header__anim'),
      start: 'top 80%',
      stagger: 0.12,
    })
  }, [])

  return (
    <section
      id="countdown"
      ref={sectionRef}
      className="countdown-header section-wrap"
    >
      <div className="countdown-header__panel capiz-panel">
        <p className="countdown-header__meet countdown-header__anim">
          <span className="countdown-header__meet-prefix">
            {countdown.meetUsPrefix}
          </span>{' '}
          <span className="countdown-header__venue">{countdown.venue}</span>
        </p>
        <p className="countdown-header__date countdown-header__anim">
          {countdown.dateDisplay}
        </p>
        <div className="countdown-header__timer countdown-header__anim">
          <CountdownTimer />
        </div>
      </div>
    </section>
  )
}
