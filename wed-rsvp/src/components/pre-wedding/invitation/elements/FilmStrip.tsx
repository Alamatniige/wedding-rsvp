import { invitationCollage } from '../../../../data/weddingData'

type FilmStripProps = {
  className?: string
}

export default function FilmStrip({ className = '' }: FilmStripProps) {
  const { filmStripSrcs, filmStripAlt } = invitationCollage

  return (
    <div className={`invitation-collage__film ${className}`.trim()} aria-hidden="true">
      <div className="invitation-collage__film-photos">
        {filmStripSrcs.map((src, index) => (
          <img
            key={src}
            className="invitation-collage__film-photo"
            src={src}
            alt={index === 0 ? filmStripAlt : ''}
            width={120}
            height={120}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ))}
      </div>
    </div>
  )
}
