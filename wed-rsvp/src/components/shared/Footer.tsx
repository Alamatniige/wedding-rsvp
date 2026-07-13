import { useRef } from 'react'
import { footer } from '../../data/weddingData'
import { useGSAP } from '../../hooks/useGSAP'
import { fadeUpOnScroll, parallaxOnScroll } from '../../hooks/useScrollTrigger'

export type FooterVariant = 'hero' | 'rsvp'

type FooterProps = {
  variant: FooterVariant
  /** Optional override for the message under the initials. */
  message?: string
}

export default function Footer({ variant, message }: FooterProps) {
  const rootRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const resolvedMessage =
    message ??
    (variant === 'rsvp' ? footer.rsvpThankYouMessage : footer.heroMessage)

  useGSAP(() => {
    const root = rootRef.current
    const image = imageRef.current
    if (!root) return

    fadeUpOnScroll({
      trigger: root,
      targets: root.querySelectorAll('.site-footer__anim'),
      start: 'top 85%',
      stagger: 0.12,
    })

    if (image) {
      parallaxOnScroll({
        trigger: root,
        target: image,
        y: -60,
        start: 'top bottom',
        end: 'bottom top',
      })
    }
  }, [variant])

  return (
    <footer ref={rootRef} className={`site-footer site-footer--${variant}`}>
      <div className="site-footer__bg" aria-hidden="true">
        <img
          ref={imageRef}
          className="site-footer__bg-image"
          src={footer.coupleBackgroundImageUrl}
          alt=""
        />
      </div>
      <div className="site-footer__overlay" aria-hidden="true" />
      <div className="site-footer__content">
        <p className="site-footer__initials site-footer__anim">
          {footer.initials}
        </p>
        {resolvedMessage ? (
          <p className="site-footer__message site-footer__anim">
            {resolvedMessage}
          </p>
        ) : null}
      </div>
    </footer>
  )
}
