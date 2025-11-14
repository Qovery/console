import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { observability } from '@qovery/domains/observability/data-access'
import { useDashboardContext } from '../../util-filter/dashboard-context'
import { type TimeRangeOption } from '../../util-filter/time-range'
import { alignEndSec, alignStartSec, resolutionByRetention } from '../use-metrics/align-timestamp'
import { alignedRangeInMinutes } from '../use-metrics/grafana-util'

interface UseInstantMetricsProps {
  clusterId: string
  query: string
  startTimestamp: string
  endTimestamp: string
  boardShortName: 'service_overview' | 'rds_overview'
  metricShortName: string
  timeRange?: TimeRangeOption
  isLiveUpdateEnabled?: boolean
  enabled?: boolean
}

// Helper hook to safely get live update setting from context
function useLiveUpdateSetting(): boolean {
  try {
    const context = useDashboardContext()
    // Pause live updates when charts are zoomed or when the date picker is open
    return context.isLiveUpdateEnabled && !context.isAnyChartZoomed && !context.isDatePickerOpen
  } catch {
    // Context not available, default to true
    return true
  }
}

// Inspired by use-metrics.tsx
// When querying Prometheus in instant mode, only the 'time' parameter is used (which is our 'endTimestamp').
// 'startTimestamp' and 'endTimestamp' are only needed to calculate the range, but are otherwise unused here.
export function useInstantMetrics({
  clusterId,
  query,
  startTimestamp,
  endTimestamp,
  timeRange,
  isLiveUpdateEnabled: overrideLiveUpdate,
  boardShortName,
  metricShortName,
  enabled = true,
}: UseInstantMetricsProps) {
  // Get live update setting from context, but allow override
  const contextLiveUpdate = useLiveUpdateSetting()
  const finalLiveUpdateEnabled = overrideLiveUpdate ?? contextLiveUpdate
  const context = useDashboardContext()

  const alignedStart = alignStartSec(startTimestamp)
  const alignedEnd = alignEndSec(endTimestamp)

  const alignedRange = alignedRangeInMinutes(alignedStart, alignedEnd)

  const maxSourceResolution = useMemo(() => {
    if (!alignedStart || !alignedEnd) return '1h' as const

    return resolutionByRetention(alignedStart)
  }, [alignedStart, alignedEnd])

  const queryResult = useQuery({
    ...observability.metrics({
      clusterId,
      query,
      queryRange: 'query',
      startTimestamp: undefined,
      endTimestamp: undefined,
      time: alignedEnd,
      step: undefined,
      maxSourceResolution,
      // These params are used to generate charts in Grafana
      boardShortName,
      metricShortName,
      traceId: context.traceId,
      alignedRange,
    }),
    keepPreviousData: true,
    refetchInterval: finalLiveUpdateEnabled ? 30_000 : false, // Refetch every 30 seconds only if live update is enabled
    refetchIntervalInBackground: finalLiveUpdateEnabled,
    refetchOnWindowFocus: false,
    retry: 3,
    enabled,
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
