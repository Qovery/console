import { type Cluster, type ClusterStatus } from 'qovery-typescript-axios'
import { Link } from 'react-router-dom'
import { match } from 'ts-pattern'
import { IconEnum } from '@qovery/shared/enums'
import { CLUSTER_SETTINGS_URL, CLUSTER_URL, INFRA_LOGS_URL } from '@qovery/shared/routes'
import { AnimatedGradientText, Badge, Icon, Indicator, Link as LinkQ, Skeleton, Tooltip } from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { ClusterActionToolbar } from '../cluster-action-toolbar/cluster-action-toolbar'
import { ClusterAvatar } from '../cluster-avatar/cluster-avatar'
import { ClusterRunningStatusBadge } from '../cluster-running-status-badge/cluster-running-status-badge'
import { ClusterType } from '../cluster-type/cluster-type'
import { useClusterRunningStatusSocket } from '../hooks/use-cluster-running-status/use-cluster-running-status'

function Subtitle({ cluster, clusterDeploymentStatus }: { cluster: Cluster; clusterDeploymentStatus?: ClusterStatus }) {
  return match(clusterDeploymentStatus?.status)
    .with('BUILDING', 'DEPLOYING', 'CANCELING', (s) => (
      <LinkQ
        to={INFRA_LOGS_URL(cluster.organization.id, cluster.id)}
        color="brand"
        underline
        size="sm"
        className="group flex truncate"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatedGradientText shimmerWidth={80} className="group-hover:text-brand-500">
          <span className="flex items-center gap-0.5">
            {upperCaseFirstLetter(s)}... <Icon iconName="arrow-up-right" />
          </span>
        </AnimatedGradientText>
      </LinkQ>
    ))
    .otherwise(
      () =>
        cluster.created_at && <span className="text-sm text-neutral-350">{timeAgo(new Date(cluster.created_at))}</span>
    )
}

export interface ClusterCardProps {
  cluster: Cluster
  clusterDeploymentStatus?: ClusterStatus
}

export function ClusterCard({ cluster, clusterDeploymentStatus }: ClusterCardProps) {
  useClusterRunningStatusSocket({ organizationId: cluster.organization.id, clusterId: cluster.id })

  return (
    <Link
      to={CLUSTER_URL(cluster.organization.id, cluster.id) + CLUSTER_SETTINGS_URL}
      className="duration-50 flex flex-col gap-5 rounded border border-neutral-200 p-5 shadow-sm outline outline-2 outline-transparent transition-all hover:border-brand-500 hover:-outline-offset-2 hover:outline-brand-500"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Indicator
            align="end"
            side="right"
            className="right-4 top-0"
            content={
              cluster.cloud_provider !== 'ON_PREMISE' && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white p-0.5">
                  <Icon className="h-5 w-5" name={IconEnum.QOVERY} />
                </div>
              )
            }
          >
            <ClusterAvatar cluster={cluster} className="h-9 w-9" />
          </Indicator>
          <div className="flex flex-col gap-1.5">
            <Tooltip content={cluster.id} side="bottom">
              <span className=" block text-base font-semibold leading-snug text-neutral-400">{cluster.name}</span>
            </Tooltip>
            <Subtitle cluster={cluster} clusterDeploymentStatus={clusterDeploymentStatus} />
          </div>
        </div>
        <div className="mt-1.5">
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
            {cluster.region !== 'on-premise' && (
              <Badge color="neutral" variant="surface">
                {cluster.region}
              </Badge>
            )}
          </>
        ) : (
          <>
            <Badge color="neutral">
              <Icon name={IconEnum.QOVERY} height={16} width={16} className="mr-1" />
              Qovery managed
            </Badge>
            <ClusterType cloudProvider={cluster.cloud_provider} kubernetes={cluster.kubernetes} />
            {cluster.region !== 'on-premise' && (
              <Badge color="neutral" variant="surface">
                {cluster.region}
              </Badge>
            )}
            {cluster.version && (
              <Badge color="neutral" variant="surface">
                {cluster.version}
              </Badge>
            )}
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
      </div>
    </Link>
  )
}

export default ClusterCard
