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

  // ENVOY: Fetch envoy metrics
  const { data: metricsEnvoy50, isLoading: isLoadingMetricsEnvoy50 } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryEnvoyDuration50(httpRouteName),
    boardShortName: 'service_overview',
    metricShortName: 'envoy_p50',
  })

  const { data: metricsEnvoy99, isLoading: isLoadingMetricsEnvoy99 } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryEnvoyDuration99(httpRouteName),
    boardShortName: 'service_overview',
    metricShortName: 'envoy_p99',
  })

  const { data: metricsEnvoy95, isLoading: isLoadingMetricsEnvoy95 } = useMetrics({
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
    if (!metrics99?.data?.result && !metricsEnvoy99?.data?.result) {
      return []
    }

    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // NGINX: Process nginx duration metrics (to remove when migrating to envoy)
    if (metrics99?.data?.result) {
      processMetricsData(
        metrics99,
        timeSeriesMap,
        () => '99th percentile (nginx)',
        (value) => parseFloat(value) * 1000, // Convert to ms
        useLocalTime
      )
    }

    if (metrics95?.data?.result) {
      processMetricsData(
        metrics95,
        timeSeriesMap,
        () => '95th percentile (nginx)',
        (value) => parseFloat(value) * 1000, // Convert to ms
        useLocalTime
      )
    }

    if (metrics50?.data?.result) {
      processMetricsData(
        metrics50,
        timeSeriesMap,
        () => '50th percentile (nginx)',
        (value) => parseFloat(value) * 1000, // Convert to ms
        useLocalTime
      )
    }

    // ENVOY: Process envoy duration metrics
    if (metricsEnvoy99?.data?.result) {
      processMetricsData(
        metricsEnvoy99,
        timeSeriesMap,
        () => '99th percentile (envoy)',
        (value) => parseFloat(value), // Already in ms
        useLocalTime
      )
    }

    if (metricsEnvoy95?.data?.result) {
      processMetricsData(
        metricsEnvoy95,
        timeSeriesMap,
        () => '95th percentile (envoy)',
        (value) => parseFloat(value), // Already in ms
        useLocalTime
      )
    }

    if (metricsEnvoy50?.data?.result) {
      processMetricsData(
        metricsEnvoy50,
        timeSeriesMap,
        () => '50th percentile (envoy)',
        (value) => parseFloat(value), // Already in ms
        useLocalTime
      )
    }

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [
    metrics99,
    metrics95,
    metrics50,
    metricsEnvoy99,
    metricsEnvoy95,
    metricsEnvoy50,
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
          content={(props) => {
            const nginxSeries = ['50th percentile (nginx)', '95th percentile (nginx)', '99th percentile (nginx)']
            const envoySeries = ['50th percentile (envoy)', '95th percentile (envoy)', '99th percentile (envoy)']

            return (
              <div className="flex flex-col">
                {props.payload?.some((item) => nginxSeries.includes(item.dataKey as string)) && (
                  <Chart.LegendContent
                    selectedKeys={legendSelectedKeys}
                    {...props}
                    payload={props.payload?.filter((item) => nginxSeries.includes(item.dataKey as string))}
                  />
                )}
                {props.payload?.some((item) => envoySeries.includes(item.dataKey as string)) && (
                  <Chart.LegendContent
                    selectedKeys={legendSelectedKeys}
                    {...props}
                    payload={props.payload?.filter((item) => envoySeries.includes(item.dataKey as string))}
                  />
                )}
              </div>
            )
          }}
        />
      )}
    </LocalChart>
  )
}

export default NetworkRequestDurationChart
