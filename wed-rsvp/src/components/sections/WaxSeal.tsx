import { forwardRef } from 'react'
import { couple } from '../../data/weddingData'

type WaxSealProps = {
  onClick?: () => void
  ariaLabel?: string
}

export const WaxSeal = forwardRef<HTMLButtonElement, WaxSealProps>(function WaxSeal(
  { onClick, ariaLabel = 'Open the invitation' },
  ref,
) {
  return (
    <button
      ref={ref}
      onClick={onClick}
      aria-label={ariaLabel}
      type="button"
      style={{ willChange: 'transform', cursor: 'pointer' }}
      className="wax-seal__btn group relative h-28 w-28 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-champagne)"
    >
      <svg
        viewBox="0 0 120 120"
        className="h-full w-full"
        style={{ filter: 'drop-shadow(0 8px 24px rgba(80,20,30,0.5))' }}
      >
        <defs>
          <radialGradient id="wax-fill" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#9b2335" />
            <stop offset="60%" stopColor="#6b1520" />
            <stop offset="100%" stopColor="#3d0a10" />
          </radialGradient>
          <radialGradient id="wax-shine" cx="35%" cy="30%" r="25%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        {/* drip blob — irregular edges for realism */}
        <path
          d="M60 6 C 78 8 102 18 110 38 C 118 60 108 96 86 110 C 64 122 36 116 18 100 C 0 84 4 50 18 32 C 28 18 44 8 60 6 Z"
          fill="url(#wax-fill)"
        />
        {/* monogram */}
        <text
          x="50%"
          y="56%"
          textAnchor="middle"
          fontFamily="Cormorant Garamond, Georgia, serif"
          fontSize="36"
          fontStyle="italic"
          fill="var(--color-champagne)"
          opacity="0.92"
          dominantBaseline="middle"
        >
          {couple.monogram}
        </text>
        {/* highlight sheen */}
        <ellipse cx="44" cy="38" rx="22" ry="14" fill="url(#wax-shine)" />
      </svg>
      <span
        className="wax-seal__hint pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 max-w-[90vw] truncate text-center text-xs uppercase"
        style={{
          color: 'rgba(250,247,242,0.75)',
          fontFamily: 'var(--font-subheading)',
        }}
      >
        Tap to open
      </span>
    </button>
  )
})
