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
    <div className="flex min-h-page-container flex-1 flex-col bg-background">
      <div className="flex min-h-0 flex-1 flex-col">
        <ClusterTerminal
          organizationId={cluster.organization.id}
          clusterId={cluster.id}
          className="rounded-none border-0"
          backgroundClassName="bg-background"
        />
      </div>
    </div>
  )
}
