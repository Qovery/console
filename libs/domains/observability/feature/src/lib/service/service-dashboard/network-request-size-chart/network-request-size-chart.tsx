import { useMemo, useState } from 'react'
import { type LegendPayload, Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../../../local-chart/local-chart'
import { addTimeRangePadding } from '../../../util-chart/add-time-range-padding'
import { processMetricsData } from '../../../util-chart/process-metrics-data'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

// NGINX: Queries for nginx metrics (to remove when migrating to envoy)
const queryResponseSize = (ingressName: string) => `
  sum(nginx:resp_bytes_rate:5m{ingress="${ingressName}"})
`

const queryRequestSize = (ingressName: string) => `
   sum(nginx:req_bytes_rate:5m{ingress="${ingressName}"})
`

// ENVOY: Queries for envoy metrics
const queryEnvoyResponseSize = (httpRouteName: string) => `
  sum(envoy_proxy:resp_bytes_rate:5m{httproute_name="${httpRouteName}"})
`

const queryEnvoyRequestSize = (httpRouteName: string) => `
   sum(envoy_proxy:req_bytes_rate:5m{httproute_name="${httpRouteName}"})
`

export function NetworkRequestSizeChart({
  clusterId,
  serviceId,
  ingressName,
  httpRouteName,
}: {
  clusterId: string
  serviceId: string
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
  const { data: metricsResponseSize, isLoading: isLoadingMetricsResponseSize } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryResponseSize(ingressName),
    boardShortName: 'service_overview',
    metricShortName: 'network_resp_size',
  })

  const { data: metricsRequestSize, isLoading: isLoadingMetricsRequestSize } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryRequestSize(ingressName),
    boardShortName: 'service_overview',
    metricShortName: 'network_req_size',
  })

  // ENVOY: Fetch envoy metrics
  const { data: metricsEnvoyResponseSize, isLoading: isLoadingMetricsEnvoyResponseSize } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryEnvoyResponseSize(httpRouteName),
    boardShortName: 'service_overview',
    metricShortName: 'envoy_resp_size',
  })

  const { data: metricsEnvoyRequestSize, isLoading: isLoadingMetricsEnvoyRequestSize } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryEnvoyRequestSize(httpRouteName),
    boardShortName: 'service_overview',
    metricShortName: 'envoy_req_size',
  })

  const chartData = useMemo(() => {
    // Check if we have data from either source
    if (!metricsResponseSize?.data?.result && !metricsEnvoyResponseSize?.data?.result) {
      return []
    }

    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // NGINX: Process nginx size metrics (to remove when migrating to envoy)
    if (metricsResponseSize?.data?.result) {
      processMetricsData(
        metricsResponseSize,
        timeSeriesMap,
        () => 'Response size (nginx)',
        (value) => parseFloat(value),
        useLocalTime
      )
    }

    if (metricsRequestSize?.data?.result) {
      processMetricsData(
        metricsRequestSize,
        timeSeriesMap,
        () => 'Request size (nginx)',
        (value) => parseFloat(value),
        useLocalTime
      )
    }

    // ENVOY: Process envoy size metrics
    if (metricsEnvoyResponseSize?.data?.result) {
      processMetricsData(
        metricsEnvoyResponseSize,
        timeSeriesMap,
        () => 'Response size (envoy)',
        (value) => parseFloat(value),
        useLocalTime
      )
    }

    if (metricsEnvoyRequestSize?.data?.result) {
      processMetricsData(
        metricsEnvoyRequestSize,
        timeSeriesMap,
        () => 'Request size (envoy)',
        (value) => parseFloat(value),
        useLocalTime
      )
    }

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [
    metricsResponseSize,
    metricsRequestSize,
    metricsEnvoyResponseSize,
    metricsEnvoyRequestSize,
    useLocalTime,
    startTimestamp,
    endTimestamp,
  ])

  const isLoadingMetrics =
    isLoadingMetricsResponseSize ||
    isLoadingMetricsRequestSize ||
    isLoadingMetricsEnvoyResponseSize ||
    isLoadingMetricsEnvoyRequestSize

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoadingMetrics}
      isEmpty={chartData.length === 0}
      label="Network request size (bytes/s)"
      description="Large sizes can increase latency and bandwidth costs"
      unit="bytes"
      serviceId={serviceId}
      handleResetLegend={legendSelectedKeys.size > 0 ? handleResetLegend : undefined}
    >
      {/* NGINX: Lines for nginx metrics (to remove when migrating to envoy) */}
      <Line
        key="response-size-nginx"
        dataKey="Response size (nginx)"
        name="Response size (nginx)"
        type="linear"
        stroke="var(--color-brand-400)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('Response size (nginx)')}
      />
      <Line
        key="request-size-nginx"
        dataKey="Request size (nginx)"
        name="Request size (nginx)"
        type="linear"
        stroke="var(--color-purple-400)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('Request size (nginx)')}
      />
      {/* ENVOY: Lines for envoy metrics */}
      <Line
        key="response-size-envoy"
        dataKey="Response size (envoy)"
        name="Response size (envoy)"
        type="linear"
        stroke="var(--color-green-400)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('Response size (envoy)')}
      />
      <Line
        key="request-size-envoy"
        dataKey="Request size (envoy)"
        name="Request size (envoy)"
        type="linear"
        stroke="var(--color-sky-400)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('Request size (envoy)')}
      />
      {!isLoadingMetrics && chartData.length > 0 && (
        <Chart.Legend
          name="network-request-size"
          className="w-[calc(100%-0.5rem)] pb-1 pt-2"
          onClick={onClick}
          content={(props) => <Chart.LegendContent selectedKeys={legendSelectedKeys} {...props} />}
        />
      )}
    </LocalChart>
  )
}

export default NetworkRequestSizeChart
