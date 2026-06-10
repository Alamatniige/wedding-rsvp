import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const DEFAULTS = {
  markers: false,
  invalidateOnRefresh: true,
} as const

type FadeUpOptions = {
  trigger: gsap.DOMTarget
  targets?: gsap.DOMTarget
  start?: string
  y?: number
  duration?: number
  stagger?: number
}

export function fadeUpOnScroll({
  trigger,
  targets,
  start = 'top 85%',
  y = 40,
  duration = 0.8,
  stagger = 0,
}: FadeUpOptions) {
  const elements = targets ?? trigger

  return gsap.from(elements, {
    opacity: 0,
    y,
    duration,
    stagger,
    ease: 'power2.out',
    scrollTrigger: {
      trigger,
      start,
      toggleActions: 'play none none none',
      ...DEFAULTS,
    },
  })
}

type ParallaxOptions = {
  trigger: gsap.DOMTarget
  target: gsap.DOMTarget
  y?: number
  start?: string
  end?: string
}

export function parallaxOnScroll({
  trigger,
  target,
  y = -80,
  start = 'top bottom',
  end = 'bottom top',
}: ParallaxOptions) {
  return gsap.to(target, {
    y,
    ease: 'none',
    scrollTrigger: {
      trigger,
      start,
      end,
      scrub: 1,
      ...DEFAULTS,
    },
  })
}

type LineDrawOptions = {
  trigger: gsap.DOMTarget
  target: gsap.DOMTarget
  start?: string
  end?: string
}

export function lineDrawOnScroll({
  trigger,
  target,
  start = 'top 70%',
  end = 'bottom 40%',
}: LineDrawOptions) {
  gsap.set(target, { transformOrigin: 'top center', scaleY: 0 })

  return gsap.to(target, {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: {
      trigger,
      start,
      end,
      scrub: 1,
      ...DEFAULTS,
    },
  })
}

type BatchFadeOptions = {
  trigger: gsap.DOMTarget
  targets: gsap.DOMTarget
  start?: string
  stagger?: number
}

export function batchFadeOnScroll({
  trigger,
  targets,
  start = 'top 85%',
  stagger = 0.15,
}: BatchFadeOptions) {
  return ScrollTrigger.batch(targets, {
    start,
    onEnter: (batch) => {
      gsap.from(batch, {
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger,
        ease: 'power2.out',
      })
    },
    once: true,
    ...DEFAULTS,
  })
}
