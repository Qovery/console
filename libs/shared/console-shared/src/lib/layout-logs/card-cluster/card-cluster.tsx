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
    <div className="rounded bg-neutral-600 p-4">
      <div data-testid="status" className="flex items-center text-xs font-bold text-neutral-300">
        <StatusChip status={clusterStatus?.status} className="mr-4" /> Cluster infra logs
      </div>
      <div className="mt-4">
        <div className="mt-1 flex">
          <Icon data-testid="icon" name={`${cluster.cloud_provider}_GRAY`} className="mr-4 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-neutral-100">
              {cluster.name} ({cluster.region})
            </p>
            <ul className="mt-5 text-xs">
              <li className="mb-2 flex">
                <span className="mr-3 w-16 text-neutral-300">Cluster ID</span>
                <div className="flex">
                  <span className="text-sky-400">{splitId(cluster.id)}</span>
                  <CopyToClipboardButtonIcon content={cluster.id} className="ml-1 text-neutral-300" />
                </div>
              </li>
              {clusterStatus?.last_execution_id && (
                <li className="mb-2 flex">
                  <span className="mr-3 w-16 text-neutral-300">Exec. ID</span>
                  <div className="flex">
                    <span className="text-sky-400">{splitId(clusterStatus?.last_execution_id)}</span>
                    <CopyToClipboardButtonIcon
                      content={clusterStatus?.last_execution_id}
                      className="ml-1 text-neutral-300"
                    />
                  </div>
                </li>
              )}
              <li className="mb-2 flex">
                <span className="mr-3 w-16 text-neutral-300">Version</span>
                <span className="text-neutral-300">{cluster.version}</span>
              </li>
              <li className="flex">
                <span className="mr-3 w-16 text-neutral-300">Org. ID</span>
                <div className="flex">
                  <span className="text-sky-400">{splitId(organizationId)}</span>
                  <CopyToClipboardButtonIcon content={organizationId} className="ml-1 text-neutral-300" />
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
