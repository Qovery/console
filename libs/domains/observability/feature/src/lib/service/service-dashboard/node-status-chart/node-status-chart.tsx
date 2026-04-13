import { useMemo } from 'react'
import { Area } from 'recharts'
import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { LocalChart, type ReferenceLineEvent } from '../../../local-chart/local-chart'
import { addTimeRangePadding } from '../../../util-chart/add-time-range-padding'
import { processMetricsData } from '../../../util-chart/process-metrics-data'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

const queryTotalNodes = () => `count(kube_node_info)`

const queryReadyNodes = () => `count(kube_node_status_condition{condition="Ready",status="true"} == 1)`

export function NodeStatusChart({
  clusterId,
  serviceId,
  isFullscreen,
}: {
  clusterId: string
  serviceId: string
  isFullscreen?: boolean
}) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useDashboardContext()
  const showReferenceLines =
    isFullscreen || timeRange === '5m' || timeRange === '15m' || timeRange === '30m' || timeRange === '1h'

  const { data: totalMetrics, isLoading: isLoadingTotal } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryTotalNodes(),
    boardShortName: 'service_overview',
    metricShortName: 'node_status_total',
  })

  const { data: readyMetrics, isLoading: isLoadingReady } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryReadyNodes(),
    boardShortName: 'service_overview',
    metricShortName: 'node_status_ready',
  })

  const chartData = useMemo(() => {
    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    processMetricsData(
      totalMetrics,
      timeSeriesMap,
      () => 'Total',
      (value) => parseFloat(value),
      useLocalTime
    )
    processMetricsData(
      readyMetrics,
      timeSeriesMap,
      () => 'Node ready',
      (value) => parseFloat(value),
      useLocalTime
    )

    for (const point of timeSeriesMap.values()) {
      const total = point['Total'] as number | null
      const ready = point['Node ready'] as number | null
      if (total != null && ready != null) {
        point['Node not ready'] = Math.max(0, total - ready)
      }
    }

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)
    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [totalMetrics, readyMetrics, useLocalTime, startTimestamp, endTimestamp])

  const referenceLineData = useMemo((): ReferenceLineEvent[] => {
    if (!totalMetrics?.data?.result?.[0]?.values) return []

    const lines: ReferenceLineEvent[] = []
    const values = totalMetrics.data.result[0].values as [number, string][]

    for (let i = 1; i < values.length; i++) {
      const prev = parseFloat(values[i - 1][1])
      const curr = parseFloat(values[i][1])
      if (!isFinite(prev) || !isFinite(curr) || curr === prev) continue

      const delta = curr - prev
      const timestamp = values[i][0] * 1000

      if (delta > 0) {
        lines.push({
          type: 'event',
          timestamp,
          reason: `+${delta} node${delta > 1 ? 's' : ''}`,
          icon: 'arrow-up',
          color: 'var(--color-green-500)',
          key: `node-up-${timestamp}`,
        })
      } else {
        lines.push({
          type: 'event',
          timestamp,
          reason: `${delta} node${Math.abs(delta) > 1 ? 's' : ''}`,
          icon: 'arrow-down',
          color: 'var(--color-red-500)',
          key: `node-down-${timestamp}`,
        })
      }
    }

    return lines
  }, [totalMetrics])

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoadingTotal || isLoadingReady}
      isEmpty={chartData.length === 0}
      unit="instance"
      tooltipLabel="Nodes"
      serviceId={serviceId}
      yDomain={[0, 'dataMax + 1']}
      referenceLineData={showReferenceLines ? referenceLineData : []}
      isFullscreen={isFullscreen}
    >
      <Area
        dataKey="Node ready"
        stroke="var(--color-green-500)"
        fill="var(--color-green-500)"
        fillOpacity={0.3}
        strokeWidth={0}
        isAnimationActive={false}
        dot={false}
        stackId="status"
      />
      <Area
        dataKey="Node not ready"
        stroke="var(--color-red-500)"
        fill="var(--color-red-500)"
        fillOpacity={0.3}
        strokeWidth={0}
        isAnimationActive={false}
        dot={false}
        stackId="status"
      />
    </LocalChart>
  )
}

export default NodeStatusChart
