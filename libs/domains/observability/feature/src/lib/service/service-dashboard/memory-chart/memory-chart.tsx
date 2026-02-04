import { useMemo, useState } from 'react'
import { type LegendPayload, Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { usePodColor } from '@qovery/shared/util-hooks'
import { useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../../../local-chart/local-chart'
import { addTimeRangePadding } from '../../../util-chart/add-time-range-padding'
import { buildPromSelector } from '../../../util-chart/build-selector'
import { convertPodName } from '../../../util-chart/convert-pod-name'
import { processMetricsData } from '../../../util-chart/process-metrics-data'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

const queryMemoryUsageByPod = (selector: string) => `sum by (pod) (container_memory_working_set_bytes{${selector}})`

const queryMemoryUsageP50 = (selector: string) => `quantile(0.50, container_memory_working_set_bytes{${selector}})`

const queryMemoryUsageP90 = (selector: string) => `quantile(0.90, container_memory_working_set_bytes{${selector}})`

const queryMemoryLimit = (selector: string) =>
  `sum (bottomk(1, kube_pod_container_resource_limits{resource="memory", ${selector}}))`

const queryMemoryRequest = (selector: string) =>
  `sum (bottomk(1, kube_pod_container_resource_requests{resource="memory", ${selector}}))`

export function MemoryChart({
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

  const selector = useMemo(() => buildPromSelector(containerName, podNames), [containerName, podNames])

  // Query for individual pods (always load to count them)
  const { data: podMetrics, isLoading: isLoadingPods } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryMemoryUsageByPod(selector),
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'memory_by_pod',
  })

  // Dynamically decide based on actual pod count (more performant than time-based threshold)
  // If > 10 pods, use aggregated metrics (p50/p90) to avoid rendering too many series
  const podCount = podMetrics?.data?.result?.length || 0
  const useAggregatedMetrics = podCount > 10

  // Queries for aggregated metrics (used when pod count > 10)
  const { data: p50Metrics, isLoading: isLoadingP50 } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryMemoryUsageP50(selector),
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'memory_p50',
  })

  const { data: p90Metrics, isLoading: isLoadingP90 } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryMemoryUsageP90(selector),
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'memory_p90',
  })

  const { data: metricsLimit, isLoading: isLoadingMetricsLimit } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryMemoryLimit(selector),
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'memory_limit',
  })

  const { data: metricsRequest, isLoading: isLoadingMetricsRequest } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: queryMemoryRequest(selector),
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'memory_request',
  })

  const chartData = useMemo(() => {
    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    if (useAggregatedMetrics) {
      // Process aggregated metrics (p50/p90) for time ranges > 1 hour
      processMetricsData(
        p50Metrics,
        timeSeriesMap,
        () => 'memory-p50',
        (value) => parseFloat(value) / 1024 / 1024, // Convert to MiB
        useLocalTime
      )

      processMetricsData(
        p90Metrics,
        timeSeriesMap,
        () => 'memory-p90',
        (value) => parseFloat(value) / 1024 / 1024, // Convert to MiB
        useLocalTime
      )
    } else {
      // Process individual pod metrics for time ranges <= 1 day
      processMetricsData(
        podMetrics,
        timeSeriesMap,
        (_, index) => convertPodName(podMetrics?.data?.result?.[index]?.metric?.pod || ''),
        (value) => parseFloat(value) / 1024 / 1024, // Convert to MiB
        useLocalTime
      )
    }

    // Always process memory limit and request metrics
    processMetricsData(
      metricsLimit,
      timeSeriesMap,
      () => 'memory-limit',
      (value) => parseFloat(value) / 1024 / 1024, // Convert to MiB
      useLocalTime
    )

    processMetricsData(
      metricsRequest,
      timeSeriesMap,
      () => 'memory-request',
      (value) => parseFloat(value) / 1024 / 1024, // Convert to MiB
      useLocalTime
    )

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [
    useAggregatedMetrics,
    p50Metrics,
    p90Metrics,
    podMetrics,
    metricsLimit,
    metricsRequest,
    useLocalTime,
    startTimestamp,
    endTimestamp,
  ])

  const seriesNames = useMemo(() => {
    if (useAggregatedMetrics || !podMetrics?.data?.result) return []
    return podMetrics.data.result.map((_: unknown, index: number) =>
      convertPodName(podMetrics.data.result[index].metric.pod)
    ) as string[]
  }, [useAggregatedMetrics, podMetrics])

  const isLoading =
    isLoadingPods ||
    isLoadingMetricsLimit ||
    isLoadingMetricsRequest ||
    (useAggregatedMetrics && (isLoadingP50 || isLoadingP90))

  return (
    <LocalChart
      data={chartData}
      unit="MiB"
      isLoading={isLoading}
      isEmpty={chartData.length === 0}
      label="Memory usage (MiB)"
      description={
        useAggregatedMetrics
          ? 'p50 and p90 memory usage across all pods with memory limit and request'
          : 'Usage per instance in MiB of memory limit and request'
      }
      tooltipLabel="Memory"
      serviceId={serviceId}
      handleResetLegend={legendSelectedKeys.size > 0 ? handleResetLegend : undefined}
    >
      {useAggregatedMetrics ? (
        <>
          <Line
            dataKey="memory-p90"
            name="memory-p90"
            type="linear"
            stroke="var(--color-red-400)"
            strokeWidth={2}
            connectNulls={false}
            dot={false}
            isAnimationActive={false}
            hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('memory-p90') ? true : false}
          />
          <Line
            dataKey="memory-p50"
            name="memory-p50"
            type="linear"
            stroke="#10B981"
            strokeWidth={2}
            connectNulls={false}
            dot={false}
            isAnimationActive={false}
            hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('memory-p50') ? true : false}
          />
        </>
      ) : (
        <>
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
              hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has(name) ? true : false}
            />
          ))}
        </>
      )}
      <Line
        dataKey="memory-request"
        name="memory-request"
        type="linear"
        stroke="var(--color-neutral-300)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('memory-request') ? true : false}
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
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('memory-limit') ? true : false}
      />
      {!isLoading && chartData.length > 0 && (
        <Chart.Legend
          className="w-[calc(100%-0.5rem)] pb-1 pt-2"
          onClick={onClick}
          itemSorter={(item) => {
            if (item.value === 'memory-p90') {
              return -4
            }
            if (item.value === 'memory-p50') {
              return -3
            }
            if (item.value === 'memory-limit') {
              return -2
            }
            if (item.value === 'memory-request') {
              return -1
            }
            return 0
          }}
          content={(props) => (
            <Chart.LegendContent
              name="memory"
              selectedKeys={legendSelectedKeys}
              formatter={(value) => {
                if (useAggregatedMetrics) {
                  if (value === 'memory-p90') {
                    return 'Memory p90'
                  }
                  if (value === 'memory-p50') {
                    return 'Memory p50'
                  }
                }
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
