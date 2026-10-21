import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import { type Cluster, type ClusterStatus } from 'qovery-typescript-axios'
import { type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { match } from 'ts-pattern'
import {
  AnimatedGradientText,
  Badge,
  Icon,
  Indicator,
  LogoIcon,
  Skeleton,
  Tooltip,
  linkVariants,
} from '@qovery/shared/ui'
import { dateFullFormat, timeAgo } from '@qovery/shared/util-dates'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { ClusterActions } from '../cluster-actions/cluster-actions'
import { ClusterAvatar } from '../cluster-avatar/cluster-avatar'
import { ClusterBadges } from '../cluster-badges/cluster-badges'
import { ClusterRunningStatusIndicator } from '../cluster-running-status-indicator/cluster-running-status-indicator'
import { useClusterRunningStatusSocket } from '../hooks/use-cluster-running-status-socket/use-cluster-running-status-socket'

// The whole card is already a link: render this shortcut as a span to avoid nesting <a> elements
function DeploymentsLink({
  cluster,
  color,
  className,
  children,
}: {
  cluster: Cluster
  color: 'brand' | 'red'
  className?: string
  children: ReactNode
}) {
  const navigate = useNavigate()

  const goToDeployments = (event: MouseEvent | KeyboardEvent) => {
    // Prevent the card link from handling the event
    event.preventDefault()
    event.stopPropagation()
    navigate({
      to: '/organization/$organizationId/cluster/$clusterId/deployments',
      params: {
        organizationId: cluster.organization.id,
        clusterId: cluster.id,
      },
    })
  }

  return (
    <span
      role="link"
      tabIndex={0}
      className={twMerge(linkVariants({ color, size: 'sm', underline: true }), className)}
      onClick={goToDeployments}
      onKeyDown={(event) => event.key === 'Enter' && goToDeployments(event)}
    >
      {children}
    </span>
  )
}

function Subtitle({ cluster, clusterDeploymentStatus }: { cluster: Cluster; clusterDeploymentStatus?: ClusterStatus }) {
  return match(clusterDeploymentStatus?.status)
    .with('DEPLOYMENT_QUEUED', 'DELETE_QUEUED', 'STOP_QUEUED', 'RESTART_QUEUED', (s) => (
      <span className="text-ssm font-normal text-neutral-subtle">{upperCaseFirstLetter(s).replace('_', ' ')}...</span>
    ))
    .with('BUILDING', 'DEPLOYING', 'CANCELING', 'DELETING', 'RESTARTING', 'STOPPING', 'DRY_RUN', (s) => (
      <DeploymentsLink cluster={cluster} color="brand" className="group flex truncate">
        <AnimatedGradientText shimmerWidth={80} className="group-hover:text-brand">
          <span className="flex items-center gap-0.5">
            {s === 'DRY_RUN' ? 'Evaluating changes (dry-run) ' : upperCaseFirstLetter(s) + '...'}{' '}
            <Icon iconName="arrow-up-right" />
          </span>
        </AnimatedGradientText>
      </DeploymentsLink>
    ))
    .with('BUILD_ERROR', 'DELETE_ERROR', 'DEPLOYMENT_ERROR', 'STOP_ERROR', 'RESTART_ERROR', () => (
      <DeploymentsLink cluster={cluster} color="red" className="truncate">
        Last deployment failed
        <Icon iconName="arrow-up-right" />
      </DeploymentsLink>
    ))
    .with('INVALID_CREDENTIALS', () => (
      <DeploymentsLink cluster={cluster} color="red">
        Invalid cloud credentials
        <Icon iconName="arrow-up-right" />
      </DeploymentsLink>
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
      className="duration-50 flex flex-col rounded-lg border border-neutral bg-surface-neutral p-5 pb-4 shadow-sm transition-all hover:border-brand-strong"
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
      <div className="mt-5 flex flex-wrap gap-2">
        <ClusterBadges cluster={cluster} />
      </div>
      <hr className="mt-5 border-neutral" />
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="min-w-max" height={36} width={146} show={!clusterDeploymentStatus}>
          {clusterDeploymentStatus && (
            <div onClick={(e) => e.preventDefault()}>
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
    </Link>
  )
}

export default ClusterCard
