import MixedDisplayText from './MixedDisplayText'

type MixedDisplayNameProps = {
  name: string
  /** 0-based letter indices rendered in Loren Blake Script (rest use Serif). */
  scriptIndices?: number[]
  className?: string
}

/**
 * Thin wrapper for couple-name usage of {@link MixedDisplayText}.
 */
export default function MixedDisplayName({
  name,
  scriptIndices = [0],
  className,
}: MixedDisplayNameProps) {
  return (
    <MixedDisplayText
      text={name}
      scriptIndices={scriptIndices}
      className={className}
    />
  )
}
