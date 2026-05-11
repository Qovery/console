import { createFileRoute } from '@tanstack/react-router'
import { Outlet } from '@tanstack/react-router'
import { ClusterCreationFlow } from '@qovery/domains/clusters/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/create/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ClusterCreationFlow>
      <Outlet />
    </ClusterCreationFlow>
  )
}
