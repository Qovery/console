import { Outlet, createFileRoute } from '@tanstack/react-router'
import { ClusterOperatorInstallModal } from '@qovery/domains/clusters/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Outlet />
      <ClusterOperatorInstallModal />
    </>
  )
}
