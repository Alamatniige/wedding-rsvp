import { useRef } from 'react'
import { saveTheDate } from '../../data/weddingData'
import { useGSAP } from '../../hooks/useGSAP'
import { fadeUpOnScroll } from '../../hooks/useScrollTrigger'

export default function SaveTheDateReveal() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return
    fadeUpOnScroll({
      trigger: section,
      targets: section.querySelectorAll('.save-the-date__stack-item'),
      start: 'top 75%',
      y: 48,
      stagger: 0.18,
    })
  }, [])

  return (
    <section
      id="save-the-date"
      ref={sectionRef}
      className="save-the-date section-wrap"
    >
      <div className="save-the-date__stack">
        <article className="save-the-date__card capiz-panel save-the-date__stack-item">
          <p className="save-the-date__card-title">{saveTheDate.cardTitle}</p>
          <p className="save-the-date__card-date">{saveTheDate.cardSubtitle}</p>
          <p className="save-the-date__card-venue">{saveTheDate.cardVenue}</p>
        </article>

        <div className="save-the-date__strip save-the-date__stack-item" aria-hidden="false">
          <div className="save-the-date__strip-frame">
            <img
              className="save-the-date__strip-photo"
              src={saveTheDate.stripPhotoSrc}
              alt={saveTheDate.stripAlt}
              width={180}
              height={180}
              loading="lazy"
            />
            <img
              className="save-the-date__strip-photo"
              src={saveTheDate.stripPhotoSrc}
              alt=""
              width={180}
              height={180}
              loading="lazy"
            />
            <img
              className="save-the-date__strip-photo"
              src={saveTheDate.stripPhotoSrc}
              alt=""
              width={180}
              height={180}
              loading="lazy"
            />
          </div>
        </div>

        <p className="save-the-date__note capiz-panel save-the-date__stack-item">
          {saveTheDate.note}
        </p>
      </div>
    </section>
  )
}
