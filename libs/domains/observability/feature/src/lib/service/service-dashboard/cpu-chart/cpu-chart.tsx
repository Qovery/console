import { useMemo, useState } from 'react'
import { type LegendPayload, Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { usePodColor } from '@qovery/shared/util-hooks'
import { calculateRateInterval, useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../../../local-chart/local-chart'
import { addTimeRangePadding } from '../../../util-chart/add-time-range-padding'
import { convertPodName } from '../../../util-chart/convert-pod-name'
import { processMetricsData } from '../../../util-chart/process-metrics-data'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

const queryCpuUsage = (rateInterval: string, containerName: string, podNames?: string[]) => {
  if (podNames && podNames.length > 0) {
    const podFilter = podNames.join('|')
    return `sum by (pod) (rate(container_cpu_usage_seconds_total{pod=~"${podFilter}"}[${rateInterval}]))`
  }
  return `sum by (pod) (rate(container_cpu_usage_seconds_total{container="${containerName}"}[${rateInterval}]))`
}

const queryCpuLimit = (containerName: string, podNames?: string[]) => {
  if (podNames && podNames.length > 0) {
    const podFilter = podNames.join('|')
    return `sum (bottomk(1, kube_pod_container_resource_limits{resource="cpu",pod=~"${podFilter}"}))`
  }
  return `sum (bottomk(1, kube_pod_container_resource_limits{resource="cpu",container="${containerName}"}))`
}

const queryCpuRequest = (containerName: string, podNames?: string[]) => {
  if (podNames && podNames.length > 0) {
    const podFilter = podNames.join('|')
    return `sum (bottomk(1, kube_pod_container_resource_requests{resource="cpu",pod=~"${podFilter}"}))`
  }
  return `sum (bottomk(1, kube_pod_container_resource_requests{resource="cpu",container="${containerName}"}))`
}

export function CpuChart({
  clusterId,
  serviceId,
  containerName,
  podNames,
}: {
  clusterId: string
  serviceId: string
  containerName: string
  podNames?: string[]
}) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useDashboardContext()
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
    query: queryCpuUsage(rateInterval, containerName, podNames),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'cpu',
  })

  const { data: limitMetrics, isLoading: isLoadingLimit } = useMetrics({
    clusterId,
    query: queryCpuLimit(containerName, podNames),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'cpu_limit',
  })

  const { data: requestMetrics, isLoading: isLoadingRequest } = useMetrics({
    clusterId,
    query: queryCpuRequest(containerName, podNames),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'cpu_request',
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
            hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has(name) ? true : false}
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
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('cpu-request') ? true : false}
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
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('cpu-limit') ? true : false}
      />
      {!isLoading && chartData.length > 0 && (
        <Chart.Legend
          name="cpu"
          className="w-[calc(100%-0.5rem)] pb-1 pt-2"
          onClick={onClick}
          itemSorter={(item) => {
            if (item.value === 'cpu-request') {
              return -1
            }
            if (item.value === 'cpu-limit') {
              return -2
            }
            return 0
          }}
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
