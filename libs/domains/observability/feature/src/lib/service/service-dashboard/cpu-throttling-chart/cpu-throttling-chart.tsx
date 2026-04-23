import { useMemo } from 'react'
import { Line } from 'recharts'
import { usePodColor } from '@qovery/shared/util-hooks'
import { calculateRateInterval, useMetrics } from '../../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../../../local-chart/local-chart'
import { addTimeRangePadding } from '../../../util-chart/add-time-range-padding'
import { buildPromSelector } from '../../../util-chart/build-selector'
import { convertPodName } from '../../../util-chart/convert-pod-name'
import { processMetricsData } from '../../../util-chart/process-metrics-data'
import { useDashboardContext } from '../../../util-filter/dashboard-context'

const queryThrottleByPod = (rateInterval: string, selector: string) => `
  (
    sum by (pod) (rate(container_cpu_cfs_throttled_periods_total{${selector}}[${rateInterval}]))
    /
    (sum by (pod) (rate(container_cpu_cfs_periods_total{${selector}}[${rateInterval}])) > 0)
  ) * 100
`

export function CpuThrottlingChart({
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

  const rateInterval = useMemo(
    () => calculateRateInterval(startTimestamp, endTimestamp),
    [startTimestamp, endTimestamp]
  )

  const selector = useMemo(() => buildPromSelector(containerName, podNames), [containerName, podNames])

  const { data: throttleMetrics, isLoading } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryThrottleByPod(rateInterval, selector),
    boardShortName: 'service_overview',
    metricShortName: 'cpu_throttle_by_pod',
  })

  const { chartData, seriesNames } = useMemo(() => {
    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    processMetricsData(
      throttleMetrics,
      timeSeriesMap,
      (_, index) => convertPodName(throttleMetrics?.data?.result?.[index]?.metric?.pod || ''),
      (value) => {
        const v = parseFloat(value)
        return isFinite(v) ? Math.min(v, 100) : 0
      },
      useLocalTime
    )

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)
    const names = (throttleMetrics?.data?.result ?? []).map((_: unknown, index: number) =>
      convertPodName(throttleMetrics!.data.result[index].metric.pod)
    ) as string[]

    return {
      chartData: addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime),
      seriesNames: names,
    }
  }, [throttleMetrics, useLocalTime, startTimestamp, endTimestamp])

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoading}
      isEmpty={chartData.length === 0}
      label="CPU throttling (%)"
      description="% of time the container was throttled by the CPU limit"
      tooltipLabel="Throttling"
      unit="%"
      serviceId={serviceId}
      yDomain={[0, 100]}
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
        />
      ))}
    </LocalChart>
  )
}

export default CpuThrottlingChart
