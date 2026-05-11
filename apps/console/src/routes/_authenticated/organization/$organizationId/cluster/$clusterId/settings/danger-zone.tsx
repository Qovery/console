import { createFileRoute, useParams } from '@tanstack/react-router'
import { type Cluster } from 'qovery-typescript-axios'
import { ClusterDeleteModal, useCluster } from '@qovery/domains/clusters/feature'
import { BlockContentDelete, useModal } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/cluster/$clusterId/settings/danger-zone'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })

  const { data: cluster } = useCluster({ organizationId, clusterId })
  const { openModal } = useModal()

  const deleteCluster = (cluster: Cluster) => {
    openModal({
      content: <ClusterDeleteModal cluster={cluster} />,
    })
  }

  if (!cluster) {
    return null
  }

  return (
    <div className="flex w-full flex-col justify-between">
      <div className="max-w-content-with-navigation-left p-8">
        <BlockContentDelete
          title="Uninstall cluster"
          ctaLabel="Delete cluster"
          customModalConfirmation={() => deleteCluster(cluster)}
        />
      </div>
    </div>
  )
}
