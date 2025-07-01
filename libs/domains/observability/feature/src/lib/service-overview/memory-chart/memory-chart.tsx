import { type OrganizationEventResponse } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { Customized, Line } from 'recharts'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import ReferenceLineEvents from '../reference-line-events/reference-line-events'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function MemoryChart({
  clusterId,
  serviceId,
  events,
}: {
  clusterId: string
  serviceId: string
  events?: OrganizationEventResponse[]
}) {
  const { startTimestamp, endTimestamp, useLocalTime, hideEvents } = useServiceOverviewContext()

  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `sum by (pod, label_qovery_com_service_id) (container_memory_working_set_bytes{container!="", pod=~".+"} * on(namespace, pod) group_left() kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"})`,
  })

  const chartData = useMemo(() => {
    if (!metrics?.data?.result) {
      return []
    }

    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // Process regular CPU metrics (pods)
    processMetricsData(
      metrics,
      timeSeriesMap,
      (_, index) => metrics.data.result[index].metric.pod,
      (value) => parseFloat(value) / 1024 / 1024, // Convert to MiB
      useLocalTime
    )

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [metrics, useLocalTime, startTimestamp, endTimestamp])

  const seriesNames = useMemo(() => {
    if (!metrics?.data?.result) return []
    return metrics.data.result.map((_: unknown, index: number) => metrics.data.result[index].metric.pod) as string[]
  }, [metrics])

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoadingMetrics}
      isEmpty={chartData.length === 0}
      label="Memory (MiB)"
      events={!hideEvents ? events : undefined}
    >
      {seriesNames.map((name) => (
        <Line
          key={name}
          dataKey={name}
          type="linear"
          stroke="var(--color-brand-500)"
          strokeWidth={2}
          dot={false}
          connectNulls={false}
          isAnimationActive={false}
        />
      ))}
      {!hideEvents && <Customized component={ReferenceLineEvents} events={events} />}
    </LocalChart>
  )
}
