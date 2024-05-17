import { type Cluster, ClusterStateEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { ClusterActionToolbar, ClusterType, useClusterStatus } from '@qovery/domains/clusters/feature'
import { IconEnum } from '@qovery/shared/enums'
import { Badge, Icon, Skeleton, StatusChip } from '@qovery/shared/ui'
import { getStatusClusterMessage } from '@qovery/shared/util-js'

export interface CardClusterProps {
  cluster: Cluster
  organizationId: string
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

export function CardCluster({ organizationId, cluster }: CardClusterProps) {
  const { data: clusterStatus, isLoading: isClusterStatusLoading } = useClusterStatus({
    organizationId,
    clusterId: cluster.id,
    refetchInterval: 3000,
  })

  const cardIcon = match(cluster.cloud_provider)
    .with('ON_PREMISE', () => IconEnum.KUBERNETES)
    .otherwise(() => cluster.cloud_provider)

  return (
    <div data-testid={`cluster-list-${cluster.id}`} className="border border-neutral-200 rounded p-5">
      <div className="flex justify-between gap-4 mb-5">
        <div className="flex items-center">
          <Icon className="mr-3" name={cardIcon} />
          <div className="flex flex-col">
            <div className="flex">
              <h2 className="inline-flex basis-40 items-center text-xs text-neutral-400 font-medium">
                <span className="block mr-2 line-clamp-2">{cluster.name}</span>
                <StatusChip status={clusterStatus?.status} />
              </h2>
            </div>
            <Skeleton height={12} width={100} show={isClusterStatusLoading}>
              <p
                data-testid="status-message"
                className={`text-2xs mt-0.5 font-medium ${getColorForStatus(clusterStatus?.status)}`}
              >
                {getStatusClusterMessage(clusterStatus?.status, clusterStatus?.is_deployed)}
              </p>
            </Skeleton>
          </div>
        </div>
        <Skeleton className="min-w-max" height={36} width={146} show={isClusterStatusLoading}>
          {clusterStatus && <ClusterActionToolbar cluster={cluster} clusterStatus={clusterStatus} />}
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
        {cluster.kubernetes === 'SELF_MANAGED' ? (
          <Badge size="xs" color="neutral">
            <Icon name={IconEnum.KUBERNETES} height={16} width={16} className="mr-1" />
            Self managed
          </Badge>
        ) : (
          <>
            <Badge size="xs" color="neutral">
              <Icon name={IconEnum.QOVERY} height={16} width={16} className="mr-1" />
              Qovery managed
            </Badge>
            <ClusterType size="xs" cloudProvider={cluster.cloud_provider} kubernetes={cluster.kubernetes} />
          </>
        )}
        <Badge size="xs" color="neutral" data-testid="tag-region">
          {cluster.region}
        </Badge>
        {cluster.version && (
          <Badge size="xs" color="neutral" data-testid="tag-version">
            {cluster.version}
          </Badge>
        )}
        {cluster.instance_type && (
          <Badge size="xs" color="neutral" data-testid="tag-instance">
            {cluster.instance_type.replace('_', '.').toLowerCase()}
          </Badge>
        )}
      </div>
    </div>
  )
}

export default CardCluster
