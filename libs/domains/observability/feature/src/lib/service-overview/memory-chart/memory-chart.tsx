import { useCallback } from 'react'
import { Line } from 'recharts'
import { usePodColor } from '@qovery/shared/util-hooks'
import { useMetrics, type MetricData } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { useResourceChartData } from '../util-chart/optimized-chart-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const queryMemoryUsage = (serviceId: string) => `
  sum by (pod, label_qovery_com_service_id) (container_memory_working_set_bytes{container!="", pod=~".+"} * on(namespace, pod) group_left() group by (namespace, pod, label_qovery_com_service_id) (kube_pod_labels{label_qovery_com_service_id="${serviceId}"} ))
`

const queryMemoryLimit = (serviceId: string) => `
  sum by (label_qovery_com_service_id) (bottomk(1, kube_pod_container_resource_limits{resource="memory", container!="", pod=~".+"} * on(namespace, pod) group_left(label_qovery_com_service_id) group by (namespace, pod, label_qovery_com_service_id) (kube_pod_labels{label_qovery_com_service_id="${serviceId}"} )))
`

const queryMemoryRequest = (serviceId: string) => `
  sum by (label_qovery_com_service_id) (bottomk(1, kube_pod_container_resource_requests{resource="memory", container!="", pod=~".+"} * on(namespace, pod) group_left(label_qovery_com_service_id) group by (namespace, pod, label_qovery_com_service_id) (kube_pod_labels{label_qovery_com_service_id="${serviceId}"} )))
`

export function MemoryChart({ clusterId, serviceId }: { clusterId: string; serviceId: string }) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useServiceOverviewContext()
  const getColorByPod = usePodColor()

  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryMemoryUsage(serviceId),
    timeRange,
  })

  const { data: metricsLimit, isLoading: isLoadingMetricsLimit } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryMemoryLimit(serviceId),
    timeRange,
  })

  const { data: metricsRequest, isLoading: isLoadingMetricsRequest } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryMemoryRequest(serviceId),
    timeRange,
  })

  // Memoize transform and series name functions to prevent recreation
  const transformValue = useCallback((value: string) => parseFloat(value) / 1024 / 1024, []) // Convert to MiB
  const getSeriesName = useCallback((series: MetricData, index: number) => 
    series.metric.pod, []
  )

  // Use optimized chart data processing
  const { chartData, seriesNames } = useResourceChartData({
    usageMetrics: metrics,
    limitMetrics: metricsLimit,
    requestMetrics: metricsRequest,
    serviceId,
    useLocalTime,
    startTimestamp,
    endTimestamp,
    transformValue,
    getSeriesName,
    limitSeriesName: 'memory-limit',
    requestSeriesName: 'memory-request',
  })

  // const renderMemoryLimitLabel = renderResourceLimitLabel('Memory limit', chartData)

  return (
    <LocalChart
      data={chartData}
      unit="MiB"
      isLoading={isLoadingMetrics || isLoadingMetricsLimit || isLoadingMetricsRequest}
      isEmpty={chartData.length === 0}
      label="Memory usage (MiB)"
      description="Usage per instance in MiB of memory limit and request"
      tooltipLabel="Memory"
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
        dataKey="memory-request"
        type="linear"
        stroke="var(--color-neutral-300)"
        strokeDasharray="4 4"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      <Line
        dataKey="memory-limit"
        type="linear"
        stroke="var(--color-red-500)"
        strokeDasharray="4 4"
        strokeWidth={2}
        // label={renderMemoryLimitLabel}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
      />
    </LocalChart>
  )
}

export default MemoryChart
