import { useCallback, useMemo } from 'react'
import { type MetricData } from '../../hooks/use-metrics/use-metrics'
import { addTimeRangePadding } from './add-time-range-padding'
import { processMetricsData } from './process-metrics-data'

// Optimized chart data processing hook that reduces re-renders
export function useOptimizedChartData({
  metrics,
  additionalMetrics = [],
  serviceId,
  useLocalTime,
  startTimestamp,
  endTimestamp,
  transformValue,
  getSeriesName,
  additionalProcessors = [],
}: {
  metrics: { data?: { result: MetricData[] } } | undefined
  additionalMetrics?: ({ data?: { result: MetricData[] } } | undefined)[]
  serviceId: string
  useLocalTime: boolean
  startTimestamp: string
  endTimestamp: string
  transformValue: (value: string) => number
  getSeriesName: (series: MetricData, index: number) => string
  additionalProcessors?: Array<{
    metrics: { data?: { result: MetricData[] } } | undefined
    getSeriesName: (series: MetricData, index: number) => string
    transformValue: (value: string) => number
  }>
}) {
  // Memoize the raw metrics data with stable references
  const stableMetrics = useMemo(() => {
    return {
      main: metrics?.data?.result ? JSON.stringify(metrics.data.result) : null,
      additional: additionalMetrics.map((m) => (m?.data?.result ? JSON.stringify(m.data.result) : null)),
    }
  }, [metrics?.data?.result, additionalMetrics])

  // Memoize series names separately with more granular dependencies
  const seriesNames = useMemo(() => {
    if (!metrics?.data?.result) return []
    const result = metrics.data.result
    return result.map((_: unknown, index: number) => getSeriesName(result[index], index))
  }, [stableMetrics.main, getSeriesName])

  // Main chart data processing - only re-runs when actual data changes
  const chartData = useMemo(() => {
    if (!metrics?.data?.result) {
      return []
    }

    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // Process main metrics
    processMetricsData(metrics, timeSeriesMap, getSeriesName, transformValue, useLocalTime)

    // Process additional metrics (limits, requests, etc.)
    additionalProcessors.forEach((processor, index) => {
      if (processor.metrics?.data?.result) {
        processMetricsData(
          processor.metrics,
          timeSeriesMap,
          processor.getSeriesName,
          processor.transformValue,
          useLocalTime
        )
      }
    })

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [
    stableMetrics.main,
    stableMetrics.additional,
    useLocalTime,
    startTimestamp,
    endTimestamp,
    getSeriesName,
    transformValue,
    additionalProcessors,
  ])

  return {
    chartData,
    seriesNames,
  }
}

// Specialized hook for resource charts (CPU/Memory) with limit/request metrics
export function useResourceChartData({
  usageMetrics,
  limitMetrics,
  requestMetrics,
  serviceId,
  useLocalTime,
  startTimestamp,
  endTimestamp,
  transformValue,
  getSeriesName,
  limitSeriesName = 'limit',
  requestSeriesName = 'request',
}: {
  usageMetrics: { data?: { result: MetricData[] } } | undefined
  limitMetrics: { data?: { result: MetricData[] } } | undefined
  requestMetrics: { data?: { result: MetricData[] } } | undefined
  serviceId: string
  useLocalTime: boolean
  startTimestamp: string
  endTimestamp: string
  transformValue: (value: string) => number
  getSeriesName: (series: MetricData, index: number) => string
  limitSeriesName?: string
  requestSeriesName?: string
}) {
  // Memoize the series name functions to prevent recreation
  const limitGetSeriesName = useCallback(() => limitSeriesName, [limitSeriesName])
  const requestGetSeriesName = useCallback(() => requestSeriesName, [requestSeriesName])

  // Memoize the additionalMetrics array to prevent recreation
  const additionalMetrics = useMemo(() => [limitMetrics, requestMetrics], [limitMetrics, requestMetrics])

  // Memoize the additionalProcessors array to prevent recreation
  const additionalProcessors = useMemo(
    () => [
      {
        metrics: limitMetrics,
        getSeriesName: limitGetSeriesName,
        transformValue,
      },
      {
        metrics: requestMetrics,
        getSeriesName: requestGetSeriesName,
        transformValue,
      },
    ],
    [limitMetrics, requestMetrics, limitGetSeriesName, requestGetSeriesName, transformValue]
  )

  const result = useOptimizedChartData({
    metrics: usageMetrics,
    additionalMetrics,
    serviceId,
    useLocalTime,
    startTimestamp,
    endTimestamp,
    transformValue,
    getSeriesName,
    additionalProcessors,
  })

  return result
}

// Simple hook for single metric charts (Network charts)
export function useSimpleChartData({
  metrics,
  serviceId,
  useLocalTime,
  startTimestamp,
  endTimestamp,
  transformValue,
  getSeriesName,
}: {
  metrics: { data?: { result: MetricData[] } } | undefined
  serviceId: string
  useLocalTime: boolean
  startTimestamp: string
  endTimestamp: string
  transformValue: (value: string) => number
  getSeriesName: (series: MetricData, index: number) => string
}) {
  return useOptimizedChartData({
    metrics,
    serviceId,
    useLocalTime,
    startTimestamp,
    endTimestamp,
    transformValue,
    getSeriesName,
  })
}
