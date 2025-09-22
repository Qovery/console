import { useMemo } from 'react'
import { Line } from 'recharts'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const queryDuration50 = (ingressName: string) => `
  nginx:request_p50:5m{ingress="${ingressName}"}
`

const queryDuration95 = (ingressName: string) => `
  nginx:request_p95:5m{ingress="${ingressName}"}
`

const queryDuration99 = (ingressName: string) => `
 nginx:request_p99:5m{ingress="${ingressName}"}
`

export function NetworkRequestDurationChart({
  clusterId,
  serviceId,
  containerName,
  isFullscreen,
  ingressName,
}: {
  clusterId: string
  serviceId: string
  containerName: string
  isFullscreen?: boolean
  ingressName: string
}) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useServiceOverviewContext()

  const { data: metrics50, isLoading: isLoadingMetrics50 } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryDuration50(ingressName),
    boardShortName: 'service_overview',
    metricShortName: 'network_p50',
  })

  const { data: metrics99, isLoading: isLoadingMetrics99 } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryDuration99(ingressName),
    boardShortName: 'service_overview',
    metricShortName: 'network_p99',
  })

  const { data: metrics95, isLoading: isLoadingMetrics95 } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryDuration95(ingressName),
    boardShortName: 'service_overview',
    metricShortName: 'network_p95',
  })

  const chartData = useMemo(() => {
    if (!metrics99?.data?.result) {
      return []
    }

    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // Process network duration 99th percentile metrics
    processMetricsData(
      metrics99,
      timeSeriesMap,
      () => '99th percentile',
      (value) => parseFloat(value) * 1000, // Convert to ms
      useLocalTime
    )

    // Process network duration 99th percentile metrics
    processMetricsData(
      metrics95,
      timeSeriesMap,
      () => '95th percentile',
      (value) => parseFloat(value) * 1000, // Convert to ms
      useLocalTime
    )

    // Process network duration 0.5th percentile metrics
    processMetricsData(
      metrics50,
      timeSeriesMap,
      () => '50th percentile',
      (value) => parseFloat(value) * 1000, // Convert to ms
      useLocalTime
    )

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [metrics99, metrics95, metrics50, useLocalTime, startTimestamp, endTimestamp])

  return (
    <LocalChart
      data={chartData}
      serviceId={serviceId}
      isLoading={isLoadingMetrics99 || isLoadingMetrics50 || isLoadingMetrics95}
      isEmpty={chartData.length === 0}
      label={!isFullscreen ? 'Network request duration (ms)' : undefined}
      description="How long requests take to complete. Lower values mean faster responses"
      unit="ms"
    >
      <Line
        key="50th-percentile"
        dataKey="50th percentile"
        type="linear"
        stroke="var(--color-purple-400)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      <Line
        key="95th-percentile"
        dataKey="95th percentile"
        type="linear"
        stroke="var(--color-brand-400)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      <Line
        key="99th-percentile"
        dataKey="99th percentile"
        type="linear"
        stroke="var(--color-purple-600)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
    </LocalChart>
  )
}

export default NetworkRequestDurationChart
