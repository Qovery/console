import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'
import { useServiceOverviewContext } from '../../service-overview/util-filter/service-overview-context'

interface UseLokiMetricsProps {
  clusterId: string
  query: string
  endTimestamp: string
  enabled?: boolean
}

// Helper hook to safely get live update setting from context
function useLiveUpdateSetting(): boolean {
  try {
    const context = useServiceOverviewContext()
    // Pause live updates when charts are zoomed or when the date picker is open
    return context.isLiveUpdateEnabled && !context.isAnyChartZoomed && !context.isDatePickerOpen
  } catch {
    // Context not available, default to true
    return true
  }
}

export function useLokiMetrics({ clusterId, query, endTimestamp, enabled = true }: UseLokiMetricsProps) {
  const contextLiveUpdate = useLiveUpdateSetting()

  return useQuery({
    ...observability.lokiMetrics({
      clusterId,
      query,
      endTimestamp,
    }),
    keepPreviousData: true,
    refetchInterval: contextLiveUpdate ? 30_000 : false, // Refetch every 30 seconds only if live update is enabled
    refetchIntervalInBackground: contextLiveUpdate,
    refetchOnWindowFocus: false,
    retry: 3,
    enabled,
  })
}
