import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '../../hooks/useGSAP'

type AnimatedTextProps = {
  children: React.ReactNode
  className?: string
  trigger?: boolean
  stagger?: number
}

export default function AnimatedText({
  children,
  className = '',
  trigger = true,
  stagger = 0.15,
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current || !trigger) return

    const elements = containerRef.current.children
    gsap.set(elements, { opacity: 0, y: 30 })

    gsap.to(elements, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger,
      ease: 'power2.out',
    })
  }, [trigger, stagger])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}
