import { useRef } from 'react'
import { useGSAP } from '../../hooks/useGSAP'
import { parallaxOnScroll } from '../../hooks/useScrollTrigger'

type ParallaxImageProps = {
  src: string
  alt: string
  className?: string
}

export default function ParallaxImage({ src, alt, className = '' }: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useGSAP(() => {
    if (!containerRef.current || !imageRef.current) return
    parallaxOnScroll({
      trigger: containerRef.current,
      target: imageRef.current,
      y: -100,
    })
  }, [])

  return (
    <div ref={containerRef} className={`hero-section__bg will-animate ${className}`}>
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="hero-section__bg-image will-animate"
        width={1920}
        height={1080}
        loading="eager"
      />
    </div>
  )
}
