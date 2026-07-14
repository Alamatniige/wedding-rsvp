import { invitationCollage } from '../../../../data/weddingData'

type SaveTheDateCardProps = {
  className?: string
}

export default function SaveTheDateCard({ className = '' }: SaveTheDateCardProps) {
  const { inviteLine, title, names } = invitationCollage.saveTheDate

  return (
    <article className={`invitation-collage__save-date ${className}`.trim()}>
      <p className="invitation-collage__save-date-invite">{inviteLine}</p>
      <h2 className="invitation-collage__save-date-title">{title}</h2>
      <p className="invitation-collage__save-date-names">{names}</p>
    </article>
  )
}
