import { useCluster, useClusterStatus } from '@qovery/domains/clusters/feature'
import { CopyToClipboardButtonIcon, Icon, StatusChip } from '@qovery/shared/ui'

export interface CardClusterProps {
  clusterId: string
  organizationId: string
}

export const splitId = (id: string) => `${id.split('-')[0]}[...]${id.split('-')[id.split('-').length - 1]}`

export function CardCluster({ clusterId, organizationId }: CardClusterProps) {
  const { data: cluster } = useCluster({ organizationId, clusterId })
  const { data: clusterStatus } = useClusterStatus({
    organizationId,
    clusterId,
    refetchInterval: 3000,
  })

  if (!cluster) return null

  return (
    <div className="bg-neutral-600 p-4 rounded">
      <div data-testid="status" className="flex items-center text-neutral-300 font-bold text-xs">
        <StatusChip status={clusterStatus?.status} className="mr-4" /> Cluster infra logs
      </div>
      <div className="mt-4">
        <div className="flex mt-1">
          <Icon data-testid="icon" name={`${cluster.cloud_provider}_GRAY`} className="mr-4 mt-0.5" />
          <div>
            <p className="text-neutral-100 text-sm font-medium">
              {cluster.name} ({cluster.region})
            </p>
            <ul className="text-xs mt-5">
              <li className="flex mb-2">
                <span className="text-neutral-300 w-16 mr-3">Cluster ID</span>
                <div className="flex">
                  <span className="text-sky-400">{splitId(cluster.id)}</span>
                  <CopyToClipboardButtonIcon content={cluster.id} className="text-neutral-300 ml-1" />
                </div>
              </li>
              {clusterStatus?.last_execution_id && (
                <li className="flex mb-2">
                  <span className="text-neutral-300 w-16 mr-3">Exec. ID</span>
                  <div className="flex">
                    <span className="text-sky-400">{splitId(clusterStatus?.last_execution_id)}</span>
                    <CopyToClipboardButtonIcon
                      content={clusterStatus?.last_execution_id}
                      className="text-neutral-300 ml-1"
                    />
                  </div>
                </li>
              )}
              <li className="flex mb-2">
                <span className="text-neutral-300 w-16 mr-3">Version</span>
                <span className="text-neutral-300">{cluster.version}</span>
              </li>
              <li className="flex">
                <span className="text-neutral-300 w-16 mr-3">Org. ID</span>
                <div className="flex">
                  <span className="text-sky-400">{splitId(organizationId)}</span>
                  <CopyToClipboardButtonIcon content={organizationId} className="text-neutral-300 ml-1" />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardCluster
