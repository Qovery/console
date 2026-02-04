import { useMemo, useState } from 'react'
import { type LegendPayload, Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../../../local-chart/local-chart'
import { addTimeRangePadding } from '../../../util-chart/add-time-range-padding'
import { processMetricsData } from '../../../util-chart/process-metrics-data'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

// NGINX: Queries for nginx metrics (to remove when migrating to envoy)
const queryDuration50 = (ingressName: string) => `
  nginx:request_p50:5m{ingress="${ingressName}"}
`

const queryDuration95 = (ingressName: string) => `
  nginx:request_p95:5m{ingress="${ingressName}"}
`

const queryDuration99 = (ingressName: string) => `
 nginx:request_p99:5m{ingress="${ingressName}"}
`

// ENVOY: Queries for envoy metrics
const queryEnvoyDuration50 = (httpRouteName: string) => `
  envoy_proxy:request_p50:5m{httproute_name="${httpRouteName}"}
`

const queryEnvoyDuration95 = (httpRouteName: string) => `
  envoy_proxy:request_p95:5m{httproute_name="${httpRouteName}"}
`

const queryEnvoyDuration99 = (httpRouteName: string) => `
  envoy_proxy:request_p99:5m{httproute_name="${httpRouteName}"}
`

export function NetworkRequestDurationChart({
  clusterId,
  serviceId,
  isFullscreen,
  ingressName,
  httpRouteName,
}: {
  clusterId: string
  serviceId: string
  isFullscreen?: boolean
  ingressName: string
  httpRouteName: string
}) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useDashboardContext()

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

  // NGINX: Fetch nginx metrics (to remove when migrating to envoy)
  const { data: metricsP50InSeconds, isLoading: isLoadingMetrics50 } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryDuration50(ingressName),
    boardShortName: 'service_overview',
    metricShortName: 'network_p50',
  })

  const { data: metricsP99InSeconds, isLoading: isLoadingMetrics99 } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryDuration99(ingressName),
    boardShortName: 'service_overview',
    metricShortName: 'network_p99',
  })

  const { data: metricsP95InSeconds, isLoading: isLoadingMetrics95 } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryDuration95(ingressName),
    boardShortName: 'service_overview',
    metricShortName: 'network_p95',
  })

  // ENVOY: Fetch envoy metrics
  const { data: metricsEnvoyP50InMs, isLoading: isLoadingMetricsEnvoy50 } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryEnvoyDuration50(httpRouteName),
    boardShortName: 'service_overview',
    metricShortName: 'envoy_p50',
  })

  const { data: metricsEnvoyP99InMs, isLoading: isLoadingMetricsEnvoy99 } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryEnvoyDuration99(httpRouteName),
    boardShortName: 'service_overview',
    metricShortName: 'envoy_p99',
  })

  const { data: metricsEnvoyP95InMs, isLoading: isLoadingMetricsEnvoy95 } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryEnvoyDuration95(httpRouteName),
    boardShortName: 'service_overview',
    metricShortName: 'envoy_p95',
  })

  const chartData = useMemo(() => {
    // Check if we have data from either source
    if (!metricsP99InSeconds?.data?.result && !metricsEnvoyP99InMs?.data?.result) {
      return []
    }

    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // NGINX: Process nginx duration metrics (convert seconds to ms)
    if (metricsP99InSeconds?.data?.result) {
      processMetricsData(
        metricsP99InSeconds,
        timeSeriesMap,
        () => '99th percentile (nginx)',
        (value) => parseFloat(value) * 1000, // Convert seconds to ms
        useLocalTime
      )
    }

    if (metricsP95InSeconds?.data?.result) {
      processMetricsData(
        metricsP95InSeconds,
        timeSeriesMap,
        () => '95th percentile (nginx)',
        (value) => parseFloat(value) * 1000, // Convert seconds to ms
        useLocalTime
      )
    }

    if (metricsP50InSeconds?.data?.result) {
      processMetricsData(
        metricsP50InSeconds,
        timeSeriesMap,
        () => '50th percentile (nginx)',
        (value) => parseFloat(value) * 1000, // Convert seconds to ms
        useLocalTime
      )
    }

    // ENVOY: Process envoy duration metrics (already in ms)
    if (metricsEnvoyP99InMs?.data?.result) {
      processMetricsData(
        metricsEnvoyP99InMs,
        timeSeriesMap,
        () => '99th percentile (envoy)',
        (value) => parseFloat(value), // Already in ms
        useLocalTime
      )
    }

    if (metricsEnvoyP95InMs?.data?.result) {
      processMetricsData(
        metricsEnvoyP95InMs,
        timeSeriesMap,
        () => '95th percentile (envoy)',
        (value) => parseFloat(value), // Already in ms
        useLocalTime
      )
    }

    if (metricsEnvoyP50InMs?.data?.result) {
      processMetricsData(
        metricsEnvoyP50InMs,
        timeSeriesMap,
        () => '50th percentile (envoy)',
        (value) => parseFloat(value), // Already in ms
        useLocalTime
      )
    }

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [
    metricsP99InSeconds,
    metricsP95InSeconds,
    metricsP50InSeconds,
    metricsEnvoyP99InMs,
    metricsEnvoyP95InMs,
    metricsEnvoyP50InMs,
    useLocalTime,
    startTimestamp,
    endTimestamp,
  ])

  const isLoadingMetrics =
    isLoadingMetrics99 ||
    isLoadingMetrics50 ||
    isLoadingMetrics95 ||
    isLoadingMetricsEnvoy99 ||
    isLoadingMetricsEnvoy50 ||
    isLoadingMetricsEnvoy95

  return (
    <LocalChart
      data={chartData}
      serviceId={serviceId}
      isLoading={isLoadingMetrics}
      isEmpty={chartData.length === 0}
      label={!isFullscreen ? 'Network request duration (ms)' : undefined}
      description="How long requests take to complete. Lower values mean faster responses"
      unit="ms"
      handleResetLegend={legendSelectedKeys.size > 0 ? handleResetLegend : undefined}
    >
      {/* NGINX: Lines for nginx metrics (to remove when migrating to envoy) */}
      <Line
        key="50th-percentile-nginx"
        dataKey="50th percentile (nginx)"
        type="linear"
        stroke="var(--color-purple-400)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('50th percentile (nginx)')}
      />
      <Line
        key="95th-percentile-nginx"
        dataKey="95th percentile (nginx)"
        type="linear"
        stroke="var(--color-brand-400)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('95th percentile (nginx)')}
      />
      <Line
        key="99th-percentile-nginx"
        dataKey="99th percentile (nginx)"
        type="linear"
        stroke="var(--color-purple-600)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('99th percentile (nginx)')}
      />
      {/* ENVOY: Lines for envoy metrics */}
      <Line
        key="50th-percentile-envoy"
        dataKey="50th percentile (envoy)"
        type="linear"
        stroke="var(--color-green-400)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('50th percentile (envoy)')}
      />
      <Line
        key="95th-percentile-envoy"
        dataKey="95th percentile (envoy)"
        type="linear"
        stroke="var(--color-sky-400)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('95th percentile (envoy)')}
      />
      <Line
        key="99th-percentile-envoy"
        dataKey="99th percentile (envoy)"
        type="linear"
        stroke="var(--color-green-600)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('99th percentile (envoy)')}
      />
      {!isLoadingMetrics && chartData.length > 0 && (
        <Chart.Legend
          name="network-request-duration"
          className="w-[calc(100%-0.5rem)] pb-1 pt-2"
          onClick={onClick}
          content={(props) => <Chart.LegendContent selectedKeys={legendSelectedKeys} {...props} />}
        />
      )}
    </LocalChart>
  )
}

export default NetworkRequestDurationChart
