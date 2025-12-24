import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/cluster-logs')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/organization/$organizationId/cluster/$clusterId/cluster-logs"!</div>
}
