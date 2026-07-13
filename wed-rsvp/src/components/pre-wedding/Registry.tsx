import { registry } from '../../data/weddingData'

export default function Registry() {
  return (
    <section id="registry" className="registry section-wrap">
      <p className="section-label">Gifts</p>
      <div className="section-divider" />
      <h2 className="section-title">Registry</h2>

      <div className="registry__grid">
        {registry.links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="registry__card"
          >
            <h3 className="registry__card-name">{link.name}</h3>
            <p className="registry__card-desc">{link.description}</p>
            <span className="registry__card-link">Visit Registry →</span>
          </a>
        ))}
      </div>

      <div className="registry__wishing-well">
        <h3 className="registry__card-name">{registry.wishingWell.title}</h3>
        <p className="registry__card-desc">{registry.wishingWell.description}</p>
        <img
          className="registry__qr"
          src={registry.wishingWell.qrImageUrl}
          alt="Wishing well QR code"
          width={200}
          height={200}
          loading="lazy"
        />
      </div>
    </section>
  )
}
