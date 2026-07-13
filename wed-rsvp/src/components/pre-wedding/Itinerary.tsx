import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { itinerary } from '../../data/weddingData'
import { useGSAP } from '../../hooks/useGSAP'
import { lineDrawOnScroll } from '../../hooks/useScrollTrigger'

export default function Itinerary() {
  const sectionRef = useRef<HTMLElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  useGSAP(() => {
    if (!sectionRef.current || !lineRef.current) return
    lineDrawOnScroll({
      trigger: sectionRef.current,
      target: lineRef.current,
    })
  }, [])

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <section ref={sectionRef} id="itinerary" className="itinerary section-wrap">
      <p className="section-label">Schedule</p>
      <div className="section-divider" />
      <h2 className="section-title">Day&apos;s Itinerary</h2>

      <div className="itinerary__timeline">
        <div ref={lineRef} className="itinerary__line will-animate" />

        {itinerary.map((item) => {
          const isOpen = openId === item.id
          return (
            <div key={item.id} className="itinerary__item">
              <div className="itinerary__node" />
              <button
                type="button"
                className="itinerary__header"
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
              >
                <span className="itinerary__title">{item.title}</span>
                <span className="itinerary__time">{item.time}</span>
                <span
                  className={`itinerary__chevron ${isOpen ? 'itinerary__chevron--open' : ''}`}
                >
                  ▼
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    className="itinerary__details"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="itinerary__details-inner">
                      <p className="itinerary__detail-row">
                        <span className="itinerary__detail-label">Venue </span>
                        {item.venue}
                      </p>
                      <p className="itinerary__detail-row">
                        <span className="itinerary__detail-label">Dress Code </span>
                        {item.dressCode}
                      </p>
                      <p className="itinerary__detail-row">{item.description}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
