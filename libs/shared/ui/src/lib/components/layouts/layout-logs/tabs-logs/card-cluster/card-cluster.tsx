import { ClusterEntity } from '@qovery/shared/interfaces'
import CopyToClipboard from '../../../../copy-to-clipboard/copy-to-clipboard'
import Icon from '../../../../icon/icon'
import StatusChip from '../../../../status-chip/status-chip'

export interface CardClusterProps {
  cluster?: ClusterEntity
  organizationId: string
}

export const splitId = (id: string) => `${id.split('-')[0]}[...]${id.split('-')[id.split('-').length - 1]}`

export function CardCluster(props: CardClusterProps) {
  const { cluster, organizationId } = props

  if (!cluster) return null

  return (
    <div className="bg-element-light-darker-300 p-4 rounded">
      <div data-testid="status" className="flex items-center text-text-300 font-bold text-xs">
        <StatusChip status={cluster.extendedStatus?.status?.status} className="mr-4" /> Cluster infra logs
      </div>
      <div className="mt-4">
        <div className="flex mt-1">
          <Icon data-testid="icon" name={`${cluster.cloud_provider}_GRAY`} className="mr-4 mt-0.5" />
          <div>
            <p className="text-text-200 text-sm font-medium">
              {cluster.name} ({cluster.region})
            </p>
            <ul className="text-xs mt-5">
              <li className="flex mb-2">
                <span className="text-text-300 w-16 mr-3">Cluster ID</span>
                <div className="flex">
                  <span className="text-accent2-400">{splitId(cluster.id)}</span>
                  <CopyToClipboard content={cluster.id} className="text-text-300 ml-1" />
                </div>
              </li>
              {cluster.extendedStatus?.status?.last_execution_id && (
                <li className="flex mb-2">
                  <span className="text-text-300 w-16 mr-3">Exec. ID</span>
                  <div className="flex">
                    <span className="text-accent2-400">
                      {splitId(cluster.extendedStatus?.status?.last_execution_id)}
                    </span>
                    <CopyToClipboard
                      content={cluster.extendedStatus?.status?.last_execution_id}
                      className="text-text-300 ml-1"
                    />
                  </div>
                </li>
              )}
              <li className="flex mb-2">
                <span className="text-text-300 w-16 mr-3">Version</span>
                <span className="text-text-300">{cluster.version}</span>
              </li>
              <li className="flex">
                <span className="text-text-300 w-16 mr-3">Org. ID</span>
                <div className="flex">
                  <span className="text-accent2-400">{splitId(organizationId)}</span>
                  <CopyToClipboard content={organizationId} className="text-text-300 ml-1" />
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
