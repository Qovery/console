import { useMemo, useState } from 'react'
import { type LegendPayload, Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { usePodColor } from '@qovery/shared/util-hooks'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { convertPodName } from '../util-chart/convert-pod-name'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const queryMemoryUsage = (serviceId: string) => `
  sum by (pod, label_qovery_com_service_id) (container_memory_working_set_bytes{container!=""} * on(namespace, pod) group_left() group by (namespace, pod, label_qovery_com_service_id) (kube_pod_labels{label_qovery_com_service_id="${serviceId}"} ))
`

const queryMemoryLimit = (serviceId: string) => `
  sum by (label_qovery_com_service_id) (bottomk(1, kube_pod_container_resource_limits{resource="memory", container!=""} * on(namespace, pod) group_left(label_qovery_com_service_id) group by (namespace, pod, label_qovery_com_service_id) (kube_pod_labels{label_qovery_com_service_id="${serviceId}"} )))
`

const queryMemoryRequest = (serviceId: string) => `
  sum by (label_qovery_com_service_id) (bottomk(1, kube_pod_container_resource_requests{resource="memory", container!=""} * on(namespace, pod) group_left(label_qovery_com_service_id) group by (namespace, pod, label_qovery_com_service_id) (kube_pod_labels{label_qovery_com_service_id="${serviceId}"} )))
`

export function MemoryChart({ clusterId, serviceId }: { clusterId: string; serviceId: string }) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useServiceOverviewContext()
  const getColorByPod = usePodColor()

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
      (_, index) => convertPodName(metrics.data.result[index].metric.pod),
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
    return metrics.data.result.map((_: unknown, index: number) =>
      convertPodName(metrics.data.result[index].metric.pod)
    ) as string[]
  }, [metrics])

  const isLoading = isLoadingMetrics || isLoadingMetricsLimit || isLoadingMetricsRequest

  return (
    <LocalChart
      data={chartData}
      unit="MiB"
      isLoading={isLoading}
      isEmpty={chartData.length === 0}
      label="Memory usage (MiB)"
      description="Usage per instance in MiB of memory limit and request"
      tooltipLabel="Memory"
      serviceId={serviceId}
      handleResetLegend={legendSelectedKeys.size > 0 ? handleResetLegend : undefined}
    >
      {seriesNames.map((name) => (
        <Line
          key={name}
          dataKey={name}
          name={name}
          type="linear"
          stroke={getColorByPod(name)}
          strokeWidth={2}
          dot={false}
          connectNulls={false}
          isAnimationActive={false}
          className={legendSelectedKeys.size > 0 && !legendSelectedKeys.has(name) ? '[&>path]:opacity-0' : ''}
        />
      ))}
      <Line
        dataKey="memory-request"
        name="memory-request"
        type="linear"
        stroke="var(--color-neutral-300)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        className={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('memory-request') ? '[&>path]:opacity-0' : ''}
      />
      <Line
        dataKey="memory-limit"
        name="memory-limit"
        type="linear"
        stroke="var(--color-red-500)"
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
        className={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('memory-limit') ? '[&>path]:opacity-0' : ''}
      />
      {!isLoading && chartData.length > 0 && (
        <Chart.Legend
          className="w-[calc(100%-0.5rem)] py-2"
          onClick={onClick}
          itemSorter={(item) => {
            if (item.value === 'memory-request') {
              return -1
            }
            if (item.value === 'memory-limit') {
              return -2
            }
            return 0
          }}
          content={(props) => (
            <Chart.LegendContent
              name="memory"
              selectedKeys={legendSelectedKeys}
              formatter={(value) => {
                if (value === 'memory-request') {
                  return 'Memory Request'
                }
                if (value === 'memory-limit') {
                  return 'Memory Limit'
                }
                return value as string
              }}
              {...props}
            />
          )}
        />
      )}
    </LocalChart>
  )
}

export default MemoryChart
