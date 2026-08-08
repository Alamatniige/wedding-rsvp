type PalmLeavesProps = {
  className?: string
}

/** Alfie postage stamp — replaces the collage corner palm leaves. */
export default function PalmLeaves({ className = '' }: PalmLeavesProps) {
  return (
    <img
      className={`invitation-collage__palm-leaves ${className}`.trim()}
      src="/images/entrance/alfie.png"
      alt=""
      width={300}
      height={400}
      loading="lazy"
      decoding="async"
      draggable={false}
      aria-hidden="true"
    />
  )
}
