import { invitationCollage } from '../../../../data/weddingData'

type PalmLeavesProps = {
  className?: string
}

/** Edited slanted-V palm asset for the collage corner. */
export default function PalmLeaves({ className = '' }: PalmLeavesProps) {
  return (
    <img
      className={`invitation-collage__palm-leaves ${className}`.trim()}
      src={invitationCollage.palmLeavesSrc}
      alt=""
      width={400}
      height={400}
      loading="lazy"
      decoding="async"
      draggable={false}
      aria-hidden="true"
    />
  )
}
