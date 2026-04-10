import { useEffect, useMemo, useState } from 'react'
import { type LegendPayload, Line } from 'recharts'
import { Chart } from '@qovery/shared/ui'
import { usePodColor } from '@qovery/shared/util-hooks'
import { calculateRateInterval, useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { usePodCount } from '../../../hooks/use-pod-count/use-pod-count'
import { LocalChart } from '../../../local-chart/local-chart'
import { addTimeRangePadding } from '../../../util-chart/add-time-range-padding'
import { buildPromSelector } from '../../../util-chart/build-selector'
import { convertPodName } from '../../../util-chart/convert-pod-name'
import { processMetricsData } from '../../../util-chart/process-metrics-data'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

const queryCpuUsageByPod = (rateInterval: string, selector: string) =>
  `sum by (pod) (rate(container_cpu_usage_seconds_total{${selector}}[${rateInterval}]))`

const queryCpuUsageP50 = (rateInterval: string, selector: string) =>
  `quantile(0.50, rate(container_cpu_usage_seconds_total{${selector}}[${rateInterval}]))`

const queryCpuUsageP90 = (rateInterval: string, selector: string) =>
  `quantile(0.90, rate(container_cpu_usage_seconds_total{${selector}}[${rateInterval}]))`

const queryCpuLimit = (selector: string) =>
  `sum (bottomk(1, kube_pod_container_resource_limits{resource="cpu",${selector}}))`

const queryCpuRequest = (selector: string) =>
  `sum (bottomk(1, kube_pod_container_resource_requests{resource="cpu",${selector}}))`

export function CpuChart({
  clusterId,
  serviceId,
  containerName,
  podNames,
  podCountData,
}: {
  clusterId: string
  serviceId: string
  containerName: string
  podNames?: string[]
  podCountData?: { podCount: number; isResolved: boolean }
}) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useDashboardContext()
  const getColorByPod = usePodColor()

  const [legendSelectedKeys, setLegendSelectedKeys] = useState<Set<string>>(new Set())

  // Count pods using lightweight query to determine view mode
  const {
    podCount,
    isFetched: isPodCountFetched,
    isFetching: isFetchingPodCount,
  } = usePodCount({
    clusterId,
    containerName,
    podNames,
    enabled: !!containerName && !podCountData,
  })

  const effectivePodCount = podCountData ? podCountData.podCount : podCount
  const isPodCountResolved = podCountData ? podCountData.isResolved : isPodCountFetched && !isFetchingPodCount

  // Use aggregated view (p50/p90) if more than 10 pods. Only decide once pod count is resolved
  const useAggregatedMetrics = isPodCountResolved && effectivePodCount > 10
  const metricsEnabled = isPodCountResolved

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

  const selector = useMemo(() => buildPromSelector(containerName, podNames), [containerName, podNames])

  // Reset legend filters when switching between pods and percentiles view, when timeRange changes, or when zooming
  useEffect(() => {
    setLegendSelectedKeys(new Set())
  }, [useAggregatedMetrics, timeRange, startTimestamp, endTimestamp])

  // Query for individual pods (only when NOT in aggregated mode)
  const { data: podMetrics, isLoading: isLoadingPods } = useMetrics({
    clusterId,
    query: queryCpuUsageByPod(rateInterval, selector),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'cpu_by_pod',
    enabled: metricsEnabled && !useAggregatedMetrics,
  })

  // Queries for aggregated metrics (only when in aggregated mode)
  const { data: p50Metrics, isLoading: isLoadingP50 } = useMetrics({
    clusterId,
    query: queryCpuUsageP50(rateInterval, selector),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'cpu_p50',
    enabled: metricsEnabled && useAggregatedMetrics,
  })

  const { data: p90Metrics, isLoading: isLoadingP90 } = useMetrics({
    clusterId,
    query: queryCpuUsageP90(rateInterval, selector),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'cpu_p90',
    enabled: metricsEnabled && useAggregatedMetrics,
  })

  const { data: limitMetrics, isLoading: isLoadingLimit } = useMetrics({
    clusterId,
    query: queryCpuLimit(selector),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'cpu_limit',
  })

  const { data: requestMetrics, isLoading: isLoadingRequest } = useMetrics({
    clusterId,
    query: queryCpuRequest(selector),
    startTimestamp,
    endTimestamp,
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'cpu_request',
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
        () => 'p50',
        (value) => parseFloat(value) * 1000, // Convert to mCPU
        useLocalTime
      )

      processMetricsData(
        p90Metrics,
        timeSeriesMap,
        () => 'p90',
        (value) => parseFloat(value) * 1000, // Convert to mCPU
        useLocalTime
      )
    } else {
      // Process individual pod metrics for time ranges <= 1 day
      processMetricsData(
        podMetrics,
        timeSeriesMap,
        (_, index) => convertPodName(podMetrics?.data?.result?.[index]?.metric?.pod || ''),
        (value) => parseFloat(value) * 1000, // Convert to mCPU
        useLocalTime
      )
    }

    // Always process CPU limit and request metrics
    processMetricsData(
      limitMetrics,
      timeSeriesMap,
      () => 'Limit',
      (value) => parseFloat(value) * 1000, // Convert to mCPU
      useLocalTime
    )

    processMetricsData(
      requestMetrics,
      timeSeriesMap,
      () => 'Request',
      (value) => parseFloat(value) * 1000, // Convert to mCPU
      useLocalTime
    )

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [
    useAggregatedMetrics,
    p50Metrics,
    p90Metrics,
    podMetrics,
    limitMetrics,
    requestMetrics,
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

  const isLoading = useMemo(() => {
    if (!isPodCountResolved) return true

    const podLoading = useAggregatedMetrics ? false : isLoadingPods
    const aggregatedLoading = useAggregatedMetrics ? isLoadingP50 || isLoadingP90 : false

    return podLoading || aggregatedLoading || isLoadingLimit || isLoadingRequest
  }, [
    isPodCountResolved,
    useAggregatedMetrics,
    isLoadingPods,
    isLoadingP50,
    isLoadingP90,
    isLoadingLimit,
    isLoadingRequest,
  ])

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoading}
      isEmpty={chartData.length === 0}
      label="CPU usage (mCPU)"
      description={
        useAggregatedMetrics
          ? 'p50 and p90 CPU usage across all pods with CPU limit and request'
          : 'Usage per instance in mCPU of CPU limit and request'
      }
      tooltipLabel="CPU"
      unit="mCPU"
      serviceId={serviceId}
      handleResetLegend={legendSelectedKeys.size > 0 ? handleResetLegend : undefined}
    >
      {useAggregatedMetrics ? (
        <>
          <Line
            dataKey="p90"
            name="p90"
            type="linear"
            stroke="var(--color-red-400)"
            strokeWidth={2}
            connectNulls={false}
            dot={false}
            isAnimationActive={false}
            hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('p90') ? true : false}
          />
          <Line
            dataKey="p50"
            name="p50"
            type="linear"
            stroke="#10B981"
            strokeWidth={2}
            connectNulls={false}
            dot={false}
            isAnimationActive={false}
            hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('p50') ? true : false}
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
        dataKey="Request"
        name="Request"
        type="linear"
        stroke="var(--neutral-8)"
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('Request') ? true : false}
      />
      <Line
        dataKey="Limit"
        name="Limit"
        type="linear"
        stroke="var(--negative-11)"
        strokeWidth={2}
        connectNulls={false}
        dot={false}
        isAnimationActive={false}
        hide={legendSelectedKeys.size > 0 && !legendSelectedKeys.has('Limit') ? true : false}
      />
      {!isLoading && chartData.length > 0 && (
        <Chart.Legend
          name="cpu"
          className="w-[calc(100%-0.5rem)] pb-1 pt-2"
          onClick={onClick}
          itemSorter={(item) => {
            if (item.value === 'Limit') {
              return -4
            }
            if (item.value === 'Request') {
              return -3
            }
            if (item.value === 'p50') {
              return -2
            }
            if (item.value === 'p90') {
              return -1
            }
            return 0
          }}
          content={(props) => (
            <Chart.LegendContent
              selectedKeys={legendSelectedKeys}
              formatter={(value) => {
                if (useAggregatedMetrics) {
                  if (value === 'p90') {
                    return 'p90'
                  }
                  if (value === 'p50') {
                    return 'p50'
                  }
                }
                if (value === 'Request') {
                  return 'Request'
                }
                if (value === 'Limit') {
                  return 'Limit'
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
