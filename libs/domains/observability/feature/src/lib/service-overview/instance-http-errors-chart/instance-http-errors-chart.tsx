import { useMemo } from 'react'
import { Area } from 'recharts'
import { getColorByPod } from '@qovery/shared/util-hooks'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function InstanceHTTPErrorsChart({ clusterId, serviceId }: { clusterId: string; serviceId: string }) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useServiceOverviewContext()

  const { data: metricsHttpStatusErrorRatio, isLoading: isLoadingHttpStatusErrorRatio } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `
    (sum by (status)  (
  rate(nginx_ingress_controller_requests{status!~"2.."}[5m])
  * on (ingress) group_left(label_qovery_com_associated_service_id)
    max by (ingress, label_qovery_com_associated_service_id) (
      kube_ingress_labels{label_qovery_com_associated_service_id =~ "${serviceId}"}
    )
) > 0)
/ ignoring(status) group_left
sum (
  rate(nginx_ingress_controller_requests[5m])
  * on (ingress) group_left(label_qovery_com_associated_service_id)
    max by (ingress, label_qovery_com_associated_service_id) (
      kube_ingress_labels{label_qovery_com_associated_service_id =~ "${serviceId}"}
    )
) * 100
`,
    timeRange,
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
      margin={{ top: 14, bottom: 0, left: 0, right: 0 }}
      isFullscreen
    >
      {seriesNames.map((name) => (
        <Area
          key={name}
          dataKey={name}
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
