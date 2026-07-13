import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import PhotoboothGate from '../components/pre-wedding/PhotoboothGate'
import PreWeddingPage from '../components/pre-wedding/PreWeddingPage'
import WeddingDayPlaceholder from '../components/wedding-day/WeddingDayPlaceholder'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { weddingMode } = Route.useRouteContext()
  const [gateOpen, setGateOpen] = useState(false)

  if (weddingMode === 'wedding-day') {
    return <WeddingDayPlaceholder />
  }

  return (
    <>
      <PhotoboothGate onComplete={() => setGateOpen(true)} />
      <PreWeddingPage gateOpen={gateOpen} />
    </>
  )
}
