import { type OrganizationEventResponse } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { Line } from 'recharts'
import { usePodColor } from '@qovery/shared/util-hooks'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function MemoryChart({
  clusterId,
  serviceId,
  kubeEvents,
}: {
  clusterId: string
  serviceId: string
  kubeEvents?: any
}) {
  const { startTimestamp, endTimestamp, useLocalTime } = useServiceOverviewContext()
  const getColorByPod = usePodColor()

  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `sum by (pod, label_qovery_com_service_id) (container_memory_working_set_bytes{container!="", pod=~".+"} * on(namespace, pod) group_left() kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"})`,
  })

  const { data: metricsLimit, isLoading: isLoadingMetricsLimit } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `sum by (label_qovery_com_service_id) (bottomk(1, kube_pod_container_resource_requests{resource="memory", container!="", pod=~".+"} * on(namespace, pod) group_left(label_qovery_com_service_id) kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}))`,
  })

  const { data: metricsRequest, isLoading: isLoadingMetricsRequest } = useMetrics({
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

    // Process memory limit metrics
    processMetricsData(
      metricsLimit,
      timeSeriesMap,
      () => 'memory-limit',
      (value) => parseFloat(value) / 1024 / 1024, // Convert to MiB
      useLocalTime
    )

    // Process memory request metrics
    processMetricsData(
      metricsRequest,
      timeSeriesMap,
      () => 'memory-request',
      (value) => parseFloat(value) / 1024 / 1024, // Convert to MiB
      useLocalTime
    )

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [metrics, metricsLimit, metricsRequest, useLocalTime, startTimestamp, endTimestamp])

  const seriesNames = useMemo(() => {
    if (!metrics?.data?.result) return []
    return metrics.data.result.map((_: unknown, index: number) => metrics.data.result[index].metric.pod) as string[]
  }, [metrics])

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoadingMetrics || isLoadingMetricsLimit || isLoadingMetricsRequest}
      isEmpty={chartData.length === 0}
      label="Memory (MiB)"
      serviceId={serviceId}
      clusterId={clusterId}
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
        />
      ))}
      <Line
        dataKey="memory-limit"
        type="linear"
        stroke="var(--color-red-500)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      <Line
        dataKey="memory-request"
        type="linear"
        stroke="var(--color-brand-500)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
    </LocalChart>
  )
}
