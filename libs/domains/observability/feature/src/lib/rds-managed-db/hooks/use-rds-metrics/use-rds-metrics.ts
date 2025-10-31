import { useQuery } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'
import { observability } from '@qovery/domains/observability/data-access'
import { alignEndSec, alignStartSec, resolutionByRetention } from '../../../hooks/use-metrics/align-timestamp'
import { alignedRangeInMinutes } from '../../../hooks/use-metrics/grafana-util'
import { type TimeRangeOption } from '../../../service-overview/util-filter/time-range'
import { useRdsManagedDbContext } from '../../util-filter/rds-managed-db-context'

export interface RdsMetricData {
  metric: {
    [key: string]: string
  }
  values: [number, string][]
}

interface UseRdsMetricsProps {
  clusterId: string
  query: string
  startTimestamp?: string
  endTimestamp?: string
  timeRange?: TimeRangeOption
  boardShortName: 'rds_overview'
  metricShortName: string
}

function useLiveUpdateSetting(): boolean {
  try {
    const context = useRdsManagedDbContext()
    // Pause live updates when charts are zoomed or when the date picker is open
    return context.isLiveUpdateEnabled && !context.isAnyChartZoomed && !context.isDatePickerOpen
  } catch {
    return true
  }
}

// Hook for fetching RDS time-series metrics
export function useRdsMetrics({
  clusterId,
  query,
  startTimestamp,
  endTimestamp,
  timeRange,
  boardShortName,
  metricShortName,
}: UseRdsMetricsProps) {
  const isLiveUpdateEnabled = useLiveUpdateSetting()

  const alignedStart = startTimestamp ? alignStartSec(startTimestamp) : undefined
  const alignedEnd = endTimestamp ? alignEndSec(endTimestamp) : undefined

  const alignedRange = alignedStart && alignedEnd ? alignedRangeInMinutes(alignedStart, alignedEnd) : 'na'

  const maxSourceResolution = useMemo(() => {
    if (!alignedStart || !alignedEnd) return '1h' as const
    return resolutionByRetention(alignedStart)
  }, [alignedStart, alignedEnd])

  const queryResult = useQuery({
    ...observability.metrics({
      clusterId,
      query,
      queryRange: 'query_range',
      startTimestamp: alignedStart,
      endTimestamp: alignedEnd,
      time: undefined,
      step: '60s',
      maxSourceResolution,
      boardShortName,
      metricShortName,
      traceId: '',
      alignedRange,
    }),
    keepPreviousData: true,
    refetchInterval: isLiveUpdateEnabled ? 30_000 : false,
    refetchIntervalInBackground: isLiveUpdateEnabled,
    refetchOnWindowFocus: false,
    retry: 3,
  })

  const lastTimeRange = useRef<TimeRangeOption | undefined>(timeRange)
  const [isLoadingCustom, setIsLoadingCustom] = useState(queryResult.isLoading)

  // Update loading state when time range changes
  if (timeRange !== lastTimeRange.current) {
    setIsLoadingCustom(true)
    lastTimeRange.current = timeRange
  }

  // Clear loading state when fetch completes
  if (!queryResult.isFetching && isLoadingCustom) {
    setIsLoadingCustom(false)
  }

  return {
    ...queryResult,
    isLoading: isLoadingCustom,
  }
}
