import { Link, useRouter } from '@tanstack/react-router'
import { type Cluster, type ClusterStatus } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { IconEnum } from '@qovery/shared/enums'
import {
  AnimatedGradientText,
  Badge,
  Icon,
  Indicator,
  Link as LinkUI,
  LogoIcon,
  Skeleton,
  Tooltip,
} from '@qovery/shared/ui'
import { dateFullFormat, timeAgo } from '@qovery/shared/util-dates'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { ClusterActionToolbar } from '../cluster-action-toolbar/cluster-action-toolbar'
import { ClusterAvatar } from '../cluster-avatar/cluster-avatar'
import { ClusterRunningStatusIndicator } from '../cluster-running-status-indicator/cluster-running-status-indicator'
import { ClusterType } from '../cluster-type/cluster-type'
import { useClusterRunningStatusSocket } from '../hooks/use-cluster-running-status-socket/use-cluster-running-status-socket'
import { hasGpuInstance } from '../utils/has-gpu-instance'

function Subtitle({ cluster, clusterDeploymentStatus }: { cluster: Cluster; clusterDeploymentStatus?: ClusterStatus }) {
  return match(clusterDeploymentStatus?.status)
    .with('DEPLOYMENT_QUEUED', 'DELETE_QUEUED', 'STOP_QUEUED', 'RESTART_QUEUED', (s) => (
      <span className="text-ssm font-normal text-neutral-350">{upperCaseFirstLetter(s).replace('_', ' ')}...</span>
    ))
    .with('BUILDING', 'DEPLOYING', 'CANCELING', 'DELETING', 'RESTARTING', 'STOPPING', 'DRY_RUN', (s) => (
      <LinkUI
        to="/organization/$organizationId/cluster/$clusterId/cluster-logs"
        params={{
          organizationId: cluster.organization.id,
          clusterId: cluster.id,
        }}
        color="brand"
        underline
        size="sm"
        className="group flex truncate"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatedGradientText shimmerWidth={80} className="group-hover:text-brand-11">
          <span className="flex items-center gap-0.5">
            {s === 'DRY_RUN' ? 'Evaluating changes (dry-run) ' : upperCaseFirstLetter(s) + '...'}{' '}
            <Icon iconName="arrow-up-right" />
          </span>
        </AnimatedGradientText>
      </LinkUI>
    ))
    .with('BUILD_ERROR', 'DELETE_ERROR', 'DEPLOYMENT_ERROR', 'STOP_ERROR', 'RESTART_ERROR', () => (
      <LinkUI
        to="/organization/$organizationId/cluster/$clusterId/cluster-logs"
        params={{
          organizationId: cluster.organization.id,
          clusterId: cluster.id,
        }}
        color="red"
        underline
        size="sm"
        className="truncate"
        onClick={(e) => e.stopPropagation()}
      >
        Last deployment failed
        <Icon iconName="arrow-up-right" />
      </LinkUI>
    ))
    .with('INVALID_CREDENTIALS', () => (
      <LinkUI
        to="/organization/$organizationId/cluster/$clusterId/cluster-logs"
        params={{
          organizationId: cluster.organization.id,
          clusterId: cluster.id,
        }}
        color="red"
        underline
        size="sm"
        onClick={(e) => e.stopPropagation()}
      >
        Invalid cloud credentials
        <Icon iconName="arrow-up-right" />
      </LinkUI>
    ))
    .otherwise(
      () =>
        clusterDeploymentStatus?.last_deployment_date && (
          <Tooltip
            content={`Last deployment: ${dateFullFormat(clusterDeploymentStatus.last_deployment_date)}`}
            disabled={!clusterDeploymentStatus.last_deployment_date}
          >
            <span className="max-w-max text-sm text-neutral-subtle">
              {timeAgo(new Date(clusterDeploymentStatus.last_deployment_date))}
            </span>
          </Tooltip>
        )
    )
}

export interface ClusterCardProps {
  cluster: Cluster
  clusterDeploymentStatus?: ClusterStatus
}

export function ClusterCard({ cluster, clusterDeploymentStatus }: ClusterCardProps) {
  useClusterRunningStatusSocket({ organizationId: cluster.organization.id, clusterId: cluster.id })
  const { buildLocation } = useRouter()

  return (
    <Link
      to={
        buildLocation({
          to: '/organization/$organizationId/cluster/$clusterId/overview',
          params: { organizationId: cluster.organization.id, clusterId: cluster.id },
        }).href
      }
      className="duration-50 flex flex-col gap-5 rounded-lg border border-neutral bg-surface-neutral p-5 shadow-sm transition-all hover:border-brand-strong"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Indicator
            align="end"
            side="right"
            className="right-4 top-0 flex-shrink-0"
            content={
              cluster.cloud_provider !== 'ON_PREMISE' && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-neutral p-0.5">
                  <LogoIcon width={20} height={20} />
                </div>
              )
            }
          >
            <ClusterAvatar cluster={cluster} className="h-9 w-9" />
          </Indicator>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Tooltip content={cluster.id} side="bottom">
              <span className="block max-w-max truncate text-base font-semibold leading-snug text-neutral">
                {cluster.name}
              </span>
            </Tooltip>
            <Subtitle cluster={cluster} clusterDeploymentStatus={clusterDeploymentStatus} />
          </div>
        </div>
        {match(clusterDeploymentStatus?.status)
          .with('BUILDING', 'DEPLOYING', 'CANCELING', 'DELETING', 'RESTARTING', 'STOPPING', () => null)
          .otherwise(
            () =>
              clusterDeploymentStatus?.is_deployed && (
                <div className="mt-1.5 flex-shrink-0">
                  <ClusterRunningStatusIndicator
                    cluster={cluster}
                    clusterDeploymentStatus={clusterDeploymentStatus?.status}
                  />
                </div>
              )
          )}
      </div>
      <div className="flex flex-wrap gap-2">
        {cluster.kubernetes === 'SELF_MANAGED' ? (
          <>
            <Badge color="neutral">
              <Icon name={IconEnum.KUBERNETES} height={16} width={16} className="mr-1" />
              Self managed
            </Badge>
            {cluster.cloud_provider !== 'ON_PREMISE' && (
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
            <ClusterType
              cloudProvider={cluster.cloud_provider}
              kubernetes={cluster.kubernetes}
              instanceType={cluster.instance_type}
            />
            {cluster.cloud_provider !== 'ON_PREMISE' && (
              <Badge color="neutral" variant="surface">
                {cluster.region}
              </Badge>
            )}
            {cluster.version && (
              <Badge color="neutral" variant="surface">
                {cluster.version}
              </Badge>
            )}
            {hasGpuInstance(cluster) && (
              <Badge color="neutral" variant="surface">
                GPU pool
              </Badge>
            )}
          </>
        )}
      </div>
      <hr className="border-neutral" />
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
