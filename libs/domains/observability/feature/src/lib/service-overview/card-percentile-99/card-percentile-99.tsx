import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function CardPercentile99({ serviceId, clusterId }: { serviceId: string; clusterId: string }) {
  const { timeRange } = useServiceOverviewContext()
  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    query: `
    max_over_time(
  histogram_quantile(
    0.99,
    (
      sum by(le, ingress) (
        rate(nginx_ingress_controller_request_duration_seconds_bucket[1m])
      )
      * on(ingress) group_left(label_qovery_com_associated_service_id)
        max by(ingress, label_qovery_com_associated_service_id)(
          kube_ingress_labels{
            label_qovery_com_associated_service_id =~ "${serviceId}"
          }
        )
    )
  )[${timeRange}:]
)
  `,
    queryRange: 'query',
  })

  const value = Math.round(Number(metrics?.data?.result[0]?.value[1]) * 1000) || 0
  const isError = value > 150

  const title = '99th percentile'

  return (
    <CardMetric
      title={title}
      value={`${value} ms`}
      status={isError ? 'RED' : 'GREEN'}
      description={`in last ${timeRange}`}
      isLoading={isLoadingMetrics}
    />
  )
}

export default CardPercentile99
