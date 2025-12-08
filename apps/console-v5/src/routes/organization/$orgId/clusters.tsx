import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/organization/$orgId/clusters')({
  component: RouteComponent,
})

function RouteComponent() {
  return <p className="text-neutral">Clusters</p>
}
