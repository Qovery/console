import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { observability } from '@qovery/domains/observability/data-access'
import { useServiceOverviewContext } from '../../service-overview/util-filter/service-overview-context'
import { type TimeRangeOption } from '../../service-overview/util-filter/time-range'

interface UseInstantMetricsProps {
  clusterId: string
  query: string
  startTimestamp: string
  endTimestamp: string
  timeRange?: TimeRangeOption
  isLiveUpdateEnabled?: boolean
}

// TODO PG (factorize wit use-metrics?
// Helpers for alignment (timestamps in seconds)
// Needed to avoid issues with Prometheus when the time range is not aligned with the step interval
const ALIGN_SEC = 30
const alignStartSec = (ts?: string) => (ts == null ? undefined : Math.floor(Number(ts) / ALIGN_SEC) * ALIGN_SEC + '')
const alignEndSec = (ts?: string) => (ts == null ? undefined : Math.ceil(Number(ts) / ALIGN_SEC) * ALIGN_SEC + '')

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
export function useInstantMetrics({
  clusterId,
  query,
  startTimestamp,
  endTimestamp,
  timeRange,
  isLiveUpdateEnabled: overrideLiveUpdate,
}: UseInstantMetricsProps) {
  // Get live update setting from context, but allow override
  const contextLiveUpdate = useLiveUpdateSetting()
  const finalLiveUpdateEnabled = overrideLiveUpdate ?? contextLiveUpdate

  const alignedStart = alignStartSec(endTimestamp)
  const alignedEnd = alignEndSec(endTimestamp)

  const maxSourceResolution = useMemo(() => {
    if (!alignedStart || !alignedEnd) return '0s' as const

    return '0s' as const // TODO PG calculate the maxSourceResolution according to time windows.
  }, [alignedStart, alignedEnd])

  const queryResult = useQuery({
    ...observability.observability({
      clusterId,
      query,
      queryRange: 'query',
      startTimestamp: undefined,
      endTimestamp: undefined,
      time: alignedEnd,
      step: undefined,
      maxSourceResolution,
    }),
    keepPreviousData: true,
    refetchInterval: finalLiveUpdateEnabled ? 30_000 : false, // Refetch every 30 seconds only if live update is enabled
    refetchIntervalInBackground: finalLiveUpdateEnabled,
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
