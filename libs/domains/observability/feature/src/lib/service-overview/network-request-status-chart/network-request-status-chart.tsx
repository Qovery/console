import { useMemo } from 'react'
import { Line } from 'recharts'
import { getColorByPod } from '@qovery/shared/util-hooks'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function NetworkRequestStatusChart({ clusterId, serviceId }: { clusterId: string; serviceId: string }) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useServiceOverviewContext()

  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: `sum by(path,status)( rate(nginx_ingress_controller_requests{}[1m])
      * on(ingress) group_left(label_qovery_com_associated_service_id)
        max by(ingress, label_qovery_com_associated_service_id)(
          kube_ingress_labels{
            label_qovery_com_associated_service_id =~ "${serviceId}"
          }
        )
    )`,
  })

  const chartData = useMemo(() => {
    if (!metrics?.data?.result) {
      return []
    }

    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // Process network request metrics
    processMetricsData(
      metrics,
      timeSeriesMap,
      (_, index) => JSON.stringify(metrics.data.result[index].metric),
      (value) => parseFloat(value) * 1000, // Convert to req/s
      useLocalTime
    )

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [metrics, useLocalTime, startTimestamp, endTimestamp])

  const seriesNames = useMemo(() => {
    if (!metrics?.data?.result) return []
    return metrics.data.result.map((_: unknown, index: number) =>
      JSON.stringify(metrics.data.result[index].metric)
    ) as string[]
  }, [metrics])

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoadingMetrics}
      isEmpty={chartData.length === 0}
      label="Network request status (req/s)"
      description="Network request status: 2xx, 3xx, 4xx, 5xx"
      unit="req/s"
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
    </LocalChart>
  )
}

export default NetworkRequestStatusChart
