import { createFileRoute } from '@tanstack/react-router'
import AdminReveal from '../components/wedding-day/AdminReveal'

export const Route = createFileRoute('/wedding-day/admin')({
  component: WeddingDayAdminPage,
})

function WeddingDayAdminPage() {
  const { weddingDayPreviewEnabled } = Route.useRouteContext()

  return <AdminReveal initialPreviewEnabled={weddingDayPreviewEnabled} />
}
