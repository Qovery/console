import { type Cluster, type ClusterStatus } from 'qovery-typescript-axios'
import { Link } from 'react-router-dom'
import { match } from 'ts-pattern'
import { IconEnum } from '@qovery/shared/enums'
import { CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import { Badge, Icon, Indicator, Skeleton, Tooltip } from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'
import { ClusterActionToolbar } from '../cluster-action-toolbar/cluster-action-toolbar'
import { ClusterRunningStatusBadge } from '../cluster-running-status-badge/cluster-running-status-badge'
import { ClusterType } from '../cluster-type/cluster-type'
import { useClusterRunningStatusSocket } from '../hooks/use-cluster-running-status/use-cluster-running-status'

export interface ClusterCardProps {
  cluster: Cluster
  clusterDeploymentStatus?: ClusterStatus
}

export function ClusterCard({ cluster, clusterDeploymentStatus }: ClusterCardProps) {
  useClusterRunningStatusSocket({ organizationId: cluster.organization.id, clusterId: cluster.id })

  const cloudProviderIcon = match(cluster.cloud_provider)
    .with('ON_PREMISE', () => IconEnum.KUBERNETES)
    .otherwise(() => cluster.cloud_provider)

  return (
    <Link
      to={CLUSTER_URL(cluster.organization.id, cluster.id) + CLUSTER_SETTINGS_URL}
      className="duration-50 flex flex-col gap-5 rounded border border-neutral-200 p-5 shadow-sm outline outline-2 outline-transparent transition-all hover:border-brand-500 hover:-outline-offset-2 hover:outline-brand-500"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-6">
          <Indicator
            align="end"
            side="right"
            className="bottom-1 right-0.5"
            content={
              cluster.cloud_provider !== 'ON_PREMISE' && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white p-0.5">
                  <Icon className="h-5 w-5" name={IconEnum.QOVERY} />
                </div>
              )
            }
          >
            <Icon width={36} height={36} name={cloudProviderIcon} />
          </Indicator>
          <div className="flex flex-col gap-0.5">
            <Tooltip content={cluster.id} side="bottom">
              <span className="line-clamp-2 block text-base font-semibold text-neutral-400">{cluster.name}</span>
            </Tooltip>
            {cluster.created_at && (
              <span className="text-sm font-medium text-neutral-300">{timeAgo(new Date(cluster.created_at))}</span>
            )}
          </div>
        </div>
        <div className="mt-0.5 flex min-w-28 items-center justify-end gap-1.5">
          <ClusterRunningStatusBadge cluster={cluster} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {cluster.kubernetes === 'SELF_MANAGED' ? (
          <>
            <Badge color="neutral">
              <Icon name={IconEnum.KUBERNETES} height={16} width={16} className="mr-1" />
              Self managed
            </Badge>
            {!cluster.is_demo && <Badge color="neutral">{cluster.region}</Badge>}
          </>
        ) : (
          <>
            <Badge color="neutral">
              <Icon name={IconEnum.QOVERY} height={16} width={16} className="mr-1" />
              Qovery managed
            </Badge>
            <ClusterType cloudProvider={cluster.cloud_provider} kubernetes={cluster.kubernetes} />
            <Badge color="neutral">{cluster.region}</Badge>
            {cluster.version && <Badge color="neutral">{cluster.version}</Badge>}
          </>
        )}
      </div>
      <hr />
      <div className="flex items-center justify-between">
        <Skeleton className="min-w-max" height={36} width={146} show={!clusterDeploymentStatus}>
          {clusterDeploymentStatus && (
            <div onClick={(e) => e.preventDefault()}>
              <ClusterActionToolbar cluster={cluster} clusterStatus={clusterDeploymentStatus} />
            </div>
          )}
        </Skeleton>
        {cluster.production && (
          <Badge variant="surface" color="red">
            Production
          </Badge>
        )}
        {cluster.is_demo && (
          <Badge variant="surface" color="sky">
            Demo
          </Badge>
        )}
      </div>
    </Link>
  )
}

export default ClusterCard
