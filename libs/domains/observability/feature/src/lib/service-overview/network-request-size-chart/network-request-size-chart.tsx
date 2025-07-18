import { useMemo } from 'react'
import { Line } from 'recharts'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { addTimeRangePadding } from '../util-chart/add-time-range-padding'
import { processMetricsData } from '../util-chart/process-metrics-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function NetworkRequestSizeChart({ clusterId, serviceId }: { clusterId: string; serviceId: string }) {
  const { startTimestamp, endTimestamp, useLocalTime } = useServiceOverviewContext()

  const { data: metricsResponseSize, isLoading: isLoadingMetricsResponseSize } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `sum by (path) (
  rate(nginx_ingress_controller_response_size_count{}[1m])
   * on(ingress) group_left(label_qovery_com_associated_service_id)
      max by(ingress, label_qovery_com_associated_service_id)(
        kube_ingress_labels{
          label_qovery_com_associated_service_id =~ "${serviceId}"
        }
      )
)`,
  })

  const { data: metricsRequestSize, isLoading: isLoadingMetricsRequestSize } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `sum by (path) (
  rate(nginx_ingress_controller_request_size_count{}[1m])
   * on(ingress) group_left(label_qovery_com_associated_service_id)
      max by(ingress, label_qovery_com_associated_service_id)(
        kube_ingress_labels{
          label_qovery_com_associated_service_id =~ "${serviceId}"
        }
      )
)`,
  })

  const chartData = useMemo(() => {
    if (!metricsResponseSize?.data?.result) {
      return []
    }

    const timeSeriesMap = new Map<
      number,
      { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
    >()

    // Process network response size metrics
    processMetricsData(
      metricsResponseSize,
      timeSeriesMap,
      () => 'response-size',
      (value) => parseFloat(value), // Convert to bytes
      useLocalTime
    )

    // Process network request size metrics
    processMetricsData(
      metricsRequestSize,
      timeSeriesMap,
      () => 'request-size',
      (value) => parseFloat(value), // Convert to bytes
      useLocalTime
    )

    const baseChartData = Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)

    return addTimeRangePadding(baseChartData, startTimestamp, endTimestamp, useLocalTime)
  }, [metricsResponseSize, metricsRequestSize, useLocalTime, startTimestamp, endTimestamp])

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoadingMetricsResponseSize || isLoadingMetricsRequestSize}
      isEmpty={chartData.length === 0}
      label="Network request size"
      unit="bytes"
      serviceId={serviceId}
    >
      <Line
        key="response-size"
        dataKey="response-size"
        type="linear"
        stroke="var(--color-brand-400)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      <Line
        key="request-size"
        dataKey="request-size"
        type="linear"
        stroke="var(--color-purple-400)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
    </LocalChart>
  )
}

export default NetworkRequestSizeChart
