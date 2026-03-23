import { createFileRoute } from '@tanstack/react-router'
import { ClusterTerminal, useCluster } from '@qovery/domains/clusters/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/cloud-shell')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', clusterId = '' } = Route.useParams()
  useDocumentTitle('Cluster - Cloud shell')

  const { data: cluster } = useCluster({
    organizationId,
    clusterId,
    suspense: true,
  })

  if (!cluster) {
    return null
  }

  return (
    <div className="flex h-[calc(100dvh-108px)] min-h-0 flex-col overflow-hidden bg-background">
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <ClusterTerminal
          organizationId={cluster.organization.id}
          clusterId={cluster.id}
          className="rounded-none border-0"
        />
      </div>
    </div>
  )
}
