import { useMemo, useState } from 'react'
import { type LegendPayload, Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../../../local-chart/local-chart'
import { PartialErrorBadge } from '../../../local-chart/partial-error-badge'
import { addTimeRangePadding } from '../../../util-chart/add-time-range-padding'
import { processMetricsData } from '../../../util-chart/process-metrics-data'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

// NGINX: Queries for nginx metrics (to remove when migrating to envoy)
// NOTE: no `> 0` filter here — at zero traffic that filter drops the series
// entirely instead of rendering a real 0, making an idle service look identical
// to a broken metrics pipeline.
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
  const {
    data: metricsResponseSize,
    isLoading: isLoadingMetricsResponseSize,
    isError: isErrorMetricsResponseSize,
  } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryResponseSize(ingressName),
    boardShortName: 'service_overview',
    metricShortName: 'network_resp_size',
  })

  const {
    data: metricsRequestSize,
    isLoading: isLoadingMetricsRequestSize,
    isError: isErrorMetricsRequestSize,
  } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryRequestSize(ingressName),
    boardShortName: 'service_overview',
    metricShortName: 'network_req_size',
  })

  // ENVOY: Fetch envoy metrics (only if httpRouteName is configured)
  const {
    data: metricsEnvoyResponseSize,
    isLoading: isLoadingMetricsEnvoyResponseSize,
    isError: isErrorMetricsEnvoyResponseSize,
  } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryEnvoyResponseSize(httpRouteName),
    boardShortName: 'service_overview',
    metricShortName: 'envoy_resp_size',
    enabled: !!httpRouteName,
  })

  const {
    data: metricsEnvoyRequestSize,
    isLoading: isLoadingMetricsEnvoyRequestSize,
    isError: isErrorMetricsEnvoyRequestSize,
  } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryEnvoyRequestSize(httpRouteName),
    boardShortName: 'service_overview',
    metricShortName: 'envoy_req_size',
    enabled: !!httpRouteName,
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

    // Keep null padding for gaps — a missing sample (as opposed to an explicit
    // NaN/zero sample, already normalized in processMetricsData) usually means a
    // scrape or recording-rule gap, not confirmed zero traffic. useMetrics only
    // flags isError on a failed request, so a "successful" but sparse query would
    // otherwise render as a false idle flatline instead of a visible gap.
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

  const isLoadingMetrics = useMemo(() => {
    const shouldWaitForEnvoy = !!httpRouteName
    return (
      isLoadingMetricsResponseSize ||
      isLoadingMetricsRequestSize ||
      (shouldWaitForEnvoy && (isLoadingMetricsEnvoyResponseSize || isLoadingMetricsEnvoyRequestSize))
    )
  }, [
    isLoadingMetricsResponseSize,
    isLoadingMetricsRequestSize,
    isLoadingMetricsEnvoyResponseSize,
    isLoadingMetricsEnvoyRequestSize,
    httpRouteName,
  ])

  // hasError and hasPartialError share the same underlying condition (any
  // relevant query erroring) and only differ on whether chartData has anything
  // to show. Splitting them by data presence — rather than by which query is
  // "the gating one" — matters because `useMetrics` uses `keepPreviousData`: a
  // failed refetch on response-size still leaves stale data in place (chartData
  // non-empty) while isErrorMetricsResponseSize is true, so it must stay
  // included here too, not just request-size, or that failure would go
  // silently unflagged.
  const anyError = useMemo(() => {
    const shouldWaitForEnvoy = !!httpRouteName
    return (
      isErrorMetricsResponseSize ||
      isErrorMetricsRequestSize ||
      (shouldWaitForEnvoy && (isErrorMetricsEnvoyResponseSize || isErrorMetricsEnvoyRequestSize))
    )
  }, [
    isErrorMetricsResponseSize,
    isErrorMetricsRequestSize,
    isErrorMetricsEnvoyResponseSize,
    isErrorMetricsEnvoyRequestSize,
    httpRouteName,
  ])
  const hasError = chartData.length === 0 && anyError
  const hasPartialError = chartData.length > 0 && anyError

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoadingMetrics}
      isEmpty={chartData.length === 0}
      hasError={hasError}
      emptyLabel="No traffic in this period"
      label="Network request size (bytes/s)"
      description="Large sizes can increase latency and bandwidth costs"
      descriptionRight={hasPartialError ? <PartialErrorBadge /> : undefined}
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
        stroke="#847AE6"
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
        stroke="#CB87F6"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('Request size (nginx)')}
      />
      {/* ENVOY: Lines for envoy metrics (only shown if httpRouteName is configured) */}
      {httpRouteName && (
        <>
          <Line
            key="response-size-envoy"
            dataKey="Response size (envoy)"
            name="Response size (envoy)"
            type="linear"
            stroke="#70DE91"
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
            stroke="#3AB0E9"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
            hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('Request size (envoy)')}
          />
        </>
      )}
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
