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
// NOTE: the p50/p95/p99 recording rules are a histogram_quantile over a 5m rate
// window, which evaluates to NaN (not an absent series) when there were zero
// observations in that window. No query-level guard needed: process-metrics-data.ts
// already converts a NaN sample to 0 before it reaches the chart. (Do not wrap
// these in `... or vector(0)` — that idiom only suppresses the fallback for
// label sets identical to the unlabeled vector(0), so it ends up adding a second,
// unlabeled 0-valued series alongside the real one at every step instead of only
// when data is missing.)
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
  const {
    data: metricsP50InSeconds,
    isLoading: isLoadingMetrics50,
    isError: isErrorMetrics50,
  } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryDuration50(ingressName),
    boardShortName: 'service_overview',
    metricShortName: 'network_p50',
  })

  const {
    data: metricsP99InSeconds,
    isLoading: isLoadingMetrics99,
    isError: isErrorMetrics99,
  } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryDuration99(ingressName),
    boardShortName: 'service_overview',
    metricShortName: 'network_p99',
  })

  const {
    data: metricsP95InSeconds,
    isLoading: isLoadingMetrics95,
    isError: isErrorMetrics95,
  } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryDuration95(ingressName),
    boardShortName: 'service_overview',
    metricShortName: 'network_p95',
  })

  // ENVOY: Fetch envoy metrics (only if httpRouteName is configured)
  const {
    data: metricsEnvoyP50InMs,
    isLoading: isLoadingMetricsEnvoy50,
    isError: isErrorMetricsEnvoy50,
  } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryEnvoyDuration50(httpRouteName),
    boardShortName: 'service_overview',
    metricShortName: 'envoy_p50',
    enabled: !!httpRouteName,
  })

  const {
    data: metricsEnvoyP99InMs,
    isLoading: isLoadingMetricsEnvoy99,
    isError: isErrorMetricsEnvoy99,
  } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryEnvoyDuration99(httpRouteName),
    boardShortName: 'service_overview',
    metricShortName: 'envoy_p99',
    enabled: !!httpRouteName,
  })

  const {
    data: metricsEnvoyP95InMs,
    isLoading: isLoadingMetricsEnvoy95,
    isError: isErrorMetricsEnvoy95,
  } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryEnvoyDuration95(httpRouteName),
    boardShortName: 'service_overview',
    metricShortName: 'envoy_p95',
    enabled: !!httpRouteName,
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
        () => 'p99 (nginx)',
        (value) => parseFloat(value) * 1000, // Convert seconds to ms
        useLocalTime
      )
    }

    if (metricsP95InSeconds?.data?.result) {
      processMetricsData(
        metricsP95InSeconds,
        timeSeriesMap,
        () => 'p95 (nginx)',
        (value) => parseFloat(value) * 1000, // Convert seconds to ms
        useLocalTime
      )
    }

    if (metricsP50InSeconds?.data?.result) {
      processMetricsData(
        metricsP50InSeconds,
        timeSeriesMap,
        () => 'p50 (nginx)',
        (value) => parseFloat(value) * 1000, // Convert seconds to ms
        useLocalTime
      )
    }

    // ENVOY: Process envoy duration metrics (already in ms)
    if (metricsEnvoyP99InMs?.data?.result) {
      processMetricsData(
        metricsEnvoyP99InMs,
        timeSeriesMap,
        () => 'p99 (envoy)',
        (value) => parseFloat(value), // Already in ms
        useLocalTime
      )
    }

    if (metricsEnvoyP95InMs?.data?.result) {
      processMetricsData(
        metricsEnvoyP95InMs,
        timeSeriesMap,
        () => 'p95 (envoy)',
        (value) => parseFloat(value), // Already in ms
        useLocalTime
      )
    }

    if (metricsEnvoyP50InMs?.data?.result) {
      processMetricsData(
        metricsEnvoyP50InMs,
        timeSeriesMap,
        () => 'p50 (envoy)',
        (value) => parseFloat(value), // Already in ms
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

  const isLoadingMetrics = useMemo(() => {
    const shouldWaitForEnvoy = !!httpRouteName
    return (
      isLoadingMetrics99 ||
      isLoadingMetrics50 ||
      isLoadingMetrics95 ||
      (shouldWaitForEnvoy && (isLoadingMetricsEnvoy99 || isLoadingMetricsEnvoy50 || isLoadingMetricsEnvoy95))
    )
  }, [
    isLoadingMetrics99,
    isLoadingMetrics50,
    isLoadingMetrics95,
    isLoadingMetricsEnvoy99,
    httpRouteName,
    isLoadingMetricsEnvoy50,
    isLoadingMetricsEnvoy95,
  ])

  // isEmpty && anyError catches "nothing to show, and it's a real failure"
  // (any relevant query, not just p99, since a failing p50/p95 could just as
  // well be why nothing rendered). Once chartData has something to show —
  // including stale data kept around by `keepPreviousData` during a failed
  // refetch — a single failing percentile is downgraded to the partial-data
  // badge rather than blanking the chart. But if EVERY relevant query is
  // currently erroring, none of what's on screen reflects a successful fetch,
  // so that still escalates to the full broken state even though stale data
  // technically exists.
  const anyError = useMemo(() => {
    const shouldWaitForEnvoy = !!httpRouteName
    return (
      isErrorMetrics99 ||
      isErrorMetrics50 ||
      isErrorMetrics95 ||
      (shouldWaitForEnvoy && (isErrorMetricsEnvoy99 || isErrorMetricsEnvoy50 || isErrorMetricsEnvoy95))
    )
  }, [
    isErrorMetrics99,
    isErrorMetrics50,
    isErrorMetrics95,
    isErrorMetricsEnvoy99,
    isErrorMetricsEnvoy50,
    isErrorMetricsEnvoy95,
    httpRouteName,
  ])
  const allError = useMemo(() => {
    const shouldWaitForEnvoy = !!httpRouteName
    return (
      isErrorMetrics99 &&
      isErrorMetrics50 &&
      isErrorMetrics95 &&
      (!shouldWaitForEnvoy || (isErrorMetricsEnvoy99 && isErrorMetricsEnvoy50 && isErrorMetricsEnvoy95))
    )
  }, [
    isErrorMetrics99,
    isErrorMetrics50,
    isErrorMetrics95,
    isErrorMetricsEnvoy99,
    isErrorMetricsEnvoy50,
    isErrorMetricsEnvoy95,
    httpRouteName,
  ])
  const hasError = chartData.length === 0 ? anyError : allError
  const hasPartialError = chartData.length > 0 && anyError && !allError

  return (
    <LocalChart
      data={chartData}
      serviceId={serviceId}
      isLoading={isLoadingMetrics}
      isEmpty={chartData.length === 0}
      hasError={hasError}
      emptyLabel="No traffic in this period"
      label={!isFullscreen ? 'Network request duration (ms)' : undefined}
      description="How long requests take to complete. Lower values mean faster responses"
      descriptionRight={hasPartialError ? <PartialErrorBadge /> : undefined}
      unit="ms"
      handleResetLegend={legendSelectedKeys.size > 0 ? handleResetLegend : undefined}
    >
      {/* NGINX: Lines for nginx metrics (to remove when migrating to envoy) */}
      <Line
        key="50th-percentile-nginx"
        dataKey="p50 (nginx)"
        name="p50 (nginx)"
        type="linear"
        stroke="#CB87F6"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('p50 (nginx)')}
      />
      <Line
        key="95th-percentile-nginx"
        dataKey="p95 (nginx)"
        name="p95 (nginx)"
        type="linear"
        stroke="#847AE6"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('p95 (nginx)')}
      />
      <Line
        key="99th-percentile-nginx"
        dataKey="p99 (nginx)"
        name="p99 (nginx)"
        type="linear"
        stroke="#8B46CE"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('p99 (nginx)')}
      />
      {/* ENVOY: Lines for envoy metrics (only shown if httpRouteName is configured) */}
      {httpRouteName && (
        <>
          <Line
            key="50th-percentile-envoy"
            dataKey="p50 (envoy)"
            name="p50 (envoy)"
            type="linear"
            stroke="#70DE91"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
            hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('p50 (envoy)')}
          />
          <Line
            key="95th-percentile-envoy"
            dataKey="p95 (envoy)"
            name="p95 (envoy)"
            type="linear"
            stroke="#3AB0E9"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
            hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('p95 (envoy)')}
          />
          <Line
            key="99th-percentile-envoy"
            dataKey="p99 (envoy)"
            name="p99 (envoy)"
            type="linear"
            stroke="#31AC6F"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
            hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('p99 (envoy)')}
          />
        </>
      )}
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
