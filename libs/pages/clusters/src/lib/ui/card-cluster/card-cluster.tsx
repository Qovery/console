import { ClusterStateEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { ClusterType } from '@qovery/domains/clusters/feature'
import { ClusterButtonsActions } from '@qovery/shared/console-shared'
import { type ClusterEntity } from '@qovery/shared/interfaces'
import { Badge, Icon, Skeleton, StatusChip } from '@qovery/shared/ui'
import { getStatusClusterMessage } from '@qovery/shared/util-js'

export interface CardClusterProps {
  cluster: ClusterEntity
}

export const getColorForStatus = (status?: ClusterStateEnum): string => {
  return match(status)
    .with(
      ClusterStateEnum.DEPLOYMENT_QUEUED,
      ClusterStateEnum.DEPLOYING,
      ClusterStateEnum.DEPLOYED,
      ClusterStateEnum.STOP_QUEUED,
      ClusterStateEnum.STOPPING,
      ClusterStateEnum.DELETE_QUEUED,
      ClusterStateEnum.DELETING,
      () => 'text-orange-500'
    )
    .with(
      ClusterStateEnum.STOP_ERROR,
      ClusterStateEnum.DELETE_ERROR,
      ClusterStateEnum.DEPLOYMENT_ERROR,
      ClusterStateEnum.BUILD_ERROR,
      ClusterStateEnum.INVALID_CREDENTIALS,
      () => 'text-red-500'
    )
    .otherwise(() => 'text-brand-500')
}

export function CardCluster(props: CardClusterProps) {
  const { cluster } = props

  const statusLoading = !!cluster.extendedStatus?.status?.status

  return (
    <div data-testid={`cluster-list-${cluster.id}`} className="border border-neutral-200 rounded p-5">
      <div className="flex justify-between mb-5">
        <div className="flex items-center">
          <Icon className="mr-3" name={cluster.cloud_provider} />
          <div className="flex flex-col">
            <div className="flex">
              <h2 className="flex items-center text-xs text-neutral-400 font-medium">
                <span className="block mr-2">{cluster.name}</span>
                <StatusChip status={cluster.extendedStatus?.status?.status} />
              </h2>
            </div>
            <Skeleton height={12} width={100} show={!statusLoading}>
              <p
                data-testid="status-message"
                className={`text-2xs mt-0.5 font-medium ${getColorForStatus(cluster.extendedStatus?.status?.status)}`}
              >
                {getStatusClusterMessage(
                  cluster.extendedStatus?.status?.status,
                  cluster.extendedStatus?.status?.is_deployed
                )}
              </p>
            </Skeleton>
          </div>
        </div>
        <Skeleton height={32} width={146} show={!statusLoading}>
          <ClusterButtonsActions cluster={cluster} />
        </Skeleton>
      </div>
      <div className="flex flex-wrap gap-2">
        {cluster.production && (
          <Badge size="xs" color="brand" data-testid="tag-prod">
            Production
          </Badge>
        )}
        {cluster.is_default && (
          <Badge size="xs" color="sky" variant="surface" data-testid="tag-default">
            Default
          </Badge>
        )}
        <ClusterType size="xs" cloudProvider={cluster.cloud_provider} kubernetes={cluster.kubernetes} />
        <Badge size="xs" color="neutral" data-testid="tag-region">
          {cluster.region}
        </Badge>
        <Badge size="xs" color="neutral" data-testid="tag-version">
          {cluster.version}
        </Badge>
        <Badge size="xs" color="neutral" data-testid="tag-instance">
          {cluster.instance_type?.replace('_', '.').toLowerCase()}
        </Badge>
      </div>
    </div>
  )
}

export default CardCluster
