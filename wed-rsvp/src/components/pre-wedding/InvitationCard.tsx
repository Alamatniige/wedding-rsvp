import { couple, hero } from '../../data/weddingData'
import AnimatedText from '../shared/AnimatedText'

type InvitationCardProps = {
  gateOpen: boolean
}

export default function InvitationCard({ gateOpen }: InvitationCardProps) {
  return (
    <section id="invitation" className="invitation-card">
      <div className="invitation-card__panel capiz-panel">
        <AnimatedText trigger={gateOpen}>
          <p className="invitation-card__tagline">{hero.tagline}</p>
          <h1 className="invitation-card__names">
            {couple.name1}
            <span className="invitation-card__ampersand">&</span>
            {couple.name2}
          </h1>
          <p className="invitation-card__date">{couple.weddingDateDisplay}</p>
          <p className="invitation-card__location">{couple.location}</p>
        </AnimatedText>
      </div>
    </section>
  )
}
