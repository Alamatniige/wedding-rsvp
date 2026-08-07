import { couple, invitationCollage } from '../../../../data/weddingData'
import MixedDisplayName from '../../../typography/MixedDisplayName'
import MixedDisplayText, {
  wordInitialScriptIndices,
} from '../../../typography/MixedDisplayText'

type SaveTheDateCardProps = {
  className?: string
}

export default function SaveTheDateCard({ className = '' }: SaveTheDateCardProps) {
  const { inviteLine, title } = invitationCollage.saveTheDate

  return (
    <article className={`invitation-collage__save-date ${className}`.trim()}>
      <p className="invitation-collage__save-date-invite">{inviteLine}</p>
      <h2 className="invitation-collage__save-date-title">
        <MixedDisplayText
          text={title}
          scriptIndices={wordInitialScriptIndices(title)}
        />
      </h2>
      <p
        className="invitation-collage__save-date-names"
        aria-label={`${couple.name1} and ${couple.name2}`}
      >
        <span aria-hidden="true">
          <MixedDisplayName
            name={couple.name1}
            scriptIndices={couple.name1ScriptIndices}
          />
          <span className="mixed-name__amp">&amp;</span>
          <MixedDisplayName
            name={couple.name2}
            scriptIndices={couple.name2ScriptIndices}
          />
        </span>
      </p>
    </article>
  )
}
