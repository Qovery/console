import { useMemo, useState } from 'react'
import { type LegendPayload, Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { getColorByPod } from '@qovery/shared/util-hooks'
import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../../../local-chart/local-chart'
import { PartialErrorBadge } from '../../../local-chart/partial-error-badge'
import { addTimeRangePadding } from '../../../util-chart/add-time-range-padding'
import { processMetricsData } from '../../../util-chart/process-metrics-data'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

// NOTE: no `> 0` filter here — at zero request rate that filter drops the series
// entirely instead of rendering a real 0, making an idle service look identical
// to a broken metrics pipeline.
const query = (containerName: string) => `
   sum by(http_response_status_code)(beyla:req_rate:5m_by_status{k8s_container_name="${containerName}"})
`

export function PrivateNetworkRequestStatusChart({
  clusterId,
  serviceId,
  containerName,
}: {
  clusterId: string
  serviceId: string
  containerName: string
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
    data: metrics,
    isLoading: isLoadingMetrics,
    isError: isErrorMetrics,
  } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: query(containerName),
    boardShortName: 'service_overview',
    metricShortName: 'private_network_count',
  })

  const chartData = useMemo(() => {
    if (!metrics?.data?.result) {
      return []
    }

    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // Process network request metrics
    processMetricsData(
      metrics,
      timeSeriesMap,
      (_, index) => JSON.stringify(metrics.data.result[index].metric),
      (value) => parseFloat(value),
      useLocalTime
    )

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    // Keep null padding for gaps — a missing sample (as opposed to an explicit
    // NaN/zero sample, already normalized in processMetricsData) usually means a
    // scrape or recording-rule gap, not confirmed zero traffic. useMetrics only
    // flags isError on a failed request, so a "successful" but sparse query would
    // otherwise render as a false idle flatline instead of a visible gap.
    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [metrics, useLocalTime, startTimestamp, endTimestamp])

  // Only fully blank the chart when there's nothing to show AND the query
  // errored. `useMetrics` uses `keepPreviousData`, so a failed refetch can
  // leave stale data in place (chartData non-empty) while isError is still
  // true — that should surface as partial/stale data, not blank a chart that
  // still has something to display.
  const hasError = chartData.length === 0 && isErrorMetrics
  const hasPartialError = chartData.length > 0 && isErrorMetrics

  const seriesNames = useMemo(() => {
    if (!metrics?.data?.result) return []
    return metrics.data.result.map((_: unknown, index: number) =>
      JSON.stringify(metrics.data.result[index].metric)
    ) as string[]
  }, [metrics])

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoadingMetrics}
      isEmpty={chartData.length === 0}
      hasError={hasError}
      emptyLabel="No traffic in this period"
      label="Network request status (req/s)"
      description="Sudden drops or spikes may signal service instability"
      descriptionRight={hasPartialError ? <PartialErrorBadge /> : undefined}
      unit="req/s"
      serviceId={serviceId}
      handleResetLegend={legendSelectedKeys.size > 0 ? handleResetLegend : undefined}
    >
      {seriesNames.map((name) => (
        <Line
          key={name}
          dataKey={name}
          type="linear"
          stroke={getColorByPod(name)}
          strokeWidth={2}
          dot={false}
          connectNulls={false}
          isAnimationActive={false}
          hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has(name) ? true : false}
        />
      ))}
      {!isLoadingMetrics && chartData.length > 0 && (
        <Chart.Legend
          name="private-network-request-status"
          className="w-[calc(100%-0.5rem)] pb-1 pt-2"
          onClick={onClick}
          content={(props) => <Chart.LegendContent selectedKeys={legendSelectedKeys} {...props} />}
        />
      )}
    </LocalChart>
  )
}

export default PrivateNetworkRequestStatusChart
