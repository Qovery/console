import { Link, useRouter } from '@tanstack/react-router'
import { type Cluster, type ClusterStatus } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
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
import { ClusterActions } from '../cluster-actions/cluster-actions'
import { ClusterAvatar } from '../cluster-avatar/cluster-avatar'
import { ClusterBadges } from '../cluster-badges/cluster-badges'
import { ClusterRunningStatusIndicator } from '../cluster-running-status-indicator/cluster-running-status-indicator'
import { useClusterRunningStatusSocket } from '../hooks/use-cluster-running-status-socket/use-cluster-running-status-socket'

function Subtitle({ cluster, clusterDeploymentStatus }: { cluster: Cluster; clusterDeploymentStatus?: ClusterStatus }) {
  return match(clusterDeploymentStatus?.status)
    .with('DEPLOYMENT_QUEUED', 'DELETE_QUEUED', 'STOP_QUEUED', 'RESTART_QUEUED', (s) => (
      <span className="text-ssm font-normal text-neutral-subtle">{upperCaseFirstLetter(s).replace('_', ' ')}...</span>
    ))
    .with('BUILDING', 'DEPLOYING', 'CANCELING', 'DELETING', 'RESTARTING', 'STOPPING', 'DRY_RUN', (s) => (
      <LinkUI
        to="/organization/$organizationId/cluster/$clusterId/deployments"
        params={{
          organizationId: cluster.organization.id,
          clusterId: cluster.id,
        }}
        color="brand"
        underline
        size="sm"
        className="group pointer-events-auto flex truncate"
      >
        <AnimatedGradientText shimmerWidth={80} className="group-hover:text-brand">
          <span className="flex items-center gap-0.5">
            {s === 'DRY_RUN' ? 'Evaluating changes (dry-run) ' : upperCaseFirstLetter(s) + '...'}{' '}
            <Icon iconName="arrow-up-right" />
          </span>
        </AnimatedGradientText>
      </LinkUI>
    ))
    .with('BUILD_ERROR', 'DELETE_ERROR', 'DEPLOYMENT_ERROR', 'STOP_ERROR', 'RESTART_ERROR', () => (
      <LinkUI
        to="/organization/$organizationId/cluster/$clusterId/deployments"
        params={{
          organizationId: cluster.organization.id,
          clusterId: cluster.id,
        }}
        color="red"
        underline
        size="sm"
        className="pointer-events-auto truncate"
      >
        Last deployment failed
        <Icon iconName="arrow-up-right" />
      </LinkUI>
    ))
    .with('INVALID_CREDENTIALS', () => (
      <LinkUI
        to="/organization/$organizationId/cluster/$clusterId/deployments"
        params={{
          organizationId: cluster.organization.id,
          clusterId: cluster.id,
        }}
        color="red"
        underline
        size="sm"
        className="pointer-events-auto"
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
            <span className="pointer-events-auto max-w-max text-sm text-neutral-subtle">
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
  const overviewHref = buildLocation({
    to: '/organization/$organizationId/cluster/$clusterId/overview',
    params: { organizationId: cluster.organization.id, clusterId: cluster.id },
  }).href

  return (
    <div className="duration-50 relative flex flex-col rounded-lg border border-neutral bg-surface-neutral p-5 pb-4 shadow-sm transition-all hover:border-brand-strong">
      {/* Makes the whole card open the overview. It sits behind the content instead of wrapping it, because
          the card contains other links and buttons, which can't be nested in a link */}
      <Link to={overviewHref} aria-hidden="true" tabIndex={-1} className="absolute inset-0 rounded-lg" />
      {/* Lets clicks through to the card link, except on elements opting back in with pointer-events-auto */}
      <div className="pointer-events-none relative flex flex-col">
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
                <Link
                  to={overviewHref}
                  className="pointer-events-auto block max-w-max truncate text-base font-semibold leading-snug text-neutral"
                >
                  {cluster.name}
                </Link>
              </Tooltip>
              <Subtitle cluster={cluster} clusterDeploymentStatus={clusterDeploymentStatus} />
            </div>
          </div>
          {match(clusterDeploymentStatus?.status)
            .with('BUILDING', 'DEPLOYING', 'CANCELING', 'DELETING', 'RESTARTING', 'STOPPING', () => null)
            .otherwise(
              () =>
                clusterDeploymentStatus?.is_deployed && (
                  <div className="pointer-events-auto mt-1.5 flex-shrink-0">
                    <ClusterRunningStatusIndicator
                      cluster={cluster}
                      clusterDeploymentStatus={clusterDeploymentStatus?.status}
                    />
                  </div>
                )
            )}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <ClusterBadges cluster={cluster} />
        </div>
        <hr className="mt-5 border-neutral" />
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="min-w-max" height={36} width={146} show={!clusterDeploymentStatus}>
            {clusterDeploymentStatus && (
              <div className="pointer-events-auto">
                <ClusterActions cluster={cluster} clusterStatus={clusterDeploymentStatus} variant="card" />
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
      </div>
    </div>
  )
}

export default ClusterCard
