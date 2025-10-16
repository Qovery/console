import { useMemo, useState } from 'react'
import { useQueryParams } from 'use-query-params'
import { type AnyService } from '@qovery/domains/services/data-access'
import { type Pod, useMetrics, useRunningStatus } from '@qovery/domains/services/feature'
import { Button, Popover, Skeleton, Tooltip } from '@qovery/shared/ui'
import { getColorByPod } from '@qovery/shared/util-hooks'
import { pluralize, twMerge } from '@qovery/shared/util-js'
import { queryParamsServiceLogs } from '../list-service-logs/service-logs-context/service-logs-context'

export function PodHealthChips({ service }: { service: AnyService }) {
  const [open, setOpen] = useState(false)

  const handleMouseEnter = () => setOpen(true)

  const handleMouseLeave = () => setOpen(false)

  const { data: metrics = [], isLoading: isMetricsLoading } = useMetrics({
    environmentId: service?.environment.id,
    serviceId: service?.id,
  })
  const { data: runningStatuses, isLoading: isRunningStatusesLoading } = useRunningStatus({
    environmentId: service?.environment.id,
    serviceId: service?.id,
  })

  const [, setQueryParams] = useQueryParams(queryParamsServiceLogs)

  const pods: Pod[] = useMemo(() => {
    // NOTE: metrics or runningStatuses could be undefined because backend doesn't have the info.
    // So we must find all possible pods by merging the two into a Set.
    const podNames = new Set([
      ...(runningStatuses?.pods.map(({ name }) => name) ?? []),
      ...(metrics?.map(({ pod_name }) => pod_name) ?? []),
    ])

    return [...podNames].map((podName) => ({
      ...(metrics?.find(({ pod_name }) => pod_name === podName) ?? {}),
      ...(runningStatuses?.pods.find(({ name }) => name === podName) ?? {}),
      podName,
    }))
  }, [metrics, runningStatuses])

  // Group pods by their status using the same logic as sidebar
  const podsByStatus = useMemo(() => {
    const groups = {
      running: [] as Pod[],
      starting: [] as Pod[],
      warning: [] as Pod[],
      failing: [] as Pod[],
      other: [] as Pod[],
    }

    pods.forEach((pod) => {
      const state = pod.state?.toUpperCase()

      if (state === 'RUNNING' || state === 'COMPLETED') {
        groups.running.push(pod)
      } else if (state === 'STARTING' || state === 'STOPPING') {
        groups.starting.push(pod)
      } else if (state === 'WARNING') {
        groups.warning.push(pod)
      } else if (state === 'ERROR') {
        groups.failing.push(pod)
      } else {
        groups.other.push(pod)
      }
    })

    return groups
  }, [pods])

  const getStatusChipClassNames = (
    color: 'green' | 'purple' | 'yellow' | 'red' | 'neutral',
    isOpen: boolean
  ): string => {
    switch (color) {
      case 'green':
        return isOpen
          ? 'border-green-500/20 bg-green-500/10 text-green-500'
          : 'bg-green-500/10 text-green-500 hover:border-green-500/20 focus:border-green-500/20 active:border-green-500/20'
      case 'purple':
        return isOpen
          ? 'border-purple-400/20 bg-purple-400/10 text-[#CB1D63]'
          : 'bg-purple-400/10 text-[#CB1D63] hover:border-purple-400/20 focus:border-purple-400/20 active:border-purple-400/20'
      case 'yellow':
        return isOpen
          ? 'border-yellow-400/20 bg-yellow-400/10 text-yellow-500'
          : 'bg-yellow-400/10 text-yellow-500 hover:border-yellow-400/20 focus:border-yellow-400/20 active:border-yellow-400/20'
      case 'red':
        return isOpen
          ? 'border-red-500/20 bg-red-500/10 text-red-500'
          : 'bg-red-500/10 text-red-500 hover:border-red-500/20 focus:border-red-500/20 active:border-red-500/20'
      case 'neutral':
      default:
        return isOpen
          ? 'border-neutral-300/20 bg-neutral-300/10 text-neutral-300'
          : 'bg-neutral-300/10 text-neutral-300 hover:border-neutral-300/20 focus:border-neutral-300/20 active:border-neutral-300/20'
    }
  }

  // Function to display status chips with counts
  const renderStatusChips = () => {
    const statusConfig: { status: string; label: string; color: 'green' | 'purple' | 'yellow' | 'red' | 'neutral' }[] =
      [
        {
          status: 'running' as const,
          label: 'running',
          color: 'green',
        },
        { status: 'starting' as const, label: 'starting', color: 'purple' },
        { status: 'warning' as const, label: 'warning', color: 'yellow' },
        { status: 'failing' as const, label: 'failing', color: 'red' },
        { status: 'other' as const, label: 'other', color: 'neutral' },
      ]

    return (
      <div className="flex flex-wrap gap-2">
        {statusConfig.map(({ status, label, color }) => {
          const podsInStatus = podsByStatus[status as keyof typeof podsByStatus]
          const count = podsInStatus.length
          if (count === 0) return null

          return (
            <Popover.Root key={status} open={open} onOpenChange={setOpen}>
              <Popover.Trigger onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className="-mx-2 p-2">
                  <button
                    type="button"
                    className={twMerge(
                      'inline-flex h-5 w-6 items-center justify-center rounded-full border border-transparent text-ssm font-medium outline-none transition-colors duration-75',
                      getStatusChipClassNames(color, open)
                    )}
                  >
                    {count}
                  </button>
                </div>
              </Popover.Trigger>
              <Popover.Content
                className="w-60 p-3"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                sideOffset={0}
              >
                <div className="space-y-2">
                  <p className="text-sm">
                    {count} {pluralize(count, 'instance', 'instances')} {label}:
                  </p>
                  <div className="flex gap-1">
                    {podsInStatus.map((pod, index) => (
                      <Tooltip key={pod.podName + index} content={pod.podName} side="bottom">
                        <Popover.Close>
                          <Button
                            type="button"
                            variant="surface"
                            color="neutral"
                            size="xs"
                            className="h-5 gap-1.5 px-1.5 font-code"
                            onClick={(e) => {
                              e.stopPropagation()
                              setQueryParams({ instance: pod.podName })
                            }}
                          >
                            <span
                              className="block h-1.5 w-1.5 min-w-1.5 rounded-sm"
                              style={{ backgroundColor: getColorByPod(pod.podName ?? '') }}
                            />
                            {pod.podName?.substring(pod.podName?.length - 5)}
                          </Button>
                        </Popover.Close>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </Popover.Content>
            </Popover.Root>
          )
        })}
      </div>
    )
  }

  if (pods.length === 0 || isMetricsLoading || isRunningStatusesLoading) {
    return (
      <div className="text-sm text-gray-500">
        <Skeleton height={20} width={24} rounded />
      </div>
    )
  }

  return <div className="space-y-4">{renderStatusChips()}</div>
}

export default PodHealthChips
