import { thankYou } from '../../data/weddingData'

type ThankYouSectionProps = {
  visible: boolean
}

export default function ThankYouSection({ visible }: ThankYouSectionProps) {
  if (!visible) return null

  return (
    <section id="thank-you" className="thank-you" aria-live="polite">
      <div className="thank-you__panel capiz-panel">
        <div className="thank-you__seal" aria-hidden="true">
          <span className="thank-you__monogram">{thankYou.monogram}</span>
        </div>
        <p className="thank-you__label">{thankYou.label}</p>
        <h2 className="thank-you__title">{thankYou.title}</h2>
        <p className="thank-you__message">{thankYou.message}</p>
      </div>
    </section>
  )
}
