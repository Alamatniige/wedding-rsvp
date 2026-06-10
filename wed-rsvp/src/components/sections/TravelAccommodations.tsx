import { travel } from '../../data/weddingData'

export default function TravelAccommodations() {
  return (
    <section id="travel" className="travel section-wrap">
      <p className="section-label">Getting There</p>
      <div className="section-divider" />
      <h2 className="section-title">Travel & Accommodations</h2>

      <div className="travel__map-wrap">
        <iframe
          className="travel__map"
          src={travel.mapEmbedUrl}
          title={`Map of ${travel.venueName}`}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="travel__map-buttons">
        <a
          href={travel.mapsLinks.google}
          target="_blank"
          rel="noopener noreferrer"
          className="travel__map-btn"
        >
          Open in Google Maps
        </a>
        <a
          href={travel.mapsLinks.apple}
          target="_blank"
          rel="noopener noreferrer"
          className="travel__map-btn"
        >
          Open in Apple Maps
        </a>
        <a
          href={travel.mapsLinks.waze}
          target="_blank"
          rel="noopener noreferrer"
          className="travel__map-btn"
        >
          Open in Waze
        </a>
      </div>

      <div className="travel__hotels">
        {travel.hotels.map((hotel) => (
          <article key={hotel.name} className="travel__hotel-card">
            <h3 className="travel__hotel-name">{hotel.name}</h3>
            <p className="travel__hotel-code">Code: {hotel.discountCode}</p>
            <p className="travel__hotel-distance">{hotel.distance}</p>
            <p className="travel__hotel-desc">{hotel.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
