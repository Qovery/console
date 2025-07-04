import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import { CardMetric } from '../card-metric/card-metric'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

export function CardInstanceRestarts({ serviceId, clusterId }: { serviceId: string; clusterId: string }) {
  const { timeRange } = useServiceOverviewContext()
  const { data: metrics, isLoading: isLoadingMetrics } = useMetrics({
    clusterId,
    query: `
    round(
      (
        sum(
          (
            changes(kube_pod_container_status_last_terminated_exitcode{container!="POD"}[${timeRange}]) 
          )
          * on(namespace,pod,container)
            (kube_pod_container_status_last_terminated_exitcode{container!="POD"} > 0)
          * on(namespace,pod) group_left(label_qovery_com_service_id)
            max by(namespace,pod,label_qovery_com_service_id)(
              kube_pod_labels{label_qovery_com_service_id=~"${serviceId}"}
            )
        )
      ) or vector(0)
    )
  `,
    queryRange: 'query',
  })

  const value = Math.round(Number(metrics?.data?.result[0]?.value[1]))
  const isError = value > 0

  return (
    <CardMetric
      title="Instance restarts"
      value={<span>{value} times</span>}
      status={isError ? 'YELLOW' : 'GREEN'}
      description={isError ? `Restarts during the last ${timeRange}` : `No restarts during the last ${timeRange}`}
      scrollToId="cpu"
      isLoading={isLoadingMetrics}
    />
  )
}

export default CardInstanceRestarts
