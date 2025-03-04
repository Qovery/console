import clsx from 'clsx'
import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { type Cluster } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { match } from 'ts-pattern'
import { Badge, Icon, Popover, Skeleton, Tooltip } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useClusterRunningStatus } from '../hooks/use-cluster-running-status/use-cluster-running-status'

export interface ClusterRunningStatusBadgeProps {
  cluster: Cluster
}

export function ClusterRunningStatusBadge({ cluster }: ClusterRunningStatusBadgeProps) {
  const isFeatureFlag = useFeatureFlagVariantKey('cluster-running-status')

  const [isTimeout, setIsTimeout] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const isNotInstalled = cluster.status === 'READY'

  const { data: runningStatus, isLoading } = useClusterRunningStatus({
    organizationId: cluster.organization.id,
    clusterId: cluster.id,
  })

  useEffect(() => {
    if (runningStatus === undefined) {
      const timeoutId = setTimeout(() => {
        if (runningStatus === undefined) {
          setIsTimeout(true)
        }
      }, 3000)

      return () => clearTimeout(timeoutId)
    }
    return
  }, [runningStatus])

  if (isNotInstalled) {
    return (
      <Badge variant="surface" color="neutral" className="items-center gap-2 border-[#A0AFC54D] pr-2">
        <span className="text-neutral-400">Not installed</span>
        <span className="block h-2 w-2 rounded-full bg-neutral-300" />
      </Badge>
    )
  }

  if (isLoading && !runningStatus) {
    return <Skeleton width={80} height={24} />
  }

  if (isTimeout && !runningStatus) {
    if (cluster.is_demo) {
      return (
        <Tooltip content="Cannot fetch the cluster status. Check the installation guide">
          <Badge variant="surface" color="neutral" className="items-center gap-2 border-[#A0AFC54D] pr-2">
            <span className="text-neutral-400">Unknown</span>
            <span className="block h-2 w-2 rounded-full bg-neutral-300" />
          </Badge>
        </Tooltip>
      )
    } else {
      return (
        <Tooltip content="Cannot fetch the cluster status. Please contact us if the issue persists">
          <Badge variant="surface" color="red" className="items-center gap-2 border-[#FF62404D] pr-2">
            <span className="truncate text-neutral-400">Status unavailable</span>
            <span className="block h-2 w-2 rounded-full bg-current" />
          </Badge>
        </Tooltip>
      )
    }
  }

  return match(runningStatus?.computed_status)
    .with({ global_status: 'RUNNING' }, (s) => (
      <Badge variant="surface" color="green" className="items-center gap-2 border-[#44C9794D] pr-2 capitalize">
        <span className="text-neutral-400">{s.global_status.toLowerCase()}</span>
        <span className="block h-2 w-2 rounded-full bg-current" />
      </Badge>
    ))
    .with({ global_status: 'WARNING' }, (s) => (
      <Popover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <Popover.Trigger>
          <Badge
            variant="surface"
            color={isFeatureFlag ? 'yellow' : 'green'}
            className="items-center gap-1.5 border-[#D1A0024D] pr-2 capitalize"
            onClick={(e) => {
              // XXX: To avoid link redirection from the parent, we need to manage onOpenChange
              e.preventDefault()
              e.stopPropagation()
              setIsPopoverOpen((prev) => !prev)
            }}
          >
            <span
              className={twMerge(
                clsx(
                  'flex h-4 w-4 items-center justify-center rounded bg-yellow-700 text-xs font-semibold text-white',
                  {
                    'bg-green-500': !isFeatureFlag,
                  }
                )
              )}
            >
              {Object.keys(s.node_warnings).length}
            </span>
            <span className="text-neutral-400">{isFeatureFlag ? s.global_status.toLowerCase() : 'Running'}</span>
            {Object.entries(s.node_warnings).length === 0 ? (
              <span className="block h-2 w-2 rounded-full bg-current" />
            ) : (
              <Icon iconName="chevron-down" className="text-neutral-400" />
            )}
          </Badge>
        </Popover.Trigger>
        <Popover.Content className="w-full max-w-96 border border-neutral-400 bg-neutral-700 p-0 text-sm text-white">
          {Object.entries(s.node_warnings).map(([key, message]) => (
            <div
              key={key}
              className={twMerge(
                clsx(
                  'flex items-center gap-[9px] border-b border-neutral-400 p-1 before:block before:h-full before:min-h-7 before:w-[3px] before:bg-yellow-500 last:border-0',
                  {
                    'before:bg-green-500': !isFeatureFlag,
                  }
                )
              )}
            >
              <span className="py-1 pr-1">
                {key}: {message}
              </span>
            </div>
          ))}
        </Popover.Content>
      </Popover.Root>
    ))
    .with({ global_status: 'ERROR' }, (s) => (
      <Popover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <Popover.Trigger>
          <Badge
            variant="surface"
            color={isFeatureFlag ? 'red' : 'green'}
            className={twMerge(
              clsx('items-center gap-1.5 border-[#FF62404D] pr-2 capitalize', {
                'border-[#44C9794D]': !isFeatureFlag,
              })
            )}
            onClick={(e) => {
              // XXX: To avoid link redirection from the parent, we need to manage onOpenChange
              e.preventDefault()
              e.stopPropagation()
              setIsPopoverOpen((prev) => !prev)
            }}
          >
            <span
              className={twMerge(
                clsx('flex h-4 w-4 items-center justify-center rounded bg-red-500 text-xs font-semibold text-white', {
                  'bg-green-500': !isFeatureFlag,
                })
              )}
            >
              {s.qovery_components_in_failure.length}
            </span>
            <span className="text-neutral-400">{isFeatureFlag ? s.global_status.toLowerCase() : 'Running'}</span>
            {s.qovery_components_in_failure.length === 0 ? (
              <span className="block h-2 w-2 rounded-full bg-current" />
            ) : (
              <Icon iconName="chevron-down" className="text-neutral-400" />
            )}
          </Badge>
        </Popover.Trigger>
        <Popover.Content className="w-full max-w-96 border border-neutral-400 bg-neutral-700 p-0 text-sm text-white">
          {s.qovery_components_in_failure.map((c) => (
            <div
              key={c.component_name}
              className={twMerge(
                clsx(
                  'flex items-center gap-[9px] border-b border-neutral-400 p-1 before:block before:h-full before:min-h-7 before:w-[3px] before:bg-red-500 last:border-0',
                  {
                    'before:bg-green-500': !isFeatureFlag,
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
    ))
    .otherwise(() => (
      <Badge
        variant="surface"
        color={isFeatureFlag ? 'red' : 'green'}
        className={twMerge(
          clsx('items-center gap-2 border-[#FF62404D] pr-2', {
            'border-[#44C9794D]': !isFeatureFlag,
          })
        )}
      >
        <span className="truncate text-neutral-400">{isFeatureFlag ? 'Status unavailable' : 'Running'}</span>
        <span className="block h-2 w-2 rounded-full bg-current" />
      </Badge>
    ))
}

export default ClusterRunningStatusBadge
