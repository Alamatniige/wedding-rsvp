import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import PhotoboothGate from '../components/sections/PhotoboothGate'
import HeroSection from '../components/sections/HeroSection'
import OurStory from '../components/sections/OurStory'
import Itinerary from '../components/sections/Itinerary'
import TravelAccommodations from '../components/sections/TravelAccommodations'
import RSVPForm from '../components/sections/RSVPForm'
import Registry from '../components/sections/Registry'
import Footer from '../components/ui/Footer'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [gateOpen, setGateOpen] = useState(false)

  return (
    <>
      <PhotoboothGate onComplete={() => setGateOpen(true)} />
      <main>
        <HeroSection gateOpen={gateOpen} />
        <OurStory />
        <Itinerary />
        <TravelAccommodations />
        <RSVPForm />
        <Registry />
        <Footer />
      </main>
    </>
  )
}
