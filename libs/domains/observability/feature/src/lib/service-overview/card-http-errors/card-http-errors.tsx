import { pluralize } from '@qovery/shared/util-js'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function CardHTTPErrors({ serviceId, clusterId }: { serviceId: string; clusterId: string }) {
  const { timeRange } = useServiceOverviewContext()
  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    query: `100 *
      sum(
        rate(nginx_ingress_controller_requests{status!~"2.."}[${timeRange}])
          * on(ingress) group_left(label_qovery_com_associated_service_id)
            max by(ingress, label_qovery_com_associated_service_id)(
              kube_ingress_labels{label_qovery_com_associated_service_id =~ "${serviceId}"}
            )
      )
      /
      clamp_min(
        sum(
          rate(nginx_ingress_controller_requests[${timeRange}])
            * on(ingress) group_left(label_qovery_com_associated_service_id)
              max by(ingress, label_qovery_com_associated_service_id)(
                kube_ingress_labels{label_qovery_com_associated_service_id =~ "${serviceId}"}
              )
        ),
        1
      ) or vector(0)`,
    queryRange: 'query',
  })

  const value = Math.round(metrics?.data?.result[0]?.value[1]) ?? 0
  const isError = value > 0

  return (
    <CardMetric
      title={`HTTP ${pluralize(value, 'error', 'errors')} rate`}
      value={`${value}%`}
      status={isError ? 'RED' : 'GREEN'}
      description={`in the last ${timeRange}`}
      isLoading={isLoadingMetrics}
    />
  )
}

export default CardHTTPErrors
