import { useRef } from 'react'
import { contactBlock } from '../../data/weddingData'
import { useGSAP } from '../../hooks/useGSAP'
import { fadeUpOnScroll } from '../../hooks/useScrollTrigger'

type ContactBlockProps = {
  onGoBack: () => void
}

export default function ContactBlock({ onGoBack }: ContactBlockProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return
    fadeUpOnScroll({
      trigger: section,
      targets: section.querySelector('.contact-block__panel'),
      start: 'top 85%',
    })
  }, [])

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="contact-block section-wrap"
    >
      <div className="contact-block__panel capiz-panel">
        <h2 className="contact-block__heading">{contactBlock.heading}</h2>
        <p className="contact-block__body">{contactBlock.body}</p>
        <button
          type="button"
          className="contact-block__back"
          onClick={onGoBack}
        >
          {contactBlock.goBackLabel}
        </button>
      </div>
    </section>
  )
}
