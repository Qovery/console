import { useMemo, useState } from 'react'
import { type LegendPayload, Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const queryDuration50 = (containerName: string) => `
  beyla:http_server_p50:5m{k8s_container_name="${containerName}"}
`

const queryDuration99 = (containerName: string) => `
   beyla:http_server_p99:5m{k8s_container_name="${containerName}"}
`

const queryDuration95 = (containerName: string) => `
  beyla:http_server_p95:5m{k8s_container_name="${containerName}"}
`

export function PrivateNetworkRequestDurationChart({
  clusterId,
  serviceId,
  containerName,
  isFullscreen,
}: {
  clusterId: string
  serviceId: string
  containerName: string
  isFullscreen?: boolean
}) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useServiceOverviewContext()

  const [legendSelectedKeys, setLegendSelectedKeys] = useState<Set<string>>(new Set())
  const onClick = (value: LegendPayload) => {
    if (!value?.dataKey) return
    const key = value.dataKey as string
    const newKeys = new Set(legendSelectedKeys)
    if (newKeys.has(key)) {
      newKeys.delete(key)
    } else {
      newKeys.add(key)
    }
    setLegendSelectedKeys(newKeys)
  }

  const handleResetLegend = () => {
    setLegendSelectedKeys(new Set())
  }

  const { data: metrics50, isLoading: isLoadingMetrics50 } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryDuration50(containerName),
    boardShortName: 'service_overview',
    metricShortName: 'private_network_p50',
  })

  const { data: metrics99, isLoading: isLoadingMetrics99 } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryDuration99(containerName),
    boardShortName: 'service_overview',
    metricShortName: 'private_network_p99',
  })

  const { data: metrics95, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryDuration95(containerName),
    boardShortName: 'service_overview',
    metricShortName: 'private_network_p95',
  })

  const chartData = useMemo(() => {
    if (!metrics95?.data?.result) {
      return []
    }

    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // Process network duration 95th percentile metrics
    processMetricsData(
      metrics95,
      timeSeriesMap,
      () => '95th percentile',
      (value) => parseFloat(value) * 1000, // Convert to ms
      useLocalTime
    )

    // Process network duration 99th percentile metrics
    processMetricsData(
      metrics99,
      timeSeriesMap,
      () => '99th percentile',
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
  }, [metrics95, metrics99, metrics50, useLocalTime, startTimestamp, endTimestamp])

  return (
    <LocalChart
      data={chartData}
      serviceId={serviceId}
      isLoading={isLoadingMetrics || isLoadingMetrics99 || isLoadingMetrics50}
      isEmpty={chartData.length === 0}
      label={!isFullscreen ? 'Network request duration (ms)' : undefined}
      description="How long requests take to complete. Lower values mean faster responses"
      unit="ms"
      handleResetLegend={legendSelectedKeys.size > 0 ? handleResetLegend : undefined}
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
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('50th percentile') ? true : false}
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
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('95th percentile') ? true : false}
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
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('99th percentile') ? true : false}
      />
      {!isLoadingMetrics && chartData.length > 0 && (
        <Chart.Legend
          name="private-network-request-duration"
          className="w-[calc(100%-0.5rem)] pb-1 pt-2"
          onClick={onClick}
          content={(props) => <Chart.LegendContent selectedKeys={legendSelectedKeys} {...props} />}
        />
      )}
    </LocalChart>
  )
}

export default PrivateNetworkRequestDurationChart
