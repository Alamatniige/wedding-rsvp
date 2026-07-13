import { forwardRef, type CSSProperties } from 'react'
import type { StoryCard } from '../../data/weddingData'

type StoryPhotoCardProps = {
  card: StoryCard
  slant: number
  isFlipped: boolean
  onFlip: () => void
}

const StoryPhotoCard = forwardRef<HTMLDivElement, StoryPhotoCardProps>(
  function StoryPhotoCard({ card, slant, isFlipped, onFlip }, ref) {
    return (
      <div ref={ref} className="our-story__card-outer will-animate" data-slant={slant}>
        <div
          className="our-story__card-slant"
          style={{ '--slant': `${slant}deg` } as CSSProperties}
        >
          <button
            type="button"
            className="our-story__card"
            onClick={onFlip}
            aria-pressed={isFlipped}
            aria-label={`${card.title} — tap to read more`}
          >
            <div
              className={`our-story__card-inner ${isFlipped ? 'our-story__card-inner--flipped' : ''}`}
            >
            <div className="our-story__card-face our-story__card-face--front">
              <img
                src={card.src}
                alt={card.alt}
                width={card.width}
                height={card.height}
                loading="lazy"
                className="our-story__card-photo"
              />
              <p className="our-story__card-caption">{card.title}</p>
            </div>
            <div className="our-story__card-face our-story__card-face--back">
              <p className="our-story__card-description">{card.description}</p>
            </div>
            </div>
          </button>
        </div>
      </div>
    )
  },
)

export default StoryPhotoCard
