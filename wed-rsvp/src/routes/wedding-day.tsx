import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/wedding-day')({
  component: WeddingDayLayout,
})

function WeddingDayLayout() {
  return <Outlet />
}
