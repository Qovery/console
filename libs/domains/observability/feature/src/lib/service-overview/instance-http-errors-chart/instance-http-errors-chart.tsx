import { useMemo } from 'react'
import { Area } from 'recharts'
import { getColorByPod } from '@qovery/shared/util-hooks'
import { calculateRateInterval, useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const query = (ingressName: string, rateInterval: string) => `
100 *
sum by (status)(
  rate(nginx_ingress_controller_requests{
    ingress="${ingressName}", status=~"499|5.."
  }[${rateInterval}])
)
/
ignoring(status) group_left
sum (
  rate(nginx_ingress_controller_requests{
    ingress="${ingressName}"
  }[${rateInterval}])
)
`

export function InstanceHTTPErrorsChart({
  clusterId,
  serviceId,
  ingressName,
}: {
  clusterId: string
  serviceId: string
  containerName: string
  ingressName: string
}) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useServiceOverviewContext()

  const rateInterval = useMemo(
    () => calculateRateInterval(startTimestamp, endTimestamp),
    [startTimestamp, endTimestamp]
  )

  const { data: metricsHttpStatusErrorRatio, isLoading: isLoadingHttpStatusErrorRatio } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: query(ingressName, rateInterval),
    timeRange,
    boardShortName: 'service_overview',
    metricShortName: 'http_errors',
  })

  const chartData = useMemo(() => {
    // Merge healthy and unhealthy metrics into a single timeSeriesMap
    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // Process ratio of HTTP status error
    if (metricsHttpStatusErrorRatio?.data?.result) {
      processMetricsData(
        metricsHttpStatusErrorRatio,
        timeSeriesMap,
        (_, index) => JSON.stringify(metricsHttpStatusErrorRatio.data.result[index].metric),
        (value) => parseFloat(value),
        useLocalTime
      )
    }

    // Convert map to sorted array and add time range padding
    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)
    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [metricsHttpStatusErrorRatio, useLocalTime, startTimestamp, endTimestamp])

  const seriesNames = useMemo(() => {
    if (!metricsHttpStatusErrorRatio?.data?.result) return []
    return metricsHttpStatusErrorRatio.data.result.map((_: unknown, index: number) =>
      JSON.stringify(metricsHttpStatusErrorRatio.data.result[index].metric)
    ) as string[]
  }, [metricsHttpStatusErrorRatio])

  return (
    <LocalChart
      data={chartData || []}
      isLoading={isLoadingHttpStatusErrorRatio}
      isEmpty={(chartData || []).length === 0}
      tooltipLabel="HTTP Error Rate"
      unit="%"
      serviceId={serviceId}
      isFullscreen
    >
      {seriesNames.map((name) => (
        <Area
          key={name}
          dataKey={name}
          name={name}
          stackId="httpErrors"
          stroke={getColorByPod(name)}
          fill={getColorByPod(name)}
          fillOpacity={0.6}
          strokeWidth={2}
          isAnimationActive={false}
        />
      ))}
    </LocalChart>
  )
}

export default InstanceHTTPErrorsChart
