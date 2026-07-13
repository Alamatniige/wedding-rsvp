import { couple, hero } from '../../data/weddingData'
import ParallaxImage from '../shared/ParallaxImage'
import AnimatedText from '../shared/AnimatedText'
import CountdownTimer from './CountdownTimer'

type HeroSectionProps = {
  gateOpen: boolean
}

export default function HeroSection({ gateOpen }: HeroSectionProps) {
  return (
    <section id="hero" className="hero-section">
      <ParallaxImage src={hero.backgroundImageUrl} alt="Wedding venue" />
      <div className="hero-section__overlay" />
      <div className="hero-section__content">
        <AnimatedText trigger={gateOpen}>
          <p className="hero-section__tagline">{hero.tagline}</p>
          <h1 className="hero-section__names display-name">
            {couple.name1}
            <span className="hero-section__ampersand display-name--italic">&</span>
            {couple.name2}
          </h1>
          <p className="hero-section__date section-label">{couple.weddingDateDisplay}</p>
          <p className="hero-section__location">{couple.location}</p>
        </AnimatedText>
        <CountdownTimer />
      </div>
    </section>
  )
}
