import { useMemo } from 'react'
import { Heading, Icon, Section, Skeleton, Tooltip } from '@qovery/shared/ui'
import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { formatTimestamp } from '../../../util-chart/format-timestamp'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

const REASON_COLOR: Record<string, string> = {
  // Errors
  DiskPressure: 'text-red-500',
  MemoryPressure: 'text-red-500',
  PIDPressure: 'text-red-500',
  NodeNotReady: 'text-red-500',
  FailedDraining: 'text-red-500',
  DeletingNodeFailed: 'text-red-500',
  InvalidDiskCapacity: 'text-red-500',
  TerminationGracePeriodExpiring: 'text-red-500',
  // Karpenter lifecycle
  Launched: 'text-green-500',
  DisruptionLaunching: 'text-green-500',
  Finalized: 'text-orange-500',
  DisruptionTerminating: 'text-orange-500',
  InstanceTerminating: 'text-orange-500',
  DeletingNode: 'text-orange-500',
}

interface NodeEvent {
  key: string
  timestamp: number
  fullTime: string
  objectKind: string
  reason: string
}

export function CardNodeEvents({ clusterId }: { clusterId: string }) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange, subQueryTimeRange } = useDashboardContext()

  const { data: metrics, isLoading } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: `sum by (reason, object_kind) (
      clamp_max(clamp_min(
        k8s_event_logger_q_k8s_events_total{
          object_kind=~"Node|NodeClaim",
          reason=~"DiskPressure|MemoryPressure|PIDPressure|NodeNotReady|FailedDraining|DeletingNodeFailed|InvalidDiskCapacity|TerminationGracePeriodExpiring|Launched|DisruptionLaunching|Finalized|DisruptionTerminating|InstanceTerminating|DeletingNode"
        }
        - k8s_event_logger_q_k8s_events_total{
          object_kind=~"Node|NodeClaim",
          reason=~"DiskPressure|MemoryPressure|PIDPressure|NodeNotReady|FailedDraining|DeletingNodeFailed|InvalidDiskCapacity|TerminationGracePeriodExpiring|Launched|DisruptionLaunching|Finalized|DisruptionTerminating|InstanceTerminating|DeletingNode"
        } offset ${subQueryTimeRange},
      0), 1)
    )`,
    boardShortName: 'service_overview',
    metricShortName: 'node_events',
  })

  const events = useMemo((): NodeEvent[] => {
    if (!metrics?.data?.result) return []

    const result: NodeEvent[] = []

    for (const series of metrics.data.result) {
      const reason = series.metric?.reason as string
      const objectKind = (series.metric?.object_kind as string) ?? ''
      const values = series.values as [number, string][]

      for (let i = 0; i < values.length; i++) {
        if (parseFloat(values[i][1]) > 0) {
          const timestamp = values[i][0] * 1000
          const { fullTimeString } = formatTimestamp(timestamp, useLocalTime)
          result.push({
            key: `${reason}-${objectKind}-${timestamp}`,
            timestamp,
            fullTime: fullTimeString,
            objectKind,
            reason,
          })
        }
      }
    }

    return result.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50)
  }, [metrics, useLocalTime])

  if (isLoading) {
    return (
      <Section className="w-full cursor-default rounded border border-neutral-250 bg-neutral-50">
        <div className="flex items-center gap-1.5 px-5 pt-4 pb-4">
          <Skeleton show width={200} height={16} />
        </div>
        <div className="flex flex-col gap-2 px-5 pb-5">
          <Skeleton show width="100%" height={28} />
          <Skeleton show width="100%" height={28} />
          <Skeleton show width="100%" height={28} />
        </div>
      </Section>
    )
  }

  if (events.length === 0) return null

  return (
    <Section className="w-full cursor-default rounded border border-neutral-250 bg-neutral-50">
      <div className="flex items-center gap-1.5 px-5 pt-4">
        <Heading weight="medium">Node infrastructure events</Heading>
        <Tooltip content="Node lifecycle and pressure events over the selected time range">
          <span>
            <Icon iconName="circle-info" iconStyle="regular" className="text-sm text-neutral-350" />
          </span>
        </Tooltip>
      </div>
      <div className="max-h-[300px] overflow-y-auto p-5">
        <table className="w-full text-ssm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-400">
              <th className="pb-2 pr-4 font-medium">Time</th>
              <th className="pb-2 pr-4 font-medium">Kind</th>
              <th className="pb-2 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.key} className="border-b border-neutral-100 last:border-0">
                <td className="py-2 pr-4 text-neutral-400">{event.fullTime}</td>
                <td className="py-2 pr-4 text-neutral-500">{event.objectKind}</td>
                <td className={`py-2 font-medium ${REASON_COLOR[event.reason] ?? 'text-neutral-400'}`}>
                  {event.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

export default CardNodeEvents
