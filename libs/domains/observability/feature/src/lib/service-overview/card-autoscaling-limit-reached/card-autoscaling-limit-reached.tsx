import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'

export function CardAutoscalingLimitReached({ serviceId, clusterId }: { serviceId: string; clusterId: string }) {
  const { data: metricsMaxInstances, isLoading: isLoadingMetricsMaxInstances } = useMetrics({
    clusterId,
    query: `max_over_time(count(kube_pod_status_ready{condition="true"} * on(namespace, pod) group_left(label_qovery_com_service_id) max by(namespace, pod, label_qovery_com_service_id)(kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}))[$__range:])`,
    queryRange: 'query',
  })

  console.log('metricsMaxInstances', metricsMaxInstances)

  const value = metricsMaxInstances?.data?.result.length

  return (
    <CardMetric
      title="Autoscaling limit reached"
      value={value}
      status={value > 0 ? 'RED' : 'GREEN'}
      isLoading={isLoadingMetricsMaxInstances}
      description="Last hour"
    />
  )
}

export default CardAutoscalingLimitReached
