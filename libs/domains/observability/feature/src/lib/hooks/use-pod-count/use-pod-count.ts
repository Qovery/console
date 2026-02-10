import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'
import { buildPromSelector } from '../../util-chart/build-selector'
import { useDashboardContext } from '../../util-filter/dashboard-context'

interface UsePodCountProps {
  clusterId: string
  containerName: string
  podNames?: string[]
  enabled?: boolean
}

/**
 * Lightweight hook to count the number of pods over the current time range.
 * Uses group() to get pod labels without fetching all metric values.
 */
export function usePodCount({ clusterId, containerName, podNames, enabled = true }: UsePodCountProps) {
  const { startTimestamp, endTimestamp, timeRange, traceId } = useDashboardContext()

  const selector = buildPromSelector(containerName, podNames)

  const query = `group by (pod) (container_cpu_usage_seconds_total{${selector}})`

  const queryResult = useQuery({
    ...observability.metrics({
      clusterId,
      query,
      queryRange: 'query_range',
      startTimestamp,
      endTimestamp,
      timeRange,
      step: '300000ms',
      maxSourceResolution: '0s',
      boardShortName: 'service_overview',
      metricShortName: 'pod_count',
      traceId,
      alignedRange: '0',
    }),
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })

  const podCount = queryResult.data?.data?.result?.length || 0

  return {
    ...queryResult,
    podCount,
  }
}
