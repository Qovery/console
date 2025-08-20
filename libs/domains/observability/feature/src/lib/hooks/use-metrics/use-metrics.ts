import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
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
}: UseMetricsProps) {
  // Get live update setting from context, but allow override
  const contextLiveUpdate = useLiveUpdateSetting()
  const finalLiveUpdateEnabled = overrideLiveUpdate ?? contextLiveUpdate

  const step = useMemo(() => {
    // TODO: Verify these step intervals match actual Prometheus scrape_interval configuration
    // Actual scrape_interval = 15s
    // https://prometheus.io/docs/prometheus/latest/configuration/configuration/#duration
    // https://qovery.slack.com/archives/C02NQ0LC8M9/p1753804730631609?thread_ts=1753803872.246399&cid=C02NQ0LC8M9
    let calculatedStep: string
    if (timeRange === '5m') {
      calculatedStep = '15000ms' // 15 seconds (match actual scrape_interval)
    } else if (timeRange === '15m') {
      calculatedStep = '30000ms' // 30 seconds for longer ranges (2x scrape_interval)
    } else if (timeRange === '30m') {
      calculatedStep = '60000ms' // 1 minute for longer ranges (4x scrape_interval)
    } else if (startTimestamp && endTimestamp) {
      calculatedStep = calculateDynamicRange(startTimestamp, endTimestamp)
    } else {
      calculatedStep = '15000ms' // Default: 15 seconds (match actual scrape_interval)
    }

    return calculatedStep
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

  // Allowed, quantized step values (in ms) - expanded for longer time ranges
  const allowedStepsMs = [
    15000, // 15s
    30000, // 30s
    60000, // 1m
    120000, // 2m
    300000, // 5m
    600000, // 10m
    900000, // 15m
    1800000, // 30m
    3600000, // 1h
    7200000, // 2h
    10800000, // 3h - added for better 12h+ range optimization
    21600000, // 6h - added for better 24h+ range optimization
  ] as const

  // Cap points by escalating to the next quantized step until under target
  const MAX_POINTS_TARGET = 150

  // Minimal step to respect the max points target
  const minimalStepForCapMs = Math.ceil(durationMs / MAX_POINTS_TARGET)

  // Round up to the nearest allowed step
  const roundedStepMs =
    allowedStepsMs.find((step) => step >= minimalStepForCapMs) ?? allowedStepsMs[allowedStepsMs.length - 1]

  const finalStepMs = roundedStepMs + offsetMultiplier * 100

  return `${finalStepMs}ms`
}
