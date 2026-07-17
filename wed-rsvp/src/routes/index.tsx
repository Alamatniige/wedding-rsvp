import { useCallback, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import PhotoboothGate from '../components/entrance/PhotoboothGate'
import type { GateRevealOptions } from '../components/entrance/PhotoboothGate'
import PreWeddingPage from '../components/pre-wedding/invitation/PreWeddingPage'
import WeddingDayFlow from '../components/wedding-day/WeddingDayFlow'

/** Seconds to wait after Open Invitation so fly-by plays as the gate clears. */
const GATE_BUTTON_REVEAL_DELAY = 0.45

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { weddingMode } = Route.useRouteContext()
  // Always start closed so SSR HTML matches the client's first paint.
  const [gateOpen, setGateOpen] = useState(false)
  const [revealDelay, setRevealDelay] = useState(0)

  const openGate = useCallback((options?: GateRevealOptions) => {
    setRevealDelay(options?.delayed ? GATE_BUTTON_REVEAL_DELAY : 0)
    setGateOpen(true)
  }, [])

  if (weddingMode === 'wedding-day') {
    return <WeddingDayFlow />
  }

  return (
    <>
      <PhotoboothGate onComplete={openGate} />
      <PreWeddingPage gateOpen={gateOpen} revealDelay={revealDelay} />
    </>
  )
}
