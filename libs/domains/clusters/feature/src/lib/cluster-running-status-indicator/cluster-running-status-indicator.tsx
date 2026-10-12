import clsx from 'clsx'
import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { type Cluster, type ClusterStateEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { match } from 'ts-pattern'
import { Badge, Icon, Popover, Skeleton, Tooltip } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { getClusterQuotaWarning } from '../cluster-quota-warning/cluster-quota-warning'
import { useClusterRunningDisplayStatus } from '../hooks/use-cluster-running-status/use-cluster-running-status'
import { useClusterStatus } from '../hooks/use-cluster-status/use-cluster-status'

function ClusterRunningStatusDot({ className, status }: { className: string; status: string }) {
  return (
    <span className="flex h-5 w-5 items-center justify-center">
      <Tooltip content={status}>
        <span aria-label={status} className={twMerge('block h-[9px] w-[9px] rounded-full border', className)} />
      </Tooltip>
    </span>
  )
}

export interface ClusterRunningStatusIndicatorProps {
  cluster: Cluster
  type?: 'dot' | 'full'
  clusterDeploymentStatus?: ClusterStateEnum
}

export function ClusterRunningStatusIndicator({
  type = 'full',
  cluster,
  clusterDeploymentStatus,
}: ClusterRunningStatusIndicatorProps) {
  const isFeatureFlag = useFeatureFlagVariantKey('cluster-running-status')

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const isNotInstalled = cluster.status === 'READY'

  const { data: runningStatus } = useClusterRunningDisplayStatus({
    organizationId: cluster.organization.id,
    clusterId: cluster.id,
  })

  const { data: deploymentStatus } = useClusterStatus({
    organizationId: cluster.organization.id,
    clusterId: cluster.id,
    enabled: clusterDeploymentStatus === undefined,
    refetchInterval: 4_000,
  })

  const quotaWarning = getClusterQuotaWarning(runningStatus)

  if ((clusterDeploymentStatus ?? deploymentStatus?.status) === 'STOPPED') {
    return type === 'dot' ? (
      <ClusterRunningStatusDot status="Stopped" className="border-neutral-subtle bg-surface-neutral-solid" />
    ) : (
      <Badge variant="surface" color="neutral" className="items-center gap-2 pr-2">
        Stopped
        <span className="block h-2 w-2 rounded-full bg-surface-neutral-solid" />
      </Badge>
    )
  }

  if (isNotInstalled) {
    return type === 'dot' ? (
      <ClusterRunningStatusDot status="Not installed" className="border-neutral-subtle bg-surface-neutral-solid" />
    ) : (
      <Badge variant="surface" color="neutral" className="items-center gap-2 pr-2">
        Not installed
        <span className="block h-2 w-2 rounded-full bg-surface-neutral-solid" />
      </Badge>
    )
  }

  if (runningStatus === undefined) {
    return type === 'dot' ? (
      <span className="flex h-5 w-5 items-center justify-center">
        <Skeleton width={9} height={9} rounded />
      </span>
    ) : (
      <Skeleton width={80} height={24} />
    )
  }

  return match(runningStatus === 'NotFound' ? undefined : runningStatus.computed_status)
    .with({ global_status: 'RUNNING' }, (s) =>
      type === 'dot' ? (
        <ClusterRunningStatusDot status="Running" className="border-positive-subtle bg-surface-positive-solid" />
      ) : (
        <Badge variant="surface" color="green" className="items-center gap-2 pr-2 capitalize">
          {s.global_status.toLowerCase()}
          <span className="block h-2 w-2 rounded-full bg-surface-positive-solid" />
        </Badge>
      )
    )
    .with({ global_status: 'WARNING' }, (s) => {
      const nodeWarnings = Object.entries(s.node_warnings)
      const warningCount = nodeWarnings.length + (quotaWarning ? 1 : 0)
      const shouldDisplayWarning = Boolean(isFeatureFlag || quotaWarning)

      return type === 'dot' ? (
        <ClusterRunningStatusDot
          status={quotaWarning ? `Quota issue${quotaWarning.resource ? `: ${quotaWarning.resource}` : ''}` : 'Warning'}
          className="border-warning-subtle bg-surface-warning-solid"
        />
      ) : (
        <Popover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <Popover.Trigger disabled={!shouldDisplayWarning}>
            <Badge
              variant="surface"
              color={shouldDisplayWarning ? 'yellow' : 'green'}
              className="items-center gap-1.5 pr-2 capitalize"
              onClick={(e) => {
                // XXX: To avoid link redirection from the parent, we need to manage onOpenChange
                e.preventDefault()
                e.stopPropagation()
                setIsPopoverOpen((prev) => !prev)
              }}
            >
              {shouldDisplayWarning && (
                <span className="flex h-4 w-4 items-center justify-center rounded bg-surface-warning-solidHover text-xs font-semibold text-neutralInvert">
                  {warningCount}
                </span>
              )}
              {shouldDisplayWarning ? s.global_status.toLowerCase() : 'Running'}
              {warningCount === 0 ? (
                <span className="block h-2 w-2 rounded-full bg-surface-positive-solid" />
              ) : shouldDisplayWarning ? (
                <Icon iconName="chevron-down" className="text-warning" />
              ) : (
                <span className="block h-2 w-2 rounded-full bg-surface-positive-solid" />
              )}
            </Badge>
          </Popover.Trigger>
          <Popover.Content className="w-full max-w-96 border border-neutral bg-surface-neutralInvert-component p-0 text-sm text-neutralInvert">
            {quotaWarning && (
              <div className="flex items-center gap-[9px] border-b border-neutral p-1 before:block before:w-[3px] before:self-stretch before:bg-surface-warning-solid last:border-0">
                <span className="py-1 pr-1">
                  {quotaWarning.provider} quota issue
                  {quotaWarning.resource ? `: ${quotaWarning.resource}` : ''}. {quotaWarning.message}
                </span>
              </div>
            )}
            {nodeWarnings.map(([key, message]) => (
              <div
                key={key}
                className={twMerge(
                  clsx(
                    'flex items-center gap-[9px] border-b border-neutral p-1 before:block before:w-[3px] before:self-stretch before:bg-surface-warning-solid last:border-0',
                    {
                      'before:bg-surface-positive-solid': !shouldDisplayWarning,
                    }
                  )
                )}
              >
                <span className="py-1 pr-1">
                  {message.map((value, index) => (
                    <div className="mb-1 flex items-center last:mb-0" key={index}>
                      {key}: {value.reason} {value.message}
                    </div>
                  ))}
                </span>
              </div>
            ))}
          </Popover.Content>
        </Popover.Root>
      )
    })
    .with({ global_status: 'ERROR' }, (s) =>
      type === 'dot' ? (
        <ClusterRunningStatusDot status="Error" className="border-negative-subtle bg-surface-negative-solid" />
      ) : (
        <Popover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <Popover.Trigger disabled={!isFeatureFlag}>
            <Badge
              variant="surface"
              color={isFeatureFlag ? 'red' : 'green'}
              className={twMerge(
                clsx('items-center gap-1.5 border-negative-subtle pr-2 capitalize', {
                  'border-positive-subtle': !isFeatureFlag,
                })
              )}
              onClick={(e) => {
                // XXX: To avoid link redirection from the parent, we need to manage onOpenChange
                e.preventDefault()
                e.stopPropagation()
                setIsPopoverOpen((prev) => !prev)
              }}
            >
              {isFeatureFlag && (
                <span className="flex h-4 w-4 items-center justify-center rounded bg-surface-negative-solid text-xs font-semibold text-neutralInvert">
                  {s.qovery_components_in_failure.length}
                </span>
              )}
              {isFeatureFlag ? s.global_status.toLowerCase() : 'Running'}
              {s.qovery_components_in_failure.length === 0 ? (
                <span className="block h-2 w-2 rounded-full bg-current" />
              ) : isFeatureFlag ? (
                <Icon iconName="chevron-down" className="text-surface-negative-solid" />
              ) : (
                <span className="block h-2 w-2 rounded-full bg-current" />
              )}
            </Badge>
          </Popover.Trigger>
          <Popover.Content className="w-full max-w-96 border border-neutral bg-surface-neutralInvert-component p-0 text-sm text-neutralInvert">
            {s.qovery_components_in_failure.map((c) => (
              <div
                key={c.component_name}
                className={twMerge(
                  clsx(
                    'flex items-center gap-[9px] border-b border-neutral p-1 before:block before:h-full before:min-h-7 before:w-[3px] before:bg-surface-negative-solid last:border-0',
                    {
                      'before:bg-surface-positive-solid': !isFeatureFlag,
                    }
                  )
                )}
              >
                <span className="py-1 pr-1">
                  {c.type}: {c.component_name}
                </span>
              </div>
            ))}
          </Popover.Content>
        </Popover.Root>
      )
    )
    .otherwise(() =>
      type === 'dot' ? (
        <ClusterRunningStatusDot
          status="Status unavailable"
          className="border-neutral-subtle bg-surface-neutral-solid"
        />
      ) : (
        <Tooltip content="Qovery cannot retrieve the cluster health. Retrying automatically.">
          <Badge variant="surface" color="neutral" className="items-center gap-2 border-neutral-component pr-2">
            <span className="text-neutral">Status unavailable</span>
            <span className="block h-2 w-2 rounded-full bg-surface-neutral-solid" />
          </Badge>
        </Tooltip>
      )
    )
}

export default ClusterRunningStatusIndicator
