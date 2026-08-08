import { invitationCollage } from '../../../../data/weddingData'

type CelebrationCardProps = {
  className?: string
}

export default function CelebrationCard({ className = '' }: CelebrationCardProps) {
  const { note, footer } = invitationCollage.celebration

  return (
    <article className={`invitation-collage__postcard ${className}`.trim()}>
      <div className="invitation-collage__postcard-frame">
        <p className="invitation-collage__postcard-note">{note}</p>
        <p className="invitation-collage__postcard-footer">{footer}</p>
      </div>
    </article>
  )
}
