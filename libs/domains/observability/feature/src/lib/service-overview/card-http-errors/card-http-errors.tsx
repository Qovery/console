import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'

export function CardHTTPErrors({ serviceId, clusterId }: { serviceId: string; clusterId: string }) {
  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    query: `100 * sum(rate(nginx_ingress_controller_requests{status!~"2.."}[$__rate_interval]) * on(ingress) group_left(label_qovery_com_associated_service_id) max by(ingress, label_qovery_com_associated_service_id)(kube_ingress_labels{label_qovery_com_associated_service_id =~ "${serviceId}"})) / clamp_min(sum(rate(nginx_ingress_controller_requests[$__rate_interval]) * on(ingress) group_left(label_qovery_com_associated_service_id) max by(ingress, label_qovery_com_associated_service_id)(kube_ingress_labels{label_qovery_com_associated_service_id =~ "${serviceId}"})), 1) or vector(0)`,
    queryRange: 'query',
  })

  const value = metrics?.data?.result.length

  return (
    <CardMetric title="HTTP errors" value={value} status={value > 0 ? 'RED' : 'GREEN'} isLoading={isLoadingMetrics} />
  )
}

export default CardHTTPErrors
