import { ClusterButtonsActions } from '@qovery/shared/console-shared'
import { ClusterEntity } from '@qovery/shared/interfaces'
import { Icon, StatusChip, Tag } from '@qovery/shared/ui'

export interface CardClusterProps {
  cluster: ClusterEntity
}

export function CardCluster(props: CardClusterProps) {
  const { cluster } = props

  return (
    <div data-testid={`cluster-list-${cluster.id}`} className="border border-element-light-lighter-400 rounded p-5">
      <div className="flex justify-between mb-5">
        <div className="flex">
          <Icon className="relative top-0.5 mr-3" name={cluster.cloud_provider} />
          <h2 className="flex items-center text-xs text-text-600 font-medium">
            <span className="block mr-2">{cluster.name}</span>
            <StatusChip status={cluster.status} />
          </h2>
        </div>
        <ClusterButtonsActions cluster={cluster} />
      </div>
      <div className="flex">
        {cluster.is_default && (
          <Tag className="text-accent2-500 border border-accent2-500 bg-accent2-50 mr-2">DEFAULT</Tag>
        )}
        <Tag className="text-text-400 border border-element-light-lighter-500 mr-2">{cluster.region}</Tag>
        <Tag className="text-text-400 border border-element-light-lighter-500 mr-2">{cluster.version}</Tag>
        <Tag className="text-text-400 border border-element-light-lighter-500">{cluster.instance_type}</Tag>
      </div>
    </div>
  )
}

export default CardCluster
