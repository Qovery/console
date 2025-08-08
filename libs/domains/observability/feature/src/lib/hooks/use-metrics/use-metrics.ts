import { useQuery } from '@tanstack/react-query'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { observability } from '@qovery/domains/observability/data-access'
import { useServiceOverviewContext } from '../../service-overview/util-filter/service-overview-context'
import { type TimeRangeOption } from '../../service-overview/util-filter/time-range'

export interface MetricData {
  metric: {
    container: string
    cpu: string
    endpoint: string
    id: string
    image: string
    instance: string
    job: string
    metrics_path: string
    name: string
    namespace: string
    node: string
    pod: string
    prometheus: string
    service: string
    reason?: string
  }
  values: [number, string][]
}

interface UseMetricsProps {
  clusterId: string
  query: string
  startTimestamp?: string
  endTimestamp?: string
  queryRange?: 'query' | 'query_range'
  timeRange?: TimeRangeOption
  isLiveUpdateEnabled?: boolean
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

// Simple wrapper that automatically applies live update toggle from context
export function useMetrics({
  clusterId,
  query,
  startTimestamp,
  endTimestamp,
  queryRange = 'query_range',
  timeRange,
  isLiveUpdateEnabled: overrideLiveUpdate,
}: UseMetricsProps & { isLiveUpdateEnabled?: boolean }) {
  // Get live update setting from context, but allow override
  const contextLiveUpdate = useLiveUpdateSetting()
  const finalLiveUpdateEnabled = overrideLiveUpdate ?? contextLiveUpdate

  const step = useMemo(() => {
    // TODO: Verify these step intervals match actual Prometheus scrape_interval configuration
    // Actual scrape_interval = 15s
    // https://prometheus.io/docs/prometheus/latest/configuration/configuration/#duration
    // https://qovery.slack.com/archives/C02NQ0LC8M9/p1753804730631609?thread_ts=1753803872.246399&cid=C02NQ0LC8M9
    if (timeRange === '5m') return '15000ms' // 15 seconds (match actual scrape_interval)
    if (timeRange === '15m') return '30000ms' // 30 seconds for longer ranges (2x scrape_interval)
    if (timeRange === '30m') return '60000ms' // 1 minute for longer ranges (4x scrape_interval)
    if (startTimestamp && endTimestamp) {
      return calculateDynamicRange(startTimestamp, endTimestamp)
    }
    return '15000ms' // Default: 15 seconds (match actual scrape_interval)
  }, [timeRange, startTimestamp, endTimestamp])

  const queryResult = useQuery({
    ...observability.observability({
      clusterId,
      query,
      queryRange,
      startTimestamp,
      endTimestamp,
      timeRange,
      step,
    }),
    keepPreviousData: true,
    refetchInterval: finalLiveUpdateEnabled ? 15_000 : false, // Refetch every 15 seconds only if live update is enabled
    refetchIntervalInBackground: finalLiveUpdateEnabled,
  })

  // Custom isLoading: true on first load and when timeRange changes, false on live refetch
  const lastTimeRange = useRef<TimeRangeOption | undefined>(timeRange)
  const [isLoadingCustom, setIsLoadingCustom] = useState(queryResult.isLoading)

  useEffect(() => {
    if (timeRange !== lastTimeRange.current) {
      setIsLoadingCustom(true)
      lastTimeRange.current = timeRange
    }
  }, [timeRange])

  useEffect(() => {
    if (!queryResult.isFetching) {
      setIsLoadingCustom(false)
    }
  }, [queryResult.isFetching])

  return {
    ...queryResult,
    isLoading: isLoadingCustom,
  }
}

export function calculateDynamicRange(startTimestamp: string, endTimestamp: string, offsetMultiplier = 0): string {
  const startMs = Number(startTimestamp) * 1000
  const endMs = Number(endTimestamp) * 1000
  const durationMs = endMs - startMs
  let stepMs: number

  if (durationMs <= 12 * 60 * 60 * 1000) {
    // < 12h
    stepMs = 15000
  } else if (durationMs < 24 * 60 * 60 * 1000) {
    // < 24h
    stepMs = 30000
  } else if (durationMs < 48 * 60 * 60 * 1000) {
    // < 48h
    stepMs = 60000
  } else if (durationMs < 7 * 24 * 60 * 60 * 1000) {
    // < 7d
    stepMs = 120000
  } else if (durationMs < 30 * 24 * 60 * 60 * 1000) {
    // < 30d
    stepMs = 300000
  } else if (durationMs < 60 * 24 * 60 * 60 * 1000) {
    // < 60d
    stepMs = 1800000
  } else {
    stepMs = 7200000 // > 60d
  }

  stepMs = stepMs + offsetMultiplier * 100

  return `${stepMs}ms`
}
