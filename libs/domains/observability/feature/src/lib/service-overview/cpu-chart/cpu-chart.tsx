import { memo, useMemo } from 'react'
import { Line } from 'recharts'
import { usePodColor } from '@qovery/shared/util-hooks'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const queryCpuUsage = (serviceId: string) => `
  sum by (pod, label_qovery_com_service_id) (rate(container_cpu_usage_seconds_total{container!="", pod=~".+"}[1m]) * on(namespace, pod) group_left() group by (namespace, pod, label_qovery_com_service_id) (kube_pod_labels{label_qovery_com_service_id="${serviceId}"}))
`

const queryCpuLimit = (serviceId: string) => `
  sum by (label_qovery_com_service_id) (bottomk(1, kube_pod_container_resource_limits{resource="cpu", container!="", pod=~".+"} * on(namespace, pod) group_left(label_qovery_com_service_id) group by (namespace, pod, label_qovery_com_service_id) (kube_pod_labels{label_qovery_com_service_id="${serviceId}"})))
`

const queryCpuRequest = (serviceId: string) => `
  sum by (label_qovery_com_service_id) (bottomk(1, kube_pod_container_resource_requests{resource="cpu", container!="", pod=~".+"} * on(namespace, pod) group_left(label_qovery_com_service_id) group by (namespace, pod, label_qovery_com_service_id) (kube_pod_labels{label_qovery_com_service_id="${serviceId}"})))
`

export const CpuChart = memo(function CpuChart({ clusterId, serviceId }: { clusterId: string; serviceId: string }) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useServiceOverviewContext()
  const getColorByPod = usePodColor()

  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    query: queryCpuUsage(serviceId),
    startTimestamp,
    endTimestamp,
    timeRange,
  })

  const { data: limitMetrics, isLoading: isLoadingLimit } = useMetrics({
    clusterId,
    query: queryCpuLimit(serviceId),
    startTimestamp,
    endTimestamp,
    timeRange,
  })

  const { data: requestMetrics, isLoading: isLoadingRequest } = useMetrics({
    clusterId,
    query: queryCpuRequest(serviceId),
    startTimestamp,
    endTimestamp,
    timeRange,
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
      (value) => parseFloat(value) * 1000, // Convert to mCPU
      useLocalTime
    )

    // Process CPU limit metrics
    processMetricsData(
      limitMetrics,
      timeSeriesMap,
      () => 'cpu-limit',
      (value) => parseFloat(value) * 1000, // Convert to mCPU
      useLocalTime
    )

    // Process CPU request metrics
    processMetricsData(
      requestMetrics,
      timeSeriesMap,
      () => 'cpu-request',
      (value) => parseFloat(value) * 1000, // Convert to mCPU
      useLocalTime
    )

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [metrics, limitMetrics, requestMetrics, useLocalTime, startTimestamp, endTimestamp])

  const seriesNames = useMemo(() => {
    if (!metrics?.data?.result) return []
    return metrics.data.result.map((_: unknown, index: number) => metrics.data.result[index].metric.pod) as string[]
  }, [metrics])

  // const renderCpuLimitLabel = renderResourceLimitLabel('CPU limit', chartData)

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoadingMetrics || isLoadingLimit || isLoadingRequest}
      isEmpty={chartData.length === 0}
      label="CPU usage (mCPU)"
      description="Usage per instance in mCPU of CPU limit and request"
      tooltipLabel="CPU"
      unit="mCPU"
      serviceId={serviceId}
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
        dataKey="cpu-request"
        type="linear"
        stroke="var(--color-neutral-300)"
        strokeDasharray="4 4"
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
      />
      <Line
        dataKey="cpu-limit"
        type="linear"
        stroke="var(--color-red-500)"
        strokeDasharray="4 4"
        strokeWidth={2}
        // label={renderCpuLimitLabel}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
      />
    </LocalChart>
  )
})

export default CpuChart
