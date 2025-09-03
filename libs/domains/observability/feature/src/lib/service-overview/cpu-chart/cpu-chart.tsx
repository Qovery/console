import { useMemo, useState } from 'react'
import { type LegendPayload, Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { usePodColor } from '@qovery/shared/util-hooks'
import { calculateRateInterval, useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { convertPodName } from '../util-chart/convert-pod-name'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const queryCpuUsage = (serviceId: string, rateInterval: string) => `
  sum by (pod, label_qovery_com_service_id) (rate(container_cpu_usage_seconds_total{container!=""}[${rateInterval}]) * on(namespace, pod) group_left() group by (namespace, pod, label_qovery_com_service_id) (kube_pod_labels{label_qovery_com_service_id="${serviceId}"}))
`

const queryCpuLimit = (serviceId: string) => `
  sum by (label_qovery_com_service_id) (bottomk(1, kube_pod_container_resource_limits{resource="cpu", container!=""} * on(namespace, pod) group_left(label_qovery_com_service_id) group by (namespace, pod, label_qovery_com_service_id) (kube_pod_labels{label_qovery_com_service_id="${serviceId}"})))
`

const queryCpuRequest = (serviceId: string) => `
  sum by (label_qovery_com_service_id) (bottomk(1, kube_pod_container_resource_requests{resource="cpu", container!=""} * on(namespace, pod) group_left(label_qovery_com_service_id) group by (namespace, pod, label_qovery_com_service_id) (kube_pod_labels{label_qovery_com_service_id="${serviceId}"})))
`

export function CpuChart({ clusterId, serviceId }: { clusterId: string; serviceId: string }) {
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

  const rateInterval = useMemo(
    () => calculateRateInterval(startTimestamp, endTimestamp),
    [startTimestamp, endTimestamp]
  )

  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    query: queryCpuUsage(serviceId, rateInterval),
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
      (_, index) => convertPodName(metrics.data.result[index].metric.pod),
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
    return metrics.data.result.map((_: unknown, index: number) =>
      convertPodName(metrics.data.result[index].metric.pod)
    ) as string[]
  }, [metrics])

  const isLoading = isLoadingMetrics || isLoadingLimit || isLoadingRequest

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoading}
      isEmpty={chartData.length === 0}
      label="CPU usage (mCPU)"
      description="Usage per instance in mCPU of CPU limit and request"
      tooltipLabel="CPU"
      unit="mCPU"
      serviceId={serviceId}
      handleResetLegend={legendSelectedKeys.size > 0 ? handleResetLegend : undefined}
    >
      {seriesNames.map((name) => {
        return (
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
            className={legendSelectedKeys.size > 0 && !legendSelectedKeys.has(name) ? 'opacity-0' : ''}
          />
        )
      })}
      <Line
        dataKey="cpu-request"
        name="cpu-request"
        type="linear"
        stroke="var(--color-neutral-300)"
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
        className={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('cpu-request') ? 'opacity-0' : ''}
      />
      <Line
        dataKey="cpu-limit"
        name="cpu-limit"
        type="linear"
        stroke="var(--color-red-500)"
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
        className={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('cpu-limit') ? 'opacity-0' : ''}
      />
      {!isLoading && chartData.length > 0 && (
        <Chart.Legend
          name="cpu"
          className="w-[calc(100%-0.5rem)] py-2"
          onClick={onClick}
          content={(props) => (
            <Chart.LegendContent
              selectedKeys={legendSelectedKeys}
              formatter={(value) => {
                if (value === 'cpu-request') {
                  return 'CPU Request'
                }
                if (value === 'cpu-limit') {
                  return 'CPU Limit'
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

export default CpuChart
