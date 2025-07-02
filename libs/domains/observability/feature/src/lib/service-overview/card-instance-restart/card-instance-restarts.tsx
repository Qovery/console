import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'

export function CardInstanceRestarts({ serviceId, clusterId }: { serviceId: string; clusterId: string }) {
  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    query: `sum(increase(kube_pod_container_status_restarts_total{container!="POD"}[24h]) * on(namespace, pod) group_left(label_qovery_com_service_id) kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"})`,
    queryRange: 'query',
  })

  const value = Math.round(Number(metrics?.data?.result[0]?.value[1]))

  return (
    <CardMetric
      title="Instance restarts"
      value={value}
      status={value > 0 ? 'YELLOW' : 'GREEN'}
      description="Restarts during the last 24h"
      scrollToId="cpu"
      isLoading={isLoadingMetrics}
    />
  )
}

export default CardInstanceRestarts
