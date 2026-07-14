import { invitationCollage } from '../../../../data/weddingData'

type PolaroidProps = {
  className?: string
}

export default function Polaroid({ className = '' }: PolaroidProps) {
  const { src, alt } = invitationCollage.polaroid

  return (
    <figure className={`invitation-collage__polaroid ${className}`.trim()}>
      <img
        className="invitation-collage__polaroid-image"
        src={src}
        alt={alt}
        width={200}
        height={200}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </figure>
  )
}
