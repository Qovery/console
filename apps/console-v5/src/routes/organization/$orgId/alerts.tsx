import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/organization/$orgId/alerts')({
  component: RouteComponent,
})

function RouteComponent() {
  return <p className="text-neutral">Alerts</p>
}
