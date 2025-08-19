import { useCallback } from 'react'
import { Line } from 'recharts'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { LocalChart } from '../local-chart/local-chart'
import { useOptimizedChartData } from '../util-chart/optimized-chart-data'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

const queryDuration50 = (serviceId: string) => `
  histogram_quantile(0.5,(
  sum by(le, ingress) (rate(nginx_ingress_controller_request_duration_seconds_bucket[1m]))
  * on(ingress) group_left(label_qovery_com_associated_service_id)
    max by(ingress, label_qovery_com_associated_service_id)(
      kube_ingress_labels{
        label_qovery_com_associated_service_id = "${serviceId}"
      }
    )
  )
)
`

const queryDuration99 = (serviceId: string) => `
  histogram_quantile(
    0.99,
    (
      sum by(le, ingress) (
        rate(nginx_ingress_controller_request_duration_seconds_bucket[1m])
      )
      * on(ingress) group_left(label_qovery_com_associated_service_id)
        max by(ingress, label_qovery_com_associated_service_id)(
          kube_ingress_labels{
            label_qovery_com_associated_service_id = "${serviceId}"
          }
        )
    )
  )
`

const queryDuration95 = (serviceId: string) => `
  histogram_quantile(0.95,(
  sum by(le, ingress) (rate(nginx_ingress_controller_request_duration_seconds_bucket[1m]))
  * on(ingress) group_left(label_qovery_com_associated_service_id)
    max by(ingress, label_qovery_com_associated_service_id)(
      kube_ingress_labels{
        label_qovery_com_associated_service_id = "${serviceId}"
      }
    )
  )
)
`

export function NetworkRequestDurationChart({
  clusterId,
  serviceId,
  isFullscreen,
}: {
  clusterId: string
  serviceId: string
  isFullscreen?: boolean
}) {
  const { startTimestamp, endTimestamp, useLocalTime, timeRange } = useServiceOverviewContext()

  const { data: metrics50, isLoading: isLoadingMetrics50 } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryDuration50(serviceId),
  })

  const { data: metrics99, isLoading: isLoadingMetrics99 } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryDuration99(serviceId),
  })

  const { data: metrics95, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    timeRange,
    query: queryDuration95(serviceId),
  })

  // Memoize transform function to prevent recreation
  const transformValue = useCallback((value: string) => parseFloat(value) * 1000, []) // Convert to ms
  const getSeriesName = useCallback(() => '95th percentile', []) // Primary series

  // Use optimized chart data processing with additional processors
  const { chartData } = useOptimizedChartData({
    metrics: metrics95, // Use 95th percentile as primary
    serviceId,
    useLocalTime,
    startTimestamp,
    endTimestamp,
    transformValue,
    getSeriesName,
    additionalProcessors: [
      {
        metrics: metrics99,
        getSeriesName: () => '99th percentile',
        transformValue,
      },
      {
        metrics: metrics50,
        getSeriesName: () => '50th percentile',
        transformValue,
      },
    ],
  })

  return (
    <LocalChart
      data={chartData}
      isLoading={isLoadingMetrics || isLoadingMetrics99 || isLoadingMetrics50}
      isEmpty={chartData.length === 0}
      label={!isFullscreen ? 'Network request duration (ms)' : undefined}
      description="How long requests take to complete. Lower values mean faster responses"
      unit="ms"
      serviceId={serviceId}
    >
      <Line
        key="50th-percentile"
        dataKey="50th percentile"
        type="linear"
        stroke="var(--color-purple-400)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      <Line
        key="95th-percentile"
        dataKey="95th percentile"
        type="linear"
        stroke="var(--color-brand-400)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      <Line
        key="99th-percentile"
        dataKey="99th percentile"
        type="linear"
        stroke="var(--color-purple-600)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
    </LocalChart>
  )
}

export default NetworkRequestDurationChart
