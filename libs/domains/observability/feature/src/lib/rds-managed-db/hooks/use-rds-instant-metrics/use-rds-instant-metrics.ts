import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { observability } from '@qovery/domains/observability/data-access'
import { alignEndSec, alignStartSec, resolutionByRetention } from '../../../hooks/use-metrics/align-timestamp'
import { alignedRangeInMinutes } from '../../../hooks/use-metrics/grafana-util'
import { type TimeRangeOption } from '../../../service-overview/util-filter/time-range'
import { useRdsManagedDbContext } from '../../util-filter/rds-managed-db-context'

interface UseRdsInstantMetricsProps {
  clusterId: string
  query: string
  startTimestamp: string
  endTimestamp: string
  boardShortName: 'rds_overview'
  metricShortName: string
  timeRange?: TimeRangeOption
  isLiveUpdateEnabled?: boolean
}

// Helper hook to safely get live update setting from context
function useLiveUpdateSetting(): boolean {
  try {
    const context = useRdsManagedDbContext()
    // Pause live updates when charts are zoomed or when the date picker is open
    return context.isLiveUpdateEnabled && !context.isAnyChartZoomed && !context.isDatePickerOpen
  } catch {
    // Context not available, default to true
    return true
  }
}

// Inspired by use-instant-metrics.ts
// When querying Prometheus in instant mode, only the 'time' parameter is used (which is our 'endTimestamp').
export function useRdsInstantMetrics({
  clusterId,
  query,
  startTimestamp,
  endTimestamp,
  timeRange,
  isLiveUpdateEnabled: overrideLiveUpdate,
  boardShortName,
  metricShortName,
}: UseRdsInstantMetricsProps) {
  // Get live update setting from context, but allow override
  const contextLiveUpdate = useLiveUpdateSetting()
  const finalLiveUpdateEnabled = overrideLiveUpdate ?? contextLiveUpdate

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
