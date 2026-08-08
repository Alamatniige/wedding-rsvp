type SaveTheDateCardProps = {
  className?: string
}

/** Botanical illustration on a textured paper card with burgundy double border. */
export default function SaveTheDateCard({ className = '' }: SaveTheDateCardProps) {
  return (
    <article className={`invitation-collage__save-date ${className}`.trim()}>
      <div className="invitation-collage__save-date-frame">
        <img
          className="invitation-collage__save-date-image"
          src="/images/entrance/wed-bg.jpg"
          alt="Tropical botanical illustration"
          width={800}
          height={504}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </div>
    </article>
  )
}
