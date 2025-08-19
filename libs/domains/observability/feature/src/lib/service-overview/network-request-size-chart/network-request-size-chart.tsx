import { useCallback } from 'react'
import { Line } from 'recharts'
import { useMetrics, type MetricData } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { useOptimizedChartData } from '../util-chart/optimized-chart-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const queryResponseSize = (serviceId: string) => `
  sum by (path) (
rate(nginx_ingress_controller_response_size_count{}[1m])
 * on(ingress) group_left(label_qovery_com_associated_service_id)
    max by(ingress, label_qovery_com_associated_service_id)(
      kube_ingress_labels{
        label_qovery_com_associated_service_id = "${serviceId}"
      }
    )
)
`

const queryRequestSize = (serviceId: string) => `
  sum by (path) (
rate(nginx_ingress_controller_request_size_count{}[1m])
 * on(ingress) group_left(label_qovery_com_associated_service_id)
    max by(ingress, label_qovery_com_associated_service_id)(
      kube_ingress_labels{
        label_qovery_com_associated_service_id = "${serviceId}"
      }
    )
)
`

export function NetworkRequestSizeChart({ clusterId, serviceId }: { clusterId: string; serviceId: string }) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useServiceOverviewContext()

  const { data: metricsResponseSize, isLoading: isLoadingMetricsResponseSize } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryResponseSize(serviceId),
  })

  const { data: metricsRequestSize, isLoading: isLoadingMetricsRequestSize } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryRequestSize(serviceId),
  })

  // Memoize transform function to prevent recreation
  const transformValue = useCallback((value: string) => parseFloat(value), []) // Convert to bytes
  const getSeriesName = useCallback((series: MetricData, index: number) => 'Response size', []) // Primary series

  // Use optimized chart data processing with additional processors
  const { chartData } = useOptimizedChartData({
    metrics: metricsResponseSize, // Use response size as primary
    serviceId,
    useLocalTime,
    startTimestamp,
    endTimestamp,
    transformValue,
    getSeriesName,
    additionalProcessors: [
      {
        metrics: metricsRequestSize,
        getSeriesName: () => 'Request size',
        transformValue,
      },
    ],
  })

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoadingMetricsResponseSize || isLoadingMetricsRequestSize}
      isEmpty={chartData.length === 0}
      label="Network request size (bytes)"
      description="Large sizes can increase latency and bandwidth costs"
      unit="bytes"
      serviceId={serviceId}
    >
      <Line
        key="response-size"
        dataKey="Response size"
        type="linear"
        stroke="var(--color-brand-400)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      <Line
        key="request-size"
        dataKey="Request size"
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
