import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function CardPercentile99({ serviceId, clusterId }: { serviceId: string; clusterId: string }) {
  const { timeRange } = useServiceOverviewContext()
  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    query: `
    (
      round(
        sum(
          increase(
            kube_pod_container_status_restarts_total{container!="POD"}[${timeRange}]
          )
          * on(namespace, pod) group_left(label_qovery_com_service_id)
            max by(namespace, pod, label_qovery_com_service_id)(
              kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}
            )
        )
      )
      or vector(0)
    )
    +
    sum_over_time(
      (
        sum(
          (
            kube_pod_container_status_waiting_reason{
              container!="POD",
              reason!~"ContainerCreating|PodInitializing|Completed"
            }
            * on(namespace, pod) group_left(label_qovery_com_service_id)
              kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}
          )
          or vector(0)
        )
      )[${timeRange}:]
    )
  `,
    queryRange: 'query',
  })

  const value = Math.round(Number(metrics?.data?.result[0]?.value[1])) || 0
  const isError = value > 0

  const title = '99th percentile'

  return (
    <CardMetric
      title={title}
      value={value}
      status={isError ? 'RED' : 'GREEN'}
      description={`in last ${timeRange}`}
      isLoading={isLoadingMetrics}
    />
  )
}

export default CardPercentile99
