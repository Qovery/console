import { useMemo, useState } from 'react'
import { type LegendPayload, Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../../../local-chart/local-chart'
import { PartialErrorBadge } from '../../../local-chart/partial-error-badge'
import { addTimeRangePadding } from '../../../util-chart/add-time-range-padding'
import { processMetricsData } from '../../../util-chart/process-metrics-data'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

// NOTE: the p50/p95/p99 recording rules are a histogram_quantile over a 5m rate
// window, which evaluates to NaN (not an absent series) when there were zero
// observations in that window. No query-level guard needed: process-metrics-data.ts
// already converts a NaN sample to 0 before it reaches the chart. (Do not wrap
// these in `... or vector(0)` — that idiom only suppresses the fallback for
// label sets identical to the unlabeled vector(0), so it ends up adding a second,
// unlabeled 0-valued series alongside the real one at every step instead of only
// when data is missing.)
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

  const {
    data: metrics50,
    isLoading: isLoadingMetrics50,
    isError: isErrorMetrics50,
  } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryDuration50(containerName),
    boardShortName: 'service_overview',
    metricShortName: 'private_network_p50',
  })

  const {
    data: metrics99,
    isLoading: isLoadingMetrics99,
    isError: isErrorMetrics99,
  } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryDuration99(containerName),
    boardShortName: 'service_overview',
    metricShortName: 'private_network_p99',
  })

  const {
    data: metrics95,
    isLoading: isLoadingMetrics,
    isError: isErrorMetrics95,
  } = useMetrics({
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

    // Process network duration p95 metrics
    processMetricsData(
      metrics95,
      timeSeriesMap,
      () => 'p95',
      (value) => parseFloat(value) * 1000, // Convert to ms
      useLocalTime
    )

    // Process network duration p99 metrics
    processMetricsData(
      metrics99,
      timeSeriesMap,
      () => 'p99',
      (value) => parseFloat(value) * 1000, // Convert to ms
      useLocalTime
    )

    // Process network duration 0.5th percentile metrics
    processMetricsData(
      metrics50,
      timeSeriesMap,
      () => 'p50',
      (value) => parseFloat(value) * 1000, // Convert to ms
      useLocalTime
    )

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    // Keep null padding for gaps — a missing sample (as opposed to an explicit
    // NaN/zero sample, already normalized in processMetricsData) usually means a
    // scrape or recording-rule gap, not confirmed zero traffic. useMetrics only
    // flags isError on a failed request, so a "successful" but sparse query would
    // otherwise render as a false idle flatline instead of a visible gap.
    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [metrics95, metrics99, metrics50, useLocalTime, startTimestamp, endTimestamp])

  // isEmpty && anyError catches "nothing to show, and it's a real failure" (any
  // of p50/p95/p99, not just p95, since a failing p50/p99 could just as well
  // be why nothing rendered). Once chartData has something to show — including
  // stale data kept around by `keepPreviousData` during a failed refetch — a
  // single failing percentile is downgraded to the partial-data badge rather
  // than blanking the chart. But if all three are currently erroring, none of
  // what's on screen reflects a successful fetch, so that still escalates to
  // the full broken state even though stale data technically exists.
  const anyError = isErrorMetrics50 || isErrorMetrics95 || isErrorMetrics99
  const allError = isErrorMetrics50 && isErrorMetrics95 && isErrorMetrics99
  const hasError = chartData.length === 0 ? anyError : allError
  const hasPartialError = chartData.length > 0 && anyError && !allError

  return (
    <LocalChart
      data={chartData}
      serviceId={serviceId}
      isLoading={isLoadingMetrics || isLoadingMetrics99 || isLoadingMetrics50}
      isEmpty={chartData.length === 0}
      hasError={hasError}
      emptyLabel="No traffic in this period"
      label={!isFullscreen ? 'Network request duration (ms)' : undefined}
      description="How long requests take to complete. Lower values mean faster responses"
      descriptionRight={hasPartialError ? <PartialErrorBadge /> : undefined}
      unit="ms"
      handleResetLegend={legendSelectedKeys.size > 0 ? handleResetLegend : undefined}
    >
      <Line
        key="50th-percentile"
        dataKey="p50"
        type="linear"
        stroke="var(--purple-8)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('p50') ? true : false}
      />
      <Line
        key="95th-percentile"
        dataKey="p95"
        type="linear"
        stroke="var(--purple-9)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('p95') ? true : false}
      />
      <Line
        key="99th-percentile"
        dataKey="p99"
        type="linear"
        stroke="var(--purple-10)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('p99') ? true : false}
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
