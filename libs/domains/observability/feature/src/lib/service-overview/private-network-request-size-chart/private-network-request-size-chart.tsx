import { useMemo } from 'react'
import { Line } from 'recharts'
import { calculateRateInterval, useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const queryResponseSize = (containerName: string, rateInterval: string) => `
   sum by (http_response_status_code) (rate(http_server_response_body_size_bytes_sum{k8s_container_name="${containerName}",  http_request_method="GET"}[${rateInterval}]))
`

const queryRequestSize = (containerName: string, rateInterval: string) => `
  sum by (http_response_status_code) (rate(http_server_request_body_size_bytes_sum{k8s_container_name="${containerName}",  http_request_method="GET"}[${rateInterval}]))
`

export function PrivateNetworkRequestSizeChart({
  clusterId,
  serviceId,
  containerName,
}: {
  clusterId: string
  serviceId: string
  containerName: string
}) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useServiceOverviewContext()

  const rateInterval = useMemo(
    () => calculateRateInterval(startTimestamp, endTimestamp),
    [startTimestamp, endTimestamp]
  )

  const { data: metricsResponseSize, isLoading: isLoadingMetricsResponseSize } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryResponseSize(containerName, rateInterval),
  })

  const { data: metricsRequestSize, isLoading: isLoadingMetricsRequestSize } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryRequestSize(containerName, rateInterval),
  })

  const chartData = useMemo(() => {
    if (!metricsResponseSize?.data?.result) {
      return []
    }

    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // Process network response size metrics
    processMetricsData(
      metricsResponseSize,
      timeSeriesMap,
      () => 'Response size',
      (value) => parseFloat(value), // Convert to bytes
      useLocalTime
    )

    // Process network request size metrics
    processMetricsData(
      metricsRequestSize,
      timeSeriesMap,
      () => 'Request size',
      (value) => {
        console.log('vvv')
        return parseFloat(value)
      }, // Convert to bytes
      useLocalTime
    )

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [metricsResponseSize, metricsRequestSize, useLocalTime, startTimestamp, endTimestamp])

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoadingMetricsResponseSize || isLoadingMetricsRequestSize}
      isEmpty={chartData.length === 0}
      label="Network request size (bytes/s)"
      description="Large sizes can increase latency and bandwidth costs"
      unit="bytes"
      serviceId={serviceId}
    >
      <Line
        key="response-size"
        dataKey="Response size"
        type="linear"
        stroke="var(--color-brand-400)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      <Line
        key="request-size"
        dataKey="Request size"
        type="linear"
        stroke="var(--color-purple-400)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
    </LocalChart>
  )
}

export default PrivateNetworkRequestSizeChart
