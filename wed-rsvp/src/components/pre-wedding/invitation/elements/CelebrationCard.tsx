import { invitationCollage } from '../../../../data/weddingData'

type CelebrationCardProps = {
  className?: string
}

export default function CelebrationCard({ className = '' }: CelebrationCardProps) {
  const { details, note, footer } = invitationCollage.celebration

  return (
    <article className={`invitation-collage__postcard ${className}`.trim()}>
      <p className="invitation-collage__postcard-details">{details}</p>
      <p className="invitation-collage__postcard-note">{note}</p>
      <p className="invitation-collage__postcard-footer">{footer}</p>
    </article>
  )
}
