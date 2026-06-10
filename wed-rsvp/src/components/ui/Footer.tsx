import { footer } from '../../data/weddingData'

export default function Footer() {
  return (
    <footer className="site-footer">
      <p className="site-footer__message">{footer.closingMessage}</p>
      <div className="site-footer__coordinator">
        <span className="site-footer__coordinator-name">
          Day-of Coordinator: {footer.coordinatorName}
        </span>
        <span>
          {footer.coordinatorPhone} · {footer.coordinatorEmail}
        </span>
      </div>
      <p className="site-footer__attribution">{footer.attribution}</p>
    </footer>
  )
}
