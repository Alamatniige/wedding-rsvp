import { Navigate, createFileRoute } from '@tanstack/react-router'

/** Alias kept for old links; QR should point at `/` — mode decides the experience. */
export const Route = createFileRoute('/wedding-day/')({
  component: WeddingDayRedirect,
})

function WeddingDayRedirect() {
  return <Navigate to="/" />
}
