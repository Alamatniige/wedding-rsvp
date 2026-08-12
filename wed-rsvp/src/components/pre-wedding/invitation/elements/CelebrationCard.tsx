import { invitationCollage } from '../../../../data/weddingData'

type CelebrationCardProps = {
  className?: string
}

export default function CelebrationCard({ className = '' }: CelebrationCardProps) {
  const { note, noteAside, secondNote, footer } = invitationCollage.celebration

  return (
    <article className={`invitation-collage__postcard ${className}`.trim()}>
      <div className="invitation-collage__postcard-frame">
        <div className="invitation-collage__postcard-body">
          <p className="invitation-collage__postcard-note">
            {note}
            <span className="invitation-collage__postcard-note-aside">{noteAside}</span>
          </p>
          <p className="invitation-collage__postcard-second-note">{secondNote}</p>
        </div>
        <p className="invitation-collage__postcard-footer">{footer}</p>
      </div>
    </article>
  )
}
