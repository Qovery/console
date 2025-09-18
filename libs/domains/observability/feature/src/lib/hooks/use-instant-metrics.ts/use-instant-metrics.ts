import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { observability } from '@qovery/domains/observability/data-access'
import { useServiceOverviewContext } from '../../service-overview/util-filter/service-overview-context'
import { type TimeRangeOption } from '../../service-overview/util-filter/time-range'
import { alignEndSec, alignStartSec } from '../use-metrics/align-timestamp'
import { alignedRangeInMinutes } from '../use-metrics/aligned-range'

interface UseInstantMetricsProps {
  clusterId: string
  query: string
  endTimestamp: string
  timeRange?: TimeRangeOption
  isLiveUpdateEnabled?: boolean
  boardShortName: string
  metricShortName: string
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

// Inspired by use-metrics.tsx
// When querying Prometheus in instant mode, only the 'time' parameter is used (which is our 'endTimestamp').
// 'startTimestamp' and 'endTimestamp' are only needed to calculate the range, but are otherwise unused here.
export function useInstantMetrics({
  clusterId,
  query,
  endTimestamp,
  timeRange,
  isLiveUpdateEnabled: overrideLiveUpdate,
  metricShortName,
}: UseInstantMetricsProps) {
  // Get live update setting from context, but allow override
  const contextLiveUpdate = useLiveUpdateSetting()
  const finalLiveUpdateEnabled = overrideLiveUpdate ?? contextLiveUpdate

  const alignedStart = alignStartSec(endTimestamp)
  const alignedEnd = alignEndSec(endTimestamp)

  const alignedRange = alignedRangeInMinutes(alignedStart, alignedEnd)

  const maxSourceResolution = useMemo(() => {
    if (!alignedStart || !alignedEnd) return '0s' as const

    return '0s' as const // TODO PG: calculate the maxSourceResolution according to time windows.
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
      boardShortName: 'service-overview',
      metricShortName,
      traceId: '',
      alignedRange,
    }),
    keepPreviousData: true,
    refetchInterval: finalLiveUpdateEnabled ? 30_000 : false, // Refetch every 30 seconds only if live update is enabled
    refetchIntervalInBackground: finalLiveUpdateEnabled,
    refetchOnWindowFocus: false,
    retry: 3,
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
