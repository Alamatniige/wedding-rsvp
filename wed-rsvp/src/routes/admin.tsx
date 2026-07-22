import { createFileRoute } from '@tanstack/react-router'
import AdminReveal from '../components/wedding-day/AdminReveal'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function AdminPage() {
  const { weddingDayPreviewEnabled } = Route.useRouteContext()

  return <AdminReveal initialPreviewEnabled={weddingDayPreviewEnabled} />
}
