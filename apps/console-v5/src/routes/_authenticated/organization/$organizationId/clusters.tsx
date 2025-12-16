import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/clusters')({
  component: RouteComponent,
})

function RouteComponent() {
  return <p className="text-neutral">Clusters</p>
}
